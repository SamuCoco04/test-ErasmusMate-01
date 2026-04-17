import type { ExceptionState, SubmissionState } from "@prisma/client";
import { Prisma } from "@prisma/client";

import { deadlines as seededDeadlines, submissions as seededSubmissions } from "@/lib/mock/student-institutional";
import { DomainError } from "@/lib/server/http/response";
import { prisma } from "@/lib/server/prisma";

type ServiceResult<T = unknown> = { outcome: "success"; details: string; data?: T };
type DeadlineState = "upcoming" | "overdue" | "overridden";

const REVIEWABLE_STATES: SubmissionState[] = ["submitted", "in_review", "resubmitted"];
const DECISION_STATES: SubmissionState[] = ["in_review"];

const submissionMeta = new Map(
  seededSubmissions.map((submission) => [
    submission.id,
    {
      procedure: submission.procedure,
      stage: submission.stage,
      dueDate: submission.dueDate,
    },
  ]),
);

const getSubmissionMeta = (submissionId: string) => {
  const meta = submissionMeta.get(submissionId);
  if (meta) return meta;

  return {
    procedure: `Institutional procedure (${submissionId})`,
    stage: "Coordinator review",
    dueDate: new Date().toISOString().slice(0, 10),
  };
};

const translateForeignKeyError = (error: unknown, message: string): never => {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
    throw new DomainError("NOT_FOUND", message);
  }
  throw error;
};

const ensureSubmission = async (submissionId: string) => {
  const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
  if (!submission) {
    throw new DomainError("NOT_FOUND", "Submission not found.");
  }
  return submission;
};

const ensureException = async (exceptionId: string) => {
  const exceptionRequest = await prisma.exceptionRequest.findUnique({ where: { id: exceptionId } });
  if (!exceptionRequest) {
    throw new DomainError("NOT_FOUND", "Exception not found.");
  }
  return exceptionRequest;
};

const recordSubmissionEvent = async (input: {
  submissionId: string;
  actorId: string;
  eventType: string;
  rationale?: string;
  priorState?: SubmissionState;
  newState?: SubmissionState;
}) => {
  await prisma.submissionAuditEvent.create({
    data: {
      submissionId: input.submissionId,
      actorId: input.actorId,
      eventType: input.eventType,
      rationale: input.rationale,
      priorState: input.priorState,
      newState: input.newState,
    },
  });
};

const assertSubmissionTransition = (from: SubmissionState, to: SubmissionState) => {
  const allowed: Partial<Record<SubmissionState, SubmissionState[]>> = {
    draft: ["submitted"],
    submitted: ["in_review"],
    in_review: ["approved", "rejected", "reopened"],
    rejected: ["resubmitted"],
    reopened: ["resubmitted"],
    resubmitted: ["in_review"],
  };

  if (!(allowed[from] ?? []).includes(to)) {
    throw new DomainError("CONFLICT", `Invalid transition ${from} -> ${to}.`);
  }
};

const parseRequestedDate = (requestedEffect: string): string | null => requestedEffect.match(/\b(\d{4}-\d{2}-\d{2})\b/)?.[1] ?? null;

const mapException = (exceptionRequest: {
  id: string;
  submissionId: string;
  requesterId: string;
  state: ExceptionState;
  scope: string;
  rationale: string;
  requestedEffect: string;
  coveredTargetId: string | null;
  decisionRationale: string | null;
  appliedEffectSummary: string | null;
  decidedAt: Date | null;
  appliedAt: Date | null;
  decidedById: string | null;
  createdAt: Date;
  updatedAt: Date;
}) => exceptionRequest;

export const institutionalServerService = {
  async listSubmissions(filters: { role?: "student" | "coordinator" }): Promise<ServiceResult> {
  
    const submissions = await prisma.submission.findMany({
      orderBy: { id: "asc" },
      include: {
        auditEvents: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        exceptionRequests: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const mapped = submissions
      .filter((submission) => {
        if (filters.role === "student") return submission.state !== "archived";
        if (filters.role === "coordinator") return REVIEWABLE_STATES.includes(submission.state);
        return true;
      })
      .map((submission) => {
        const meta = getSubmissionMeta(submission.id);
        return {
          ...submission,
          procedure: meta.procedure,
          stage: meta.stage,
          dueDate: meta.dueDate,
        };
      });

    return { outcome: "success", details: "Submission list read model fetched.", data: mapped };
  },

  async listDeadlines(): Promise<ServiceResult> {
  
    const exceptions = await prisma.exceptionRequest.findMany({
      where: {
        state: { in: ["approved", "applied"] },
        scope: "deadline",
      },
      orderBy: { createdAt: "desc" },
    });

    const deadlines = seededDeadlines.map((deadline) => {
      const matchingException = exceptions.find(
        (item) => item.coveredTargetId === deadline.id || (!item.coveredTargetId && item.submissionId === deadline.submissionId),
      );

      if (!matchingException) {
        return deadline;
      }

      const parsedDate = parseRequestedDate(matchingException.requestedEffect);
      const effectiveDueDate = parsedDate ?? deadline.effectiveDueDate;
      const state: DeadlineState = "overridden";

      return {
        ...deadline,
        effectiveDueDate,
        state,
        overrideBasis: matchingException.appliedEffectSummary ?? `Exception ${matchingException.id} ${matchingException.state}`,
      };
    });

    return { outcome: "success", details: "Deadline read model fetched.", data: deadlines };
  },

  async saveDraft(submissionId: string, actorId: string, draftPayload: Record<string, unknown>): Promise<ServiceResult> {
    const submission = await ensureSubmission(submissionId);

    if (!["draft", "rejected", "reopened"].includes(submission.state)) {
      throw new DomainError("CONFLICT", `Cannot edit draft while state is ${submission.state}.`);
    }

    try {
      const updated = await prisma.submission.update({
        where: { id: submissionId },
        data: {
          draftPayload: draftPayload as Prisma.InputJsonValue,
        },
      });

      await recordSubmissionEvent({
        submissionId,
        actorId,
        eventType: "save_submission_draft",
        priorState: submission.state,
        newState: updated.state,
      });

      return { outcome: "success", details: "Draft saved.", data: updated };
    } catch (error) {
      translateForeignKeyError(error, "Actor user not found.");
    }

    throw new DomainError("CONFLICT", "Draft could not be saved.");
  },

  async submit(submissionId: string, actorId: string): Promise<ServiceResult> {
    const submission = await ensureSubmission(submissionId);

    if (!submission.draftPayload) {
      throw new DomainError("PRECONDITION_FAILED", "Cannot submit without draft payload.");
    }

    assertSubmissionTransition(submission.state, "submitted");

    try {
      const updated = await prisma.submission.update({
        where: { id: submissionId },
        data: {
          state: "submitted",
          submittedAt: new Date(),
        },
      });

      await recordSubmissionEvent({
        submissionId,
        actorId,
        eventType: "final_submit",
        priorState: submission.state,
        newState: updated.state,
      });

      return { outcome: "success", details: "Submission submitted.", data: updated };
    } catch (error) {
      translateForeignKeyError(error, "Actor user not found.");
    }

    throw new DomainError("CONFLICT", "Submission could not be submitted.");
  },

  async startReview(submissionId: string, actorId: string): Promise<ServiceResult> {
    const submission = await ensureSubmission(submissionId);
    assertSubmissionTransition(submission.state, "in_review");

    try {
      const updated = await prisma.submission.update({
        where: { id: submissionId },
        data: { state: "in_review" },
      });

      await recordSubmissionEvent({
        submissionId,
        actorId,
        eventType: "review_started",
        priorState: submission.state,
        newState: updated.state,
      });

      return { outcome: "success", details: "Submission moved to in_review.", data: updated };
    } catch (error) {
      translateForeignKeyError(error, "Actor user not found.");
    }

    throw new DomainError("CONFLICT", "Review could not be started.");
  },

  async resubmit(submissionId: string, actorId: string, draftPayload: Record<string, unknown>): Promise<ServiceResult> {
    const submission = await ensureSubmission(submissionId);
    assertSubmissionTransition(submission.state, "resubmitted");

    try {
      const updated = await prisma.submission.update({
        where: { id: submissionId },
        data: {
          state: "resubmitted",
          submittedAt: new Date(),
          draftPayload: draftPayload as Prisma.InputJsonValue,
        },
      });

      await recordSubmissionEvent({
        submissionId,
        actorId,
        eventType: "resubmit_after_rejection",
        priorState: submission.state,
        newState: updated.state,
      });

      return { outcome: "success", details: "Submission resubmitted.", data: updated };
    } catch (error) {
      translateForeignKeyError(error, "Actor user not found.");
    }

    throw new DomainError("CONFLICT", "Submission could not be resubmitted.");
  },

  async decision(
    submissionId: string,
    decision: "approved" | "rejected",
    rationale: string,
    actorId: string,
  ): Promise<ServiceResult> {
    const submission = await ensureSubmission(submissionId);

    if (!DECISION_STATES.includes(submission.state)) {
      throw new DomainError("CONFLICT", `Cannot apply ${decision} while state is ${submission.state}.`);
    }

    try {
      const updated = await prisma.submission.update({
        where: { id: submissionId },
        data: {
          state: decision,
          decisionRationale: rationale,
        },
      });

      await recordSubmissionEvent({
        submissionId,
        actorId,
        eventType: decision === "approved" ? "submission_approved" : "submission_rejected",
        rationale,
        priorState: submission.state,
        newState: updated.state,
      });

      return { outcome: "success", details: `Submission ${decision}.`, data: updated };
    } catch (error) {
      translateForeignKeyError(error, "Actor user not found.");
    }

    throw new DomainError("CONFLICT", "Decision could not be persisted.");
  },

  async reopen(submissionId: string, rationale: string, actorId: string): Promise<ServiceResult> {
    const submission = await ensureSubmission(submissionId);

    if (!DECISION_STATES.includes(submission.state)) {
      throw new DomainError("CONFLICT", `Cannot reopen while state is ${submission.state}.`);
    }

    const updated = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        state: "reopened",
        decisionRationale: rationale,
      },
    });

    await recordSubmissionEvent({
      submissionId,
      actorId,
      eventType: "submission_reopened",
      rationale,
      priorState: submission.state,
      newState: updated.state,
    });

    return { outcome: "success", details: "Submission reopened.", data: updated };
  },

  async createException(input: {
    submissionId: string;
    requesterId: string;
    scope: "deadline" | "document_obligation" | "procedure_condition";
    rationale: string;
    requestedEffect: string;
    coveredTargetId?: string;
  }): Promise<ServiceResult> {
    await ensureSubmission(input.submissionId);

    try {
      const created = await prisma.exceptionRequest.create({
        data: {
          submissionId: input.submissionId,
          requesterId: input.requesterId,
          scope: input.scope,
          rationale: input.rationale,
          requestedEffect: input.requestedEffect,
          coveredTargetId: input.coveredTargetId,
        },
      });

      await recordSubmissionEvent({
        submissionId: input.submissionId,
        actorId: input.requesterId,
        eventType: "exception_request_created",
        rationale: input.rationale,
      });

      return { outcome: "success", details: "Exception created.", data: mapException(created) };
    } catch (error) {
      translateForeignKeyError(error, "Requester user not found.");
    }

    throw new DomainError("CONFLICT", "Exception could not be created.");
  },

  async startExceptionReview(exceptionId: string, actorId: string): Promise<ServiceResult> {
    const exception = await ensureException(exceptionId);
    if (exception.state !== "submitted") {
      throw new DomainError("CONFLICT", `Exception ${exception.id} must be in submitted state.`);
    }

    try {
      const updated = await prisma.exceptionRequest.update({
        where: { id: exceptionId },
        data: { state: "in_review", decidedById: actorId },
      });

      await recordSubmissionEvent({
        submissionId: exception.submissionId,
        actorId,
        eventType: "exception_review_started",
        priorState: undefined,
        newState: undefined,
      });

      return { outcome: "success", details: `Exception ${exceptionId} moved to in_review.`, data: mapException(updated) };
    } catch (error) {
      translateForeignKeyError(error, "Actor user not found.");
    }

    throw new DomainError("CONFLICT", "Exception review could not be started.");
  },

  async decideException(exceptionId: string, decision: "approved" | "rejected", rationale: string, actorId: string): Promise<ServiceResult> {
    const exception = await ensureException(exceptionId);

    if (!["submitted", "in_review"].includes(exception.state)) {
      throw new DomainError("CONFLICT", `Exception ${exception.id} cannot be decided from ${exception.state}.`);
    }

    try {
      const updated = await prisma.exceptionRequest.update({
        where: { id: exceptionId },
        data: {
          state: decision,
          decisionRationale: rationale,
          decidedAt: new Date(),
          decidedById: actorId,
        },
      });

      await recordSubmissionEvent({
        submissionId: exception.submissionId,
        actorId,
        eventType: decision === "approved" ? "exception_approved" : "exception_rejected",
        rationale,
      });

      return { outcome: "success", details: `Exception ${decision}.`, data: mapException(updated) };
    } catch (error) {
      translateForeignKeyError(error, "Actor user not found.");
    }

    throw new DomainError("CONFLICT", "Decision could not be persisted.");
  },

  async applyException(exceptionId: string, actorId: string): Promise<ServiceResult> {
    const exception = await ensureException(exceptionId);
    if (exception.state !== "approved") {
      throw new DomainError("CONFLICT", `Exception ${exception.id} must be approved before apply.`);
    }

    const appliedEffectSummary = exception.scope === "deadline"
      ? `Applied deadline effect: ${exception.requestedEffect}`
      : `Applied ${exception.scope} effect: ${exception.requestedEffect}`;

    try {
      const updated = await prisma.exceptionRequest.update({
        where: { id: exceptionId },
        data: {
          state: "applied",
          appliedAt: new Date(),
          appliedEffectSummary,
        },
      });

      await recordSubmissionEvent({
        submissionId: exception.submissionId,
        actorId,
        eventType: "exception_applied",
        rationale: appliedEffectSummary,
      });

      return { outcome: "success", details: `Exception ${exception.id} applied.`, data: mapException(updated) };
    } catch (error) {
      translateForeignKeyError(error, "Actor user not found.");
    }

    throw new DomainError("CONFLICT", "Exception could not be applied.");
  },

  async closeException(exceptionId: string, actorId: string): Promise<ServiceResult> {
    const exception = await ensureException(exceptionId);
    if (exception.state !== "applied") {
      throw new DomainError("CONFLICT", `Exception ${exception.id} must be applied before close.`);
    }

    try {
      const updated = await prisma.exceptionRequest.update({
        where: { id: exceptionId },
        data: { state: "closed" },
      });

      await recordSubmissionEvent({
        submissionId: exception.submissionId,
        actorId,
        eventType: "exception_closed",
      });

      return { outcome: "success", details: `Exception ${exception.id} closed.`, data: mapException(updated) };
    } catch (error) {
      translateForeignKeyError(error, "Actor user not found.");
    }

    throw new DomainError("CONFLICT", "Exception could not be closed.");
  },

  async getSubmission(submissionId: string): Promise<ServiceResult> {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        documents: true,
        auditEvents: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            actor: {
              select: { id: true, name: true },
            },
          },
        },
        exceptionRequests: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!submission) {
      throw new DomainError("NOT_FOUND", "Submission not found.");
    }

    const meta = getSubmissionMeta(submission.id);

    return {
      outcome: "success",
      details: "Submission read model fetched.",
      data: {
        ...submission,
        procedure: meta.procedure,
        stage: meta.stage,
        dueDate: meta.dueDate,
      },
    };
  },

  async listExceptions(filters: { submissionId?: string; state?: ExceptionState | "all" }): Promise<ServiceResult> {
  
    const exceptionRequests = await prisma.exceptionRequest.findMany({
      where: {
        submissionId: filters.submissionId,
        state: filters.state && filters.state !== "all" ? filters.state : undefined,
      },
      orderBy: { createdAt: "desc" },
      include: {
        submission: {
          select: { id: true, state: true, studentId: true },
        },
        requester: {
          select: { id: true, name: true, email: true },
        },
        decidedBy: {
          select: { id: true, name: true },
        },
      },
    });

    return {
      outcome: "success",
      details: "Exception list read model fetched.",
      data: exceptionRequests,
    };
  },
};

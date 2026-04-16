import type { ExceptionState, SubmissionState } from "@prisma/client";
import { Prisma } from "@prisma/client";

import { DomainError } from "@/lib/server/http/response";
import { prisma } from "@/lib/server/prisma";

type ServiceResult<T = unknown> = { outcome: "success"; details: string; data?: T };

const translateForeignKeyError = (error: unknown, message: string): never => {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
    throw new DomainError("NOT_FOUND", message);
  }
  throw error;
};

const mapSubmission = (submission: {
  id: string;
  studentId: string;
  mobilityRecordId: string;
  state: SubmissionState;
  draftPayload: unknown;
  decisionRationale: string | null;
  submittedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  ...submission,
  draftPayload: (submission.draftPayload ?? undefined) as Record<string, unknown> | undefined,
});

const mapException = (exceptionRequest: {
  id: string;
  submissionId: string;
  requesterId: string;
  state: ExceptionState;
  scope: string;
  rationale: string;
  requestedEffect: string;
  decisionRationale: string | null;
  appliedEffectSummary: string | null;
  decidedAt: Date | null;
  appliedAt: Date | null;
  decidedById: string | null;
  createdAt: Date;
  updatedAt: Date;
}) => exceptionRequest;

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

export const institutionalServerService = {
  async saveDraft(submissionId: string, draftPayload: Record<string, unknown>): Promise<ServiceResult> {
    await ensureSubmission(submissionId);

    const updated = await prisma.submission.update({
      where: { id: submissionId },
      data: { state: "draft", draftPayload: draftPayload as Prisma.InputJsonValue },
    });

    return { outcome: "success", details: "Draft saved.", data: mapSubmission(updated) };
  },

  async submit(submissionId: string): Promise<ServiceResult> {
    const submission = await ensureSubmission(submissionId);

    if (!submission.draftPayload) {
      throw new DomainError("PRECONDITION_FAILED", "Cannot submit without draft payload.");
    }

    const updated = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        state: "submitted",
        submittedAt: new Date(),
      },
    });

    return { outcome: "success", details: "Submission submitted.", data: mapSubmission(updated) };
  },

  async decision(
    submissionId: string,
    decision: "approved" | "rejected",
    rationale: string,
    actorId: string,
  ): Promise<ServiceResult> {
    await ensureSubmission(submissionId);

    try {
      const updated = await prisma.submission.update({
        where: { id: submissionId },
        data: {
          state: decision,
          decisionRationale: rationale,
          auditEvents: {
            create: {
              actorId,
              eventType: decision === "approved" ? "submission_approved" : "submission_rejected",
              rationale,
            },
          },
        },
        include: {
          auditEvents: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      return { outcome: "success", details: `Submission ${decision}.`, data: mapSubmission(updated) };
    } catch (error) {
      translateForeignKeyError(error, "Actor user not found.");
    }
  },

  async reopen(submissionId: string, rationale: string, actorId: string): Promise<ServiceResult> {
    await ensureSubmission(submissionId);

    const updated = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        state: "reopened",
        decisionRationale: rationale,
        auditEvents: {
          create: {
            actorId,
            eventType: "submission_reopened",
            rationale,
          },
        },
      },
      include: {
        auditEvents: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return { outcome: "success", details: "Submission reopened.", data: mapSubmission(updated) };
  },

  async createException(input: {
    submissionId: string;
    requesterId: string;
    scope: "deadline" | "document_obligation" | "procedure_condition";
    rationale: string;
    requestedEffect: string;
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
        },
      });

      return { outcome: "success", details: "Exception created.", data: mapException(created) };
    } catch (error) {
      translateForeignKeyError(error, "Requester user not found.");
    }
  },

  async decideException(exceptionId: string, decision: "approved" | "rejected", rationale: string, actorId: string): Promise<ServiceResult> {
    await ensureException(exceptionId);

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

      return { outcome: "success", details: `Exception ${decision}.`, data: mapException(updated) };
    } catch (error) {
      translateForeignKeyError(error, "Actor user not found.");
    }
  },

  async getSubmission(submissionId: string): Promise<ServiceResult> {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        documents: true,
        auditEvents: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        exceptionRequests: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!submission) {
      throw new DomainError("NOT_FOUND", "Submission not found.");
    }

    return { outcome: "success", details: "Submission read model fetched.", data: submission };
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
      },
    });

    return {
      outcome: "success",
      details: "Exception list read model fetched.",
      data: exceptionRequests,
    };
  },
};

"use client";

import { useEffect, useSyncExternalStore } from "react";

import { reviewDetailBySubmissionId } from "@/lib/mock/coordinator-institutional";
import { deadlines, exceptions, requiredDocumentsForSubmission, submissions } from "@/lib/mock/student-institutional";
import type { DeadlineState, SubmissionState } from "@/types/institutional";

type FormPayload = Record<string, unknown>;

type ExceptionScope = "deadline" | "document_obligation" | "procedure_condition";

type ExceptionState = "submitted" | "in_review" | "approved" | "rejected" | "applied" | "closed";

export type InstitutionalRequiredDocument = {
  id: string;
  title: string;
  required: boolean;
  status: "missing" | "attached" | "rejected";
  fileName?: string;
  fileSizeMb?: number;
  format: "pdf" | "png" | "jpg";
  maxSizeMb: number;
  qualityRule?: string;
};

export type InstitutionalSubmission = {
  id: string;
  procedure: string;
  stage: string;
  dueDate: string;
  state: SubmissionState;
  mandatoryMetadataComplete: boolean;
  validationPassed: boolean;
  lastPayload?: FormPayload;
  latestDecisionRationale?: string;
  latestDecisionBy?: string;
};

export type InstitutionalExceptionTimelineEvent = {
  id: string;
  type: "request_created" | "review_started" | "approved" | "rejected" | "applied";
  at: string;
  actorId: string;
  note: string;
};

export type InstitutionalException = {
  id: string;
  submissionId: string;
  state: ExceptionState;
  scope: ExceptionScope;
  rationale: string;
  requestedEffect: string;
  coveredTargetId?: string;
  decisionBy?: string;
  decisionRationale?: string;
  appliedEffectSummary?: string;
  timeline: InstitutionalExceptionTimelineEvent[];
};

export type InstitutionalAuditEntry = {
  id: string;
  submissionId: string;
  timestamp: string;
  actorId: string;
  action: string;
  outcome: "success" | "blocked";
  rationale?: string;
  previousState?: SubmissionState;
  nextState?: SubmissionState;
  details?: string;
};

export type InstitutionalStoreState = {
  submissions: Record<string, InstitutionalSubmission>;
  requiredDocsBySubmissionId: Record<string, InstitutionalRequiredDocument[]>;
  deadlines: Array<{
    id: string;
    submissionId?: string;
    obligation: string;
    officialDueDate: string;
    effectiveDueDate: string;
    state: DeadlineState;
    overrideBasis: string | null;
  }>;
  exceptions: InstitutionalException[];
  auditLog: InstitutionalAuditEntry[];
};

const STORAGE_KEY = "erasmusmate.institutional-store.v1";

const cloneRequiredDocs = () => requiredDocumentsForSubmission.map((doc) => ({ ...doc }));

const initialSubmissions: Record<string, InstitutionalSubmission> = {
  ...Object.fromEntries(
    submissions.map((submission) => [
      submission.id,
      {
        id: submission.id,
        procedure: submission.procedure,
        stage: submission.stage,
        dueDate: submission.dueDate,
        state: submission.state,
        mandatoryMetadataComplete: submission.mandatoryMetadataComplete,
        validationPassed: true,
      },
    ]),
  ),
  ...Object.fromEntries(
    Object.values(reviewDetailBySubmissionId).map((detail) => [
      detail.id,
      {
        id: detail.id,
        procedure: detail.procedure,
        stage: "Coordinator review",
        dueDate: detail.reviewDeadline,
        state: "in_review" as SubmissionState,
        mandatoryMetadataComplete: true,
        validationPassed: true,
      },
    ]),
  ),
};

const nowIso = () => new Date().toISOString();

const mapInitialExceptions = (): InstitutionalException[] =>
  exceptions.map((item, index) => {
    const rawState = item.state as string;
    const rawScope = item.scope as string;

    const normalizedState: ExceptionState =
      rawState === "delegated"
        ? "in_review"
        : ["submitted", "in_review", "approved", "rejected", "applied", "closed"].includes(rawState)
          ? (rawState as ExceptionState)
          : "submitted";

    const normalizedScope: ExceptionScope =
      rawScope === "signature"
        ? "procedure_condition"
        : ["deadline", "document_obligation", "procedure_condition"].includes(rawScope)
          ? (rawScope as ExceptionScope)
          : "procedure_condition";

    return {
      id: item.id,
      submissionId: item.submissionId,
      state: normalizedState,
      scope: normalizedScope,
      rationale: item.rationale,
      requestedEffect: "requestedEffect" in item && typeof item.requestedEffect === "string" ? item.requestedEffect : "Institutional exception requested.",
      coveredTargetId: "coveredTargetId" in item && typeof item.coveredTargetId === "string" ? item.coveredTargetId : undefined,
      decisionBy: "decisionBy" in item && typeof item.decisionBy === "string" ? item.decisionBy : undefined,
      decisionRationale:
        "decisionRationale" in item && typeof item.decisionRationale === "string" ? item.decisionRationale : undefined,
      appliedEffectSummary:
        "appliedEffectSummary" in item && typeof item.appliedEffectSummary === "string" ? item.appliedEffectSummary : undefined,
      timeline: [
        {
          id: `EVT-seed-${index + 1}`,
          type: "request_created",
          at: nowIso(),
          actorId: "student",
          note: "Exception request submitted.",
        },
      ],
    };
  });

const initialState: InstitutionalStoreState = {
  submissions: initialSubmissions,
  requiredDocsBySubmissionId: Object.fromEntries(Object.keys(initialSubmissions).map((id) => [id, cloneRequiredDocs()])),
  deadlines: deadlines.map((deadline) => ({ ...deadline })),
  exceptions: mapInitialExceptions(),
  auditLog: [],
};

let state = initialState;
let hydrated = false;
const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach((listener) => listener());
};

const persistState = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore persistence failures so in-memory state updates and UI notifications still complete.
  }
};

const setState = (updater: (prev: InstitutionalStoreState) => InstitutionalStoreState) => {
  state = updater(state);
  persistState();
  notify();
};

const createAuditEntry = (entry: Omit<InstitutionalAuditEntry, "id" | "timestamp">): InstitutionalAuditEntry => ({
  ...entry,
  id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  timestamp: nowIso(),
});

const createExceptionEvent = (
  type: InstitutionalExceptionTimelineEvent["type"],
  actorId: string,
  note: string,
): InstitutionalExceptionTimelineEvent => ({
  id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  type,
  at: nowIso(),
  actorId,
  note,
});

const updateSubmission = (
  submissionId: string,
  actorId: string,
  action: string,
  applyUpdate: (submission: InstitutionalSubmission) => {
    nextSubmission?: InstitutionalSubmission;
    outcome: "success" | "blocked";
    rationale?: string;
    details?: string;
  },
) => {
  setState((prev) => {
    const current = prev.submissions[submissionId];
    if (!current) {
      return {
        ...prev,
        auditLog: [
          createAuditEntry({
            submissionId,
            actorId,
            action,
            outcome: "blocked",
            details: "Submission not found.",
          }),
          ...prev.auditLog,
        ],
      };
    }

    const result = applyUpdate(current);
    const updatedSubmission = result.nextSubmission;

    return {
      ...prev,
      submissions: updatedSubmission
        ? {
            ...prev.submissions,
            [submissionId]: updatedSubmission,
          }
        : prev.submissions,
      auditLog: [
        createAuditEntry({
          submissionId,
          actorId,
          action,
          outcome: result.outcome,
          rationale: result.rationale,
          details: result.details,
          previousState: current.state,
          nextState: updatedSubmission?.state,
        }),
        ...prev.auditLog,
      ],
    };
  });
};

const hasRequiredDocs = (docs: InstitutionalRequiredDocument[]) => docs.filter((doc) => doc.required).every((doc) => doc.status === "attached");

const parseRequestedDate = (requestedEffect: string): string | null => {
  const match = requestedEffect.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  return match?.[1] ?? null;
};

export const institutionalStore = {
  hydrate() {
    if (hydrated || typeof window === "undefined") {
      return;
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as InstitutionalStoreState;
        state = {
          ...initialState,
          ...parsed,
          submissions: {
            ...initialState.submissions,
            ...parsed.submissions,
          },
          requiredDocsBySubmissionId: {
            ...initialState.requiredDocsBySubmissionId,
            ...parsed.requiredDocsBySubmissionId,
          },
        };
      } catch {
        state = initialState;
      }
    }

    hydrated = true;
    notify();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getState() {
    return state;
  },
  saveSubmissionDraft(submissionId: string, formPayload: FormPayload) {
    updateSubmission(submissionId, "student", "save_submission_draft", (submission) => ({
      outcome: "success",
      details: "Draft payload saved.",
      nextSubmission: {
        ...submission,
        state: "draft",
        lastPayload: { ...formPayload },
        mandatoryMetadataComplete: Boolean(formPayload.submissionMetadata),
      },
    }));
  },
  finalSubmit(submissionId: string) {
    updateSubmission(submissionId, "student", "final_submit", (submission) => {
      const docs = state.requiredDocsBySubmissionId[submissionId] ?? [];
      const metadataComplete = submission.mandatoryMetadataComplete;
      const validationPassed = submission.validationPassed;

      if (!hasRequiredDocs(docs) || !metadataComplete || !validationPassed) {
        return {
          outcome: "blocked",
          details: "Mandatory documents, metadata, or validations are incomplete.",
        };
      }

      return {
        outcome: "success",
        details: "Submission moved to institutional review queue.",
        nextSubmission: {
          ...submission,
          state: "submitted",
        },
      };
    });
  },
  reviewApprove(submissionId: string, rationale: string, coordinatorId: string) {
    updateSubmission(submissionId, coordinatorId, "review_approve", (submission) => ({
      outcome: "success",
      rationale,
      nextSubmission: {
        ...submission,
        state: "approved",
        latestDecisionRationale: rationale,
        latestDecisionBy: coordinatorId,
      },
    }));
  },
  reviewReject(submissionId: string, rationale: string, coordinatorId: string) {
    updateSubmission(submissionId, coordinatorId, "review_reject", (submission) => ({
      outcome: "success",
      rationale,
      nextSubmission: {
        ...submission,
        state: "rejected",
        latestDecisionRationale: rationale,
        latestDecisionBy: coordinatorId,
      },
    }));
  },
  reviewReopen(submissionId: string, rationale: string, coordinatorId: string) {
    updateSubmission(submissionId, coordinatorId, "review_reopen", (submission) => ({
      outcome: "success",
      rationale,
      nextSubmission: {
        ...submission,
        state: "reopened",
        latestDecisionRationale: rationale,
        latestDecisionBy: coordinatorId,
      },
    }));
  },
  resubmitAfterRejection(submissionId: string, correctedPayload: FormPayload) {
    updateSubmission(submissionId, "student", "resubmit_after_rejection", (submission) => {
      if (submission.state !== "rejected" && submission.state !== "reopened") {
        return {
          outcome: "blocked",
          details: "Resubmission allowed only after rejection or reopen decision.",
        };
      }

      return {
        outcome: "success",
        details: "Corrected payload submitted after coordinator feedback.",
        nextSubmission: {
          ...submission,
          state: "resubmitted",
          lastPayload: { ...correctedPayload },
          mandatoryMetadataComplete: Boolean(correctedPayload.submissionMetadata),
        },
      };
    });
  },
  createExceptionRequest({
    submissionId,
    scope,
    rationale,
    requestedEffect,
    coveredTargetId,
  }: {
    submissionId: string;
    scope: ExceptionScope;
    rationale: string;
    requestedEffect: string;
    coveredTargetId?: string;
  }) {
    setState((prev) => {
      if (!prev.submissions[submissionId]) {
        return {
          ...prev,
          auditLog: [
            createAuditEntry({
              submissionId,
              actorId: "student",
              action: "exception_request_created",
              outcome: "blocked",
              rationale,
              details: `Blocked: submission ${submissionId} not found in store.`,
            }),
            ...prev.auditLog,
          ],
        };
      }

      const exceptionId = `EXC-${new Date().getFullYear()}-${String(prev.exceptions.length + 1).padStart(3, "0")}`;
      const newException: InstitutionalException = {
        id: exceptionId,
        submissionId,
        scope,
        state: "submitted",
        rationale,
        requestedEffect,
        coveredTargetId,
        timeline: [createExceptionEvent("request_created", "student", "Exception request submitted for official review.")],
      };

      return {
        ...prev,
        exceptions: [newException, ...prev.exceptions],
        auditLog: [
          createAuditEntry({
            submissionId,
            actorId: "student",
            action: "exception_request_created",
            outcome: "success",
            rationale,
            details: `Scope=${scope}; requestedEffect=${requestedEffect}; coveredTargetId=${coveredTargetId ?? "n/a"}`,
          }),
          ...prev.auditLog,
        ],
      };
    });
  },
  startExceptionReview(exceptionId: string, coordinatorId: string) {
    setState((prev) => {
      const exception = prev.exceptions.find((item) => item.id === exceptionId);
      if (!exception) {
        return prev;
      }

      if (exception.state !== "submitted") {
        return {
          ...prev,
          auditLog: [
            createAuditEntry({
              submissionId: exception.submissionId,
              actorId: coordinatorId,
              action: "exception_review_started",
              outcome: "blocked",
              details: `Blocked: exception ${exceptionId} is in state '${exception.state}', not 'submitted'.`,
            }),
            ...prev.auditLog,
          ],
        };
      }

      const updatedExceptions = prev.exceptions.map((item) =>
        item.id === exceptionId
          ? {
              ...item,
              state: "in_review" as ExceptionState,
              decisionBy: coordinatorId,
              timeline: [...item.timeline, createExceptionEvent("review_started", coordinatorId, "Coordinator started exception review.")],
            }
          : item,
      );

      return {
        ...prev,
        exceptions: updatedExceptions,
        auditLog: [
          createAuditEntry({
            submissionId: exception.submissionId,
            actorId: coordinatorId,
            action: "exception_review_started",
            outcome: "success",
            details: `Exception ${exceptionId} entered in_review state.`,
          }),
          ...prev.auditLog,
        ],
      };
    });
  },
  approveException(exceptionId: string, rationale: string, coordinatorId: string) {
    setState((prev) => {
      const exception = prev.exceptions.find((item) => item.id === exceptionId);
      if (!exception) {
        return prev;
      }

      if (exception.state !== "submitted" && exception.state !== "in_review") {
        return {
          ...prev,
          auditLog: [
            createAuditEntry({
              submissionId: exception.submissionId,
              actorId: coordinatorId,
              action: "exception_approved",
              outcome: "blocked",
              rationale,
              details: `Blocked: exception ${exceptionId} is in state '${exception.state}', not approvable.`,
            }),
            ...prev.auditLog,
          ],
        };
      }

      const updatedExceptions = prev.exceptions.map((item) =>
        item.id === exceptionId
          ? {
              ...item,
              state: "approved" as ExceptionState,
              decisionBy: coordinatorId,
              decisionRationale: rationale,
              timeline: [...item.timeline, createExceptionEvent("approved", coordinatorId, `Approved: ${rationale}`)],
            }
          : item,
      );

      return {
        ...prev,
        exceptions: updatedExceptions,
        auditLog: [
          createAuditEntry({
            submissionId: exception.submissionId,
            actorId: coordinatorId,
            action: "exception_approved",
            outcome: "success",
            rationale,
            details: `Exception ${exceptionId} approved for scope ${exception.scope}.`,
          }),
          ...prev.auditLog,
        ],
      };
    });
  },
  rejectException(exceptionId: string, rationale: string, coordinatorId: string) {
    setState((prev) => {
      const exception = prev.exceptions.find((item) => item.id === exceptionId);
      if (!exception) {
        return prev;
      }

      if (exception.state !== "submitted" && exception.state !== "in_review") {
        return {
          ...prev,
          auditLog: [
            createAuditEntry({
              submissionId: exception.submissionId,
              actorId: coordinatorId,
              action: "exception_rejected",
              outcome: "blocked",
              rationale,
              details: `Blocked: exception ${exceptionId} is in state '${exception.state}', not rejectable.`,
            }),
            ...prev.auditLog,
          ],
        };
      }

      const updatedExceptions = prev.exceptions.map((item) =>
        item.id === exceptionId
          ? {
              ...item,
              state: "rejected" as ExceptionState,
              decisionBy: coordinatorId,
              decisionRationale: rationale,
              timeline: [...item.timeline, createExceptionEvent("rejected", coordinatorId, `Rejected: ${rationale}`)],
            }
          : item,
      );

      return {
        ...prev,
        exceptions: updatedExceptions,
        auditLog: [
          createAuditEntry({
            submissionId: exception.submissionId,
            actorId: coordinatorId,
            action: "exception_rejected",
            outcome: "success",
            rationale,
            details: `Exception ${exceptionId} rejected.`,
          }),
          ...prev.auditLog,
        ],
      };
    });
  },
  applyApprovedException(exceptionId: string) {
    setState((prev) => {
      const exception = prev.exceptions.find((item) => item.id === exceptionId);
      if (!exception || exception.state !== "approved") {
        return prev;
      }

      let updatedDeadlines = prev.deadlines;
      let updatedDocs = prev.requiredDocsBySubmissionId;
      let updatedSubmissions = prev.submissions;
      let appliedEffectSummary = "No scope effect applied.";
      let anyEffectApplied = false;

      if (exception.scope === "deadline") {
        updatedDeadlines = prev.deadlines.map((deadline) => {
          if (exception.coveredTargetId && deadline.id !== exception.coveredTargetId) {
            return deadline;
          }
          if (!exception.coveredTargetId && deadline.submissionId !== exception.submissionId) {
            return deadline;
          }

          const requestedDate = parseRequestedDate(exception.requestedEffect);
          appliedEffectSummary = `Deadline effective due date updated${requestedDate ? ` to ${requestedDate}` : ""}.`;
          anyEffectApplied = true;

          return {
            ...deadline,
            effectiveDueDate: requestedDate ?? deadline.effectiveDueDate,
            state: "overridden" as DeadlineState,
            overrideBasis: `${exception.id} approved exception`,
          };
        });
      }

      if (exception.scope === "document_obligation") {
        const submissionDocs = prev.requiredDocsBySubmissionId[exception.submissionId] ?? [];
        let docEffectApplied = false;
        const updatedSubmissionDocs = submissionDocs.map((doc) => {
          if (!exception.coveredTargetId || doc.id === exception.coveredTargetId) {
            if (doc.required) {
              docEffectApplied = true;
            }
            return { ...doc, required: false };
          }
          return doc;
        });
        if (docEffectApplied) {
          anyEffectApplied = true;
        }
        updatedDocs = {
          ...prev.requiredDocsBySubmissionId,
          [exception.submissionId]: updatedSubmissionDocs,
        };
        if (docEffectApplied) {
          appliedEffectSummary = "Covered document obligation marked as waived for this submission only.";
        }
      }

      if (exception.scope === "procedure_condition") {
        const submission = prev.submissions[exception.submissionId];
        if (submission) {
          updatedSubmissions = {
            ...prev.submissions,
            [exception.submissionId]: {
              ...submission,
              validationPassed: true,
            },
          };
          appliedEffectSummary = "Covered procedure condition constraint marked as satisfied for effective state checks.";
          anyEffectApplied = true;
        }
      }

      if (!anyEffectApplied) {
        return {
          ...prev,
          auditLog: [
            createAuditEntry({
              submissionId: exception.submissionId,
              actorId: "system",
              action: "exception_applied",
              outcome: "blocked",
              details: `Blocked: exception ${exceptionId} scope=${exception.scope} produced no state change (coveredTargetId or submissionId not matched).`,
            }),
            ...prev.auditLog,
          ],
        };
      }

      const updatedExceptions = prev.exceptions.map((item) =>
        item.id === exceptionId
          ? {
              ...item,
              state: "applied" as ExceptionState,
              appliedEffectSummary,
              timeline: [...item.timeline, createExceptionEvent("applied", "system", appliedEffectSummary)],
            }
          : item,
      );

      return {
        ...prev,
        deadlines: updatedDeadlines,
        requiredDocsBySubmissionId: updatedDocs,
        submissions: updatedSubmissions,
        exceptions: updatedExceptions,
        auditLog: [
          createAuditEntry({
            submissionId: exception.submissionId,
            actorId: "system",
            action: "exception_applied",
            outcome: "success",
            details: `Exception ${exceptionId} applied for scope ${exception.scope}. ${appliedEffectSummary}`,
          }),
          ...prev.auditLog,
        ],
      };
    });
  },
};

export const useInstitutionalStore = <T,>(selector: (store: InstitutionalStoreState) => T): T => {
  useEffect(() => {
    institutionalStore.hydrate();
  }, []);

  return useSyncExternalStore(institutionalStore.subscribe, () => selector(institutionalStore.getState()), () => selector(initialState));
};

"use client";

import { useEffect, useSyncExternalStore } from "react";

import { reviewDetailBySubmissionId } from "@/lib/mock/coordinator-institutional";
import { deadlines, exceptions, requiredDocumentsForSubmission, submissions } from "@/lib/mock/student-institutional";
import type { DeadlineState, SubmissionState } from "@/types/institutional";

type FormPayload = Record<string, unknown>;

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
    obligation: string;
    officialDueDate: string;
    effectiveDueDate: string;
    state: DeadlineState;
    overrideBasis: string | null;
  }>;
  exceptions: typeof exceptions;
  auditLog: InstitutionalAuditEntry[];
};

export type InstitutionalActionResult = {
  outcome: "success" | "blocked";
  details: string;
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

const initialState: InstitutionalStoreState = {
  submissions: initialSubmissions,
  requiredDocsBySubmissionId: Object.fromEntries(Object.keys(initialSubmissions).map((id) => [id, cloneRequiredDocs()])),
  deadlines: deadlines.map((deadline) => ({ ...deadline })),
  exceptions: exceptions.map((exception) => ({ ...exception })),
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
  timestamp: new Date().toISOString(),
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
) : InstitutionalActionResult => {
  let actionResult: InstitutionalActionResult = {
    outcome: "blocked",
    details: "Unknown error.",
  };

  setState((prev) => {
    const current = prev.submissions[submissionId];
    if (!current) {
      actionResult = {
        outcome: "blocked",
        details: "Submission not found.",
      };
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
    actionResult = {
      outcome: result.outcome,
      details: result.details ?? "Submission action processed.",
    };
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
  return actionResult;
};

const hasRequiredDocs = (docs: InstitutionalRequiredDocument[]) => docs.filter((doc) => doc.required).every((doc) => doc.status === "attached");

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
    return updateSubmission(submissionId, "student", "save_submission_draft", (submission) => ({
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
    return updateSubmission(submissionId, "student", "final_submit", (submission) => {
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
    return updateSubmission(submissionId, coordinatorId, "review_approve", (submission) => ({
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
    return updateSubmission(submissionId, coordinatorId, "review_reject", (submission) => ({
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
    return updateSubmission(submissionId, coordinatorId, "review_reopen", (submission) => ({
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
    return updateSubmission(submissionId, "student", "resubmit_after_rejection", (submission) => {
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
  submitExceptionRequest(submissionId: string, rationale: string) {
    const trimmed = rationale.trim();
    if (trimmed.length < 12) {
      return { outcome: "blocked" as const, details: "Provide at least 12 characters for exception rationale." };
    }

    const createdId = `EXC-${Date.now()}`;
    setState((prev) => ({
      ...prev,
      exceptions: [
        ...prev.exceptions,
        {
          id: createdId,
          scope: "deadline",
          state: "submitted",
          submissionId,
          rationale: trimmed,
        },
      ],
      auditLog: [
        createAuditEntry({
          submissionId,
          actorId: "student",
          action: "exception_request_submit",
          outcome: "success",
          details: `Exception ${createdId} submitted.`,
          rationale: trimmed,
        }),
        ...prev.auditLog,
      ],
    }));
    return { outcome: "success" as const, details: `Exception ${createdId} submitted for review.` };
  },
  decideException(exceptionId: string, decision: "approved" | "rejected", rationale: string, coordinatorId: string) {
    const trimmed = rationale.trim();
    if (trimmed.length < 12) {
      return { outcome: "blocked" as const, details: "Provide at least 12 characters before decision." };
    }

    const index = state.exceptions.findIndex((item) => item.id === exceptionId);
    if (index === -1) {
      return { outcome: "blocked" as const, details: "Exception request not found." };
    }

    const target = state.exceptions[index];
    const nextState = decision === "approved" ? "approved" : "rejected";

    setState((prev) => ({
      ...prev,
      exceptions: prev.exceptions.map((item, itemIndex) => (itemIndex === index ? { ...item, state: nextState, rationale: trimmed } : item)),
      auditLog: [
        createAuditEntry({
          submissionId: target.submissionId,
          actorId: coordinatorId,
          action: `exception_${decision}`,
          outcome: "success",
          details: `Exception ${exceptionId} marked ${nextState}.`,
          rationale: trimmed,
        }),
        ...prev.auditLog,
      ],
    }));

    return { outcome: "success" as const, details: `Exception ${exceptionId} marked ${nextState}.` };
  },
};

export const useInstitutionalStore = <T,>(selector: (store: InstitutionalStoreState) => T): T => {
  useEffect(() => {
    institutionalStore.hydrate();
  }, []);

  return useSyncExternalStore(institutionalStore.subscribe, () => selector(institutionalStore.getState()), () => selector(initialState));
};

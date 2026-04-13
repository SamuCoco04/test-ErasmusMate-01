"use client";

import { useEffect, useSyncExternalStore } from "react";

import { reviewDetailBySubmissionId } from "@/lib/mock/coordinator-institutional";
import { deadlines, exceptions, requiredDocumentsForSubmission, submissions } from "@/lib/mock/student-institutional";
import type { DeadlineState, SubmissionState } from "@/types/institutional";

type FormPayload = Record<string, unknown>;
type ExceptionScope = "deadline" | "document_obligation" | "procedure_condition";
type ExceptionState = "submitted" | "in_review" | "approved" | "rejected" | "applied" | "closed";
type ActorId = "student" | "system" | string;

type SubmissionSnapshot = {
  id: string;
  submissionId: string;
  version: number;
  submittedAt: string;
  actorId: string;
  stateAtSubmission: SubmissionState;
  payload: FormPayload;
};

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
  submittedVersions: SubmissionSnapshot[];
};

export type InstitutionalExceptionTimelineEvent = {
  id: string;
  type: "request_created" | "review_started" | "approved" | "rejected" | "applied" | "closed";
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
  previousState?: string;
  nextState?: string;
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

export type InstitutionalActionResult = { outcome: "success" | "blocked"; details: string };

const STORAGE_KEY = "erasmusmate.institutional-store.v2";
const nowIso = () => new Date().toISOString();
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
        submittedVersions: [],
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
        state: "submitted" as SubmissionState,
        mandatoryMetadataComplete: true,
        validationPassed: true,
        submittedVersions: [],
      },
    ]),
  ),
};

const mapInitialExceptions = (): InstitutionalException[] =>
  exceptions.map((item, index) => {
    const rawState = item.state as string;
    const normalizedState: ExceptionState = ["submitted", "in_review", "approved", "rejected", "applied", "closed"].includes(rawState)
      ? (rawState as ExceptionState)
      : "submitted";

    return {
      id: item.id,
      submissionId: item.submissionId,
      state: normalizedState,
      scope: item.scope as ExceptionScope,
      rationale: item.rationale,
      requestedEffect: item.requestedEffect,
      coveredTargetId: item.coveredTargetId,
      appliedEffectSummary: "appliedEffectSummary" in item ? item.appliedEffectSummary : undefined,
      timeline: [{ id: `EVT-seed-${index + 1}`, type: "request_created", at: nowIso(), actorId: "student", note: "Exception request submitted." }],
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

const notify = () => listeners.forEach((listener) => listener());

const persistState = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore persistence failures.
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

const appendAudit = (
  prev: InstitutionalStoreState,
  payload: Omit<InstitutionalAuditEntry, "id" | "timestamp">,
): InstitutionalStoreState => ({
  ...prev,
  auditLog: [createAuditEntry(payload), ...prev.auditLog],
});

const hasRequiredDocs = (docs: InstitutionalRequiredDocument[]) => docs.filter((doc) => doc.required).every((doc) => doc.status === "attached");
const parseRequestedDate = (requestedEffect: string): string | null => requestedEffect.match(/\b(\d{4}-\d{2}-\d{2})\b/)?.[1] ?? null;

const submissionGuards: Partial<Record<SubmissionState, SubmissionState[]>> = {
  draft: ["submitted"],
  submitted: ["in_review"],
  in_review: ["approved", "rejected", "reopened"],
  rejected: ["resubmitted"],
  reopened: ["resubmitted"],
  resubmitted: ["in_review"],
};

const canTransition = (from: SubmissionState, to: SubmissionState) => (submissionGuards[from] ?? []).includes(to);

const transitionSubmissionState = ({
  submissionId,
  actorId,
  action,
  nextState,
  rationale,
  details,
  update,
}: {
  submissionId: string;
  actorId: ActorId;
  action: string;
  nextState: SubmissionState;
  rationale?: string;
  details: string;
  update?: (submission: InstitutionalSubmission) => InstitutionalSubmission;
}): InstitutionalActionResult => {
  let actionResult: InstitutionalActionResult = { outcome: "blocked", details: "Unknown error." };

  setState((prev) => {
    const submission = prev.submissions[submissionId];
    if (!submission) {
      actionResult = { outcome: "blocked", details: "Submission not found." };
      return appendAudit(prev, {
        submissionId,
        actorId,
        action,
        outcome: "blocked",
        details: "Submission not found.",
      });
    }

    if (!canTransition(submission.state, nextState)) {
      actionResult = { outcome: "blocked", details: `Invalid transition ${submission.state} → ${nextState}.` };
      return appendAudit(prev, {
        submissionId,
        actorId,
        action,
        outcome: "blocked",
        rationale,
        previousState: submission.state,
        nextState,
        details: `Blocked invalid transition ${submission.state} → ${nextState}.`,
      });
    }

    const nextSubmission = (update ? update(submission) : submission);
    const updatedSubmission = { ...nextSubmission, state: nextState };

    actionResult = { outcome: "success", details };
    return {
      ...prev,
      submissions: {
        ...prev.submissions,
        [submissionId]: updatedSubmission,
      },
      auditLog: [
        createAuditEntry({
          submissionId,
          actorId,
          action,
          outcome: "success",
          rationale,
          previousState: submission.state,
          nextState,
          details,
        }),
        ...prev.auditLog,
      ],
    };
  });

  return actionResult;
};

export const institutionalStore = {
  hydrate() {
    if (hydrated || typeof window === "undefined") return;

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as InstitutionalStoreState;
        state = {
          ...initialState,
          ...parsed,
          submissions: {
            ...initialState.submissions,
            ...Object.fromEntries(
              Object.entries(parsed.submissions ?? {}).map(([id, item]) => [id, { ...item, submittedVersions: item.submittedVersions ?? [] }]),
            ),
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
  saveSubmissionDraft(submissionId: string, formPayload: FormPayload): InstitutionalActionResult {
    const submission = state.submissions[submissionId];
    if (!submission) return { outcome: "blocked", details: "Submission not found." } satisfies InstitutionalActionResult;
    if (!["draft", "rejected", "reopened"].includes(submission.state)) {
      return { outcome: "blocked", details: `Cannot edit draft while state is ${submission.state}.` } satisfies InstitutionalActionResult;
    }

    setState((prev) => {
      const current = prev.submissions[submissionId];
      if (!current) return prev;

      const updated = {
        ...current,
        state: "draft" as SubmissionState,
        lastPayload: { ...formPayload },
        mandatoryMetadataComplete: Boolean(formPayload.submissionMetadata),
      };

      return {
        ...prev,
        submissions: { ...prev.submissions, [submissionId]: updated },
        auditLog: [
          createAuditEntry({
            submissionId,
            actorId: "student",
            action: "save_submission_draft",
            outcome: "success",
            previousState: current.state,
            nextState: "draft",
            details: "Draft payload saved.",
          }),
          ...prev.auditLog,
        ],
      };
    });

    return { outcome: "success", details: "Draft payload saved." } satisfies InstitutionalActionResult;
  },
  finalSubmit(submissionId: string): InstitutionalActionResult {
    const submission = state.submissions[submissionId];
    if (!submission) return { outcome: "blocked", details: "Submission not found." } satisfies InstitutionalActionResult;

    const docs = state.requiredDocsBySubmissionId[submissionId] ?? [];
    if (!hasRequiredDocs(docs) || !submission.mandatoryMetadataComplete || !submission.validationPassed) {
      return transitionSubmissionState({
        submissionId,
        actorId: "student",
        action: "final_submit",
        nextState: "submitted",
        details: "Mandatory documents, metadata, or validations are incomplete.",
      });
    }

    return transitionSubmissionState({
      submissionId,
      actorId: "student",
      action: "final_submit",
      nextState: "submitted",
      details: "Submission moved to institutional review queue.",
      update: (item) => ({
        ...item,
        submittedVersions: [
          ...item.submittedVersions,
          {
            id: `SNAP-${submissionId}-${item.submittedVersions.length + 1}`,
            submissionId,
            version: item.submittedVersions.length + 1,
            submittedAt: nowIso(),
            actorId: "student",
            stateAtSubmission: item.state,
            payload: structuredClone(item.lastPayload ?? {}),
          },
        ],
      }),
    });
  },
  startReview(submissionId: string, coordinatorId: string): InstitutionalActionResult {
    return transitionSubmissionState({
      submissionId,
      actorId: coordinatorId,
      action: "review_started",
      nextState: "in_review",
      details: "Submission assigned and opened for coordinator review.",
    });
  },
  reviewApprove(submissionId: string, rationale: string, coordinatorId: string): InstitutionalActionResult {
    if (!rationale.trim()) return { outcome: "blocked", details: "Rationale required for approval decision." };
    return transitionSubmissionState({
      submissionId,
      actorId: coordinatorId,
      action: "review_approve",
      nextState: "approved",
      rationale,
      details: "Submission approved by coordinator.",
      update: (item) => ({ ...item, latestDecisionRationale: rationale, latestDecisionBy: coordinatorId }),
    });
  },
  reviewReject(submissionId: string, rationale: string, coordinatorId: string): InstitutionalActionResult {
    if (!rationale.trim()) return { outcome: "blocked", details: "Rationale required for rejection." };
    return transitionSubmissionState({
      submissionId,
      actorId: coordinatorId,
      action: "review_reject",
      nextState: "rejected",
      rationale,
      details: "Submission rejected by coordinator.",
      update: (item) => ({ ...item, latestDecisionRationale: rationale, latestDecisionBy: coordinatorId }),
    });
  },
  reviewReopen(submissionId: string, rationale: string, coordinatorId: string): InstitutionalActionResult {
    if (!rationale.trim()) return { outcome: "blocked", details: "Rationale required for reopen decision." };
    return transitionSubmissionState({
      submissionId,
      actorId: coordinatorId,
      action: "review_reopen",
      nextState: "reopened",
      rationale,
      details: "Submission reopened with coordinator rationale.",
      update: (item) => ({ ...item, latestDecisionRationale: rationale, latestDecisionBy: coordinatorId }),
    });
  },
  resubmitAfterRejection(submissionId: string, correctedPayload: FormPayload): InstitutionalActionResult {
    return transitionSubmissionState({
      submissionId,
      actorId: "student",
      action: "resubmit_after_rejection",
      nextState: "resubmitted",
      details: "Corrected payload submitted after coordinator feedback.",
      update: (item) => ({
        ...item,
        lastPayload: { ...correctedPayload },
        mandatoryMetadataComplete: Boolean(correctedPayload.submissionMetadata),
      }),
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
  }): InstitutionalActionResult {
    if (!state.submissions[submissionId]) {
      return { outcome: "blocked", details: `Submission ${submissionId} not found.` };
    }

    setState((prev) => {
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
            previousState: "none",
            nextState: "submitted",
            details: `Scope=${scope}; requestedEffect=${requestedEffect}; coveredTargetId=${coveredTargetId ?? "n/a"}`,
          }),
          ...prev.auditLog,
        ],
      };
    });

    return { outcome: "success", details: "Exception submitted for coordinator review." };
  },
  startExceptionReview(exceptionId: string, coordinatorId: string): InstitutionalActionResult {
    let result: InstitutionalActionResult = { outcome: "blocked", details: "Exception not found." };

    setState((prev) => {
      const exception = prev.exceptions.find((item) => item.id === exceptionId);
      if (!exception) return prev;
      if (exception.state !== "submitted") {
        result = { outcome: "blocked", details: `Exception ${exceptionId} must be in submitted state.` };
        return appendAudit(prev, {
          submissionId: exception.submissionId,
          actorId: coordinatorId,
          action: "exception_review_started",
          outcome: "blocked",
          previousState: exception.state,
          nextState: "in_review",
          details: result.details,
        });
      }

      result = { outcome: "success", details: `Exception ${exceptionId} moved to in_review.` };
      return {
        ...prev,
        exceptions: prev.exceptions.map((item) =>
          item.id === exceptionId
            ? {
                ...item,
                state: "in_review",
                decisionBy: coordinatorId,
                timeline: [...item.timeline, createExceptionEvent("review_started", coordinatorId, "Coordinator started exception review.")],
              }
            : item,
        ),
        auditLog: [
          createAuditEntry({
            submissionId: exception.submissionId,
            actorId: coordinatorId,
            action: "exception_review_started",
            outcome: "success",
            previousState: "submitted",
            nextState: "in_review",
            details: result.details,
          }),
          ...prev.auditLog,
        ],
      };
    });

    return result;
  },
  approveException(exceptionId: string, rationale: string, coordinatorId: string): InstitutionalActionResult {
    if (!rationale.trim()) return { outcome: "blocked", details: "Rationale required for exception approval." };
    let result: InstitutionalActionResult = { outcome: "blocked", details: "Exception not found." };

    setState((prev) => {
      const exception = prev.exceptions.find((item) => item.id === exceptionId);
      if (!exception) return prev;
      if (!["submitted", "in_review"].includes(exception.state)) {
        result = { outcome: "blocked", details: `Exception ${exceptionId} cannot be approved from ${exception.state}.` };
        return appendAudit(prev, {
          submissionId: exception.submissionId,
          actorId: coordinatorId,
          action: "exception_approved",
          outcome: "blocked",
          rationale,
          previousState: exception.state,
          nextState: "approved",
          details: result.details,
        });
      }

      result = { outcome: "success", details: `Exception ${exceptionId} approved.` };
      return {
        ...prev,
        exceptions: prev.exceptions.map((item) =>
          item.id === exceptionId
            ? {
                ...item,
                state: "approved",
                decisionBy: coordinatorId,
                decisionRationale: rationale,
                timeline: [...item.timeline, createExceptionEvent("approved", coordinatorId, `Approved: ${rationale}`)],
              }
            : item,
        ),
        auditLog: [
          createAuditEntry({
            submissionId: exception.submissionId,
            actorId: coordinatorId,
            action: "exception_approved",
            outcome: "success",
            rationale,
            previousState: exception.state,
            nextState: "approved",
            details: result.details,
          }),
          ...prev.auditLog,
        ],
      };
    });

    return result;
  },
  rejectException(exceptionId: string, rationale: string, coordinatorId: string): InstitutionalActionResult {
    if (!rationale.trim()) return { outcome: "blocked", details: "Rationale required for exception rejection." };
    let result: InstitutionalActionResult = { outcome: "blocked", details: "Exception not found." };

    setState((prev) => {
      const exception = prev.exceptions.find((item) => item.id === exceptionId);
      if (!exception) return prev;
      if (!["submitted", "in_review"].includes(exception.state)) {
        result = { outcome: "blocked", details: `Exception ${exceptionId} cannot be rejected from ${exception.state}.` };
        return appendAudit(prev, {
          submissionId: exception.submissionId,
          actorId: coordinatorId,
          action: "exception_rejected",
          outcome: "blocked",
          rationale,
          previousState: exception.state,
          nextState: "rejected",
          details: result.details,
        });
      }

      result = { outcome: "success", details: `Exception ${exceptionId} rejected.` };
      return {
        ...prev,
        exceptions: prev.exceptions.map((item) =>
          item.id === exceptionId
            ? {
                ...item,
                state: "rejected",
                decisionBy: coordinatorId,
                decisionRationale: rationale,
                timeline: [...item.timeline, createExceptionEvent("rejected", coordinatorId, `Rejected: ${rationale}`)],
              }
            : item,
        ),
        auditLog: [
          createAuditEntry({
            submissionId: exception.submissionId,
            actorId: coordinatorId,
            action: "exception_rejected",
            outcome: "success",
            rationale,
            previousState: exception.state,
            nextState: "rejected",
            details: result.details,
          }),
          ...prev.auditLog,
        ],
      };
    });

    return result;
  },
  applyApprovedException(exceptionId: string): InstitutionalActionResult {
    let result: InstitutionalActionResult = { outcome: "blocked", details: "Exception not found or not approved." };

    setState((prev) => {
      const exception = prev.exceptions.find((item) => item.id === exceptionId);
      if (!exception || exception.state !== "approved") return prev;

      let updatedDeadlines = prev.deadlines;
      let updatedDocs = prev.requiredDocsBySubmissionId;
      let updatedSubmissions = prev.submissions;
      let appliedEffectSummary = "No scope effect applied.";
      let anyEffectApplied = false;

      if (exception.scope === "deadline") {
        updatedDeadlines = prev.deadlines.map((deadline) => {
          if (exception.coveredTargetId && deadline.id !== exception.coveredTargetId) return deadline;
          if (!exception.coveredTargetId && deadline.submissionId !== exception.submissionId) return deadline;

          const requestedDate = parseRequestedDate(exception.requestedEffect);
          anyEffectApplied = true;
          appliedEffectSummary = `Deadline effective due date updated${requestedDate ? ` to ${requestedDate}` : ""}.`;

          return {
            ...deadline,
            effectiveDueDate: requestedDate ?? deadline.effectiveDueDate,
            state: "overridden" as DeadlineState,
            overrideBasis: `${exception.id} approved exception`,
          };
        });
      }

      if (exception.scope === "document_obligation") {
        const docs = prev.requiredDocsBySubmissionId[exception.submissionId] ?? [];
        let docChanged = false;
        updatedDocs = {
          ...prev.requiredDocsBySubmissionId,
          [exception.submissionId]: docs.map((doc) => {
            if (!exception.coveredTargetId || doc.id === exception.coveredTargetId) {
              docChanged ||= doc.required;
              return { ...doc, required: false };
            }
            return doc;
          }),
        };
        anyEffectApplied ||= docChanged;
        if (docChanged) appliedEffectSummary = "Covered document obligation marked as waived for this submission only.";
      }

      if (exception.scope === "procedure_condition") {
        const submission = prev.submissions[exception.submissionId];
        if (submission) {
          updatedSubmissions = {
            ...prev.submissions,
            [exception.submissionId]: { ...submission, validationPassed: true },
          };
          anyEffectApplied = true;
          appliedEffectSummary = "Covered procedure condition marked as satisfied for effective state checks.";
        }
      }

      if (!anyEffectApplied) {
        result = { outcome: "blocked", details: `Exception ${exceptionId} produced no state update.` };
        return appendAudit(prev, {
          submissionId: exception.submissionId,
          actorId: "system",
          action: "exception_applied",
          outcome: "blocked",
          previousState: exception.state,
          nextState: "applied",
          details: result.details,
        });
      }

      result = { outcome: "success", details: `Exception ${exceptionId} applied. ${appliedEffectSummary}` };

      return {
        ...prev,
        deadlines: updatedDeadlines,
        requiredDocsBySubmissionId: updatedDocs,
        submissions: updatedSubmissions,
        exceptions: prev.exceptions.map((item) =>
          item.id === exceptionId
            ? {
                ...item,
                state: "applied",
                appliedEffectSummary,
                timeline: [...item.timeline, createExceptionEvent("applied", "system", appliedEffectSummary)],
              }
            : item,
        ),
        auditLog: [
          createAuditEntry({
            submissionId: exception.submissionId,
            actorId: "system",
            action: "exception_applied",
            outcome: "success",
            previousState: "approved",
            nextState: "applied",
            details: result.details,
          }),
          ...prev.auditLog,
        ],
      };
    });

    return result;
  },
  closeAppliedException(exceptionId: string, actorId: string): InstitutionalActionResult {
    let result: InstitutionalActionResult = { outcome: "blocked", details: "Exception not found." };

    setState((prev) => {
      const exception = prev.exceptions.find((item) => item.id === exceptionId);
      if (!exception) return prev;
      if (exception.state !== "applied") {
        result = { outcome: "blocked", details: `Exception ${exceptionId} can only be closed from applied state.` };
        return appendAudit(prev, {
          submissionId: exception.submissionId,
          actorId,
          action: "exception_closed",
          outcome: "blocked",
          previousState: exception.state,
          nextState: "closed",
          details: result.details,
        });
      }

      result = { outcome: "success", details: `Exception ${exceptionId} closed.` };
      return {
        ...prev,
        exceptions: prev.exceptions.map((item) =>
          item.id === exceptionId
            ? { ...item, state: "closed", timeline: [...item.timeline, createExceptionEvent("closed", actorId, "Exception lifecycle closed.")] }
            : item,
        ),
        auditLog: [
          createAuditEntry({
            submissionId: exception.submissionId,
            actorId,
            action: "exception_closed",
            outcome: "success",
            previousState: "applied",
            nextState: "closed",
            details: result.details,
          }),
          ...prev.auditLog,
        ],
      };
    });

    return result;
  },
};

export const useInstitutionalStore = <T,>(selector: (store: InstitutionalStoreState) => T): T => {
  useEffect(() => {
    institutionalStore.hydrate();
  }, []);

  return useSyncExternalStore(institutionalStore.subscribe, () => selector(institutionalStore.getState()), () => selector(initialState));
};

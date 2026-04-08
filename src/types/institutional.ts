export type InstitutionalRole = "student" | "coordinator" | "admin";
export type MobilityLifecycle = "draft" | "submitted" | "in_review" | "approved" | "active" | "completed" | "closed" | "terminated";
export type SubmissionState = "draft" | "submitted" | "in_review" | "approved" | "rejected" | "reopened" | "resubmitted" | "archived";
export type DeadlineState = "upcoming" | "overdue" | "overridden";
export type ExceptionState = "submitted" | "in_review" | "approved" | "rejected" | "applied" | "closed" | "delegated";

export type InstitutionalPersona = {
  id: string;
  role: InstitutionalRole;
  fullName: string;
  institution: string;
  destinationScope?: string[];
};

export type InstitutionalFlowFlag = "normal" | "rejected" | "resubmitted" | "reopened" | "overdue" | "delegated";

export type InstitutionalSubmissionRecord = {
  id: string;
  studentId: string;
  procedure: string;
  lifecycleStage: "pre_departure" | "during_mobility" | "end_of_mobility";
  state: SubmissionState;
  flow: InstitutionalFlowFlag;
  dueDate: string;
  delegatedTo?: string;
  latestDecisionRationale?: string;
};

export type InstitutionalExceptionRecord = {
  id: string;
  submissionId: string;
  state: ExceptionState;
  scope: "deadline" | "document_obligation" | "signature";
  rationale: string;
  decisionBy?: string;
};

export type DelegationTrace = {
  id: string;
  fromCoordinatorId: string;
  toCoordinatorId: string;
  scope: string;
  reason: string;
  effectiveAt: string;
};

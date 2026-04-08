import type { DelegationTrace, InstitutionalExceptionRecord, InstitutionalSubmissionRecord } from "@/types/institutional";

export const institutionalSubmissionsFixture: InstitutionalSubmissionRecord[] = [
  { id: "SUB-2026-0847", studentId: "PER-STU-001", procedure: "Learning Agreement Revision", lifecycleStage: "pre_departure", state: "in_review", flow: "normal", dueDate: "2026-03-10" },
  { id: "SUB-2026-0859", studentId: "PER-STU-001", procedure: "Transcript Upload", lifecycleStage: "end_of_mobility", state: "rejected", flow: "rejected", dueDate: "2026-07-12", latestDecisionRationale: "Host institution stamp missing." },
  { id: "SUB-2026-0861", studentId: "PER-STU-001", procedure: "Transcript Upload", lifecycleStage: "end_of_mobility", state: "resubmitted", flow: "resubmitted", dueDate: "2026-07-14", latestDecisionRationale: "Resubmitted after adding certified copy." },
  { id: "SUB-2026-0865", studentId: "PER-STU-001", procedure: "Grant Agreement", lifecycleStage: "pre_departure", state: "reopened", flow: "reopened", dueDate: "2026-02-01", latestDecisionRationale: "Reopened by coordinator for corrected signature block." },
  { id: "SUB-2026-0872", studentId: "PER-STU-001", procedure: "Arrival Confirmation", lifecycleStage: "during_mobility", state: "submitted", flow: "overdue", dueDate: "2026-02-10", latestDecisionRationale: "Submitted late without prior extension." },
  { id: "SUB-2026-0888", studentId: "PER-STU-001", procedure: "Exception-backed Deadline Override", lifecycleStage: "during_mobility", state: "in_review", flow: "delegated", dueDate: "2026-03-12", delegatedTo: "PER-COO-002", latestDecisionRationale: "Delegated due to coordinator absence." },
];

export const institutionalExceptionsFixture: InstitutionalExceptionRecord[] = [
  { id: "EXC-2026-032", submissionId: "SUB-2026-0847", state: "applied", scope: "deadline", rationale: "Medical certificate for mandatory appointment", decisionBy: "PER-COO-001" },
  { id: "EXC-2026-035", submissionId: "SUB-2026-0888", state: "delegated", scope: "document_obligation", rationale: "Registrar backlog at host institution", decisionBy: "PER-COO-001" },
  { id: "EXC-2026-041", submissionId: "SUB-2026-0872", state: "rejected", scope: "deadline", rationale: "Insufficient evidence for retroactive extension", decisionBy: "PER-COO-001" },
];

export const delegationTraceFixture: DelegationTrace[] = [
  { id: "DEL-2026-001", fromCoordinatorId: "PER-COO-001", toCoordinatorId: "PER-COO-002", scope: "SUB-2026-0888", reason: "Temporary reassignment due to approved leave", effectiveAt: "2026-03-09T11:00:00Z" },
];

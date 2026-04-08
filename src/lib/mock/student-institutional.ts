export type MobilityRecordState = "draft" | "submitted" | "in_review" | "approved" | "active" | "completed" | "closed" | "terminated";

export type SubmissionState =
  | "draft"
  | "submitted"
  | "in_review"
  | "approved"
  | "rejected"
  | "reopened"
  | "resubmitted"
  | "archived";

export type DeadlineState = "upcoming" | "overdue" | "overridden";

export type RequiredDocument = {
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

export const mobilityTimeline: { state: MobilityRecordState; date: string; note: string }[] = [
  { state: "draft", date: "2026-01-05", note: "Record initiated by student" },
  { state: "submitted", date: "2026-01-07", note: "Submitted for institutional intake" },
  { state: "in_review", date: "2026-01-09", note: "Coordinator review assigned" },
  { state: "approved", date: "2026-01-12", note: "Institution accepted eligibility" },
  { state: "active", date: "2026-02-01", note: "Mobility execution started" },
  { state: "completed", date: "2026-06-30", note: "Operational mobility period completed" },
  { state: "closed", date: "2026-07-18", note: "All end-of-mobility obligations fulfilled" },
  { state: "terminated", date: "—", note: "Alternative exceptional early-exit state" },
];

export const myMobilityRecord = {
  id: "MOB-2026-00047",
  studentName: "Maria Rodriguez",
  homeInstitution: "Technical University of Madrid",
  hostInstitution: "University of Barcelona",
  destination: "Barcelona, Spain",
  period: "February 2026 – June 2026",
  state: "active" as MobilityRecordState,
};

export const submissions = [
  {
    id: "SUB-2026-0341",
    procedure: "Learning Agreement",
    stage: "Pre-departure",
    state: "in_review" as SubmissionState,
    dueDate: "2026-02-08",
    mandatoryMetadataComplete: true,
  },
  {
    id: "SUB-2026-0402",
    procedure: "Transcript of Records Upload",
    stage: "End-of-mobility",
    state: "draft" as SubmissionState,
    dueDate: "2026-07-10",
    mandatoryMetadataComplete: false,
  },
  {
    id: "SUB-2026-0179",
    procedure: "Arrival Confirmation",
    stage: "During mobility",
    state: "approved" as SubmissionState,
    dueDate: "2026-02-10",
    mandatoryMetadataComplete: true,
  },
  {
    id: "SUB-2026-0090",
    procedure: "LA Change Request",
    stage: "During mobility",
    state: "rejected" as SubmissionState,
    dueDate: "2026-03-22",
    mandatoryMetadataComplete: true,
  },
  {
    id: "SUB-2026-0051",
    procedure: "Learning Agreement v1",
    stage: "Historical",
    state: "archived" as SubmissionState,
    dueDate: "2026-01-22",
    mandatoryMetadataComplete: true,
  },
];

export const requiredDocumentsForSubmission: RequiredDocument[] = [
  {
    id: "learning-agreement",
    title: "Learning Agreement Form",
    required: true,
    status: "attached",
    fileName: "Learning_Agreement_Form.pdf",
    fileSizeMb: 2.4,
    format: "pdf",
    maxSizeMb: 10,
    qualityRule: "Scanned text must be readable and complete on every page.",
  },
  {
    id: "course-catalog",
    title: "Course Catalog with Selected Subjects",
    required: true,
    status: "missing",
    format: "pdf",
    maxSizeMb: 10,
    qualityRule: "Selected subjects and credits must be highlighted.",
  },
  {
    id: "transcript",
    title: "Current Academic Transcript",
    required: true,
    status: "attached",
    fileName: "Academic_Transcript.pdf",
    fileSizeMb: 0.85,
    format: "pdf",
    maxSizeMb: 10,
  },
  {
    id: "language-certificate",
    title: "Language Proficiency Certificate",
    required: false,
    status: "rejected",
    fileName: "Language_Certificate.jpg",
    fileSizeMb: 12.6,
    format: "jpg",
    maxSizeMb: 5,
    qualityRule: "Image must be front-facing and include issuing authority and score.",
  },
];

export const deadlines = [
  {
    id: "DL-301",
    obligation: "Learning Agreement revision",
    officialDueDate: "2026-03-10",
    effectiveDueDate: "2026-03-12",
    state: "overridden" as DeadlineState,
    overrideBasis: "Exception EXC-002 approved (medical incident)",
  },
  {
    id: "DL-302",
    obligation: "Transcript of Records upload",
    officialDueDate: "2026-07-10",
    effectiveDueDate: "2026-07-10",
    state: "upcoming" as DeadlineState,
    overrideBasis: null,
  },
  {
    id: "DL-303",
    obligation: "Grant agreement correction",
    officialDueDate: "2026-02-01",
    effectiveDueDate: "2026-02-01",
    state: "overdue" as DeadlineState,
    overrideBasis: null,
  },
];

export const signatures = [
  { role: "Student", status: "signed", date: "2026-02-03" },
  { role: "Home Coordinator", status: "pending", date: "—" },
  { role: "Host Coordinator", status: "pending", date: "—" },
];

export const exceptions = [
  {
    id: "EXC-002",
    scope: "deadline",
    state: "applied",
    submissionId: "SUB-2026-0341",
    rationale: "Medical appointment conflict with mandatory in-person administration process",
  },
  {
    id: "EXC-005",
    scope: "document_obligation",
    state: "in_review",
    submissionId: "SUB-2026-0402",
    rationale: "Host institution transcript issuance delayed by registrar backlog",
  },
];

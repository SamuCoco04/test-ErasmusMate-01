export type CoordinatorSubmission = {
  id: string;
  studentName: string;
  mobilityId: string;
  destination: string;
  hostInstitution: string;
  procedure: string;
  procedureSet: string;
  submittedAt: string;
  dueDate: string;
  priority: "standard" | "high" | "urgent";
  status: "in_review" | "resubmitted" | "awaiting_signature";
  assignedCoordinator: string;
};

export const coordinatorScope = {
  coordinatorName: "Dr. Anna Jensen",
  assignedDestinations: ["Barcelona, Spain", "Lisbon, Portugal", "Milan, Italy"],
  assignedProcedureSets: ["UG-Business-2026", "STEM-Integrated-2026"],
};

export const reviewQueue: CoordinatorSubmission[] = [
  {
    id: "SUB-2026-0847",
    studentName: "Maria Rodriguez",
    mobilityId: "MOB-2026-00047",
    destination: "Barcelona, Spain",
    hostInstitution: "University of Barcelona",
    procedure: "Learning Agreement Revision",
    procedureSet: "UG-Business-2026",
    submittedAt: "2026-03-08 14:32",
    dueDate: "2026-03-10",
    priority: "urgent",
    status: "in_review",
    assignedCoordinator: "Dr. Anna Jensen",
  },
  {
    id: "SUB-2026-0849",
    studentName: "Johan Andersson",
    mobilityId: "MOB-2026-00052",
    destination: "Barcelona, Spain",
    hostInstitution: "University of Barcelona",
    procedure: "Transcript of Records",
    procedureSet: "STEM-Integrated-2026",
    submittedAt: "2026-03-09 09:14",
    dueDate: "2026-03-11",
    priority: "high",
    status: "in_review",
    assignedCoordinator: "Dr. Anna Jensen",
  },
  {
    id: "SUB-2026-0853",
    studentName: "Luca Bianchi",
    mobilityId: "MOB-2026-00066",
    destination: "Milan, Italy",
    hostInstitution: "University of Milan",
    procedure: "Arrival Confirmation",
    procedureSet: "STEM-Integrated-2026",
    submittedAt: "2026-03-09 16:10",
    dueDate: "2026-03-14",
    priority: "standard",
    status: "resubmitted",
    assignedCoordinator: "Dr. Anna Jensen",
  },
];

export const signatureRequests = [
  {
    id: "SIG-2026-014",
    submissionId: "SUB-2026-0847",
    studentName: "Maria Rodriguez",
    signerRole: "Host Coordinator",
    stage: "Learning Agreement Stage 2",
    requestedAt: "2026-03-08 18:00",
    status: "pending",
  },
  {
    id: "SIG-2026-020",
    submissionId: "SUB-2026-0849",
    studentName: "Johan Andersson",
    signerRole: "Home Coordinator",
    stage: "Transcript Confirmation",
    requestedAt: "2026-03-09 12:05",
    status: "pending",
  },
];

export const exceptionDecisions = [
  {
    id: "EXC-2026-032",
    studentName: "Maria Rodriguez",
    scope: "Deadline extension",
    rationale: "Medical certificate provided for mandatory clinic appointment.",
    requestedEffect: "+2 calendar days on SUB-2026-0847",
    status: "in_review",
  },
  {
    id: "EXC-2026-035",
    studentName: "Oliver Schmidt",
    scope: "Document substitution",
    rationale: "Registrar delay in transcript issuance.",
    requestedEffect: "Accept provisional grade report",
    status: "delegated",
  },
];

export const studentMobilities = [
  {
    mobilityId: "MOB-2026-00047",
    studentName: "Maria Rodriguez",
    destination: "Barcelona, Spain",
    hostInstitution: "University of Barcelona",
    lifecycleStage: "during_mobility",
    state: "in_review",
  },
  {
    mobilityId: "MOB-2026-00052",
    studentName: "Johan Andersson",
    destination: "Barcelona, Spain",
    hostInstitution: "University of Barcelona",
    lifecycleStage: "end_of_mobility",
    state: "in_review",
  },
  {
    mobilityId: "MOB-2026-00066",
    studentName: "Luca Bianchi",
    destination: "Milan, Italy",
    hostInstitution: "University of Milan",
    lifecycleStage: "pre_departure",
    state: "approved",
  },
];

export const managedProcedureSets = [
  {
    id: "PS-UG-BIZ-2026",
    name: "UG-Business-2026",
    destinations: ["Barcelona, Spain", "Lisbon, Portugal"],
    procedures: ["Learning Agreement", "Arrival Confirmation", "Final Report"],
    state: "published",
  },
  {
    id: "PS-STEM-INT-2026",
    name: "STEM-Integrated-2026",
    destinations: ["Barcelona, Spain", "Milan, Italy"],
    procedures: ["Transcript of Records", "LA Change", "Final Transcript Reception"],
    state: "published",
  },
];

export const deadlineManagementItems = [
  {
    id: "DL-901",
    obligation: "Learning Agreement revision",
    destination: "Barcelona, Spain",
    officialDueDate: "2026-03-10",
    effectiveDueDate: "2026-03-12",
    overrideBasis: "EXC-2026-032 approved",
  },
  {
    id: "DL-910",
    obligation: "Transcript upload",
    destination: "Milan, Italy",
    officialDueDate: "2026-07-15",
    effectiveDueDate: "2026-07-15",
    overrideBasis: null,
  },
];

export const reviewDetailBySubmissionId = {
  "SUB-2026-0847": {
    id: "SUB-2026-0847",
    studentName: "Maria Rodriguez",
    destination: "Barcelona, Spain",
    hostInstitution: "University of Barcelona",
    procedure: "Learning Agreement - Before Mobility",
    submittedAt: "2026-03-08 14:32",
    reviewDeadline: "2026-03-10",
    deficiencyNotes: [
      "ECTS total was missing in prior rejected version; now corrected to 30 ECTS.",
      "Host signature block is now included but pending host coordinator signature synchronization.",
    ],
    reviewerComments: [
      "Previous rejection reason addressed with clearer module equivalence mapping.",
      "Minor formatting issue remains on page 3 footer; non-blocking.",
    ],
    validationChecklist: [
      "All required documents submitted",
      "Document formats comply with institution policy",
      "Course selection validated against procedure set",
      "Credit threshold met (>= 30 ECTS)",
      "Host institution approval attached",
      "Required signatures present or requested",
    ],
    auditEvents: [
      {
        id: "AUD-7721",
        timestamp: "2026-03-08 14:40",
        actor: "System",
        action: "Submission assigned to coordinator scope",
      },
      {
        id: "AUD-7729",
        timestamp: "2026-03-08 16:11",
        actor: "Dr. Anna Jensen",
        action: "Deficiency note added: previous ECTS mismatch resolved",
      },
    ],
  },
} as const;

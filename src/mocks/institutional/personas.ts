import type { InstitutionalPersona } from "@/types/institutional";

export const institutionalPersonas: InstitutionalPersona[] = [
  { id: "PER-STU-001", role: "student", fullName: "Maria Rodriguez", institution: "Technical University of Madrid" },
  { id: "PER-COO-001", role: "coordinator", fullName: "Dr. Anna Jensen", institution: "University of Barcelona", destinationScope: ["Barcelona, Spain", "Milan, Italy"] },
  { id: "PER-COO-002", role: "coordinator", fullName: "Prof. Elena Costa", institution: "University of Barcelona", destinationScope: ["Barcelona, Spain"] },
  { id: "PER-ADM-001", role: "admin", fullName: "System Administrator", institution: "ErasmusMate Platform Governance" },
];

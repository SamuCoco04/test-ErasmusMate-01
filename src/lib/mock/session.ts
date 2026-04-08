import type { Role } from "@/lib/mock/types";

export const roleOptions: Role[] = ["Student", "Coordinator", "Administrator"];

export const mockUser = {
  name: "Maria Rodriguez",
  role: "Student" as Role,
  institution: "University of Barcelona",
};

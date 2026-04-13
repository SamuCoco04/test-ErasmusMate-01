export type Role = "Student" | "Coordinator" | "Administrator";

export type NavItem = {
  label: string;
  href: string;
  section: "institutional" | "social";
  activePrefixes?: string[];
};

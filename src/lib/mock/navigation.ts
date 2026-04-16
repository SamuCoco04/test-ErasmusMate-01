import type { NavItem, Role } from "@/lib/mock/types";

export const institutionalMenus: Record<Role, NavItem[]> = {
  Student: [
    { label: "Dashboard", href: "/student/dashboard", section: "institutional" },
    { label: "My Mobility Record", href: "/student/my-mobility", section: "institutional" },
    {
      label: "Official Procedures",
      href: "/student/procedures",
      section: "institutional",
      activePrefixes: ["/student/procedures", "/student/submissions", "/student/submissions/[submissionId]"],
    },
    {
      label: "Signatures",
      href: "/student/signatures",
      section: "institutional",
    },
    { label: "Deadlines", href: "/student/deadlines", section: "institutional" },
    { label: "Exception Requests", href: "/student/exceptions", section: "institutional" },
  ],
  Coordinator: [
    { label: "Dashboard", href: "/coordinator/dashboard", section: "institutional" },
    {
      label: "Review Queue",
      href: "/coordinator/review-queue",
      section: "institutional",
      activePrefixes: ["/coordinator/review-queue", "/coordinator/review", "/coordinator/review/[submissionId]"],
    },
    { label: "Signature Requests", href: "/coordinator/signature-requests", section: "institutional" },
    { label: "Exception Decisions", href: "/coordinator/exception-decisions", section: "institutional" },
    { label: "Student Mobilities", href: "/coordinator/student-mobilities", section: "institutional" },
    { label: "Procedure Management", href: "/coordinator/procedure-management", section: "institutional" },
    { label: "Deadline Management", href: "/coordinator/deadline-management", section: "institutional" },
  ],
  Administrator: [
    { label: "Dashboard", href: "/admin/dashboard", section: "institutional" },
    { label: "User Management", href: "/admin/user-management", section: "institutional" },
    { label: "Feature Scoping", href: "/admin/feature-scoping", section: "institutional" },
    { label: "Moderation Queue", href: "/admin/moderation-queue", section: "institutional" },
    { label: "Reports", href: "/admin/reports", section: "institutional" },
    { label: "Audit & Traceability", href: "/admin/audit-traceability", section: "institutional" },
  ],
};

export const socialMenus: Record<Role, NavItem[]> = {
  Student: [
    { label: "Discover", href: "/discover", section: "social" },
    { label: "Connections", href: "/connections", section: "social" },
    { label: "Messages", href: "/messages", section: "social" },
    { label: "Recommendations", href: "/recommendations", section: "social" },
    { label: "Map Explorer", href: "/map-explorer", section: "social" },
    { label: "Profile", href: "/profile", section: "social" },
  ],
  Coordinator: [{ label: "Discover", href: "/discover", section: "social" }],
  Administrator: [{ label: "Discover", href: "/discover", section: "social" }],
};

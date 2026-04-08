import type { NavItem, Role } from "@/lib/mock/types";

export const institutionalMenus: Record<Role, NavItem[]> = {
  Student: [
    { label: "Dashboard", href: "/student/dashboard", section: "institutional" },
    { label: "My Mobility Record", href: "/student/my-mobility", section: "institutional" },
    { label: "Official Procedures", href: "/student/procedures", section: "institutional" },
    { label: "Signatures", href: "/student/signatures", section: "institutional" },
    { label: "Deadlines", href: "/student/deadlines", section: "institutional" },
    { label: "Exception Requests", href: "/student/exceptions", section: "institutional" },
  ],
  Coordinator: [{ label: "Dashboard", href: "/dashboard", section: "institutional" }],
  Administrator: [{ label: "Dashboard", href: "/dashboard", section: "institutional" }],
};

export const socialMenus: Record<Role, NavItem[]> = {
  Student: [
    { label: "Discover", href: "/discover", section: "social" },
    { label: "Connections", href: "/connections", section: "social" },
    { label: "Messages", href: "/messages", section: "social" },
  ],
  Coordinator: [{ label: "Discover", href: "/discover", section: "social" }],
  Administrator: [{ label: "Discover", href: "/discover", section: "social" }],
};

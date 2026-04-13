import type { Role } from "@/lib/mock/types";

export type AppSection = "institutional" | "social";

export const roleHomeRoutes: Record<Role, string> = {
  Student: "/student/dashboard",
  Coordinator: "/coordinator/dashboard",
  Administrator: "/admin/dashboard",
};

export const roleAllowedRoutePrefixes: Record<Role, string[]> = {
  Student: ["/student", "/discover", "/connections", "/messages", "/recommendations", "/map-explorer", "/profile"],
  Coordinator: ["/coordinator", "/discover"],
  Administrator: ["/admin", "/discover"],
};

export const sectionRoutePrefixes: Record<AppSection, string[]> = {
  institutional: ["/student", "/coordinator", "/admin"],
  social: ["/discover", "/connections", "/messages", "/recommendations", "/map-explorer", "/profile"],
};

function pathMatchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function getRoleHomeRoute(role: Role) {
  return roleHomeRoutes[role];
}

export function isPathAllowedForRole(role: Role, pathname: string) {
  return roleAllowedRoutePrefixes[role].some((prefix) => pathMatchesPrefix(pathname, prefix));
}

export function isPathInSection(pathname: string, section: AppSection) {
  return sectionRoutePrefixes[section].some((prefix) => pathMatchesPrefix(pathname, prefix));
}

export function isPathInPrefixes(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathMatchesPrefix(pathname, prefix));
}

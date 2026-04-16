import type { Role } from "@/lib/mock/types";

export type AppSection = "institutional" | "social";

type RoleRoutePolicy = {
  home: string;
  allowedPrefixes: string[];
};

export const roleRoutePolicy: Record<Role, RoleRoutePolicy> = {
  Student: {
    home: "/student/dashboard",
    allowedPrefixes: ["/dashboard", "/student", "/discover", "/connections", "/messages", "/recommendations", "/map-explorer", "/profile"],
  },
  Coordinator: {
    home: "/coordinator/dashboard",
    allowedPrefixes: ["/dashboard", "/coordinator", "/discover"],
  },
  Administrator: {
    home: "/admin/dashboard",
    allowedPrefixes: ["/dashboard", "/admin", "/discover"],
  },
};

export const roleHomeRoutes: Record<Role, string> = {
  Student: roleRoutePolicy.Student.home,
  Coordinator: roleRoutePolicy.Coordinator.home,
  Administrator: roleRoutePolicy.Administrator.home,
};

export const detailRouteTemplates = {
  studentSubmissionDetail: "/student/submissions/[submissionId]",
  coordinatorReviewDetail: "/coordinator/review/[submissionId]",
} as const;

const detailRouteMatchers: Array<{ regex: RegExp; template: string }> = [
  { regex: /^\/student\/submissions\/[^/]+$/, template: detailRouteTemplates.studentSubmissionDetail },
  { regex: /^\/coordinator\/review\/[^/]+$/, template: detailRouteTemplates.coordinatorReviewDetail },
];

export const roleAllowedRoutePrefixes: Record<Role, string[]> = {
  Student: roleRoutePolicy.Student.allowedPrefixes,
  Coordinator: roleRoutePolicy.Coordinator.allowedPrefixes,
  Administrator: roleRoutePolicy.Administrator.allowedPrefixes,
};

export const sectionRoutePrefixes: Record<AppSection, string[]> = {
  institutional: ["/dashboard", "/student", "/coordinator", "/admin"],
  social: ["/discover", "/connections", "/messages", "/recommendations", "/map-explorer", "/profile"],
};

function pathMatchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function normalizePathname(pathname: string) {
  const matched = detailRouteMatchers.find(({ regex }) => regex.test(pathname));
  return matched ? matched.template : pathname;
}

export function getRoleHomeRoute(role: Role) {
  return roleRoutePolicy[role].home;
}

export function isPathAllowedForRole(role: Role, pathname: string) {
  return roleRoutePolicy[role].allowedPrefixes.some((prefix) => pathMatchesPrefix(pathname, prefix));
}

export function isPathInSection(pathname: string, section: AppSection) {
  return sectionRoutePrefixes[section].some((prefix) => pathMatchesPrefix(pathname, prefix));
}

export function isPathInPrefixes(pathname: string, prefixes: string[]) {
  const normalizedPathname = normalizePathname(pathname);
  return prefixes.some((prefix) => normalizedPathname === prefix || pathMatchesPrefix(normalizedPathname, prefix) || pathMatchesPrefix(pathname, prefix));
}

import { strict as assert } from "node:assert";

import { institutionalMenus, socialMenus } from "../mock/navigation.ts";
import type { NavItem, Role } from "../mock/types.ts";
import { detailRouteTemplates, isPathAllowedForRole } from "./access-policy.ts";

const existingPages: ReadonlySet<string> = new Set([
  "/",
  "/dashboard",
  "/student/dashboard",
  "/student/my-mobility",
  "/student/procedures",
  "/student/signatures",
  "/student/deadlines",
  "/student/exceptions",
  "/student/submissions/[id]",
  "/coordinator/dashboard",
  "/coordinator/review-queue",
  "/coordinator/review/[id]",
  "/coordinator/signature-requests",
  "/coordinator/exception-decisions",
  "/coordinator/student-mobilities",
  "/coordinator/procedure-management",
  "/coordinator/deadline-management",
  "/admin/dashboard",
  "/admin/user-management",
  "/admin/feature-scoping",
  "/admin/moderation-queue",
  "/admin/reports",
  "/admin/audit-traceability",
  "/discover",
  "/connections",
  "/messages",
  "/recommendations",
  "/map-explorer",
  "/profile",
]);

const roleMenus: Record<Role, NavItem[]> = {
  Student: [...institutionalMenus.Student, ...socialMenus.Student],
  Coordinator: [...institutionalMenus.Coordinator, ...socialMenus.Coordinator],
  Administrator: [...institutionalMenus.Administrator, ...socialMenus.Administrator],
};

for (const [role, menuItems] of Object.entries(roleMenus) as Array<[Role, NavItem[]]>) {
  for (const item of menuItems) {
    assert(existingPages.has(item.href), `Menu href does not map to a page: ${role} -> ${item.href}`);
    assert(isPathAllowedForRole(role, item.href), `Menu href is not role-allowed: ${role} -> ${item.href}`);

    for (const prefix of item.activePrefixes ?? []) {
      assert(
        existingPages.has(prefix) || isPathAllowedForRole(role, prefix),
        `Active prefix should map to an existing page or an allowed role prefix: ${role} -> ${item.href} -> ${prefix}`,
      );
    }
  }
}

assert(existingPages.has(detailRouteTemplates.studentSubmissionDetail), "Student detail route template must exist in page map.");
assert(existingPages.has(detailRouteTemplates.coordinatorReviewDetail), "Coordinator detail route template must exist in page map.");

"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { RoleSidebar } from "@/components/layout/role-sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { getRoleHomeRoute, isPathAllowedForRole } from "@/lib/navigation/access-policy";
import { useSession } from "@/lib/providers/session-provider";

export function AppShell({ children, section }: { children: ReactNode; section: "institutional" | "social" }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role } = useSession();

  const roleHomeRoute = useMemo(() => getRoleHomeRoute(role), [role]);
  const isAllowed = isPathAllowedForRole(role, pathname);
  const [redirectTarget, setRedirectTarget] = useState<string | null>(null);

  useEffect(() => {
    if (isAllowed || pathname === roleHomeRoute || redirectTarget === roleHomeRoute) {
      return;
    }

    setRedirectTarget(roleHomeRoute);
    router.replace(roleHomeRoute);
  }, [isAllowed, pathname, redirectTarget, roleHomeRoute, router]);

  useEffect(() => {
    if (redirectTarget && pathname === redirectTarget) {
      setRedirectTarget(null);
    }
  }, [pathname, redirectTarget]);

  if (!isAllowed || redirectTarget) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <TopNav />
      <div className="mx-auto flex max-w-7xl">
        <RoleSidebar section={section} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

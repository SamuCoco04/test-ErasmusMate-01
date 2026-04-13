"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { RoleSidebar } from "@/components/layout/role-sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { getRoleHomeRoute, isPathAllowedForRole } from "@/lib/navigation/access-policy";
import { useSession } from "@/lib/providers/session-provider";

export function AppShell({ children, section }: { children: ReactNode; section: "institutional" | "social" }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role } = useSession();

  const isAllowed = isPathAllowedForRole(role, pathname);

  useEffect(() => {
    if (!isAllowed) {
      router.replace(getRoleHomeRoute(role));
    }
  }, [isAllowed, role, router]);

  if (!isAllowed) {
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

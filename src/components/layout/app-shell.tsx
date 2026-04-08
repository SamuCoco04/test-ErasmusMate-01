import type { ReactNode } from "react";

import { RoleSidebar } from "@/components/layout/role-sidebar";
import { TopNav } from "@/components/layout/top-nav";

export function AppShell({ children, section }: { children: ReactNode; section: "institutional" | "social" }) {
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

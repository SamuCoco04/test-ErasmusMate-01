"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { institutionalMenus, socialMenus } from "@/lib/mock/navigation";
import { isPathInPrefixes } from "@/lib/navigation/access-policy";
import { useSession } from "@/lib/providers/session-provider";
import { cn } from "@/lib/utils";

export function RoleSidebar({ section }: { section: "institutional" | "social" }) {
  const pathname = usePathname();
  const { role } = useSession();

  const items = section === "institutional" ? institutionalMenus[role] : socialMenus[role];

  return (
    <aside className="w-64 border-r bg-slate-50/70 p-4">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {section === "institutional" ? "Institutional Core" : "Social Support"}
      </h2>
      <nav className="space-y-1">
        {items.map((item) => {
          const activePrefixes = item.activePrefixes ?? [item.href];
          const isActive = isPathInPrefixes(pathname, activePrefixes);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("block rounded-md px-3 py-2 text-sm", isActive ? "bg-white font-medium text-slate-900 shadow-sm" : "text-slate-600 hover:bg-white")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

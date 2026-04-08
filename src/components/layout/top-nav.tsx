"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { roleOptions } from "@/lib/mock/session";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/providers/session-provider";

const tabs = [
  { label: "My Mobility", href: "/student/dashboard", section: "institutional" },
  { label: "Community", href: "/discover", section: "social" },
] as const;

export function TopNav() {
  const pathname = usePathname();
  const { role, setRole, name } = useSession();

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-slate-800">
            ErasmusMate
          </Link>
          <nav className="flex items-center gap-2">
            {tabs.map((tab) => {
              const active =
                tab.section === "institutional"
                  ? pathname.startsWith("/student") || pathname.startsWith("/dashboard")
                  : pathname.startsWith("/discover") || pathname.startsWith("/connections") || pathname.startsWith("/messages");
              return (
                <Link key={tab.href} href={tab.href} className={cn("rounded-md px-3 py-1.5 text-sm", active ? "bg-slate-100 font-medium" : "text-muted-foreground")}>
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right text-sm">
            <p className="font-medium">{name}</p>
            <p className="text-muted-foreground">{role}</p>
          </div>
          <div className="flex gap-1">
            {roleOptions.map((item) => (
              <Button key={item} type="button" variant={item === role ? "default" : "outline"} size="sm" onClick={() => setRole(item)}>
                {item}
              </Button>
            ))}
          </div>
          <Badge variant="secondary">Demo Session</Badge>
        </div>
      </div>
    </header>
  );
}

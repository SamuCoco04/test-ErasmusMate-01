"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { institutionalMenus } from "@/lib/mock/navigation";
import { roleOptions } from "@/lib/mock/session";
import { getRoleHomeRoute, isPathInSection } from "@/lib/navigation/access-policy";
import { useSession } from "@/lib/providers/session-provider";
import { cn } from "@/lib/utils";

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, setRole, name } = useSession();
  const [roleSwitchTarget, setRoleSwitchTarget] = useState<string | null>(null);

  const tabs = [
    {
      label: role === "Student" ? "My Mobility" : "Mobility Management",
      href: institutionalMenus[role][0]?.href ?? getRoleHomeRoute(role),
      section: "institutional" as const,
    },
    { label: "Community", href: "/discover", section: "social" as const },
  ];

  function handleRoleSwitch(nextRole: (typeof roleOptions)[number]) {
    if (nextRole === role) {
      return;
    }

    const nextHomeRoute = getRoleHomeRoute(nextRole);
    setRoleSwitchTarget(nextHomeRoute);
    setRole(nextRole);
    router.replace(nextHomeRoute);
  }

  useEffect(() => {
    if (roleSwitchTarget && pathname === roleSwitchTarget) {
      setRoleSwitchTarget(null);
    }
  }, [pathname, roleSwitchTarget]);

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-slate-800">
            ErasmusMate
          </Link>
          <nav className="flex items-center gap-2">
            {tabs.map((tab) => {
              const active = isPathInSection(pathname, tab.section);
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
              <Button
                key={item}
                type="button"
                variant={item === role ? "default" : "outline"}
                size="sm"
                disabled={Boolean(roleSwitchTarget)}
                onClick={() => handleRoleSwitch(item)}
              >
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

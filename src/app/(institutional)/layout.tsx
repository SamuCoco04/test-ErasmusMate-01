import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

export default function InstitutionalLayout({ children }: { children: ReactNode }) {
  return <AppShell section="institutional">{children}</AppShell>;
}

import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

export default function SocialLayout({ children }: { children: ReactNode }) {
  return <AppShell section="social">{children}</AppShell>;
}

"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { mockUser } from "@/lib/mock/session";
import type { Role } from "@/lib/mock/types";

type SessionContextValue = {
  role: Role;
  setRole: (role: Role) => void;
  name: string;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(mockUser.role);

  const value = useMemo(
    () => ({
      role,
      setRole,
      name: mockUser.name,
    }),
    [role],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }

  return context;
}

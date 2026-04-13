"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getRoleHomeRoute } from "@/lib/navigation/access-policy";
import { useSession } from "@/lib/providers/session-provider";

export default function HomePage() {
  const router = useRouter();
  const { role } = useSession();

  useEffect(() => {
    router.replace(getRoleHomeRoute(role));
  }, [role, router]);

  return null;
}

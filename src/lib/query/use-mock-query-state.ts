"use client";

import { useSearchParams } from "next/navigation";

import type { MockState } from "./mock-fetchers";

export function useMockQueryState(scope: string): MockState {
  const params = useSearchParams();
  const scoped = params.get(`mock.${scope}`);
  const global = params.get("mock");
  const value = scoped ?? global ?? "success";
  return value === "loading" || value === "error" ? value : "success";
}

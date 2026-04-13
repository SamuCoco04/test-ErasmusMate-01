import type { ApiMutationResponse } from "@/lib/server/schemas/http";

export async function postApi<T extends object>(url: string, body?: T): Promise<ApiMutationResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return response.json();
}

export async function patchApi<T extends object>(url: string, body: T): Promise<ApiMutationResponse> {
  const response = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return response.json();
}

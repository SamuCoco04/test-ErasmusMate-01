import type { ApiMutationResponse } from "@/lib/server/schemas/http";

function blockedResponse(): ApiMutationResponse {
  return { outcome: "blocked" } as ApiMutationResponse;
}

async function readMutationResponse(response: Response): Promise<ApiMutationResponse> {
  try {
    return (await response.json()) as ApiMutationResponse;
  } catch {
    return blockedResponse();
  }
}

async function readJsonResponse<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function postApi<T extends object>(url: string, body?: T): Promise<ApiMutationResponse> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    return await readMutationResponse(response);
  } catch {
    return blockedResponse();
  }
}

export async function patchApi<T extends object>(url: string, body: T): Promise<ApiMutationResponse> {
  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await readMutationResponse(response);
  } catch {
    return blockedResponse();
  }
}

export async function getApi<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { method: "GET" });
    return readJsonResponse<T>(response);
  } catch {
    return null;
  }
}

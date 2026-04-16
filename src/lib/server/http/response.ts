import { NextResponse } from "next/server";

export type ApiOutcome = "success" | "blocked";

export type ApiPayload<T = unknown> = {
  outcome: ApiOutcome;
  details: string;
  data?: T;
};

export class DomainError extends Error {
  constructor(
    public readonly code: "NOT_FOUND" | "FORBIDDEN" | "CONFLICT" | "PRECONDITION_FAILED",
    details: string,
    public readonly data?: unknown,
  ) {
    super(details);
    this.name = "DomainError";
  }
}

export const DOMAIN_ERROR_STATUS: Record<DomainError["code"], number> = {
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  CONFLICT: 409,
  PRECONDITION_FAILED: 412,
};

export function success<T>(details: string, data?: T, status = 200) {
  const payload: ApiPayload<T> = { outcome: "success", details, data };
  return NextResponse.json(payload, { status });
}

export function blocked(details: string, status = 400, data?: unknown) {
  const payload: ApiPayload = { outcome: "blocked", details, data };
  return NextResponse.json(payload, { status });
}

export function invalidJsonResponse() {
  return blocked("Invalid JSON request body.", 400);
}

export function invalidParamsResponse() {
  return blocked("Invalid route parameters.", 400);
}

export function parseValidationErrors(issues: Array<{ path: PropertyKey[]; message: string }>) {
  if (issues.length === 0) {
    return "Invalid request body.";
  }

  const message = issues
    .map((issue) => {
      if (issue.path.length === 0) return issue.message;
      return `${issue.path.join(".")}: ${issue.message}`;
    })
    .join("; ");

  return `Invalid request body. ${message}`;
}

export function parseQueryValidationErrors(issues: Array<{ path: PropertyKey[]; message: string }>) {
  if (issues.length === 0) {
    return "Invalid query parameters.";
  }

  const message = issues
    .map((issue) => {
      if (issue.path.length === 0) return issue.message;
      return `${issue.path.join(".")}: ${issue.message}`;
    })
    .join("; ");

  return `Invalid query parameters. ${message}`;
}

export function fromDomainError(error: DomainError) {
  return blocked(error.message, DOMAIN_ERROR_STATUS[error.code], error.data);
}

export function fromUnknownError(error: unknown) {
  if (error instanceof DomainError) {
    return fromDomainError(error);
  }

  return blocked("Unexpected server error.", 500);
}

import type { ApiMutationResponse } from "@/lib/server/schemas/http";

export type SubmissionState = "draft" | "submitted" | "in_review" | "approved" | "rejected" | "reopened" | "resubmitted";
export type ExceptionState = "submitted" | "in_review" | "approved" | "rejected";
export type ConnectionState = "pending" | "accepted" | "rejected" | "blocked";

type Submission = {
  id: string;
  studentId: string;
  state: SubmissionState;
  draftPayload?: Record<string, unknown>;
  decisionRationale?: string;
};

type ExceptionRequest = {
  id: string;
  submissionId: string;
  requesterId: string;
  scope: string;
  rationale: string;
  requestedEffect: string;
  state: ExceptionState;
  decisionRationale?: string;
};

type Connection = {
  id: string;
  requesterProfileId: string;
  recipientProfileId: string;
  state: ConnectionState;
  blockedReason?: string;
};

type Content = {
  id: string;
  authorId: string;
  authorName?: string;
  type: "recommendation" | "opinion";
  category: string;
  title: string;
  body: string;
  placeContext?: unknown;
};

const db = {
  submissions: new Map<string, Submission>(),
  exceptions: new Map<string, ExceptionRequest>(),
  connections: new Map<string, Connection>(),
  content: new Map<string, Content>(),
  favorites: new Set<string>(),
  reports: [] as Array<{ id: string; reporterId: string; targetType: string; targetId: string; reason: string }>,
};

const seedSubmissionId = "SUB-001";
if (!db.submissions.has(seedSubmissionId)) {
  db.submissions.set(seedSubmissionId, { id: seedSubmissionId, studentId: "student", state: "draft" });
}

const ok = (details: string, data?: unknown): ApiMutationResponse => ({ outcome: "success", details, data });
const blocked = (details: string): ApiMutationResponse => ({ outcome: "blocked", details });

export const serverMockDb = {
  saveDraft(id: string, payload: Record<string, unknown>) {
    const sub = db.submissions.get(id);
    if (!sub) return blocked("Submission not found.");
    sub.state = "draft";
    sub.draftPayload = payload;
    return ok("Draft saved.", sub);
  },
  submit(id: string) {
    const sub = db.submissions.get(id);
    if (!sub) return blocked("Submission not found.");
    if (!sub.draftPayload) return blocked("Cannot submit without draft payload.");
    sub.state = "submitted";
    return ok("Submission submitted.", sub);
  },
  decision(id: string, decision: "approved" | "rejected", rationale: string) {
    const sub = db.submissions.get(id);
    if (!sub) return blocked("Submission not found.");
    sub.state = decision;
    sub.decisionRationale = rationale;
    return ok(`Submission ${decision}.`, sub);
  },
  reopen(id: string, rationale: string) {
    const sub = db.submissions.get(id);
    if (!sub) return blocked("Submission not found.");
    sub.state = "reopened";
    sub.decisionRationale = rationale;
    return ok("Submission reopened.", sub);
  },
  createException(input: Omit<ExceptionRequest, "id" | "state">) {
    const id = `EXC-${crypto.randomUUID()}`;
    const exception = { id, state: "submitted" as const, ...input };
    db.exceptions.set(id, exception);
    return ok("Exception created.", exception);
  },
  decideException(id: string, decision: "approved" | "rejected", rationale: string) {
    const exception = db.exceptions.get(id);
    if (!exception) return blocked("Exception not found.");
    exception.state = decision;
    exception.decisionRationale = rationale;
    return ok(`Exception ${decision}.`, exception);
  },
  createConnection(requesterProfileId: string, recipientProfileId: string) {
    const id = `CON-${crypto.randomUUID()}`;
    const connection = { id, requesterProfileId, recipientProfileId, state: "pending" as const };
    db.connections.set(id, connection);
    return ok("Connection request sent.", connection);
  },
  respondConnection(id: string, action: "accepted" | "rejected") {
    const connection = db.connections.get(id);
    if (!connection) return blocked("Connection not found.");
    connection.state = action;
    return ok(`Connection ${action}.`, connection);
  },
  blockConnection(id: string, reason: string) {
    const connection = db.connections.get(id);
    if (!connection) return blocked("Connection not found.");
    connection.state = "blocked";
    connection.blockedReason = reason;
    return ok("Connection blocked.", connection);
  },
  createContent(input: Omit<Content, "id">) {
    const id = `CONT-${crypto.randomUUID()}`;
    const content = { id, ...input };
    db.content.set(id, content);
    return ok("Content created.", content);
  },
  patchContent(id: string, actorId: string, updates: Partial<Omit<Content, "id" | "authorId">>) {
    const content = db.content.get(id);
    if (!content) return blocked("Content not found.");
    if (content.authorId !== actorId) return blocked("Only author can edit content.");
    Object.assign(content, updates);
    return ok("Content updated.", content);
  },
  favorite(contentId: string, userId: string) {
    if (!db.content.has(contentId)) return blocked("Content not found.");
    db.favorites.add(`${userId}:${contentId}`);
    return ok("Content favorited.");
  },
  report(reporterId: string, targetType: string, targetId: string, reason: string) {
    db.reports.unshift({ id: `REP-${crypto.randomUUID()}`, reporterId, targetType, targetId, reason });
    return ok("Report created.");
  },
};

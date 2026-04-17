import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const dbUrl = process.env.DATABASE_URL ?? "";
  const isLocalSqlite = dbUrl.startsWith("file:") || dbUrl === "";
  if (!isLocalSqlite && process.env.SEED_ALLOW_REMOTE !== "1") {
    console.error("❌ Seed aborted: DATABASE_URL does not appear to be a local SQLite file.");
    console.error("   Set SEED_ALLOW_REMOTE=1 to override this safety check.");
    process.exit(1);
  }

  await prisma.favorite.deleteMany();
  await prisma.moderationReport.deleteMany();
  await prisma.message.deleteMany();
  await prisma.socialConnection.deleteMany();
  await prisma.socialContent.deleteMany();
  await prisma.socialProfile.deleteMany();
  await prisma.exceptionRequest.deleteMany();
  await prisma.submissionAuditEvent.deleteMany();
  await prisma.submissionDocument.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.mobilityRecord.deleteMany();
  await prisma.roleAssignment.deleteMany();
  await prisma.user.deleteMany();

  const users = [
    { id: "student", email: "student@erasmusmate.test", name: "Maria Rodriguez" },
    { id: "coord-anna-jensen", email: "anna.jensen@erasmusmate.test", name: "Dr. Anna Jensen" },
    { id: "admin-lina-smith", email: "lina.smith@erasmusmate.test", name: "Lina Smith" },
    { id: "SOC-STU-002", email: "anna.kowalski@erasmusmate.test", name: "Anna Kowalski" },
    { id: "SOC-STU-004", email: "luca.bianchi@erasmusmate.test", name: "Luca Bianchi" },
    { id: "SOC-STU-006", email: "sofie.nielsen@erasmusmate.test", name: "Sofie Nielsen" },
    { id: "SOC-STU-008", email: "paulo.silva@erasmusmate.test", name: "Paulo Silva" },
  ];
  await prisma.user.createMany({ data: users });

  await prisma.roleAssignment.createMany({
    data: [
      { id: "role-student", userId: "student", role: "student" },
      { id: "role-coordinator", userId: "coord-anna-jensen", role: "coordinator" },
      { id: "role-admin", userId: "admin-lina-smith", role: "administrator" },
    ],
  });

  await prisma.mobilityRecord.createMany({
    data: [
      {
        id: "MOB-2026-00047",
        studentId: "student",
        homeInstitution: "Technical University of Madrid",
        hostInstitution: "University of Barcelona",
        destination: "Barcelona, Spain",
        state: "active",
      },
      {
        id: "MOB-2026-00048",
        studentId: "SOC-STU-002",
        homeInstitution: "University of Warsaw",
        hostInstitution: "University of Barcelona",
        destination: "Barcelona, Spain",
        state: "active",
      },
    ],
  });

  await prisma.submission.createMany({
    data: [
      {
        id: "SUB-2026-0341",
        mobilityRecordId: "MOB-2026-00047",
        studentId: "student",
        state: "in_review",
        draftPayload: { submissionMetadata: "Seeded metadata", studyCycle: "Bachelor" },
        submittedAt: new Date("2026-02-08T09:00:00.000Z"),
      },
      {
        id: "SUB-2026-0402",
        mobilityRecordId: "MOB-2026-00047",
        studentId: "student",
        state: "draft",
      },
      {
        id: "SUB-2026-0179",
        mobilityRecordId: "MOB-2026-00047",
        studentId: "student",
        state: "approved",
        draftPayload: { submissionMetadata: "Seeded metadata", studyCycle: "Bachelor" },
        submittedAt: new Date("2026-02-10T09:00:00.000Z"),
      },
      {
        id: "SUB-2026-0090",
        mobilityRecordId: "MOB-2026-00047",
        studentId: "student",
        state: "rejected",
        draftPayload: { submissionMetadata: "Seeded metadata", studyCycle: "Bachelor" },
        submittedAt: new Date("2026-03-22T09:00:00.000Z"),
        decisionRationale: "Please fix missing transcript attachment details.",
      },
      {
        id: "SUB-2026-0051",
        mobilityRecordId: "MOB-2026-00047",
        studentId: "student",
        state: "archived",
        draftPayload: { submissionMetadata: "Historical archived", studyCycle: "Bachelor" },
        submittedAt: new Date("2026-01-22T09:00:00.000Z"),
      },
    ],
  });

  await prisma.submissionDocument.createMany({
    data: [
      { id: "DOC-LA-001", submissionId: "SUB-2026-0341", name: "Learning_Agreement_Form.pdf", type: "pdf", url: "/mock/Learning_Agreement_Form.pdf" },
      { id: "DOC-TR-001", submissionId: "SUB-2026-0341", name: "Academic_Transcript.pdf", type: "pdf", url: "/mock/Academic_Transcript.pdf" },
    ],
  });

  await prisma.submissionAuditEvent.createMany({
    data: [
      {
        id: "AUD-001",
        submissionId: "SUB-2026-0341",
        actorId: "student",
        eventType: "final_submit",
        priorState: "draft",
        newState: "submitted",
        createdAt: new Date("2026-02-07T09:00:00.000Z"),
      },
      {
        id: "AUD-002",
        submissionId: "SUB-2026-0341",
        actorId: "coord-anna-jensen",
        eventType: "review_started",
        priorState: "submitted",
        newState: "in_review",
        createdAt: new Date("2026-02-07T12:00:00.000Z"),
      },
    ],
  });

  await prisma.exceptionRequest.createMany({
    data: [
      {
        id: "EXC-002",
        submissionId: "SUB-2026-0341",
        requesterId: "student",
        state: "applied",
        scope: "deadline",
        rationale: "Medical appointment conflict with mandatory in-person administration process",
        requestedEffect: "Extend due date to 2026-03-12",
        coveredTargetId: "DL-301",
        decisionRationale: "Approved due to documented medical incident.",
        appliedEffectSummary: "Deadline effective due date updated to 2026-03-12.",
        decidedById: "coord-anna-jensen",
        decidedAt: new Date("2026-03-01T10:00:00.000Z"),
        appliedAt: new Date("2026-03-01T12:00:00.000Z"),
      },
      {
        id: "EXC-005",
        submissionId: "SUB-2026-0402",
        requesterId: "student",
        state: "in_review",
        scope: "document_obligation",
        rationale: "Host institution transcript issuance delayed by registrar backlog",
        requestedEffect: "Temporarily waive transcript document obligation pending registrar release",
        coveredTargetId: "transcript",
        decidedById: "coord-anna-jensen",
      },
    ],
  });

  await prisma.socialProfile.createMany({
    data: [
      { id: "ME-STUDENT", userId: "student", displayName: "Maria Rodriguez", bio: "Erasmus student in Barcelona", discoverable: true },
      { id: "SOC-STU-002", userId: "SOC-STU-002", displayName: "Anna Kowalski", discoverable: true },
      { id: "SOC-STU-004", userId: "SOC-STU-004", displayName: "Luca Bianchi", discoverable: true },
      { id: "SOC-STU-006", userId: "SOC-STU-006", displayName: "Sofie Nielsen", discoverable: true },
      { id: "SOC-STU-008", userId: "SOC-STU-008", displayName: "Paulo Silva", discoverable: true },
    ],
  });

  await prisma.socialConnection.createMany({
    data: [
      {
        id: "CON-ACCEPTED-001",
        requesterProfileId: "ME-STUDENT",
        recipientProfileId: "SOC-STU-002",
        state: "accepted",
        messagingPermission: "permitted",
        respondedAt: new Date("2026-04-05T10:00:00.000Z"),
      },
      {
        id: "CON-PENDING-IN-001",
        requesterProfileId: "SOC-STU-004",
        recipientProfileId: "ME-STUDENT",
        state: "pending",
        messagingPermission: "not_permitted",
      },
      {
        id: "CON-PENDING-OUT-001",
        requesterProfileId: "ME-STUDENT",
        recipientProfileId: "SOC-STU-006",
        state: "pending",
        messagingPermission: "not_permitted",
      },
      {
        id: "CON-BLOCKED-001",
        requesterProfileId: "ME-STUDENT",
        recipientProfileId: "SOC-STU-008",
        state: "blocked",
        messagingPermission: "blocked",
        blockedByProfileId: "ME-STUDENT",
        blockedReason: "User-requested safety block",
      },
    ],
  });

  await prisma.message.createMany({
    data: [
      {
        id: "MSG-001",
        connectionId: "CON-ACCEPTED-001",
        senderId: "student",
        senderProfileId: "ME-STUDENT",
        body: "Hi Anna, do you have tips for housing near the campus?",
      },
      {
        id: "MSG-002",
        connectionId: "CON-ACCEPTED-001",
        senderId: "SOC-STU-002",
        senderProfileId: "SOC-STU-002",
        body: "Yes, check Sant Antoni residences early.",
      },
    ],
  });

  await prisma.socialContent.createMany({
    data: [
      {
        id: "CONT-001",
        authorId: "SOC-STU-002",
        type: "recommendation",
        category: "accommodation",
        title: "Verified dorms near Sant Antoni",
        body: "Ask for Erasmus contract addendum up front to speed up registration paperwork.",
        state: "published_visible",
        placeLabel: "Sant Antoni Student Residence",
        placeCity: "Barcelona",
        placeCountry: "Spain",
        placeLatitude: 41.3809,
        placeLongitude: 2.1602,
      },
      {
        id: "CONT-002",
        authorId: "student",
        type: "opinion",
        category: "academics",
        title: "Study room booking tip for UB libraries",
        body: "Morning slots are easiest to reserve during orientation week.",
        state: "updated_visible",
        placeLabel: "Universitat de Barcelona Main Library",
        placeCity: "Barcelona",
        placeCountry: "Spain",
        placeLatitude: 41.3851,
        placeLongitude: 2.1734,
      },
      {
        id: "CONT-003",
        authorId: "SOC-STU-004",
        type: "recommendation",
        category: "bureaucracy",
        title: "Queue early for residence certificate",
        body: "Bring passport + acceptance letter copy; they ask both at first desk.",
        state: "published_visible",
        placeLabel: "Sants Mobility Office",
        placeCity: "Barcelona",
        placeCountry: "Spain",
        placeLatitude: 41.379,
        placeLongitude: 2.1406,
      },
    ],
  });

  await prisma.favorite.createMany({
    data: [
      { id: "FAV-001", userId: "student", contentId: "CONT-001" },
      { id: "FAV-002", userId: "SOC-STU-002", contentId: "CONT-002" },
      { id: "FAV-003", userId: "SOC-STU-006", contentId: "CONT-003" },
    ],
  });

  await prisma.moderationReport.createMany({
    data: [
      {
        id: "MR-001",
        reporterId: "SOC-STU-008",
        targetType: "opinion",
        targetId: "CONT-002",
        reason: "Contains outdated study policy details.",
        contentId: "CONT-002",
      },
      {
        id: "MR-002",
        reporterId: "student",
        targetType: "social_interaction",
        targetId: "CON-BLOCKED-001",
        reason: "Escalated from connection moderation flow.",
      },
    ],
  });

  console.log("✅ Prisma demo seed complete.");
}

main()
  .catch((error) => {
    console.error("❌ Prisma seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

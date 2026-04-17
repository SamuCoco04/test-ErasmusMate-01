-- AlterTable
ALTER TABLE "SubmissionAuditEvent" ADD COLUMN "priorState" TEXT;
ALTER TABLE "SubmissionAuditEvent" ADD COLUMN "newState" TEXT;

-- AlterTable
ALTER TABLE "ExceptionRequest" ADD COLUMN "coveredTargetId" TEXT;

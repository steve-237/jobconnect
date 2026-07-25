-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripeSessionId" TEXT;

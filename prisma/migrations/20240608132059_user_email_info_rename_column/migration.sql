/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `user_email_info` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_email_info" DROP COLUMN "expiresAt",
ADD COLUMN     "emailConfirmCodeExpiresAt" TIMESTAMP(3);

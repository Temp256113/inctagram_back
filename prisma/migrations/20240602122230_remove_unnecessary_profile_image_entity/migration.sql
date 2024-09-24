/*
  Warnings:

  - You are about to drop the column `createdById` on the `file_resources` table. All the data in the column will be lost.
  - You are about to drop the `profile_images` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[profileId]` on the table `file_resources` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `creatorId` to the `file_resources` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "file_resources" DROP CONSTRAINT "file_resources_createdById_fkey";

-- DropForeignKey
ALTER TABLE "profile_images" DROP CONSTRAINT "profile_images_imageId_fkey";

-- DropForeignKey
ALTER TABLE "profile_images" DROP CONSTRAINT "profile_images_profileId_fkey";

-- DropForeignKey
ALTER TABLE "user_change_password_requests" DROP CONSTRAINT "user_change_password_requests_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_email_info" DROP CONSTRAINT "user_email_info_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_posts" DROP CONSTRAINT "user_posts_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_profiles" DROP CONSTRAINT "user_profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_sessions" DROP CONSTRAINT "user_sessions_userId_fkey";

-- AlterTable
ALTER TABLE "file_resources" DROP COLUMN "createdById",
ADD COLUMN     "creatorId" INTEGER NOT NULL,
ADD COLUMN     "profileId" INTEGER;

-- DropTable
DROP TABLE "profile_images";

-- DropEnum
DROP TYPE "ProfileImagesKind";

-- CreateIndex
CREATE UNIQUE INDEX "file_resources_profileId_key" ON "file_resources"("profileId");

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_email_info" ADD CONSTRAINT "user_email_info_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_change_password_requests" ADD CONSTRAINT "user_change_password_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_posts" ADD CONSTRAINT "user_posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_resources" ADD CONSTRAINT "file_resources_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "user_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_resources" ADD CONSTRAINT "file_resources_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

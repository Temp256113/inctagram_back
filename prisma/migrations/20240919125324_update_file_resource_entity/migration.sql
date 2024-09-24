/*
  Warnings:

  - You are about to drop the column `path` on the `file_resources` table. All the data in the column will be lost.
  - Added the required column `googleFileId` to the `file_resources` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "file_resources" DROP COLUMN "path",
ADD COLUMN     "googleFileId" TEXT NOT NULL;

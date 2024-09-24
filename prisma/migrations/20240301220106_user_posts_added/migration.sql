-- AlterEnum
ALTER TYPE "FileResourceTypes" ADD VALUE 'postPhoto';

-- AlterTable
ALTER TABLE "file_resources" ADD COLUMN     "postId" INTEGER;

-- CreateTable
CREATE TABLE "user_posts" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "description" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playing_with_neon" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" REAL,

    CONSTRAINT "playing_with_neon_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_posts" ADD CONSTRAINT "user_posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_resources" ADD CONSTRAINT "file_resources_postId_fkey" FOREIGN KEY ("postId") REFERENCES "user_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "FileResourceTypes" AS ENUM ('profilePhoto');

-- CreateEnum
CREATE TYPE "ProfileImagesKind" AS ENUM ('avatar');

-- CreateTable
CREATE TABLE "file_resources" (
    "id" SERIAL NOT NULL,
    "type" "FileResourceTypes" NOT NULL,
    "contentType" TEXT NOT NULL,
    "size" INTEGER,
    "path" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "createdById" INTEGER NOT NULL,

    CONSTRAINT "file_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_images" (
    "id" SERIAL NOT NULL,
    "kind" "ProfileImagesKind" NOT NULL,
    "imageId" INTEGER NOT NULL,
    "profileId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "profile_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "file_resources" ADD CONSTRAINT "file_resources_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_images" ADD CONSTRAINT "profile_images_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "file_resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_images" ADD CONSTRAINT "profile_images_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "user_profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

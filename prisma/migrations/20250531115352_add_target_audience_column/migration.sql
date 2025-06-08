/*
  Warnings:

  - You are about to drop the column `parentId` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the `Parent` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Audience" AS ENUM ('STUDENTS', 'TEACHERS', 'ALL');

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_parentId_fkey";

-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "targetAudience" "Audience" DEFAULT 'ALL';

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "parentId";

-- DropTable
DROP TABLE "Parent";

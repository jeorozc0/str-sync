/*
  Warnings:

  - The primary key for the `exercise_log_entries` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `exercise_sets` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `exercises` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `folders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `workout_exercises` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `workout_logs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `workouts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `folder_id` column on the `workouts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `id` on the `exercise_log_entries` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `workout_log_id` on the `exercise_log_entries` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `workout_exercise_id` on the `exercise_log_entries` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `exercise_sets` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `exercise_log_entry_id` on the `exercise_sets` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `exercises` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `folders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `workout_exercises` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `workout_id` on the `workout_exercises` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `exercise_id` on the `workout_exercises` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `workout_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `workout_id` on the `workout_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `workouts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "exercise_log_entries" DROP CONSTRAINT "exercise_log_entries_workout_exercise_id_fkey";

-- DropForeignKey
ALTER TABLE "exercise_log_entries" DROP CONSTRAINT "exercise_log_entries_workout_log_id_fkey";

-- DropForeignKey
ALTER TABLE "exercise_sets" DROP CONSTRAINT "exercise_sets_exercise_log_entry_id_fkey";

-- DropForeignKey
ALTER TABLE "workout_exercises" DROP CONSTRAINT "workout_exercises_exercise_id_fkey";

-- DropForeignKey
ALTER TABLE "workout_exercises" DROP CONSTRAINT "workout_exercises_workout_id_fkey";

-- DropForeignKey
ALTER TABLE "workout_logs" DROP CONSTRAINT "workout_logs_workout_id_fkey";

-- DropForeignKey
ALTER TABLE "workouts" DROP CONSTRAINT "workouts_folder_id_fkey";

-- AlterTable
ALTER TABLE "exercise_log_entries" DROP CONSTRAINT "exercise_log_entries_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" VARCHAR(10) NOT NULL,
DROP COLUMN "workout_log_id",
ADD COLUMN     "workout_log_id" VARCHAR(10) NOT NULL,
DROP COLUMN "workout_exercise_id",
ADD COLUMN     "workout_exercise_id" VARCHAR(10) NOT NULL,
ADD CONSTRAINT "exercise_log_entries_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "exercise_sets" DROP CONSTRAINT "exercise_sets_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" VARCHAR(10) NOT NULL,
DROP COLUMN "exercise_log_entry_id",
ADD COLUMN     "exercise_log_entry_id" VARCHAR(10) NOT NULL,
ADD CONSTRAINT "exercise_sets_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "exercises" DROP CONSTRAINT "exercises_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" VARCHAR(10) NOT NULL,
ADD CONSTRAINT "exercises_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "folders" DROP CONSTRAINT "folders_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" VARCHAR(10) NOT NULL,
ADD CONSTRAINT "folders_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "workout_exercises" DROP CONSTRAINT "workout_exercises_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" VARCHAR(10) NOT NULL,
DROP COLUMN "workout_id",
ADD COLUMN     "workout_id" VARCHAR(10) NOT NULL,
DROP COLUMN "exercise_id",
ADD COLUMN     "exercise_id" VARCHAR(10) NOT NULL,
ADD CONSTRAINT "workout_exercises_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "workout_logs" DROP CONSTRAINT "workout_logs_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" VARCHAR(10) NOT NULL,
DROP COLUMN "workout_id",
ADD COLUMN     "workout_id" VARCHAR(10) NOT NULL,
ADD CONSTRAINT "workout_logs_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "workouts" DROP CONSTRAINT "workouts_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" VARCHAR(10) NOT NULL,
DROP COLUMN "folder_id",
ADD COLUMN     "folder_id" VARCHAR(10),
ADD CONSTRAINT "workouts_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "exercise_sets_exercise_log_entry_id_set_number_key" ON "exercise_sets"("exercise_log_entry_id", "set_number");

-- CreateIndex
CREATE UNIQUE INDEX "workout_exercises_workout_id_exercise_id_order_key" ON "workout_exercises"("workout_id", "exercise_id", "order");

-- AddForeignKey
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_log_entries" ADD CONSTRAINT "exercise_log_entries_workout_log_id_fkey" FOREIGN KEY ("workout_log_id") REFERENCES "workout_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_log_entries" ADD CONSTRAINT "exercise_log_entries_workout_exercise_id_fkey" FOREIGN KEY ("workout_exercise_id") REFERENCES "workout_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_sets" ADD CONSTRAINT "exercise_sets_exercise_log_entry_id_fkey" FOREIGN KEY ("exercise_log_entry_id") REFERENCES "exercise_log_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - The primary key for the `exercise_log_entries` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `exercise_sets` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `exercises` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `folders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `workout_exercises` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `workout_logs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `workouts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[ref_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ref_id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "exercise_log_entries" DROP CONSTRAINT "exercise_log_entries_workout_exercise_id_fkey";

-- DropForeignKey
ALTER TABLE "exercise_log_entries" DROP CONSTRAINT "exercise_log_entries_workout_log_id_fkey";

-- DropForeignKey
ALTER TABLE "exercise_sets" DROP CONSTRAINT "exercise_sets_exercise_log_entry_id_fkey";

-- DropForeignKey
ALTER TABLE "folders" DROP CONSTRAINT "folders_user_id_fkey";

-- DropForeignKey
ALTER TABLE "workout_exercises" DROP CONSTRAINT "workout_exercises_exercise_id_fkey";

-- DropForeignKey
ALTER TABLE "workout_exercises" DROP CONSTRAINT "workout_exercises_workout_id_fkey";

-- DropForeignKey
ALTER TABLE "workout_logs" DROP CONSTRAINT "workout_logs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "workout_logs" DROP CONSTRAINT "workout_logs_workout_id_fkey";

-- DropForeignKey
ALTER TABLE "workouts" DROP CONSTRAINT "workouts_folder_id_fkey";

-- DropForeignKey
ALTER TABLE "workouts" DROP CONSTRAINT "workouts_user_id_fkey";

-- AlterTable
ALTER TABLE "exercise_log_entries" DROP CONSTRAINT "exercise_log_entries_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "workout_log_id" SET DATA TYPE TEXT,
ALTER COLUMN "workout_exercise_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "exercise_log_entries_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "exercise_sets" DROP CONSTRAINT "exercise_sets_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "exercise_log_entry_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "exercise_sets_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "exercises" DROP CONSTRAINT "exercises_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "exercises_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "folders" DROP CONSTRAINT "folders_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "folders_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ADD COLUMN     "ref_id" TEXT NOT NULL,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "workout_exercises" DROP CONSTRAINT "workout_exercises_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "workout_id" SET DATA TYPE TEXT,
ALTER COLUMN "exercise_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "workout_exercises_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "workout_logs" DROP CONSTRAINT "workout_logs_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "workout_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "workout_logs_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "workouts" DROP CONSTRAINT "workouts_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "folder_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "workouts_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_ref_id_key" ON "users"("ref_id");

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_log_entries" ADD CONSTRAINT "exercise_log_entries_workout_log_id_fkey" FOREIGN KEY ("workout_log_id") REFERENCES "workout_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_log_entries" ADD CONSTRAINT "exercise_log_entries_workout_exercise_id_fkey" FOREIGN KEY ("workout_exercise_id") REFERENCES "workout_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_sets" ADD CONSTRAINT "exercise_sets_exercise_log_entry_id_fkey" FOREIGN KEY ("exercise_log_entry_id") REFERENCES "exercise_log_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

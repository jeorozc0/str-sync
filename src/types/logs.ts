// src/types/workout.ts (or wherever you keep your shared types)

// Import necessary types from Prisma Client if extending/omitting
import type { ExerciseSet as PrismaExerciseSet } from "@prisma/client";

// Represents a single logged set for an exercise within a workout log.
// Corresponds to the 'ExerciseSet' model in Prisma.
export interface LoggedSetData extends Omit<PrismaExerciseSet, 'exerciseLogEntryId'> {
  // Fields directly from Prisma ExerciseSet:
  // id: string;          // (@id @db.VarChar(10)) - Included via Omit's base
  // setNumber: number;   // (@map("set_number")) - Included
  // reps: number;        // Included
  // weight: number | null;// Included (Float? maps to number | null)
  // rpe: number | null;    // Included (Int? maps to number | null)
  // isCompleted: boolean;// (@default(true) @map("is_completed")) - Included
}

// Represents the logged performance for a specific exercise within a completed workout log.
// Corresponds to 'ExerciseLogEntry' model, often including related 'WorkoutExercise' and 'Exercise' info.
export interface LoggedExerciseData {
  // --- Data from ExerciseLogEntry ---
  logEntryId: string; // The unique ID of this specific entry in the log (ExerciseLogEntry.id)

  // --- Data from the related WorkoutExercise (The Plan) ---
  plannedExerciseId: string; // ID of the WorkoutExercise record this log entry corresponds to (ExerciseLogEntry.workoutExerciseId -> WorkoutExercise.id)
  order: number;             // The intended order from the plan (WorkoutExercise.order)
  targetSets?: number | null;      // Target sets from the plan (WorkoutExercise.sets) - Optional for display
  targetReps?: string | null;      // Target reps from the plan (WorkoutExercise.reps) - Optional for display
  plannedNotes?: string | null;  // Notes from the plan (WorkoutExercise.notes)

  // --- Denormalized Data from the related Exercise (Master Exercise Details) ---
  exerciseId: string;        // ID of the master exercise (WorkoutExercise.exerciseId -> Exercise.id)
  name: string;              // Name of the master exercise (Exercise.name)
  category?: string | null;  // Muscle group from the master exercise (Exercise.muscleGroup)
  equipment?: string | null; // Equipment from the master exercise (Exercise.equipment)

  // --- Data from the related ExerciseSet (The Actual Performance) ---
  sets: LoggedSetData[];     // Array of actual sets performed for this exercise entry
}

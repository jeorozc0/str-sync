import type {
  Prisma, // Import the Prisma namespace for utility types
  Exercise as PrismaExercise,
  WorkoutExercise as PrismaWorkoutExercise,
  Workout as PrismaWorkout,
  ExerciseSet as PrismaExerciseSet,
  ExerciseLogEntry as PrismaExerciseLogEntry,
  WorkoutLog as PrismaWorkoutLog
} from '@prisma/client';

// --- Base Prisma Types ---
// You can often use the direct Prisma types if no specific relations are needed immediately.
// However, for components, it's often clearer to define types that include expected relations.

// Type for Exercise (usually no relations needed directly in log context)
export type Exercise = PrismaExercise;

// Type for WorkoutExercise *including* its nested Exercise relation
// This is what you'd typically fetch when getting workout details.
export type WorkoutExerciseWithExercise = Prisma.WorkoutExerciseGetPayload<{
  include: { exercise: true }
}>;
// Alias for consistency with previous naming if preferred
export type WorkoutExercise = WorkoutExerciseWithExercise;

// Type for Workout *including* its nested WorkoutExercises, which *also* include their Exercises
// This represents the full template structure needed for logging.
export type WorkoutWithExercises = Prisma.WorkoutGetPayload<{
  include: {
    exercises: { // The relation field name in the Workout model
      include: {
        exercise: true // Include the Exercise details within each WorkoutExercise
      }
    }
  }
}>;
// Alias for consistency
export type Workout = WorkoutWithExercises;

// Type for a logged Exercise Set (direct mapping is usually fine)
export type ExerciseSetLog = PrismaExerciseSet;

// Type for an Exercise Log Entry *including* its logged Sets relation
export type ExerciseLogEntryWithSets = Prisma.ExerciseLogEntryGetPayload<{
  include: { sets: true } // Include the array of logged sets
}>;

// --- Custom Combined Type for Live Logging State ---

// Type for the ExerciseLogEntry as needed by the live logging component:
// It includes the base log entry data, the logged sets, AND the corresponding template exercise details.
export type LiveExerciseLogEntry = ExerciseLogEntryWithSets & {
  // Add the template exercise details for easy access during logging
  templateExercise: WorkoutExerciseWithExercise;
};

// Type for the main Workout Log record (direct mapping is usually fine)
export type WorkoutLog = PrismaWorkoutLog;

// Structure for our live state, using the enhanced LiveExerciseLogEntry type
// Keyed by the ExerciseLogEntry ID (string)
export type LiveLogState = Record<string, LiveExerciseLogEntry>;



// src/types/workout.ts
export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  rir: number; // Reps in Reserve
  restTime: number; // in seconds
  category: string; // e.g., 'Chest', 'Back', 'Legs'
  equipment?: string; // e.g., 'Barbell', 'Dumbbell'
  // Add other potential fields like weight, notes per set, etc.
}

export interface Workout {
  id: string; // Use string for IDs typically from DBs
  folderId: string;
  name: string;
  date: string; // Consider using Date object if needed, but string is fine for display
  duration: string; // e.g., '65 min'
  exercises: Exercise[];
  totalWeight: number; // Calculated or stored total volume/weight
  isPR?: boolean; // Personal Record flag
  notes?: string;
}

// Type for calculated muscle group data
export interface MuscleGroupData {
  name: string;
  value: number; // Number of sets or volume
  percentage: number;
}

// Type for calculated intensity data
export interface IntensityData {
  name: string; // RIR description
  count: number; // Number of exercises at this RIR
}

// Type for calculated volume data
export interface VolumeData {
  name: string; // Exercise name
  volume: number; // Total reps (sets * reps)
}

// Represents a specific exercise planned within a workout template.
// This often corresponds to a record in a join table like 'WorkoutExercise'.
export interface PlannedExercise {
  id: string;          // WorkoutExercise ID
  exerciseId: string;  // Master Exercise ID
  order: number;       // Order within the template
  name: string;        // Denormalized Exercise name
  targetSets: number;  // From WorkoutExercise.sets
  targetReps: string;  // From WorkoutExercise.reps (e.g., "8-12")
  targetWeight?: number | null; // From WorkoutExercise.weight
  targetRestTime?: number | null; // From WorkoutExercise.restSeconds
  // targetRir?: number | null; // Add if you add RIR to WorkoutExercise schema
  notes?: string | null; // From WorkoutExercise.notes

  // Denormalized fields from the master Exercise model
  category?: string | null; // From Exercise.muscleGroup
  equipment?: string | null; // From Exercise.equipment
}

// Represents a workout template/plan.
// Corresponds to the 'Workout' model in Prisma.
export interface WorkoutTemplate {
  id: string;           // Workout ID
  folderId: string | null; // Workout.folderId
  name: string;         // Workout.name
  description?: string | null; // Workout.description
  isArchived: boolean;  // Workout.isArchived (useful for UI filtering)
  createdAt: Date;      // Workout.createdAt
  updatedAt: Date;      // Workout.updatedAt
  userId: string;       // Workout.userId

  plannedExercises: PlannedExercise[]; // Array of exercises planned for this template

  // Optional fields populated by specific queries (e.g., using include or _count)
  folderName?: string | null;
  logCount?: number; // If _count: { logs: true } is included
}

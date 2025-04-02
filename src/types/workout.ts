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

export interface PlannedExercise {
  id: string; // Unique ID within the template
  exerciseId: string; // Reference to a master exercise definition (optional)
  name: string; // Exercise Name
  targetSets: number;
  targetReps: string; // Can be a range like "8-12" or a number "5"
  targetRir?: number; // Optional target intensity
  targetRestTime: number; // in seconds
  notes?: string; // Notes specific to this exercise in the template
  category?: string; // Denormalized for easier display
  equipment?: string; // Denormalized for easier display
}

export interface WorkoutTemplate {
  id: string;
  folderId: string;
  name: string;
  description?: string;
  // Exercises planned for this template
  plannedExercises: PlannedExercise[];
  // Metadata (optional)
  createdAt: Date;
  updatedAt: Date;
  // Calculated/derived properties (optional)
  estimatedDurationMinutes?: number;
  primaryMuscleGroups?: string[];
}

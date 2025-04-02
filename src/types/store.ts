import { type WorkoutTemplate } from "./workout";

export interface Folder {
  id: string;
  name: string;
}

export interface Exercise { // Represents the master Exercise definition used within the store
  id: string; // Corresponds to Exercise.id in Prisma
  name: string;
  muscleGroup: string; // Corresponds to Exercise.muscleGroup in Prisma
  equipment?: string; // Optional, maps from Exercise.equipment
  // Include other fields from Prisma Exercise if needed for display/logic in store/UI
  // e.g., secondaryMuscleGroups?: string;
  // description?: string;
}

// Interface for an exercise entry within the workout form/store state
export interface StoreWorkoutExercise {
  id: string; // ID of the WorkoutExercise record (join table entry). Generated client-side for new ones.
  order: number; // Display/logic order in the list
  sets: number; // Target sets
  reps: string; // Target reps (string for ranges like "8-12")
  weight?: number; // Target/suggested weight (optional)
  restSeconds?: number; // Target rest time in seconds (optional)
  rir?: 0 | 1 | 2 | 3 | 4 | 5; // Optional: Target Reps in Reserve
  notes?: string; // Optional notes for this exercise within the template
  exerciseId: string; // Foreign key linking to the master Exercise record
  exercise: Exercise; // Nested object containing details of the selected master Exercise
}

export interface Workout { // Represents the Workout Template in the context of the store type definition
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description: string | null;
  isArchived: boolean;
  userId: string;
  folderId: string | null;
  exercises: StoreWorkoutExercise[]; // Use the specific store exercise type here
}

// Form state for workout creation/editing
export interface WorkoutFormState {
  name: string;
  description: string | null;
  folderId: string | null;
  exercises: StoreWorkoutExercise[]; // Array of exercises in the form
}


// --- Keep WorkoutStore interface ---
export interface WorkoutStore {
  // Workout data
  currentWorkout: WorkoutFormState;
  isSubmitting: boolean;
  error: string | null;

  // Form actions
  setName: (name: string) => void;
  setDescription: (description: string | null) => void;
  setFolderId: (folderId: string | null) => void;

  // Exercise actions
  addExercise: (exercise: StoreWorkoutExercise) => void; // Uses StoreWorkoutExercise
  updateExercise: (index: number, exercise: Partial<StoreWorkoutExercise>) => void; // Allow partial updates
  removeExercise: (index: number) => void;
  reorderExercises: (exercises: StoreWorkoutExercise[]) => void; // Uses StoreWorkoutExercise

  // Init/Reset actions
  initializeForEdit: (template: WorkoutTemplate) => void; // Takes UI type
  initWithFolder: (folderId: string | null) => void;
  resetForm: () => void;

  // Submit actions
  saveWorkout: (templateId?: string) => Promise<string | null>; // Returns workout ID if successful

  // Server sync mock (can be removed or adapted)
  // fetchCurrentWorkout: (id: string) => Promise<void>;
}

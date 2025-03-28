export interface Folder {
  id: string;
  name: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  secondaryMuscleGroups?: string;
  description?: string;
  instructions?: string;
  difficulty?: string;
  equipment?: string;
}

export interface WorkoutExercise {
  id: string;
  order: number;
  sets: number;
  reps: string;
  weight?: number;
  restSeconds?: number;
  rir?: 0 | 1 | 2 | 3 | 4 | 5; // Reps in Reserve (intensity)
  notes?: string;
  exerciseId: string;
  exercise: Exercise;
}

export interface Workout {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description: string | null;
  isArchived: boolean;
  userId: string;
  folderId: string | null;
  exercises: WorkoutExercise[];
}

// Form state for workout creation
export interface WorkoutFormState {
  name: string;
  description: string | null;
  folderId: string | null;
  exercises: WorkoutExercise[];
}

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
  addExercise: (exercise: WorkoutExercise) => void;
  updateExercise: (index: number, exercise: WorkoutExercise) => void;
  removeExercise: (index: number) => void;
  reorderExercises: (exercises: WorkoutExercise[]) => void;

  // Init with predefined folder
  initWithFolder: (folderId: string | null) => void;

  // Reset form
  resetForm: () => void;

  // Submit actions
  saveWorkout: () => Promise<string | null>; // Returns workout ID if successful

  // Server sync mock (in real app, this would call your API)
  fetchCurrentWorkout: (id: string) => Promise<void>;
}


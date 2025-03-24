import { create } from "zustand";
import { nanoid } from "nanoid";

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
interface WorkoutFormState {
  name: string;
  description: string | null;
  folderId: string | null;
  exercises: WorkoutExercise[];
}

interface WorkoutStore {
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

// Initial state for the form
const initialFormState: WorkoutFormState = {
  name: "",
  description: null,
  folderId: null,
  exercises: [],
};

const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  // Initial state
  currentWorkout: { ...initialFormState },
  isSubmitting: false,
  error: null,

  // Form actions
  setName: (name) =>
    set((state) => ({
      currentWorkout: { ...state.currentWorkout, name },
    })),

  setDescription: (description) =>
    set((state) => ({
      currentWorkout: { ...state.currentWorkout, description },
    })),

  setFolderId: (folderId) =>
    set((state) => ({
      currentWorkout: { ...state.currentWorkout, folderId },
    })),

  // Exercise actions
  addExercise: (exercise) =>
    set((state) => {
      const updatedExercises = [...state.currentWorkout.exercises];

      // Set the correct order for the new exercise
      exercise.order = updatedExercises.length;

      // Generate an ID if not provided
      if (!exercise.id) {
        exercise.id = nanoid(10);
      }

      return {
        currentWorkout: {
          ...state.currentWorkout,
          exercises: [...updatedExercises, exercise],
        },
      };
    }),

  updateExercise: (index, exercise) =>
    set((state) => {
      const updatedExercises = [...state.currentWorkout.exercises];
      if (index >= 0 && index < updatedExercises.length) {
        const existingExercise = updatedExercises[index];
        if (existingExercise) {
          updatedExercises[index] = {
            ...existingExercise,
            ...exercise,
            // Preserve the original order
            order: existingExercise.order,
          };
        }
      }

      return {
        currentWorkout: {
          ...state.currentWorkout,
          exercises: updatedExercises,
        },
      };
    }),

  removeExercise: (index) =>
    set((state) => {
      const updatedExercises = [...state.currentWorkout.exercises];
      updatedExercises.splice(index, 1);

      // Update order values after removal
      updatedExercises.forEach((ex, idx) => {
        ex.order = idx;
      });

      return {
        currentWorkout: {
          ...state.currentWorkout,
          exercises: updatedExercises,
        },
      };
    }),

  reorderExercises: (exercises) =>
    set((state) => {
      // Update order values based on new array position
      const updatedExercises = exercises.map((ex, idx) => ({
        ...ex,
        order: idx,
      }));

      return {
        currentWorkout: {
          ...state.currentWorkout,
          exercises: updatedExercises,
        },
      };
    }),

  // Initialize with a folder ID (e.g., when coming from a folder page)
  initWithFolder: (folderId) =>
    set((state) => ({
      currentWorkout: { ...state.currentWorkout, folderId },
    })),

  // Reset form to initial state
  resetForm: () =>
    set({
      currentWorkout: { ...initialFormState },
      error: null,
    }),

  // Save workout to server
  saveWorkout: async () => {
    set({ isSubmitting: true, error: null });
    const { currentWorkout } = get();

    // Validate required fields
    if (!currentWorkout.name) {
      set({
        isSubmitting: false,
        error: "Workout name is required",
      });
      return null;
    }

    try {
      // In a real app, you'd make an API call here
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful response with new workout ID
      const newWorkoutId = nanoid(10);

      // Reset form after successful submission
      set({
        isSubmitting: false,
        currentWorkout: { ...initialFormState },
      });

      return newWorkoutId;
    } catch (error) {
      set({
        isSubmitting: false,
        error:
          error instanceof Error ? error.message : "Failed to save workout",
      });
      return null;
    }
  },

  // Fetch an existing workout (for editing)
  fetchCurrentWorkout: async (_id: string) => {
    set({ isSubmitting: true, error: null });

    try {
      // In a real app, you'd make an API call here
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock response with workout data
      const mockWorkout: WorkoutFormState = {
        name: "Sample Workout",
        description: "This is a sample workout loaded from the server",
        folderId: "folder-1",
        exercises: [],
      };

      set({
        currentWorkout: mockWorkout,
        isSubmitting: false,
      });
    } catch (error) {
      set({
        isSubmitting: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch workout",
      });
    }
  },
}));

export default useWorkoutStore;

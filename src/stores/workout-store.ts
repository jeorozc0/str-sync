import { create } from "zustand";
import { nanoid } from "nanoid";
import { type WorkoutFormState, type WorkoutStore } from "@/types/store";
import { createWorkoutAction } from "@/actions/workouts";


// Initial state for the form
const initialFormState: WorkoutFormState = {
  name: "",
  description: null,
  folderId: null,
  exercises: [],
};


// Get the user's ID from the auth data

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
  // In your store file
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
      // Call server action
      const result = await createWorkoutAction(currentWorkout);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Make sure workoutId exists
      if (!result.workoutId) {
        throw new Error("Workout ID not returned from server");
      }

      // Reset form after successful submission
      set({
        isSubmitting: false,
        currentWorkout: { ...initialFormState },
      });

      // Return the ID which we've confirmed exists
      return result.workoutId;
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

import { create } from "zustand";
import { nanoid } from "nanoid";
import { type StoreWorkoutExercise, type WorkoutFormState, type WorkoutStore } from "@/types/store";
import { createWorkoutAction, updateWorkoutAction } from "@/actions/workouts";
import { type PlannedExercise, type WorkoutTemplate } from "@/types/workout";
import { toast } from "sonner";


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
  saveWorkout: async (templateId?: string) => { // Add optional templateId for updates
    set({ isSubmitting: true, error: null });
    const { currentWorkout } = get();

    if (!currentWorkout.name.trim()) {
      const errorMsg = "Workout name is required";
      set({ isSubmitting: false, error: errorMsg });
      toast.error(errorMsg);
      return null;
    }
    if (currentWorkout.exercises.length === 0) {
      const errorMsg = "Add at least one exercise to the workout";
      set({ isSubmitting: false, error: errorMsg });
      toast.error(errorMsg);
      return null;
    }

    try {
      let result;
      let successMessage: string;

      if (templateId) {
        // ----- UPDATE -----
        console.log("Calling updateWorkoutAction for ID:", templateId);
        result = await updateWorkoutAction(templateId, currentWorkout);
        successMessage = "Workout template updated successfully!";
      } else {
        // ----- CREATE -----
        console.log("Calling createWorkoutAction");
        result = await createWorkoutAction(currentWorkout);
        successMessage = "Workout template created successfully!";
      }

      if (!result.success) {
        throw new Error(result.error ?? "An unknown error occurred");
      }

      set({ isSubmitting: false, error: null });
      toast.success(successMessage);

      // Reset form only on create, not necessarily on update
      if (!templateId) {
        get().resetForm();
      }

      return result.workoutId; // Return ID (same for create/update result structure)

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to save workout template";
      set({ isSubmitting: false, error: errorMsg });
      toast.error(errorMsg);
      console.error("Save workout error:", error);
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
  initializeForEdit: (template: WorkoutTemplate) => {
    console.log("Initializing store for edit:", template);
    // Map fetched WorkoutTemplate data to the WorkoutFormState structure
    const formState: WorkoutFormState = {
      name: template.name,
      description: template.description ?? null,
      folderId: template.folderId ?? null,
      exercises: template.plannedExercises.map((pe: PlannedExercise, index: number): StoreWorkoutExercise => ({
        // Map PlannedExercise to StoreWorkoutExercise
        id: pe.id, // Use the existing ID from WorkoutExercise record
        order: index, // Ensure order is sequential based on fetch result
        sets: pe.targetSets,
        reps: pe.targetReps,
        weight: pe.targetWeight,
        restSeconds: pe.targetRestTime,
        rir: pe.targetRir, // Add if targetRir exists in PlannedExercise type
        notes: pe.notes,
        exerciseId: pe.exerciseId,
        // Map nested exercise details
        exercise: {
          id: pe.exerciseId,
          name: pe.name,
          muscleGroup: pe.category ?? 'Unknown', // Use category as muscleGroup
          equipment: pe.equipment,
          // Add other fields from Exercise if needed by the store type
        },
      })),
    };
    set({ currentWorkout: formState, error: null, isSubmitting: false });
  },

  // --- UPDATED: saveWorkout (now handles both create and update logic via actions) ---
}));

export default useWorkoutStore;

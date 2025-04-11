import { create } from 'zustand';
import type { Workout, WorkoutExercise as PrismaWorkoutExercise, Exercise as PrismaExercise, ExerciseSet as PrismaExerciseSet } from '@prisma/client';
import { nanoid } from 'nanoid';
import { addExerciseSetToLog } from '@/actions/logging';

// --- Types for the Store ---

// Represents a single set being logged or already logged
export interface LoggedSet extends Omit<PrismaExerciseSet, 'id' | 'exerciseLogEntryId'> {
  // Add a temporary client-side ID for React keys before saving
  tempId: string;
  // Status can help UI differentiate (e.g., 'pending', 'completed', 'skipped')
  status: 'pending' | 'completed' | 'skipped';
}

// Represents the state of a specific exercise being logged
export interface LoggedExercise {
  exerciseLogEntryId: string; // Link to the ExerciseLogEntry created in the DB
  workoutExerciseId: string;  // Link back to the planned WorkoutExercise
  exerciseDetails: Pick<PrismaExercise, 'id' | 'name' | 'muscleGroup' | 'equipment'>; // Basic info for display
  targetSets: number;
  targetReps: string;
  targetWeight?: number | null;
  targetRestSeconds?: number | null;
  plannedNotes?: string | null;
  loggedSets: LoggedSet[]; // Array of sets logged for this exercise so far
  isCompleted: boolean; // Flag if all target sets are done/skipped
}

// Represents the overall state of the live logging session
export interface LiveLoggingState {
  workoutLogId: string | null; // ID of the WorkoutLog being tracked
  templateName: string | null;
  startedAt: Date | null;
  exercises: LoggedExercise[]; // The list of exercises being logged
  currentExerciseIndex: number;
  // Note: Current *set* number logic is often handled within the component or derived
  //       based on targetSets vs loggedSets.length for the current exercise.

  // Timer states (optional, could be local component state too)
  isResting: boolean;
  restTimerSeconds: number;
  restTimerDuration: number; // The target duration for the current rest

  // Status
  isLoading: boolean; // Loading initial data
  isFinishing: boolean; // Submitting the final workout
  error: string | null;
}

// --- Store Actions ---
export interface LiveLoggingActions {
  initializeSession: (logId: string, template: Workout, plannedExercises: (PrismaWorkoutExercise & { exercise: PrismaExercise })[]) => void;
  completeSet: (exerciseIndex: number, setNumber: number, reps: number, weight: number | null, rpe: number | null) => Promise<void>; // Add RPE/RIR
  skipSet: (exerciseIndex: number, setNumber: number) => void; // Mark set as skipped
  // editSet: (exerciseIndex: number, setIndex: number, updatedSetData: Partial<LoggedSet>) => void; // More complex: for editing past sets
  moveToNextExercise: () => void;
  moveToPreviousExercise: () => void;
  startRestTimer: (duration: number) => void;
  clearRestTimer: () => void;
  tickRestTimer: () => void; // Called by interval
  finishWorkout: () => Promise<boolean>; // Returns true on success
  resetStore: () => void;
  setError: (message: string | null) => void;
}

// --- Store Definition ---
const initialState: LiveLoggingState = {
  workoutLogId: null,
  templateName: null,
  startedAt: null,
  exercises: [],
  currentExerciseIndex: 0,
  isResting: false,
  restTimerSeconds: 0,
  restTimerDuration: 0,
  isLoading: true,
  isFinishing: false,
  error: null,
};

export const useLiveLoggingStore = create<LiveLoggingState & LiveLoggingActions>((set, get) => ({
  ...initialState,

  initializeSession: (logId, template, plannedExercises) => {
    console.log("Initializing live logging store for log:", logId);
    const mappedExercises: LoggedExercise[] = plannedExercises.map(pe => ({
      // Find the corresponding ExerciseLogEntry ID (requires fetching LogEntries separately or assuming order/structure)
      // For simplicity now, we assume the LogEntries were created and we *could* fetch them,
      // but we'll just use placeholder logic here. In reality, you'd fetch LogEntries by workoutLogId.
      exerciseLogEntryId: `placeholder-entry-id-${pe.id}`, // *** Placeholder - Needs real ID ***
      workoutExerciseId: pe.id,
      exerciseDetails: { // Pick needed fields from included exercise
        id: pe.exercise.id,
        name: pe.exercise.name,
        muscleGroup: pe.exercise.muscleGroup,
        equipment: pe.exercise.equipment,
      },
      targetSets: pe.sets,
      targetReps: pe.reps,
      targetWeight: pe.weight,
      targetRestSeconds: pe.restSeconds,
      plannedNotes: pe.notes,
      loggedSets: [], // Start with no logged sets
      isCompleted: false,
    }));

    set({
      workoutLogId: logId,
      templateName: template.name,
      startedAt: new Date(), // Or fetch the actual startedAt from the log if resuming
      exercises: mappedExercises,
      currentExerciseIndex: 0,
      isLoading: false,
      error: null,
    });
  },

  completeSet: async (exerciseIndex, setNumber, reps, weight, rpe) => {
    const state = get();
    const exercise = state.exercises[exerciseIndex];
    const currentWorkoutLogId = state.workoutLogId; // Use state variable

    if (!exercise || !currentWorkoutLogId) {
      const errorMsg = "Cannot complete set: exercise, log ID missing, or session not initialized.";
      console.error(errorMsg, { exerciseExists: !!exercise, logIdExists: !!currentWorkoutLogId });
      set({ error: errorMsg });
      // Throw an error so the calling component's catch block handles it
      throw new Error(errorMsg);
    }

    // Verify exerciseLogEntryId exists and is not a placeholder
    if (!exercise.exerciseLogEntryId || exercise.exerciseLogEntryId.startsWith('placeholder-')) {
      const errorMsg = "Cannot save set: Invalid database link for this exercise.";
      console.error(errorMsg, { exerciseLogEntryId: exercise.exerciseLogEntryId });
      set({ error: errorMsg });
      throw new Error(errorMsg);
    }


    // Optimistic UI update state object
    const newSet: LoggedSet = {
      tempId: nanoid(10), // Temporary ID for UI key
      setNumber: setNumber,
      reps: reps,
      weight: weight ?? null,
      rpe: rpe ?? null,
      isCompleted: true, // Mark as completed optimistically
      status: 'completed',
    };

    // Prepare data specifically for the server action (exclude tempId, status)
    const setDataForAction: Omit<PrismaExerciseSet, 'id' | 'exerciseLogEntryId'> = {
      setNumber: newSet.setNumber,
      reps: newSet.reps,
      weight: newSet.weight,
      rpe: newSet.rpe,
      isCompleted: newSet.isCompleted,
    };

    // --- Optimistic State Update ---
    // Apply the update immediately for responsive UI
    set((prevState) => {
      const updatedExercises = [...prevState.exercises];
      const targetExercise = updatedExercises[exerciseIndex];
      if (!targetExercise) return {}; // Should not happen if initial checks passed

      const updatedSets = [...targetExercise.loggedSets, newSet]; // Add the new set
      const isExerciseNowComplete = updatedSets.filter(s => s.status === 'completed' || s.status === 'skipped').length >= targetExercise.targetSets;

      updatedExercises[exerciseIndex] = {
        ...targetExercise,
        loggedSets: updatedSets,
        isCompleted: isExerciseNowComplete,
      };

      // --- Auto-advance logic (keep as is) ---
      let nextIndex = prevState.currentExerciseIndex;
      if (isExerciseNowComplete && prevState.currentExerciseIndex === exerciseIndex) {
        if (exerciseIndex < updatedExercises.length - 1) {
          nextIndex = exerciseIndex + 1;
          console.log("Auto-advancing to next exercise index:", nextIndex);
        } else {
          console.log("Last exercise completed.");
        }
      }
      // --- End auto-advance ---

      return { exercises: updatedExercises, currentExerciseIndex: nextIndex, error: null }; // Clear previous errors on optimistic success
    });
    // --- End Optimistic State Update ---


    // --- Server Action Call ---
    try {
      console.log(`Calling addExerciseSetToLog: logId=${currentWorkoutLogId}, entryId=${exercise.exerciseLogEntryId}`);
      // Call the actual server action
      const result = await addExerciseSetToLog(
        currentWorkoutLogId,
        exercise.exerciseLogEntryId,
        setDataForAction // Pass data without tempId/status
      );

      if (!result.success) {
        // If server action failed, throw an error to trigger catch block
        throw new Error(result.error ?? "Failed to save set to server.");
      }

      // Optional: If server returns the created set ID, you could update the optimistic set
      // Find the set with tempId and update its actual ID if needed for future edits/deletes
      if (result.createdSet) {
        console.log("Server save successful, created set ID:", result.createdSet.id);
        // Update the set in the store with the real ID (optional but good practice)
        set(prevState => {
          const updatedExercises = prevState.exercises.map((ex, idx) => {
            if (idx === exerciseIndex) {
              const updatedSets = ex.loggedSets.map(s =>
                s.tempId === newSet.tempId ? { ...s, id: result.createdSet!.id } : s // Add 'id' from DB result
              );
              return { ...ex, loggedSets: updatedSets };
            }
            return ex;
          });
          return { exercises: updatedExercises };
        });
      }

      // --- Start Rest Timer (Only on successful save) ---
      if (exercise.targetRestSeconds) {
        get().startRestTimer(exercise.targetRestSeconds);
      }
      // --- End Rest Timer ---

    } catch (error) {
      console.error("Error saving set via server action:", error);
      const errorMsg = error instanceof Error ? error.message : "Failed to save set.";
      set({ error: errorMsg }); // Update store error state

      // --- Revert Optimistic Update ---
      set(prevState => {
        const revertedExercises = prevState.exercises.map((ex, idx) => {
          if (idx === exerciseIndex) {
            // Filter out the set that failed to save using tempId
            const revertedSets = ex.loggedSets.filter(s => s.tempId !== newSet.tempId);
            // Also potentially revert isCompleted status if needed
            const wasPreviouslyComplete = revertedSets.filter(s => s.status === 'completed' || s.status === 'skipped').length >= ex.targetSets;
            return { ...ex, loggedSets: revertedSets, isCompleted: wasPreviouslyComplete };
          }
          return ex;
        });
        // Revert auto-advance if it happened? Might be complex, consider simple error display first.
        return { exercises: revertedExercises };
      });
      // --- End Revert ---

      // Re-throw the error so the calling component's catch block is triggered
      throw new Error(errorMsg);
    }
    // --- End Server Action Call ---
  },

  skipSet: (exerciseIndex, setNumber) => {
    // Similar logic to completeSet, but mark status as 'skipped'
    // Call server action to record skipped set if necessary
    // Update state optimistically
    console.log("Skipping set - Not implemented");
    // TODO: Implement skip logic and state update
  },

  moveToNextExercise: () => {
    set((state) => {
      if (state.currentExerciseIndex < state.exercises.length - 1) {
        return { currentExerciseIndex: state.currentExerciseIndex + 1 };
      }
      return {}; // No change if already at last exercise
    });
    get().clearRestTimer(); // Clear timer when manually moving
  },

  moveToPreviousExercise: () => {
    set((state) => {
      if (state.currentExerciseIndex > 0) {
        return { currentExerciseIndex: state.currentExerciseIndex - 1 };
      }
      return {}; // No change if already at first exercise
    });
    get().clearRestTimer(); // Clear timer when manually moving
  },

  startRestTimer: (duration) => {
    console.log(`Starting rest timer for ${duration} seconds`);
    set({ isResting: true, restTimerDuration: duration, restTimerSeconds: duration });
    // Interval logic should be handled in the UI component using this state
  },

  clearRestTimer: () => {
    console.log("Clearing rest timer");
    set({ isResting: false, restTimerSeconds: 0, restTimerDuration: 0 });
    // UI component should clear its interval
  },

  // This should be called by an interval in the UI component
  tickRestTimer: () => {
    set((state) => {
      if (!state.isResting || state.restTimerSeconds <= 0) {
        return { isResting: false, restTimerSeconds: 0 }; // Stop timer if it reaches 0 or wasn't resting
      }
      return { restTimerSeconds: state.restTimerSeconds - 1 };
    });
  },

  finishWorkout: async () => {
    set({ isFinishing: true, error: null });
    const { workoutLogId, startedAt } = get();
    if (!workoutLogId || !startedAt) {
      set({ isFinishing: false, error: "Cannot finish workout: Log ID or start time missing." });
      return false;
    }

    const completedAt = new Date();
    const duration = Math.round((completedAt.getTime() - startedAt.getTime()) / (1000 * 60)); // Duration in minutes

    try {
      // --- TODO: Server Action Call ---
      // Call action `finishWorkoutLog(workoutLogId, completedAt, duration)`
      // This action updates the WorkoutLog record in the DB.
      console.log("Simulating finishing workout:", { workoutLogId, completedAt, duration });
      await new Promise(res => setTimeout(res, 500)); // Simulate network delay
      // --- ---

      set({ isFinishing: false });
      get().resetStore(); // Reset store after successful finish
      return true; // Indicate success
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to finish workout";
      console.error("Error finishing workout:", error);
      set({ isFinishing: false, error: errorMsg });
      return false; // Indicate failure
    }
  },

  resetStore: () => {
    console.log("Resetting live logging store.");
    set(initialState);
  },

  setError: (message) => set({ error: message }),

}));

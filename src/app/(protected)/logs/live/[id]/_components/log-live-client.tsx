// src/components/logging/live-logging-client.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLiveLoggingStore } from '@/stores/logs-store'; // Ensure correct store path
import { toast } from 'sonner';
import { Check } from 'lucide-react'; // Icons needed
import type { Workout, WorkoutExercise as PrismaWorkoutExercise, Exercise as PrismaExercise } from '@prisma/client';
import { LiveLogLoadingSkeleton } from './live-logging-skeleton'; // Assuming this path is correct
import { ExerciseListItem } from './exercise-list-item'; // Import new list item
import { WorkoutTimerFooter } from './workout-timer-footer'; // Import new footer

// --- Initial Data Structure from Server ---
interface InitialData {
  logId: string;
  template: Workout & { // Include nested relation type if not already fully typed in Prisma gen
    exercises: (PrismaWorkoutExercise & {
      exercise: PrismaExercise;
    })[];
  };
  plannedExercisesWithLogEntryIds: (PrismaWorkoutExercise & {
    exercise: PrismaExercise;
    exerciseLogEntryId: string; // Added by server page
  })[];
}

// --- Props for the Client Component ---
interface LiveLoggingClientProps {
  initialData: InitialData;
}

// --- Helper Function for Elapsed Time ---
const formatElapsedTime = (start: Date | null): string => {
  if (!start) return "00:00:00";
  const now = Date.now();
  const elapsedMs = now - start.getTime();
  // Ensure we don't show negative time if clock skew happens
  if (elapsedMs < 0) return "00:00:00";
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Main client component for the live workout logging interface.
 */
export default function LiveLoggingClient({ initialData }: LiveLoggingClientProps) {
  const router = useRouter();

  // --- Zustand Store Access ---
  // Select state slices and actions using individual selectors or memoized selectors
  const workoutLogId = useLiveLoggingStore(state => state.workoutLogId);
  const templateName = useLiveLoggingStore(state => state.templateName);
  const exercises = useLiveLoggingStore(state => state.exercises);
  const currentExerciseIndex = useLiveLoggingStore(state => state.currentExerciseIndex);
  const startedAt = useLiveLoggingStore(state => state.startedAt);
  const isFinishing = useLiveLoggingStore(state => state.isFinishing);
  const error = useLiveLoggingStore(state => state.error);
  const isResting = useLiveLoggingStore(state => state.isResting);
  const restTimerSeconds = useLiveLoggingStore(state => state.restTimerSeconds);

  // Select actions (references are usually stable)
  const initializeSession = useLiveLoggingStore(state => state.initializeSession);
  const completeSet = useLiveLoggingStore(state => state.completeSet);
  const finishWorkout = useLiveLoggingStore(state => state.finishWorkout);
  const setError = useLiveLoggingStore(state => state.setError);
  const resetStore = useLiveLoggingStore(state => state.resetStore);
  const tickRestTimer = useLiveLoggingStore(state => state.tickRestTimer);
  const clearRestTimer = useLiveLoggingStore(state => state.clearRestTimer);

  // --- Local Component State ---
  const [isSavingSet, setIsSavingSet] = useState(false); // Loading state for saving a single set
  const [elapsedTime, setElapsedTime] = useState("00:00:00"); // Local state for the formatted elapsed time string

  // --- Refs ---
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null); // Ref for the rest timer interval
  const elapsedIntervalRef = useRef<NodeJS.Timeout | null>(null); // Ref for the elapsed timer interval
  const exerciseListRef = useRef<HTMLDivElement>(null); // Ref for scrolling the exercise list

  // --- Effects ---

  // Effect 1: Initialize store on mount and cleanup on unmount
  useEffect(() => {
    console.log("LiveLoggingClient: Initializing session with logId:", initialData.logId);
    initializeSession(
      initialData.logId,
      initialData.template,
      initialData.plannedExercisesWithLogEntryIds
    );

    // Cleanup function: Clear intervals and reset store state
    return () => {
      console.log("LiveLoggingClient: Unmounting, clearing timers and resetting store.");
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
      if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
      resetStore();
    };
    // Only depend on initialData.logId and stable action references
    // This prevents re-initialization on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initializeSession, resetStore, initialData.logId]);


  // Effect 2: Manage Rest Timer Interval (from Zustand state)
  useEffect(() => {
    if (isResting && restTimerSeconds > 0) {
      if (!restIntervalRef.current) {
        restIntervalRef.current = setInterval(() => {
          tickRestTimer();
        }, 1000);
      }
    } else {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
        restIntervalRef.current = null;
        if (isResting && restTimerSeconds <= 0) {
          // Timer finished naturally
          clearRestTimer();
          toast.info("Rest finished!");
        }
      }
    }
    // Cleanup specifically for the interval ref
    return () => {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
      }
    };
  }, [isResting, restTimerSeconds, tickRestTimer, clearRestTimer]);


  // Effect 3: Manage Elapsed Time Interval (using local state)
  useEffect(() => {
    if (elapsedIntervalRef.current) {
      clearInterval(elapsedIntervalRef.current); // Clear previous interval if any
    }

    if (startedAt) {
      // Update immediately on start
      setElapsedTime(formatElapsedTime(startedAt));
      // Set up interval
      elapsedIntervalRef.current = setInterval(() => {
        setElapsedTime(formatElapsedTime(startedAt));
      }, 1000);
    } else {
      setElapsedTime("00:00:00"); // Reset if workout hasn't started or is reset
    }

    // Cleanup interval on unmount or when startedAt changes
    return () => {
      if (elapsedIntervalRef.current) {
        clearInterval(elapsedIntervalRef.current);
      }
    };
  }, [startedAt]); // Depends only on startedAt from the store


  // Effect 4: Scroll to current exercise when index changes
  useEffect(() => {
    // Find the element using a more robust method if possible, like a ref array,
    // but ID lookup is simpler for now.
    const element = document.getElementById(`exercise-${currentExerciseIndex}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentExerciseIndex]); // Run only when the index changes

  // --- Event Handlers ---
  // Memoize handlers passed to children
  const handleCompleteSet = useCallback(async (exerciseIndex: number, reps: number, weight: number | null, rpe: number | null) => {
    if (isSavingSet || !workoutLogId) return; // Prevent double submission

    const exercise = exercises[exerciseIndex];
    if (!exercise) {
      console.error("Attempted to complete set for non-existent exercise index:", exerciseIndex);
      toast.error("An internal error occurred (exercise not found).");
      return;
    }

    const setNumber = exercise.loggedSets.length + 1;
    setIsSavingSet(true); // Set local loading state
    setError(null); // Clear previous store errors

    try {
      // Call store action (handles optimistic update + server action)
      await completeSet(exerciseIndex, setNumber, reps, weight, rpe);
      toast.success(`Set ${setNumber} logged!`);
    } catch (err) {
      // Error handling primarily done within store action, but catch here just in case
      const errorMsg = err instanceof Error ? err.message : "Failed to save set";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Error completing set in client:", err);
    } finally {
      setIsSavingSet(false); // Reset local loading state
    }
  }, [completeSet, setError, exercises, isSavingSet, workoutLogId]); // Dependencies

  const handleFinishWorkout = useCallback(async () => {
    // Optional: Add confirmation dialog here
    const success = await finishWorkout();
    if (success && workoutLogId) {
      toast.success("Workout finished and logged!");
      // Navigate AFTER the state is potentially reset by finishWorkout's success path
      router.push(`/logs/${workoutLogId}`);
    }
    // Error toast should be handled within the finishWorkout store action
  }, [finishWorkout, workoutLogId, router]);

  // --- Render Logic ---
  const totalExercises = exercises?.length ?? 0; // Handle case where exercises might be initially undefined
  const isWorkoutComplete = totalExercises > 0 && exercises.every(ex => ex.isCompleted);

  // Loading State: Render skeleton if store hasn't initialized or exercises aren't populated
  if (!workoutLogId || !exercises || exercises.length === 0) {
    // Check initialData as well to ensure server provided something
    if (!initialData?.logId || !initialData.plannedExercisesWithLogEntryIds) {
      return <div>Error: Missing initial workout data.</div>; // Or redirect
    }
    return <LiveLogLoadingSkeleton />;
  }

  return (
    <div className="container mx-auto max-w-3xl px-0 md:px-4 py-8 relative pb-24"> {/* pb-24 ensures space for footer */}
      {/* Header */}
      <div className='mb-6 text-center px-4'>
        <p className="text-sm text-neutral-400">{templateName ?? 'Workout Session'}</p>
        <h1 className="text-2xl font-semibold">Logging Workout</h1>
        {/* Optional: Display Log ID for debugging */}
        {/* <p className="text-xs text-neutral-500 mt-1">Session ID: {workoutLogId}</p> */}
      </div>

      {/* Exercise List Container */}
      <div ref={exerciseListRef} className="border-t border-neutral-800">
        {exercises.map((exercise, index) => (
          // Wrapper div with ID for scrolling
          <div id={`exercise-${index}`} key={exercise.exerciseLogEntryId}>
            <ExerciseListItem
              exercise={exercise}
              index={index}
              isCurrent={index === currentExerciseIndex}
              // Pass local saving state only to the current exercise item
              isSavingSet={isSavingSet && index === currentExerciseIndex}
              onCompleteSet={handleCompleteSet}
            />
          </div>
        ))}
      </div>

      {/* Completion Message */}
      {isWorkoutComplete && (
        <div className="mt-8 text-center text-green-400 p-4 border border-dashed border-green-700 rounded-md mx-4">
          <Check className="inline-block h-5 w-5 mr-2" /> Workout Complete! Ready to finish.
        </div>
      )}

      {/* Global Error Display from Store */}
      {error && <p className="mt-4 text-center text-sm text-red-500 px-4">{error}</p>}


      {/* Fixed Footer */}
      {/* Pass the locally managed elapsedTime string */}
      <WorkoutTimerFooter
        elapsedTime={elapsedTime}
        onFinish={handleFinishWorkout}
        isFinishing={isFinishing}
      />
    </div>
  );
}

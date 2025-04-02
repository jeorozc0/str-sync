// src/app/(protected)/w/create/create-workout-client.tsx
"use client";

import { useEffect, useState, useRef } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import WorkoutDetailsForm from "@/components/workout/workout-details-form";
import WorkoutExerciseList from "@/components/workout/workout-list";
import WorkoutSummary from "@/components/workout/workout-summary";
import useWorkoutStore from '@/stores/workout-store';
import { toast } from 'sonner';
import { getAllExercises } from '@/actions/exercises';
import { type Exercise as PrismaExercise } from '@prisma/client';

interface Folder {
  id: string;
  name: string;
}

interface CreateWorkoutClientProps {
  folders: Folder[];
  initialFolderId?: string;
}

export default function CreateWorkoutClient({ folders, initialFolderId }: CreateWorkoutClientProps) {
  const router = useRouter();

  // Store selectors (keep specific)
  const saveWorkout = useWorkoutStore(state => state.saveWorkout);
  const isSubmitting = useWorkoutStore(state => state.isSubmitting);
  const storeError = useWorkoutStore(state => state.error); // Renamed to avoid conflict
  const initWithFolder = useWorkoutStore(state => state.initWithFolder);
  const resetForm = useWorkoutStore(state => state.resetForm);

  // State for fetched exercises
  const [allExercises, setAllExercises] = useState<PrismaExercise[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(true);
  const [exerciseFetchError, setExerciseFetchError] = useState<string | null>(null);

  const isMounted = useRef(false); // Track mount status

  // Effect 1: Store Initialization and Cleanup (Runs only on mount/unmount)
  useEffect(() => {
    // Ensure this runs only once after initial mount
    if (!isMounted.current) {
      console.log("CreateWorkoutClient initializing store. initialFolderId:", initialFolderId);
      resetForm();
      if (initialFolderId) {
        initWithFolder(initialFolderId);
      }
      isMounted.current = true; // Mark as mounted
    }

    // Cleanup: Reset form ONLY when the component truly unmounts
    return () => {
      console.log("CreateWorkoutClient unmounting - resetting form.");
      resetForm();
      // No need to reset isMounted here unless component can remount within same page view
    };
    // Empty dependency array ensures this runs only once on mount and cleanup on unmount
  }, [resetForm, initWithFolder, initialFolderId]); // Include props/actions needed for init logic


  // Effect 2: Fetch Exercises (Runs only once on mount)
  useEffect(() => {
    const fetchExercises = async () => {
      console.log("Fetching all exercises in CreateWorkoutClient...");
      setIsLoadingExercises(true); // Set loading true at the start
      setExerciseFetchError(null);
      try {
        const { exercises: fetchedExercises, error: fetchError } = await getAllExercises();
        if (fetchError) {
          throw new Error(fetchError);
        }
        setAllExercises(fetchedExercises ?? []);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load exercises";
        console.error("Failed to load exercises:", err);
        setExerciseFetchError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsLoadingExercises(false); // Set loading false at the end
      }
    };

    void fetchExercises();
    // Empty dependency array ensures this runs only once on mount
  }, []); // No dependencies needed here

  const handleSaveWorkout = async () => {
    const workoutId = await saveWorkout();
    if (workoutId) {
      // Don't need to manage isMounted/didInit flag here anymore
      router.push(`/w/${workoutId}`);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="outline" size="icon" className="h-8 w-8 border-[#333333] bg-background/10 hover:bg-background/20">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">Create Workout Template</h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <WorkoutDetailsForm folders={folders} folderId={initialFolderId} />
          <WorkoutExerciseList
            availableExercises={allExercises}
            isLoadingAvailableExercises={isLoadingExercises}
            exerciseFetchError={exerciseFetchError}
          />
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-4 rounded-lg border border-[#333333] bg-[#111111] p-4">
            <h2 className="mb-4 text-lg font-medium">Workout Summary</h2>
            <WorkoutSummary />
            <div className="border-t border-[#333333] pt-4">
              <Button
                className="h-9 w-full gap-2 bg-white text-black hover:bg-gray-200"
                onClick={handleSaveWorkout}
                disabled={isSubmitting || isLoadingExercises}
              >
                {isSubmitting ? 'Creating...' : 'Create Workout Template'}
              </Button>
              {/* Display store error */}
              {storeError && <p className="mt-2 text-sm text-red-500">{storeError}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  FileText,
  ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkoutDetailsForm from "@/components/workout/workout-details-form";
import WorkoutExerciseList from "@/components/workout/workout-list";
import WorkoutSummary from "@/components/workout/workout-summary";
import useWorkoutStore from '@/stores/workout-store';
import { type Exercise as PrismaExercise } from '@prisma/client';

interface Folder {
  id: string;
  name: string;
}

interface CreateWorkoutClientProps {
  folders: Folder[];
  initialFolderId?: string;
  allExercises: PrismaExercise[];
}

export default function CreateWorkoutClient({
  folders,
  initialFolderId,
  allExercises,
}: CreateWorkoutClientProps) {
  const router = useRouter();

  // Store selectors
  const saveWorkout = useWorkoutStore(state => state.saveWorkout);
  const isSubmitting = useWorkoutStore(state => state.isSubmitting);
  const storeError = useWorkoutStore(state => state.error);
  const initWithFolder = useWorkoutStore(state => state.initWithFolder);
  const resetForm = useWorkoutStore(state => state.resetForm);

  // Ref to track initial mount for store initialization logic
  const isMounted = useRef(false);

  // Effect: Store Initialization and Cleanup
  useEffect(() => {
    if (!isMounted.current) {
      console.log("CreateWorkoutClient initializing store. initialFolderId:", initialFolderId);
      resetForm();
      if (initialFolderId) {
        initWithFolder(initialFolderId);
      }
      isMounted.current = true;
    }

    return () => {
      if (isMounted.current) {
        console.log("CreateWorkoutClient unmounting - resetting form.");
        resetForm();
        isMounted.current = false;
      }
    };
  }, [resetForm, initWithFolder, initialFolderId]);

  // Handler for saving the workout template
  const handleSaveWorkout = async () => {
    const workoutId = await saveWorkout();
    if (workoutId) {
      router.push(`/w/${workoutId}`);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header Section */}
      <div className='flex flex-col lg:flex-row lg:justify-between'>
        <div className="mb-6 flex items-center gap-3">
          <Link href={initialFolderId ? `/f/${initialFolderId}` : "/dashboard"}>
            <Button variant="outline" size="icon" className="h-8 w-8 border-[#333333] bg-background/10 hover:bg-background/20">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Create Workout Template</h1>
        </div>

        {/* Save Button - Always visible at the top for easy access */}
        <div className="mb-6 flex justify-end">
          <Button
            className="h-9 w-full lg:w-auto gap-2 bg-white text-black hover:bg-gray-200 disabled:opacity-70"
            onClick={handleSaveWorkout}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSubmitting ? 'Saving...' : 'Save Workout Template'}
          </Button>
        </div>
      </div>

      {/* Mobile Tab Structure - Hidden on desktop */}
      <Tabs defaultValue="details" className="md:hidden">
        <TabsList className="sticky z-10 grid w-full h-auto grid-cols-2 bg-[#111111] px-1 py-1 shadow-sm mx-auto max-w-screen-xl">
          <TabsTrigger value="details" className="flex items-center justify-center gap-2 rounded-md py-3 text-sm data-[state=active]:bg-[#222222] data-[state=active]:text-white">
            <FileText className="h-4 w-4 flex-shrink-0" />
            <span className="truncate font-medium">Details</span>
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center justify-center gap-2 rounded-md py-3 text-sm data-[state=active]:bg-[#222222] data-[state=active]:text-white">
            <ClipboardList className="h-4 w-4 flex-shrink-0" />
            <span className="truncate font-medium">Summary</span>
          </TabsTrigger>
        </TabsList>

        {/* Mobile Tab Contents */}
        <TabsContent value="details" className="mt-6 pb-24">
          <div className="space-y-6">
            <WorkoutDetailsForm folders={folders} folderId={initialFolderId} />
            <WorkoutExerciseList
              availableExercises={allExercises}
              isLoadingAvailableExercises={false}
              exerciseFetchError={null}
            />
          </div>
        </TabsContent>
        <TabsContent value="summary" className="mt-6 pb-24">
          <div className="space-y-6">
            <div className="rounded-lg border border-[#333333] bg-[#111111] p-4">
              <h2 className="mb-4 text-lg font-medium">Workout Summary</h2>
              <WorkoutSummary />
              {storeError && <p className="mt-4 text-sm text-red-500">{storeError}</p>}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Desktop Layout - Hidden on mobile */}
      <div className="hidden md:grid md:grid-cols-3 md:gap-8">
        {/* Left Column: Forms */}
        <div className="space-y-6 md:col-span-2">
          <WorkoutDetailsForm folders={folders} folderId={initialFolderId} />
          <WorkoutExerciseList
            availableExercises={allExercises}
            isLoadingAvailableExercises={false}
            exerciseFetchError={null}
          />
        </div>

        {/* Right Column: Summary */}
        <div className="md:col-span-1">
          <div className="sticky top-4 space-y-4 rounded-lg border border-[#333333] bg-[#111111] p-4">
            <h2 className="mb-4 text-lg font-medium">Workout Summary</h2>
            <WorkoutSummary />
            <div className="border-t border-[#333333] pt-4">
              <Button
                className="h-9 w-full gap-2 bg-white text-black hover:bg-gray-200 disabled:opacity-70"
                onClick={handleSaveWorkout}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? 'Creating...' : 'Create Workout Template'}
              </Button>
              {storeError && <p className="mt-2 text-sm text-red-500">{storeError}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileText, // Icon for Details tab
  ClipboardList, // Icon for Summary tab
  Loader2 // Icon for loading state
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Tabs components
import WorkoutDetailsForm from '@/components/workout/workout-details-form';
import WorkoutExerciseList from '@/components/workout/workout-list';
import WorkoutSummary from '@/components/workout/workout-summary';
import useWorkoutStore from '@/stores/workout-store';
import { type WorkoutTemplate } from '@/types/workout';
import { getAllExercises } from '@/actions/exercises';
import { type Exercise as PrismaExercise } from '@prisma/client';
import { toast } from 'sonner';

interface Folder {
  id: string;
  name: string;
}

interface EditWorkoutTemplateClientProps {
  initialTemplateData: WorkoutTemplate;
  fetchedFolders: Folder[]
}

export default function EditWorkoutTemplateClient({ initialTemplateData, fetchedFolders }: EditWorkoutTemplateClientProps) {
  const router = useRouter();
  // Store selectors
  const { initializeForEdit, saveWorkout, isSubmitting, error: storeError } = useWorkoutStore(); // Renamed error to storeError for clarity
  const [folders, setFolders] = useState<Folder[]>([]);

  // State for fetched exercises
  const [allExercises, setAllExercises] = useState<PrismaExercise[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(true);
  const [exerciseFetchError, setExerciseFetchError] = useState<string | null>(null);

  // Ref to track store initialization
  const isInitialized = useRef(false);

  // Effect: Store Initialization and Data Loading
  useEffect(() => {
    // Initialize store only once
    if (!isInitialized.current) {
      console.log("EditWorkoutTemplateClient initializing store for edit.");
      initializeForEdit(initialTemplateData);
      isInitialized.current = true;
    }

    // Fetch initial data (folders are passed, exercises need fetching)
    const loadInitialData = async () => {
      // Only fetch if exercises aren't loaded yet
      if (!isLoadingExercises) return;

      console.log("EditWorkoutTemplateClient fetching exercises.");
      setExerciseFetchError(null);
      try {
        // Set folders from props immediately
        setFolders(fetchedFolders || []);

        // Fetch exercises
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
        setIsLoadingExercises(false);
        console.log("EditWorkoutTemplateClient finished fetching exercises.");
      }
    };

    // Trigger data loading if needed
    if (isLoadingExercises) {
      void loadInitialData();
    }
    // No cleanup needed here for resetForm as it's an edit page
  }, [initializeForEdit, initialTemplateData, isLoadingExercises, fetchedFolders]); // Dependencies

  // Handler for saving changes
  const handleSaveChanges = async () => {
    console.log("Attempting to save changes for workout ID:", initialTemplateData.id);
    const updatedWorkoutId = await saveWorkout(initialTemplateData.id); // Pass ID for update
    if (updatedWorkoutId) {
      toast.success("Workout template updated successfully!");
      router.push(`/w/${updatedWorkoutId}`); // Navigate to the updated workout view
    } else {
      // Error handling is likely done within the store, but you could add fallback toast here
      console.error("Failed to save workout changes. Store error:", storeError);
      // toast.error(storeError || "Failed to save changes."); // Display store error if available
    }
  };

  // Determine the link for the back button
  const backLinkHref = initialTemplateData.folderId
    ? `/f/${initialTemplateData.folderId}` // Go back to folder if it exists
    : `/w/${initialTemplateData.id}`; // Otherwise, go back to workout view

  return (
    // Consistent root container styling
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header Section - Consistent structure */}
      <div className='flex flex-col lg:flex-row lg:justify-between'>
        <div className="mb-6 flex items-center gap-3">
          <Link href={backLinkHref}>
            {/* Consistent Back Button styling */}
            <Button variant="outline" size="icon" className="h-8 w-8 border-[#333333] bg-background/10 hover:bg-background/20">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          {/* Consistent Title styling */}
          <h1 className="text-2xl font-semibold">Edit: {initialTemplateData.name}</h1>
        </div>

        {/* Save Button - Always visible at the top - Consistent structure */}
        <div className="mb-6 flex justify-end">
          <Button
            className="h-9 w-full lg:w-auto gap-2 bg-white text-black hover:bg-gray-200 disabled:opacity-70"
            onClick={handleSaveChanges}
            disabled={isSubmitting || isLoadingExercises} // Disable while submitting or loading
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Mobile Tab Structure - Hidden on desktop - Consistent structure */}
      <Tabs defaultValue="details" className="md:hidden">
        {/* Consistent TabsList styling */}
        <TabsList className="sticky top-0 z-10 grid w-full h-auto grid-cols-2 bg-[#111111] px-1 py-1 shadow-sm mx-auto max-w-screen-xl">
          {/* Consistent TabsTrigger styling */}
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
        {/* Consistent TabsContent styling */}
        <TabsContent value="details" className="mt-6 pb-24">
          <div className="space-y-6">
            <WorkoutDetailsForm folders={folders} /> {/* Pass folders */}
            <WorkoutExerciseList
              availableExercises={allExercises}
              isLoadingAvailableExercises={isLoadingExercises}
              exerciseFetchError={exerciseFetchError}
            />
          </div>
        </TabsContent>
        <TabsContent value="summary" className="mt-6 pb-24">
          <div className="space-y-6">
            {/* Consistent Summary Card styling */}
            <div className="rounded-lg border border-[#333333] bg-[#111111] p-4">
              <h2 className="mb-4 text-lg font-medium">Workout Summary</h2>
              <WorkoutSummary />
              {/* Consistent error message styling */}
              {storeError && <p className="mt-4 text-sm text-red-500">{storeError}</p>}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Desktop Layout - Hidden on mobile - Consistent structure */}
      <div className="hidden md:grid md:grid-cols-3 md:gap-8">
        {/* Left Column: Forms - Consistent structure */}
        <div className="space-y-6 md:col-span-2">
          <WorkoutDetailsForm folders={folders} /> {/* Pass folders */}
          <WorkoutExerciseList
            availableExercises={allExercises}
            isLoadingAvailableExercises={isLoadingExercises}
            exerciseFetchError={exerciseFetchError}
          />
        </div>

        {/* Right Column: Summary - Consistent structure */}
        <div className="md:col-span-1">
          {/* Consistent Sticky Wrapper styling */}
          <div className="sticky top-4 space-y-4 rounded-lg border border-[#333333] bg-[#111111] p-4">
            <h2 className="mb-4 text-lg font-medium">Workout Summary</h2>
            <WorkoutSummary />
            {/* Consistent Desktop Save Button Wrapper styling */}
            <div className="border-t border-[#333333] pt-4">
              {/* Consistent Desktop Save Button styling */}
              <Button
                className="h-9 w-full gap-2 bg-white text-black hover:bg-gray-200 disabled:opacity-70"
                onClick={handleSaveChanges}
                disabled={isSubmitting || isLoadingExercises}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
              {/* Consistent error message styling */}
              {storeError && <p className="mt-2 text-sm text-red-500">{storeError}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


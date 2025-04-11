// src/app/(protected)/w/create/_components/create-workout-client.tsx
"use client";

import { useEffect, useRef } from 'react'; // Removed useState for exercises state
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from "lucide-react"; // Added Loader2
import { Button } from "@/components/ui/button";
import WorkoutDetailsForm from "@/components/workout/workout-details-form";
import WorkoutExerciseList from "@/components/workout/workout-list";
import WorkoutSummary from "@/components/workout/workout-summary";
import useWorkoutStore from '@/stores/workout-store';
// No longer fetching exercises here, so getAllExercises and related imports can be removed
// import { toast } from 'sonner'; // Keep toast if saveWorkout might use it for errors
// import { getAllExercises } from '@/actions/exercises';
import { type Exercise as PrismaExercise } from '@prisma/client'; // Keep type definition for props

// Interface for folder data passed as props
interface Folder {
  id: string;
  name: string;
}

// --- CORRECTED: Props Interface definition ---
interface CreateWorkoutClientProps {
  folders: Folder[];
  initialFolderId?: string;
  // Add the allExercises prop expected from the parent Server Component
  allExercises: PrismaExercise[];
}

// Export the component function
export default function CreateWorkoutClient({
  folders,
  initialFolderId,
  allExercises, // Destructure the prop here
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

  // Effect 1: Store Initialization and Cleanup (Runs only on mount/unmount)
  useEffect(() => {
    // Initialize store state only on the first mount
    if (!isMounted.current) {
      console.log("CreateWorkoutClient initializing store. initialFolderId:", initialFolderId);
      resetForm(); // Clear any previous form state
      if (initialFolderId) {
        initWithFolder(initialFolderId); // Set folder if provided via URL
      }
      isMounted.current = true; // Mark as mounted
    }

    // Cleanup function: Reset store form state when component unmounts
    return () => {
      // Check if it was mounted to prevent resetting if effect runs before mount somehow
      if (isMounted.current) {
        console.log("CreateWorkoutClient unmounting - resetting form.");
        resetForm();
        isMounted.current = false; // Reset mounted status
      }
    };
    // Dependencies: Ensures effect runs if these props/actions change identity,
    // but the isMounted ref prevents re-initialization after the first run.
  }, [resetForm, initWithFolder, initialFolderId]);

  // Effect 2: Fetch Exercises (REMOVED - Data is passed via props now)

  // Handler for saving the workout template
  const handleSaveWorkout = async () => {
    const workoutId = await saveWorkout(); // Call the zustand store action
    if (workoutId) {
      // If save is successful (returns an ID), navigate to the new template's page
      router.push(`/w/${workoutId}`);
    }
    // Error display is handled by reading `storeError` state below
  };

  // --- Render Logic ---
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header Section */}
      <div className="mb-8 flex items-center gap-3">
        {/* Back Link: Navigate to dashboard or specific folder */}
        <Link href={initialFolderId ? `/f/${initialFolderId}` : "/dashboard"}>
          <Button variant="outline" size="icon" className="h-8 w-8 border-[#333333] bg-background/10 hover:bg-background/20">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">Create Workout Template</h1>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Forms */}
        <div className="space-y-6 lg:col-span-2">
          <WorkoutDetailsForm folders={folders} folderId={initialFolderId} />
          <WorkoutExerciseList
            availableExercises={allExercises} // Pass down the prop from parent
            // Loading/Error for this list is handled by the parent page's Suspense/Error Boundary
            isLoadingAvailableExercises={false}
            exerciseFetchError={null}
          />
        </div>

        {/* Right Column: Summary & Actions */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-4 rounded-lg border border-[#333333] bg-[#111111] p-4">
            <h2 className="mb-4 text-lg font-medium">Workout Summary</h2>
            <WorkoutSummary />
            <div className="border-t border-[#333333] pt-4">
              {/* Save Button */}
              <Button
                className="h-9 w-full gap-2 bg-white text-black hover:bg-gray-200 disabled:opacity-70"
                onClick={handleSaveWorkout}
                disabled={isSubmitting} // Disable only based on store submission state
              >
                {/* Show loader when submitting */}
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? 'Creating...' : 'Create Workout Template'}
              </Button>
              {/* Display potential errors from the store (e.g., validation errors) */}
              {storeError && <p className="mt-2 text-sm text-red-500">{storeError}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

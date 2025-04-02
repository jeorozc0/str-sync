"use client";

import { useEffect, useState, useRef } from 'react'; // Add useState, useRef
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WorkoutDetailsForm from '@/components/workout/workout-details-form';
import WorkoutExerciseList from '@/components/workout/workout-list'; // Will trigger dialog
import WorkoutSummary from '@/components/workout/workout-summary';
import useWorkoutStore from '@/stores/workout-store';
import { type WorkoutTemplate } from '@/types/workout';
import { getAllExercises } from '@/actions/exercises'; // Import action
import { type Exercise as PrismaExercise } from '@prisma/client'; // Import Prisma type
import { toast } from 'sonner';

interface Folder {
  id: string;
  name: string;
}

interface EditWorkoutTemplateClientProps {
  initialTemplateData: WorkoutTemplate;
  fetchedFolders: any[]
}

export default function EditWorkoutTemplateClient({ initialTemplateData, fetchedFolders }: EditWorkoutTemplateClientProps) {
  const router = useRouter();
  const { initializeForEdit, saveWorkout, isSubmitting, error } = useWorkoutStore();
  const [folders, setFolders] = useState<Folder[]>([]);

  // --- State for fetched exercises ---
  const [allExercises, setAllExercises] = useState<PrismaExercise[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(true);
  const [exerciseFetchError, setExerciseFetchError] = useState<string | null>(null);
  // ----------------------------------

  const isInitialized = useRef(false); // Track store initialization

  useEffect(() => {
    // --- Initialize Store ---
    if (!isInitialized.current) {
      initializeForEdit(initialTemplateData);
      isInitialized.current = true;
    }
    // ----------------------

    // --- Fetch folders & exercises (only once) ---
    const loadInitialData = async () => {
      // Check if both are already loading or loaded
      if (!isLoadingExercises && folders.length > 0) return;

      setIsLoadingExercises(true); // Assume loading both for simplicity
      setExerciseFetchError(null);
      try {
        // Fetch both in parallel if possible
        const [{ exercises: fetchedExercises, error: fetchError }] = await Promise.all([
          getAllExercises()  // Fetch exercises
        ]);

        setFolders(fetchedFolders || []);

        if (fetchError) {
          throw new Error(fetchError);
        }
        setAllExercises(fetchedExercises ?? []);

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load initial data";
        console.error("Failed to load initial data:", err);
        setExerciseFetchError(errorMsg); // Can use a general error state if preferred
        toast.error(errorMsg);
      } finally {
        setIsLoadingExercises(false);
      }
    };

    // Only fetch if needed
    if (isLoadingExercises) {
      void loadInitialData();
    }
    // -----------------------------------------

    // No cleanup needed here for resetForm as it's an edit page
  }, [initializeForEdit, initialTemplateData, isLoadingExercises, folders.length]); // Dependencies

  const handleSaveChanges = async () => {
    const updatedWorkoutId = await saveWorkout(initialTemplateData.id);
    if (updatedWorkoutId) {
      router.push(`/w/${updatedWorkoutId}`);
    }
  };

  return (
    <div className={`h-full overflow-y-auto bg-black text-white`}>
      <div className="container mx-auto max-w-5xl px-4 py-8">
        {/* ... Header ... */}
        <div className="mb-8 flex items-center gap-3">
          <Link href={`/w/${initialTemplateData.id}`}>
            <Button variant="outline" size="icon" className="h-8 w-8 border-[#333333] bg-background/10 hover:bg-background/20">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Cancel Edit</span>
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Edit Workout: {initialTemplateData.name}</h1>
        </div>


        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Pass folders */}
            <WorkoutDetailsForm folders={folders} />
            {/* Pass fetched exercises and loading state */}
            <WorkoutExerciseList
              availableExercises={allExercises}
              isLoadingAvailableExercises={isLoadingExercises}
              exerciseFetchError={exerciseFetchError}
            />
          </div>

          {/* ... Summary & Save Button ... */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4 rounded-lg border border-[#333333] bg-[#111111] p-4">
              <h2 className="mb-4 text-lg font-medium">Workout Summary</h2>
              <WorkoutSummary />
              <div className="border-t border-[#333333] pt-4">
                <Button
                  className="h-9 w-full gap-2 bg-white text-black hover:bg-gray-200"
                  onClick={handleSaveChanges}
                  disabled={isSubmitting || isLoadingExercises} // Disable on load too
                >
                  {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                </Button>
                {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

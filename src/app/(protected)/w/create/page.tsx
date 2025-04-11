import { Inter } from "next/font/google";
import { getFoldersName } from "@/server/queries/folders";
import { getAllExercises } from "@/actions/exercises"; // <-- Import action to fetch exercises
import CreateWorkoutClient from "./_components/create-workout-client";
import { authenticateAndGetUserId } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

interface CreateWorkoutPageProps {
  searchParams?: { folder?: string }; // Make searchParams optional
}

export default async function CreateWorkoutPage({ searchParams }: CreateWorkoutPageProps) {
  const initialFolderId = searchParams?.folder; // Optional chaining

  // --- Authentication ---
  const userId = await authenticateAndGetUserId()

  // --- Fetch Data Server-Side ---
  // Fetch folders and exercises in parallel for efficiency
  const [folders, { exercises: allExercisesData, error: exerciseFetchError }] = await Promise.all([
    getFoldersName(userId),
    getAllExercises()
  ]);

  // --- Handle Exercise Fetch Error ---
  // If exercises fail to load, we might want to show an error state
  // instead of proceeding. You could return an error component or throw.
  if (exerciseFetchError || !allExercisesData) {
    console.error("Failed to load exercises for create page:", exerciseFetchError);
    // Optionally return a dedicated error UI
    return (
      <div className={`h-full overflow-y-auto bg-black text-white ${inter.className}`}>
        <div className="container mx-auto max-w-5xl px-4 py-8 text-red-400">
          Error loading essential exercise data. Please try again later.
        </div>
      </div>
    );
  }


  return (
    <div className={`h-full overflow-y-auto bg-black text-white ${inter.className}`}>
      {/*
         Suspense isn't strictly needed *here* anymore because Promise.all
         waits for both fetches before rendering. The loading state is handled
         by the page-level loading.tsx file if you create one.
         If fetching was independent, Suspense would be useful.
      */}
      <CreateWorkoutClient
        folders={folders}
        initialFolderId={initialFolderId}
        allExercises={allExercisesData} // Pass fetched exercises down
      />
    </div>
  );
}

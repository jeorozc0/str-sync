"use server";

import { db } from "@/server/db";
import fetchAllExercises from "@/server/queries/exercises";
import { type Exercise } from "@prisma/client";

/**
 * Server action to fetch all exercises (utilizing server-side caching).
 *
 * This function can be directly imported and used in client components.
 *
 * @returns Promise resolving to an object with exercises array or error string.
 */
export async function getAllExercises(): Promise<{ exercises: Exercise[] | null; error: string | null; }> {
  try {
    // This now calls the cached version from the query file
    const exercises = await fetchAllExercises();
    console.log(`getAllExercises action called, returning ${exercises?.length ?? 0} exercises (potentially cached).`);
    return {
      exercises: exercises,
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch exercises via action:", error);
    const message = error instanceof Error ? error.message : "Failed to load exercises. Please try again.";
    return {
      exercises: null, // Return null on error
      error: message,
    };
  }
}

/**
 * Server action to fetch a single exercise by ID
 *
 * @param id - The unique identifier of the exercise
 * @returns Promise that resolves to an Exercise object or null if not found
 * @example
 * // In a client component:
 * import { getExerciseById } from '@/app/actions/exercises';
 *
 * // Later in component:
 * const handleFetchExercise = async (id) => {
 *   const { exercise, error } = await getExerciseById(id);
 *   if (exercise) {
 *     // Do something with the exercise
 *   }
 * };
 */
export async function getExerciseById(id: string) {
  try {
    return {
      exercise: await db.exercise.findUnique({
        where: { id },
      }),
      error: null,
    };
  } catch (error) {
    console.error(`Failed to fetch exercise with ID ${id}:`, error);
    return {
      exercise: null,
      error: "Failed to load exercise. Please try again.",
    };
  }
}

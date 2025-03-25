"use server";

import { db } from "@/server/db";
import fetchAllExercises from "@/server/queries/exercises";

/**
 * Server action to fetch all exercises
 *
 * This function can be directly imported and used in client components
 *
 * @returns Promise that resolves to an array of Exercise objects
 * @example
 * // In a client component:
 * import { getAllExercises } from '@/app/actions/exercises';
 *
 * // Later in component:
 * const handleClick = async () => {
 *   const exercises = await getAllExercises();
 *   console.log(exercises);
 * };
 */
export async function getAllExercises() {
  try {
    return {
      exercises: await fetchAllExercises(),
      error: null,
    };
  } catch (error) {
    console.error("Failed to fetch exercises:", error);
    return {
      exercises: [],
      error: "Failed to load exercises. Please try again.",
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

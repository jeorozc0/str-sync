import { db } from "../db";

/**
 * Fetches all exercises from the database
 *
 * @returns Promise that resolves to an array of Exercise objects
 * @example
 * // Get all exercises
 * const exercises = await fetchAllExercises();
 * console.log(`Found ${exercises.length} exercises`);
 */
export default async function fetchAllExercises() {
  const exercises = await db.exercise.findMany();
  console.log(exercises);
  return exercises;
}

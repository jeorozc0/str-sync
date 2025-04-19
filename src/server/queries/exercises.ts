// src/server/queries/exercises.ts
import { db } from "../db";
import { type Exercise } from "@prisma/client"; // Import Prisma type

/**
 * Fetches all exercises from the database, wrapped in Next.js cache.
 * Subsequent calls within the revalidation period will return cached data.
 *
 * @returns Promise that resolves to an array of Exercise objects
 */
const getCachedExercises =   // The function to cache - performs the actual DB query
  async (): Promise<Exercise[]> => {
    try {
      const exercises = await db.exercise.findMany({
        orderBy: {
          name: 'asc', // Keep ordering consistent for cache key stability
        },
        // Select specific fields if your Exercise model is very large and you only need a few
        // select: { id: true, name: true, muscleGroup: true, equipment: true }
      });
      return exercises;
    } catch (error) {
      console.error("Database error fetching exercises:", error);
      // Depending on requirements, you might return [] or re-throw
      return [];
    }
  }


// The function that will be imported and used by your Server Action
export default async function fetchAllExercises(): Promise<Exercise[]> {
  // Call the cached function. This will either hit the cache or run the inner async function.
  return getCachedExercises();
}

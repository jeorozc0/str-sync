import { type Exercise } from "@prisma/client";

/**
 * Filters exercises based on a search query
 *
 * @param exercises - Array of exercise objects to filter
 * @param query - Search query string
 * @returns Filtered array of exercises that match the query
 * @example
 * // Filter exercises by search term
 * const results = filterExercises(exercises, "bench press");
 */
export function filterExercises(exercises: Exercise[], query: string) {
  if (!query || query.trim() === "") {
    return exercises;
  }

  const searchQuery = query.toLowerCase().trim();

  return exercises.filter((exercise) => {
    return (
      // Check name
      exercise.name?.toLowerCase().includes(searchQuery) ??
      // Check equipment
      exercise.equipment?.toLowerCase().includes(searchQuery) ??
      // Optionally add more properties to search through
      exercise.muscleGroup?.toLowerCase().includes(searchQuery) ??
      exercise.description?.toLowerCase().includes(searchQuery)
    );
  });
}

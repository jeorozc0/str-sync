import { db } from '../db';
import type { WorkoutLog, Workout } from '@prisma/client'; // Import Prisma types

// Define the structure of the returned log object with nested data
export type WorkoutLogRow = WorkoutLog & {
  workout: Pick<Workout, 'id' | 'name'>; // Include template name
  _count: {
    exercises: number; // Count of ExerciseLogEntry records
  }
};

/**
 * Fetches all workout logs for a specific user, ordered by start date.
 * Includes the name of the workout template used and the count of exercises logged.
 *
 * @param userId The UUID of the user.
 * @param limit Optional limit for pagination.
 * @param offset Optional offset for pagination.
 * @returns Promise resolving to an array of WorkoutLogRow objects.
 * @throws Throws an error if the database query fails.
 */
export async function getUserWorkoutLogs(
  userId: string,
  limit = 50, // Default limit
  offset = 0
): Promise<WorkoutLogRow[]> {
  console.log(`Query: Fetching workout logs for user ${userId} with limit ${limit}, offset ${offset}`);
  try {
    if (!userId) {
      throw new Error("User ID is required to fetch workout logs.");
    }

    const logs = await db.workoutLog.findMany({
      where: {
        userId: userId,
      },
      include: {
        // Include the related workout template to get its name
        workout: {
          select: {
            id: true,
            name: true,
          }
        },
        // Include a count of the exercises logged in this session
        _count: {
          select: { exercises: true } // Counts ExerciseLogEntry records
        }
      },
      orderBy: {
        startedAt: 'desc', // Show most recent logs first
      },
      take: limit,
      skip: offset,
    });

    // Ensure the return type matches WorkoutLogRow[]
    return logs as WorkoutLogRow[];

  } catch (error) {
    console.error(`Database error fetching workout logs for user ${userId}:`, error);
    throw new Error("Failed to fetch workout logs."); // Re-throw for the page to handle
  }
}

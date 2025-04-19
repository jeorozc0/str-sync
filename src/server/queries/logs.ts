"use server";

import { notFound } from 'next/navigation';
import { db } from '../db';
import { type WorkoutLog, type Workout, Prisma } from '@prisma/client'; // Import Prisma types
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

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

// src/queries/workout-templates.ts

// Define the specific type for the data structure we need
// Includes Workout, its WorkoutExercises, and their nested Exercises
export type WorkoutTemplateForLogging = Prisma.WorkoutGetPayload<{
  include: {
    exercises: { // Relation field in Workout model
      include: {
        exercise: true // Include Exercise details within WorkoutExercise
      },
      orderBy: {
        order: 'asc' // Ensure consistent order
      }
    }
  }
}>;

/**
 * Fetches a workout template by its ID, including its exercises in order.
 * Throws a notFound error if the template doesn't exist.
 *
 * @param workoutId The ID of the Workout template to fetch.
 * @returns The workout template data.
 * @throws Error via notFound() if template not found.
 */
export async function getWorkoutTemplateForLogging(
  workoutId: string
): Promise<WorkoutTemplateForLogging> {
  try {
    const workoutTemplate = await db.workout.findUniqueOrThrow({
      where: {
        id: workoutId,
        // Note: Add userId check here if templates are user-specific
        // AND you want to enforce ownership during fetch
        // userId: userId,
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
    // Type assertion is safe here because findUniqueOrThrow guarantees non-null
    return workoutTemplate as WorkoutTemplateForLogging;
  } catch (error) {
    // Prisma's findUniqueOrThrow throws an error when not found
    // Log the specific error for debugging
    console.error(`Error fetching workout template ${workoutId}:`, error);
    // Trigger Next.js's Not Found mechanism
    notFound();
  }
}

// --- NEW: Delete Action ---
const deleteLogSchema = z.string().min(1, { message: "Log ID cannot be empty." });

type DeleteResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Server action to delete a specific WorkoutLog and its associated entries/sets.
 * Verifies user ownership before deleting.
 *
 * @param logId The ID of the WorkoutLog to delete.
 * @returns Object indicating success or failure with an error message.
 */
export async function deleteWorkoutLogAction(logId: string): Promise<DeleteResult> {
  console.log(`Attempting to delete WorkoutLog with ID: ${logId}`);

  // 1. Validate Input ID
  const validation = deleteLogSchema.safeParse(logId);
  if (!validation.success) {
    console.error("❌ Invalid Log ID format:", validation.error.flatten().formErrors);
    return { success: false, error: "Invalid Log ID format." };
  }
  const validatedLogId = validation.data;

  // 2. Authenticate User (Server-side)
  const supabase = await createClient(); // Use server client

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("🚫 Authentication failed during log deletion attempt.");
    return { success: false, error: "Authentication required." };
  }
  console.log(`👤 User ${user.id} authenticated for delete operation.`);

  // 3. Attempt Deletion (using deleteMany for implicit authorization check)
  try {
    console.log(`⚡️ Attempting db.workoutLog.deleteMany for ID: ${validatedLogId}, User: ${user.id}`);
    const result = await db.workoutLog.deleteMany({
      where: {
        id: validatedLogId,
        userId: user.id, // *** CRITICAL: Ensures user owns the log ***
      },
    });

    console.log(`🗑️ DeleteMany result count: ${result.count}`);

    // 4. Check if deletion occurred
    if (result.count === 0) {
      // This means either the log ID didn't exist OR it didn't belong to this user
      console.warn(`⚠️ WorkoutLog not found or user ${user.id} not authorized to delete log ${validatedLogId}.`);
      return { success: false, error: "Workout log not found or you do not have permission to delete it." };
    }

    try {
      console.log(`🔄 Revalidating path: /logs`);
      revalidatePath('/logs'); // Revalidate the list page
      // No need to revalidate /logs/[id] because it won't exist anymore
      console.log(`🔄 Path revalidation complete.`);
    } catch (revalError) {
      console.warn("⚠️ Path revalidation failed:", revalError);
    }


    // 6. Return Success
    console.log(`✅ Successfully deleted WorkoutLog ID: ${validatedLogId}`);
    return { success: true };

  } catch (error) {
    console.error("❌ Error during database delete operation:", error);
    let errorMessage = "Database error: Failed to delete workout log.";
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("  Prisma Error Code:", error.code);
      if (error.meta) console.error("  Prisma Meta:", error.meta);
      // Add specific codes if needed, though deleteMany is less likely to hit them besides connection errors
    } else if (error instanceof Error) {
      errorMessage = error.message; // Use specific message if available
    }
    return { success: false, error: errorMessage };
  }
}


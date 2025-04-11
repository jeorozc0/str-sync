'use server';

import { authenticateAndGetUserId } from '@/lib/auth';
import { db } from '@/server/db';
import { createClient } from '@/utils/supabase/server';
import { type Exercise, type ExerciseLogEntry, Prisma, type User, type Workout, type WorkoutExercise, type WorkoutLog, type ExerciseSet } from '@prisma/client';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';

/**
 * Creates initial WorkoutLog and ExerciseLogEntry records when starting a workout from a template.
 * @param templateId The ID of the Workout Template being started.
 * @returns Object with success status and the ID of the new WorkoutLog, or an error.
 */
export async function startWorkoutFromTemplate(templateId: string): Promise<{ success: boolean; workoutLogId?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Authentication required" };
  }
  const userId = user.id;

  console.log(`Action: Starting workout from template ${templateId} for user ${userId}`);

  try {
    // Fetch planned exercises for the template
    const plannedExercises = await db.workoutExercise.findMany({
      where: { workoutId: templateId },
      orderBy: { order: 'asc' },
      select: { id: true } // Only need the WorkoutExercise IDs
    });

    if (plannedExercises.length === 0) {
      return { success: false, error: "Cannot start workout: Template has no exercises." };
    }

    // Use transaction to create log and entries together
    const newWorkoutLogId = await db.$transaction(async (tx) => {
      // 1. Create the WorkoutLog
      const newLog = await tx.workoutLog.create({
        data: {
          id: nanoid(10),
          userId: userId,
          workoutId: templateId, // Link to the template
          startedAt: new Date(), // Set start time now
          // completedAt and duration are null initially
        },
        select: { id: true } // Select only the new ID
      });

      // 2. Create ExerciseLogEntry records for each planned exercise
      const logEntriesData = plannedExercises.map(pe => ({
        id: nanoid(10),
        workoutLogId: newLog.id,
        workoutExerciseId: pe.id, // Link to the specific planned exercise
      }));

      await tx.exerciseLogEntry.createMany({
        data: logEntriesData,
      });

      return newLog.id;
    });

    console.log(`Action: Created new WorkoutLog ${newWorkoutLogId}`);
    return { success: true, workoutLogId: newWorkoutLogId };

  } catch (error) {
    console.error(`Action Error starting workout from template ${templateId}:`, error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to start workout." };
  }
}

// --- Type for saving a set (excluding tempId, status) ---
type ExerciseSetInput = Omit<ExerciseSet, 'id' | 'exerciseLogEntryId'>;

/**
 * Adds a completed ExerciseSet record to a specific ExerciseLogEntry.
 * @param workoutLogId The ID of the parent WorkoutLog (for auth check).
 * @param exerciseLogEntryId The ID of the ExerciseLogEntry to add the set to.
 * @param setData The data for the set being saved.
 * @returns Object with success status and the created ExerciseSet, or an error.
 */
export async function addExerciseSetToLog(
  workoutLogId: string,
  exerciseLogEntryId: string,
  setData: ExerciseSetInput
): Promise<{ success: boolean; createdSet?: ExerciseSet; error?: string }> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Authentication required" };
  }
  const userId = user.id;

  console.log(`Action: Adding set to Entry ${exerciseLogEntryId} in Log ${workoutLogId}`);

  try {
    // **Authorization Check:** Ensure the user owns the WorkoutLog this entry belongs to.
    const logEntry = await db.exerciseLogEntry.findFirst({
      where: {
        id: exerciseLogEntryId,
        workoutLogId: workoutLogId, // Make sure entry belongs to the log
        workoutLog: { // Check ownership of the parent log
          userId: userId,
        }
      },
      select: { id: true } // Just need to confirm existence and ownership
    });

    if (!logEntry) {
      return { success: false, error: "Log entry not found or not authorized." };
    }

    // Create the ExerciseSet record
    const createdSet = await db.exerciseSet.create({
      data: {
        id: nanoid(10),
        exerciseLogEntryId: exerciseLogEntryId, // Link to the entry
        setNumber: setData.setNumber,
        reps: setData.reps,
        weight: setData.weight,
        rpe: setData.rpe,
        isCompleted: setData.isCompleted, // Should usually be true here
      }
    });

    console.log(`Action: Added set ${createdSet.id}`);
    return { success: true, createdSet: createdSet };

  } catch (error) {
    console.error(`Action Error adding set to entry ${exerciseLogEntryId}:`, error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to save set." };
  }
}

/**
 * Updates a WorkoutLog record to mark it as completed.
 * @param workoutLogId The ID of the WorkoutLog to finish.
 * @param completedAt The timestamp when the workout was completed.
 * @param duration The calculated duration in minutes.
 * @returns Object with success status or an error.
 */
export async function finishWorkoutLog(
  workoutLogId: string,
  completedAt: Date,
  duration: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Authentication required" };
  }
  const userId = user.id;

  console.log(`Action: Finishing workout log ${workoutLogId}`);

  try {
    // Update the log, ensuring user owns it
    const updatedLog = await db.workoutLog.updateMany({ // Use updateMany for condition
      where: {
        id: workoutLogId,
        userId: userId,
        completedAt: null, // Optionally ensure it hasn't already been completed
      },
      data: {
        completedAt: completedAt,
        duration: duration,
      }
    });

    if (updatedLog.count === 0) {
      throw new Error("Workout log not found, user not authorized, or already completed.");
    }

    // Revalidate relevant paths
    revalidatePath('/logs'); // Revalidate the logs list page
    revalidatePath(`/logs/${workoutLogId}`); // Revalidate the detail page for this log

    console.log(`Action: Finished workout log ${workoutLogId}`);
    return { success: true };

  } catch (error) {
    console.error(`Action Error finishing log ${workoutLogId}:`, error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to finish workout." };
  }
}

// --- Define the Detailed Structure of the Returned Log ---
// This explicitly defines the shape of the data we expect back from the query
export type WorkoutLogDetailsData = WorkoutLog & {
  user: Pick<User, 'id' | 'name' | 'email'>; // Include basic user info
  workout: Pick<Workout, 'id' | 'name'>; // Info about the template used
  exercises: (ExerciseLogEntry & {
    // Include the plan details for this exercise entry
    workoutExercise: (WorkoutExercise & {
      // Include the master exercise details for the plan
      exercise: Pick<Exercise, 'id' | 'name' | 'muscleGroup' | 'equipment'>;
    });
    // Include the actual sets performed for this exercise entry
    sets: ExerciseSet[];
  })[];
};


/**
 * Fetches the complete details for a single workout log, including all
 * logged exercises and their sets, ensuring the log belongs to the specified user.
 *
 * @param logId The ID of the WorkoutLog to fetch.
 * @param userId The ID of the user requesting the log (for authorization).
 * @returns A Promise resolving to the detailed WorkoutLog data.
 * @throws Throws error (leading to 404 via notFound()) if the log is not found or user is not authorized.
 * @throws Throws generic Error for other database issues.
 */
export async function getWorkoutLogDetails(
  logId: string,
  userId: string
): Promise<WorkoutLogDetailsData> {
  console.log(`Query: Fetching details for WorkoutLog ID: ${logId} by User ID: ${userId}`);
  try {
    const workoutLog = await db.workoutLog.findUnique({
      where: {
        id: logId,
        userId: userId, // Authorization: Ensure the log belongs to the requesting user
      },
      include: {
        // Include basic user details (optional, adjust as needed)
        user: {
          select: { id: true, name: true, email: true }
        },
        // Include the Workout (template) details
        workout: {
          select: { id: true, name: true }
        },
        // Include the ExerciseLogEntry records for this log
        exercises: {
          orderBy: {
            // Order logged exercises based on the plan's order
            workoutExercise: { order: 'asc' }
          },
          include: {
            // For each ExerciseLogEntry, include the WorkoutExercise (the plan)
            workoutExercise: {
              include: {
                // And for each WorkoutExercise, include the Exercise (master details)
                exercise: {
                  select: {
                    id: true,
                    name: true,
                    muscleGroup: true, // e.g., 'Chest'
                    equipment: true,   // e.g., 'Barbell'
                  }
                }
              }
            },
            // Include all ExerciseSet records for each ExerciseLogEntry
            sets: {
              orderBy: {
                setNumber: 'asc' // Order sets by their number
              }
            }
          }
        }
      }
    });

    // Handle case where log is not found or doesn't belong to the user
    if (!workoutLog) {
      console.log(`Query: WorkoutLog ${logId} not found or user ${userId} not authorized.`);
      notFound(); // Trigger a 404 response in Next.js
    }

    console.log(`Query: Successfully fetched details for WorkoutLog ${logId}`);
    // Type assertion might be needed if TS can't fully infer the complex nested type,
    // but the includes should structure the data correctly. Cast if necessary.
    return workoutLog as WorkoutLogDetailsData;

  } catch (error) {
    console.error(`Query Error fetching WorkoutLog ${logId}:`, error);

    // Handle specific Prisma errors if needed, otherwise rethrow generic
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      // This case might already be handled by the null check above, but included for robustness
      notFound();
    }

    // For other database errors, throw a generic error
    throw new Error(`Failed to fetch workout log details.`);
  }
}

/**
 * Server Action to safely fetch workout log details for the authenticated user.
 * Encapsulates the query call and authorization.
 *
 * @param logId The ID of the WorkoutLog to fetch.
 * @returns An object containing the log details data or an error message.
 */
export async function getWorkoutLogDetailsAction(
  logId: string
): Promise<{ logDetails: WorkoutLogDetailsData | null; error?: string }> {
  let userId: string;
  try {
    // Use the reusable auth helper
    userId = await authenticateAndGetUserId();
  } catch (error) {
    // If auth helper throws (e.g., Supabase error), catch it here
    // Redirects for non-auth users are handled inside the helper
    return { logDetails: null, error: error instanceof Error ? error.message : "Authentication check failed." };
  }

  console.log(`Action: Getting log details for Log ID: ${logId}, User ID: ${userId}`);

  try {
    // Call the query function (which handles notFound and its own errors)
    const logDetails = await getWorkoutLogDetails(logId, userId);
    return { logDetails: logDetails, error: undefined };

  } catch (error) {
    console.error(`Action Error fetching log ${logId}:`, error);
    // If getWorkoutLogDetails throws (e.g., DB connection issue), catch it.
    // Note: notFound() errors thrown by the query won't be caught here,
    // Next.js will handle them directly by rendering the 404 page.
    return {
      logDetails: null,
      error: error instanceof Error ? error.message : 'Failed to load workout log.'
    };
  }
}

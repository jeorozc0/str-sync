// db/workoutQueries.ts

import { nanoid } from 'nanoid';
import { type WorkoutFormState, type WorkoutExercise } from '../../types/store'; // Import your types
import { db } from '../db';
import { type WorkoutTemplate } from '@/types/workout';
import { notFound } from 'next/navigation';

/**
 * Creates a new workout with associated exercises in the database
 */
export async function createWorkout(data: WorkoutFormState, userId: string) {
  const workoutId = nanoid(10);

  return await db.$transaction(async (tx) => {
    // Create the workout
    const workout = await tx.workout.create({
      data: {
        id: workoutId,
        name: data.name,
        description: data.description,
        userId: userId,
        folderId: data.folderId,
        // We'll create exercises separately
      },
    });

    // Create workout exercises
    if (data.exercises.length > 0) {
      await tx.workoutExercise.createMany({
        data: data.exercises.map((exercise: WorkoutExercise) => ({
          id: exercise.id || nanoid(10), // Use existing ID or create new one
          workoutId: workout.id,
          exerciseId: exercise.exerciseId,
          order: exercise.order,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
          restSeconds: exercise.restSeconds,
          notes: exercise.notes,
        })),

      });
    }

    return workout.id;
  });
}

// Initialize Prisma Client (consider creating a singleton instance for reuse)

/**
 * Fetches a single Workout Template by its ID, including its planned exercises
 * and the associated master exercise details.
 *
 * @param templateId The ID of the workout template to fetch.
 * @returns The workout template data or throws notFound if not found.
 */
export async function getWorkoutTemplateDetails(templateId: string): Promise<WorkoutTemplate> {
  console.log(`Fetching workout template details from DB for id: ${templateId}`);

  try {
    const template = await db.workout.findUnique({
      where: {
        id: templateId,
        // Optional: Add condition to ensure it's not archived or belongs to the correct user
        // isArchived: false,
        // userId: currentUserId, // Pass current user ID if implementing authorization
      },
      include: {
        // Include the planned exercises for this template
        exercises: {
          // Include the master exercise details for each planned exercise
          include: {
            exercise: {
              select: {
                id: true,
                name: true,
                muscleGroup: true, // This is 'category' in your UI
                equipment: true,
                // Select other Exercise fields if needed for display
              }
            }
          },
          // Order the exercises within the template based on the 'order' field
          orderBy: {
            order: 'asc',
          }
        },
        // Optionally include the folder details if needed immediately
        folder: {
          select: {
            id: true,
            name: true,
          }
        }
        // Optionally include a count of logs based on this template
        // _count: {
        //    select: { logs: true }
        // }
      }
    });

    if (!template) {
      console.error(`Workout template with id ${templateId} not found in DB.`);
      notFound(); // Use Next.js notFound helper
    }

    // --- Data Transformation (Map Prisma result to your UI Type) ---
    // Prisma returns nested structures. We need to map this to your WorkoutTemplate type.
    const mappedTemplate: WorkoutTemplate = {
      id: template.id,
      folderId: template.folderId ?? '', // Handle potential null folderId
      name: template.name,
      description: template.description,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
      // isArchived: template.isArchived, // Include if needed
      folderName: template.folder?.name, // Add folder name if included
      // logCount: template._count?.logs, // Add log count if included

      // Map the included planned exercises
      plannedExercises: template.exercises.map(workoutExercise => ({
        id: workoutExercise.id, // ID of the WorkoutExercise record
        exerciseId: workoutExercise.exerciseId, // ID of the master Exercise
        name: workoutExercise.exercise.name, // Name from the master Exercise
        targetSets: workoutExercise.sets,
        targetReps: workoutExercise.reps, // String like "8-12" or "5"
        targetWeight: workoutExercise.weight, // Optional target weight
        targetRestTime: workoutExercise.restSeconds ?? 0, // Default if null
        targetRir: undefined, // Add if you add targetRir to schema
        notes: workoutExercise.notes,
        // Include category/equipment denormalized from the master Exercise
        category: workoutExercise.exercise.muscleGroup,
        equipment: workoutExercise.exercise.equipment,
        order: workoutExercise.order, // Keep order if needed later
      })),

      // Add calculated fields if needed (or calculate in utils/component)
      // estimatedDurationMinutes: calculateDuration(template.exercises),
      // primaryMuscleGroups: calculateMuscleGroups(template.exercises),
    };

    console.log(`Successfully fetched and mapped template: ${template.name}`);
    return mappedTemplate;

  } catch (error) {
    console.error(`Error fetching workout template ${templateId}:`, error);
    // Rethrow or handle appropriately - could redirect to an error page
    // For now, let's rethrow to indicate failure
    throw new Error(`Failed to fetch workout template ${templateId}.`);
  } finally {
    // Disconnect Prisma client if not using a singleton instance per request
    // await prisma.$disconnect();
  }
}

interface UpdateWorkoutTemplateData {
  name: string;
  description?: string | null;
  folderId?: string | null;
  exercises: { // Structure matching WorkoutExercise createMany input
    exerciseId: string;
    order: number;
    sets: number;
    reps: string;
    weight?: number | null;
    restSeconds?: number | null;
    notes?: string | null;
    // RIR if added to schema
  }[];
}

/**
 * Updates a workout template and its associated exercises within a transaction.
 * Assumes authorization checks have been performed before calling this.
 *
 * @param templateId The ID of the template to update.
 * @param data The validated and formatted data for the update.
 * @param userId The ID of the user performing the update (for potential future checks inside transaction if needed).
 * @returns The ID of the updated workout template.
 * @throws Throws error if update fails (e.g., template not found, transaction error).
 */
export async function updateWorkoutTemplateInDb(
  templateId: string,
  data: UpdateWorkoutTemplateData,
  userId: string // Pass userId, might be needed for complex logic/logging later
): Promise<string> {
  console.log(`DB Query: Updating template ${templateId} with data:`, data);

  return await db.$transaction(async (tx) => {
    // 1. Update Workout (template) details
    // Note: We assume ownership check happened in the Server Action before calling this query
    const updatedTemplate = await tx.workout.update({
      where: { id: templateId, userId: userId /* Optionally add userId here too for extra safety: , userId: userId */ },
      data: {
        name: data.name.trim(),
        description: data.description?.trim() ?? null, // Ensure null if empty/undefined
        folderId: data.folderId ?? null, // Ensure null if empty/undefined
      },
      select: { id: true } // Only need ID
    });

    if (!updatedTemplate) {
      // This check might be redundant if the action verified ownership, but good safety.
      throw new Error(`Template with ID ${templateId} not found during update.`);
    }

    // 2. Delete existing WorkoutExercise entries
    await tx.workoutExercise.deleteMany({
      where: { workoutId: templateId },
    });
    console.log(`DB Query: Deleted old exercises for template ${templateId}`);


    // 3. Create new WorkoutExercise entries
    if (data.exercises.length > 0) {
      const exercisesToCreate = data.exercises.map(exercise => ({
        id: nanoid(10), // Generate new ID for join record
        workoutId: templateId,
        exerciseId: exercise.exerciseId,
        order: exercise.order,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight, // Pass directly (null/number)
        restSeconds: exercise.restSeconds, // Pass directly (null/number)
        notes: exercise.notes, // Pass directly (null/string)
      }));

      await tx.workoutExercise.createMany({
        data: exercisesToCreate,
      });
      console.log(`DB Query: Created ${data.exercises.length} new exercises for template ${templateId}`);
    } else {
      console.log(`DB Query: No exercises to create for template ${templateId}`);
    }

    return templateId; // Return the template ID on successful transaction
  });
}

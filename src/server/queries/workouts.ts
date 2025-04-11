import { nanoid } from 'nanoid';
import { type WorkoutFormState, type StoreWorkoutExercise } from '../../types/store';
import { db } from '../db';
import { type WorkoutTemplate, type PlannedExercise } from '@/types/workout';
import { notFound } from 'next/navigation';
import { Prisma } from '@prisma/client';

/**
 * Creates a new workout template with associated exercises in the database.
 */
// Input type WorkoutFormState is likely correct for data coming from the store/form
export async function createWorkout(data: WorkoutFormState, userId: string): Promise<string> {
  const workoutId = nanoid(10);
  console.log(`DB Query: Creating workout template "${data.name}" for User ${userId}`);

  return await db.$transaction(async (tx) => {
    const workout = await tx.workout.create({
      data: {
        id: workoutId,
        name: data.name.trim(),
        description: data.description?.trim() ?? null,
        userId: userId,
        folderId: data.folderId ?? null,
        isArchived: false, // Explicitly set default if needed
      },
      select: { id: true }
    });

    if (data.exercises.length > 0) {
      // Map from StoreWorkoutExercise to Prisma's WorkoutExercise input
      const exercisesToCreate = data.exercises.map((exercise: StoreWorkoutExercise) => ({
        id: nanoid(10), // Generate new ID for the join record
        workoutId: workout.id,
        exerciseId: exercise.exerciseId, // ID of master Exercise
        order: exercise.order,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight, // Already optional number | undefined
        restSeconds: exercise.restSeconds, // Already optional number | undefined
        notes: exercise.notes?.trim() ?? null,
        // rir: exercise.rir // Add if defined in schema & store type
      }));
      await tx.workoutExercise.createMany({
        data: exercisesToCreate,
      });
      console.log(`DB Query: Created ${exercisesToCreate.length} exercises for workout ${workout.id}`);
    } else {
      console.log(`DB Query: No exercises provided for workout ${workout.id}`);
    }
    return workout.id;
  });
}

/**
 * Fetches a single Workout Template by its ID, including planned exercises
 * and associated master exercise details. Performs authorization check.
 *
 * @param templateId The ID of the workout template to fetch.
 * @param userId The ID of the user requesting the template.
 * @returns The workout template data matching the WorkoutTemplate type.
 * @throws Throws Prisma.NotFoundError via notFound() if not found or user is not authorized.
 */
// Return type is WorkoutTemplate based on src/types/workout.ts
export async function getWorkoutTemplateDetails(templateId: string, userId: string): Promise<WorkoutTemplate> {
  console.log(`DB Query: Fetching workout template details for id: ${templateId} by User: ${userId}`);

  try {
    const template = await db.workout.findUnique({
      where: {
        id: templateId,
        userId: userId, // Authorization check
      },
      include: {
        exercises: { // Fetches WorkoutExercise records
          include: {
            exercise: { // Includes related Exercise record
              select: {
                id: true,
                name: true,
                muscleGroup: true,
                equipment: true
              }
            }
          },
          orderBy: { order: 'asc' }
        },
        folder: { // Includes related Folder record
          select: { id: true, name: true }
        }
        // Optionally include log count:
        // _count: { select: { logs: true } }
      }
    });

    // Handle not found / unauthorized
    if (!template) {
      console.error(`DB Query: Workout template ${templateId} not found or user ${userId} not authorized.`);
      notFound(); // Trigger Next.js 404 page
    }

    // --- Data Transformation to match WorkoutTemplate type ---
    const mappedTemplate: WorkoutTemplate = {
      id: template.id,
      folderId: template.folderId, // Stays null if null in DB
      name: template.name,
      description: template.description, // Stays null if null in DB
      isArchived: template.isArchived,
      userId: template.userId,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
      folderName: template.folder?.name ?? null, // Get name or null
      // logCount: template._count?.logs // Assign if count was included

      // Map WorkoutExercise[] to PlannedExercise[]
      plannedExercises: template.exercises.map((workoutExercise): PlannedExercise => ({
        id: workoutExercise.id,          // WorkoutExercise ID
        exerciseId: workoutExercise.exerciseId,  // Master Exercise ID
        order: workoutExercise.order,      // Order from WorkoutExercise
        name: workoutExercise.exercise.name, // Denormalized name
        targetSets: workoutExercise.sets,      // WorkoutExercise.sets
        targetReps: workoutExercise.reps,      // WorkoutExercise.reps
        targetWeight: workoutExercise.weight,    // WorkoutExercise.weight (null if null)
        targetRestTime: workoutExercise.restSeconds, // WorkoutExercise.restSeconds (null if null)
        // targetRir: workoutExercise.rir // Map if added to schema
        notes: workoutExercise.notes,      // WorkoutExercise.notes (null if null)
        category: workoutExercise.exercise.muscleGroup, // Map from muscleGroup
        equipment: workoutExercise.exercise.equipment, // Exercise.equipment (null if null)
      })),
    };
    // --- End Transformation ---

    console.log(`DB Query: Successfully fetched and mapped template: ${template.name}`);
    return mappedTemplate;

  } catch (error) {
    console.error(`DB Query Error fetching workout template ${templateId}:`, error);
    // If it's the specific notFound error, re-trigger it
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      notFound();
    }
    // Otherwise, throw a generic error for other DB issues
    throw new Error(`Database error fetching workout template.`);
  }
}

// Interface matching data structure from the form/store for updates
interface UpdateWorkoutTemplateData {
  name: string;
  description?: string | null;
  folderId?: string | null;
  // Array structure should match StoreWorkoutExercise or how form data is structured
  exercises: {
    exerciseId: string; // Master Exercise ID
    order: number;
    sets: number;
    reps: string;
    weight?: number | null;
    restSeconds?: number | null;
    notes?: string | null;
    // rir?: number | null; // Add if needed
  }[];
}

/**
 * Updates a workout template and its associated exercises within a transaction.
 * Performs an authorization check.
 */
// Input type UpdateWorkoutTemplateData is based on expected form data structure
export async function updateWorkoutTemplateInDb(
  templateId: string,
  data: UpdateWorkoutTemplateData,
  userId: string
): Promise<string> { // Returns the ID of the updated template
  console.log(`DB Query: Updating template ${templateId} by User ${userId}`);

  try {
    return await db.$transaction(async (tx) => {
      // 1. Update Workout details, checking ownership
      const updatedTemplate = await tx.workout.updateMany({
        where: { id: templateId, userId: userId },
        data: {
          name: data.name.trim(),
          description: data.description?.trim() ?? null,
          folderId: data.folderId ?? null,
          updatedAt: new Date(),
        },
      });

      if (updatedTemplate.count === 0) {
        throw new Error(`Template not found or update permission denied.`);
      }
      console.log(`DB Query: Updated details for template ${templateId}`);

      // 2. Delete existing WorkoutExercise entries
      await tx.workoutExercise.deleteMany({
        where: { workoutId: templateId },
      });
      console.log(`DB Query: Deleted old exercises for template ${templateId}`);

      // 3. Create new WorkoutExercise entries
      if (data.exercises.length > 0) {
        // Map from UpdateWorkoutTemplateData structure to Prisma input
        const exercisesToCreate = data.exercises.map(exercise => ({
          id: nanoid(10), // Generate new ID
          workoutId: templateId,
          exerciseId: exercise.exerciseId,
          order: exercise.order,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight,
          restSeconds: exercise.restSeconds,
          notes: exercise.notes?.trim() ?? null,
          // rir: exercise.rir // Add if part of data/schema
        }));

        await tx.workoutExercise.createMany({ data: exercisesToCreate });
        console.log(`DB Query: Created ${exercisesToCreate.length} new exercises for template ${templateId}`);
      } else {
        console.log(`DB Query: No new exercises to create for template ${templateId}`);
      }

      return templateId; // Return ID on success
    });
  } catch (error) {
    console.error(`DB Query Error updating template ${templateId}:`, error);
    // Re-throw error for the calling action to handle
    throw error;
  }
}

/**
 * Deletes a workout template owned by the specified user.
 */
// No change needed here, already aligns with schema
export async function deleteWorkoutTemplateInDb(
  templateId: string,
  userId: string
): Promise<void> {
  console.log(`DB Query: Attempting delete for template ${templateId} by User ${userId}`);
  const result = await db.workout.deleteMany({
    where: { id: templateId, userId: userId }
  });
  if (result.count === 0) {
    console.error(`DB Query: Delete failed. Template ${templateId} not found or user ${userId} not authorized.`);
    throw new Error("Workout template not found or permission denied.");
  }
  console.log(`DB Query: Successfully deleted template ${templateId}.`);
}

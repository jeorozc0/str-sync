// src/actions/workouts.ts
'use server'

import { db } from "@/server/db"; // Import db only for potentially fetching oldFolderId if needed here
// Import the DB interaction functions from the query file
import { createWorkout as createWorkoutInDb, deleteWorkoutTemplateInDb, updateWorkoutTemplateInDb, /* deleteWorkoutTemplateInDb */ } from "@/server/queries/workouts";
import { type WorkoutFormState } from "@/types/store"; // Store type for form data
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod"; // Optional: Add validation schema

// Optional: Zod Schema for input validation (recommended)
const workoutFormSchema = z.object({
  name: z.string().trim().min(1, "Workout name cannot be empty."),
  description: z.string().nullable().optional(),
  folderId: z.string().nullable().optional(),
  exercises: z.array(z.object({ // Define structure expected from StoreWorkoutExercise
    id: z.string(), // ID from store state
    order: z.number().int(),
    sets: z.number().int().min(1),
    reps: z.string().min(1),
    weight: z.number().nullable().optional(),
    restSeconds: z.number().int().nullable().optional(),
    rir: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).nullable().optional(),
    notes: z.string().nullable().optional(),
    exerciseId: z.string().min(1, "Exercise must be selected"), // Ensure exercise is selected
    exercise: z.object({ // Include nested exercise validation if needed
      id: z.string(),
      name: z.string(),
      // ... other nested fields if needed
    }),
  })).min(1, "Workout must have at least one exercise."),
});


// --- CREATE ACTION ---
export async function createWorkoutAction(workoutData: WorkoutFormState) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Authentication required" };
  }
  const userId = user.id;

  // --- Optional: Validate input using Zod ---
  const validation = workoutFormSchema.safeParse(workoutData);
  if (!validation.success) {
    console.error("Create Workout Validation Error:", validation.error.errors);
    // Combine error messages
    const errorMessages = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
    return { success: false, error: `Invalid input: ${errorMessages}` };
  }
  const validatedData = validation.data;
  // -----------------------------------------


  try {
    // Call the database query function to perform the creation
    const workoutId = await createWorkoutInDb(validatedData, userId); // Pass validated data

    // Revalidate relevant paths
    revalidatePath('/dashboard');
    if (validatedData.folderId) {
      revalidatePath(`/f/${validatedData.folderId}`);
    }
    revalidatePath(`/w/${workoutId}`); // Revalidate the new template detail page

    return { success: true, workoutId };
  } catch (error) {
    console.error("Failed to create workout template:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create workout template"
    };
  }
}


// --- UPDATE ACTION ---
export async function updateWorkoutAction(templateId: string, workoutData: WorkoutFormState) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Authentication required" };
  }
  const userId = user.id;

  console.log(`Action: Updating template ${templateId} for user ${userId}`);

  // --- Optional: Validate input using Zod ---
  const validation = workoutFormSchema.safeParse(workoutData);
  if (!validation.success) {
    console.error("Update Workout Validation Error:", validation.error.errors);
    const errorMessages = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
    return { success: false, error: `Invalid input: ${errorMessages}` };
  }
  const validatedData = validation.data;
  // -----------------------------------------

  // Map store exercises to the format needed by updateWorkoutTemplateInDb
  const updateData = {
    name: validatedData.name,
    description: validatedData.description,
    folderId: validatedData.folderId,
    exercises: validatedData.exercises.map(ex => ({
      exerciseId: ex.exerciseId,
      order: ex.order,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight,
      restSeconds: ex.restSeconds,
      notes: ex.notes,
      // Pass rir if it's part of the schema/update data structure
    })),
  };

  try {
    // Optional: Fetch old folderId *before* the transaction if needed for revalidation outside the transaction scope
    const oldTemplateData = await db.workout.findFirst({
      where: { id: templateId, userId: userId },
      select: { folderId: true }
    });
    if (!oldTemplateData) {
      throw new Error("Workout template not found or user not authorized.");
    }
    const oldFolderId = oldTemplateData.folderId;

    // Call the database query function to perform the update transaction
    const updatedTemplateId = await updateWorkoutTemplateInDb(templateId, updateData, userId);

    // Revalidate relevant paths after successful transaction
    revalidatePath('/dashboard');
    if (validatedData.folderId) { // Revalidate new folder path
      revalidatePath(`/f/${validatedData.folderId}`);
    }
    // Revalidate the old folder path if it changed
    if (oldFolderId && oldFolderId !== validatedData.folderId) {
      revalidatePath(`/f/${oldFolderId}`);
    }
    revalidatePath(`/w/${updatedTemplateId}`); // Revalidate the template detail page

    return { success: true, workoutId: updatedTemplateId }; // Return the ID

  } catch (error) {
    console.error(`Failed to update workout template ${templateId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : `Failed to update workout template` // Keep error message generic for client
    };
  }
}

// --- DELETE ACTION (Example) ---

export async function deleteWorkoutAction(templateId: string, folderId: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Authentication required" };
  }
  const userId = user.id;

  try {
    // Call DB delete function (assuming it's renamed to deleteWorkoutTemplateInDb)
    await deleteWorkoutTemplateInDb(templateId, userId); // Pass userId for safety check inside query too

    revalidatePath('/dashboard');

    if (folderId) {
      revalidatePath(`/f/${folderId}`);
    }
    return { success: true };
  } catch (error) {
    console.error(`Failed to delete workout template ${templateId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : `Failed to delete workout template`
    };
  }
}

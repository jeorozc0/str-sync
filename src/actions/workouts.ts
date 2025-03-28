'use server'

import { createWorkout as dbCreateWorkout } from "@/server/queries/workouts";
import { type WorkoutFormState } from "@/types/store";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";


export async function createWorkoutAction(workoutData: WorkoutFormState) {
  const supabase = await createClient();

  const { data, error: authError } = await supabase.auth.getUser();
  if (authError || !data?.user) {
    redirect("/login");
  }

  // Get the user's ID from the auth data
  const userId = data.user.id;
  try {
    const workoutId = await dbCreateWorkout(workoutData, userId);
    return { success: true, workoutId };
  } catch (error) {
    console.error("Failed to create workout:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create workout"
    };
  }
}


// db/workoutQueries.ts

import { nanoid } from 'nanoid';
import { type WorkoutFormState, type WorkoutExercise } from '../../types/store'; // Import your types
import { db } from '../db';

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

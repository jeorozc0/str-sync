import { db } from '../db';

// Get all exercises
export default async function fetchAllExercises() {
  return await db.exercise.findMany()
}

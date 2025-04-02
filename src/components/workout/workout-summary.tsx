"use client";

import useWorkoutStore from "@/stores/workout-store";
import { type StoreWorkoutExercise } from "@/types/store"; // Import the specific type

// Helper function (improved type)
function calculateWorkoutDuration(exercises: StoreWorkoutExercise[] | undefined) { // Use specific type
  if (!exercises || exercises.length === 0) return null; // Check length directly
  let totalMinutes = 0;
  for (const exercise of exercises) {
    const restTime = exercise.restSeconds ? exercise.restSeconds / 60 : 1;
    const timePerSet = 1 + restTime;
    // Use nullish coalescing for potentially undefined sets
    totalMinutes += (exercise.sets ?? 0) * timePerSet;
  }
  totalMinutes += exercises.length * 0.5; // Buffer
  return Math.round(totalMinutes);
}

export default function WorkoutSummary() {
  // Select only the exercises array
  const exercises = useWorkoutStore((state) => state.currentWorkout.exercises);

  const exerciseCount = exercises.length;
  const estimatedDuration = calculateWorkoutDuration(exercises);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm text-gray-400">Exercise Count</h3>
        <p className="text-lg font-medium">
          {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}
        </p>
      </div>
      <div>
        <h3 className="text-sm text-gray-400">Estimated Duration</h3>
        <p className="text-lg font-medium">
          {estimatedDuration ? `~${estimatedDuration} min` : '--'}
        </p>
      </div>
    </div>
  );
}

"use client"

import useWorkoutStore from "@/stores/workout-store";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation"; // Assuming you're using Next.js

export default function WorkoutSummary() {
  const { saveWorkout, isSubmitting, currentWorkout } = useWorkoutStore();
  const router = useRouter();
  console.log(currentWorkout)

  const exerciseCount = currentWorkout.exercises.length;

  // Calculate estimated duration based on sets, reps and rest times
  const estimatedDuration = calculateWorkoutDuration(currentWorkout.exercises);

  const handleSaveWorkout = async () => {
    const workoutId = await saveWorkout();

    if (workoutId) {
      // Redirect to the workout page or show success message
      router.push(`/dashboard`);
    }
  };

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
          {estimatedDuration ? `${estimatedDuration} min` : '--'}
        </p>
      </div>
      <div className="border-t border-[#333333] pt-4">
        <Button
          className="h-9 w-full gap-2 bg-white text-black hover:bg-gray-200"
          onClick={handleSaveWorkout}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Workout'}
        </Button>
      </div>
    </div>
  );
}

// Helper function to calculate estimated workout duration
function calculateWorkoutDuration(exercises) {
  if (!exercises.length) return null;

  let totalMinutes = 0;

  for (const exercise of exercises) {
    // Average time per set (including rest)
    const restTime = exercise.restSeconds ? exercise.restSeconds / 60 : 1; // Default 1 min rest
    const timePerSet = 1 + restTime; // Assume ~1 min to complete a set + rest time

    // Total time for this exercise
    totalMinutes += exercise.sets * timePerSet;
  }

  // Add some buffer time for transitions between exercises
  totalMinutes += exercises.length * 0.5;

  return Math.round(totalMinutes);
}

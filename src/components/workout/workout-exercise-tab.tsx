"use client";

import { type Exercise } from "@/types/workout";
import { ExerciseCard } from "./exercise-card";

interface WorkoutExercisesTabProps {
  exercises: Exercise[];
}

export function WorkoutExercisesTab({ exercises }: WorkoutExercisesTabProps) {
  return (
    <div className="space-y-4 mt-6">
      {exercises.length > 0 ? (
        exercises.map((exercise, index) => (
          <ExerciseCard key={index} exercise={exercise} />
        ))
      ) : (
        <div className="text-center py-8 text-gray-400">No exercises recorded for this workout.</div>
      )}
    </div>
  );
}

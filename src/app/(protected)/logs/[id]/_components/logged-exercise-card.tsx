// src/components/logs/logged-exercise-card.tsx
"use client";

import { type WorkoutLogDetailsData } from "@/actions/logging";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Import the structure returned by the query
import { Check, Target, StickyNote } from "lucide-react";

// Define the type for the specific prop expected by this card
// This is one element from the 'exercises' array within WorkoutLogDetailsData
type LoggedExerciseProps = WorkoutLogDetailsData['exercises'][number];

interface LoggedExerciseCardProps {
  loggedExercise: LoggedExerciseProps; // Use the specific nested type
  index: number; // For display order
}

// Helper function for formatting weight
const formatWeight = (weight?: number | null): string => {
  if (weight === undefined || weight === null || isNaN(weight)) return 'BW'; // Bodyweight or N/A
  return `${weight} kg`;
};

export function LoggedExerciseCard({ loggedExercise, index }: LoggedExerciseCardProps) {
  // Destructure for slightly cleaner access (optional)
  const plan = loggedExercise.workoutExercise;
  const exerciseDetails = plan.exercise;
  console.log(loggedExercise)

  return (
    <Card className="bg-[#111111] border-[#333333]">
      {/* Card Header: Exercise Name, Category, Equipment, Planned Target */}
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
          {/* Left Side: Name and details */}
          <div className="flex-grow min-w-0">
            <CardTitle className="text-base font-medium leading-snug">
              {/* Access name via nested structure */}
              {index + 1}. {exerciseDetails.name}
            </CardTitle>
            {/* Access category/equipment via nested structure */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-xs text-gray-400">
              {exerciseDetails.muscleGroup && <span>{exerciseDetails.muscleGroup}</span>}
              {exerciseDetails.muscleGroup && exerciseDetails.equipment && <span className="opacity-50">•</span>}
              {exerciseDetails.equipment && <span>{exerciseDetails.equipment}</span>}
            </div>
          </div>
          {/* Right Side: Planned Target (Optional) */}
          {/* Access planned sets/reps via nested 'plan' (WorkoutExercise) */}
          {(plan.sets || plan.reps) && (
            <div
              className="flex items-center gap-1 text-xs text-blue-400 flex-shrink-0 pt-1 sm:pt-0"
              title="Planned Target"
            >
              <Target className="h-3.5 w-3.5" />
              <span>{plan.sets ?? '?'} x {plan.reps ?? '?'}</span>
            </div>
          )}
        </div>
      </CardHeader>

      {/* Card Content: Planned Notes and Performed Sets */}
      <CardContent className="px-4 pb-4 pt-2">
        {/* Access planned notes via nested 'plan' */}
        {plan.notes && (
          <div className="flex items-start gap-1.5 text-xs italic text-gray-500 mb-3 border-b border-[#333333] pb-3">
            <StickyNote className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <span>Plan Note: {plan.notes}</span>
          </div>
        )}

        {/* List of performed sets */}
        {/* Access actual sets directly from loggedExercise */}
        {loggedExercise.sets && loggedExercise.sets.length > 0 ? (
          <ul className="space-y-1.5 text-sm">
            {loggedExercise.sets.map(set => (
              <li key={set.id} className="flex items-center justify-between text-gray-300">
                {/* Left Side: Set details */}
                <div className="flex items-center gap-2">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium ${set.isCompleted ? 'bg-neutral-700 text-neutral-200' : 'bg-yellow-800/70 text-yellow-200'}`} title={set.isCompleted ? 'Completed' : 'Incomplete/Skipped'}>
                    {set.setNumber}
                  </span>
                  <span>{set.reps} reps</span>
                  <span className="text-neutral-500">@</span>
                  <span>{formatWeight(set.weight)}</span>
                </div>
                {/* Right Side: RPE and Completion Status */}
                <div className='flex items-center gap-2'>
                  {set.rpe !== null && (
                    <span className="text-xs text-neutral-400">(RPE {set.rpe})</span>
                  )}
                  {set.isCompleted && <Check className="h-4 w-4 text-green-500" />}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 italic pt-3 border-t border-[#333333]">
            No sets recorded for this exercise.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

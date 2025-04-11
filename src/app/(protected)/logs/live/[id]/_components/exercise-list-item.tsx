"use client";

import { SetInputForm } from './set-input-form';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type LoggedExercise } from '@/stores/logs-store';
import { LoggedSetDisplay } from './log-set-display';

interface ExerciseListItemProps {
  exercise: LoggedExercise;
  index: number;
  isCurrent: boolean;
  isSavingSet: boolean; // Pass saving state down
  onCompleteSet: (exerciseIndex: number, reps: number, weight: number | null, rpe: number | null) => void;
  // Add onClick handler if needed to set current exercise by clicking header
  // onClickHeader: (index: number) => void;
}

export function ExerciseListItem({
  exercise,
  index,
  isCurrent,
  isSavingSet,
  onCompleteSet,
  // onClickHeader
}: ExerciseListItemProps) {
  // State to potentially collapse completed sets view later

  const totalSets = exercise.targetSets;
  const completedSetsCount = exercise.loggedSets.length;
  const nextSetNumber = completedSetsCount + 1;
  const isExerciseComplete = completedSetsCount >= totalSets;

  const handleInternalCompleteSet = (reps: number, weight: number | null, rpe: number | null) => {
    onCompleteSet(index, reps, weight, rpe);
  };

  return (
    <div
      className={cn(
        "border-b border-neutral-800 py-4 transition-colors",
        isCurrent && "bg-neutral-900/40", // Highlight current exercise subtly
        isExerciseComplete && "opacity-60" // Dim completed exercises
      )}
    // Add id for potential scrolling: id={`exercise-${index}`}
    >
      {/* Header Row: Order, Name, Target, Status Icon */}
      <div
        className="flex items-center gap-3 px-2 md:px-4 mb-3 cursor-pointer" // Make header clickable later if needed
      // onClick={() => onClickHeader(index)}
      >
        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${isCurrent ? 'bg-blue-600 text-white' : 'bg-neutral-700 text-neutral-200'}`}>
          {index + 1}
        </span>
        <div className="flex-grow">
          <h3 className={`font-medium ${isCurrent ? 'text-white' : 'text-neutral-200'}`}>{exercise.exerciseDetails.name}</h3>
          <p className="text-xs text-neutral-400">
            Target: {exercise.targetSets} sets of {exercise.targetReps}
            {exercise.targetWeight !== null && exercise.targetWeight !== undefined ? ` @ ${exercise.targetWeight} kg` : ''}
            {exercise.targetRestSeconds ? ` / ${exercise.targetRestSeconds}s rest` : ''}
          </p>
        </div>
        {isExerciseComplete && (
          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
        )}
        {/* Add expand/collapse toggle later */}
        {/* <button onClick={() => setIsSetsExpanded(!isSetsExpanded)}>
                    {isSetsExpanded ? <ChevronUp/> : <ChevronDown/>}
                 </button> */}
      </div>

      {/* Exercise Planned Notes */}
      {exercise.plannedNotes && (
        <p className='text-xs text-neutral-500 italic px-4 md:px-6 mb-3'>Note: {exercise.plannedNotes}</p>
      )}

      {/* Sets Area: Logged Sets + Input Form (if current and not complete) */}
      <div className="space-y-2 px-2 md:px-4">
        {/* Display Logged Sets */}
        {exercise.loggedSets.map((set, setIndex) => (
          <LoggedSetDisplay key={set.tempId} set={set} setNumber={setIndex + 1} />
        ))}

        {/* Display Input Form for Next Set */}
        {isCurrent && !isExerciseComplete && (
          <SetInputForm
            exerciseIndex={index}
            setNumber={nextSetNumber}
            targetReps={exercise.targetReps}
            targetWeight={exercise.targetWeight}
            onCompleteSet={handleInternalCompleteSet}
            isSaving={isSavingSet}
          />
        )}
      </div>
    </div>
  );
}


"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Plus, Dumbbell, GripVertical, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useWorkoutStore from "@/stores/workout-store";
import { type StoreWorkoutExercise } from "@/types/store";
import ExerciseDialog from "./workout-add-dialogue";
import { type Exercise as PrismaExercise } from '@prisma/client';
import { nanoid } from "nanoid";

// Props for the component
interface WorkoutExerciseListProps {
  availableExercises: PrismaExercise[];
  isLoadingAvailableExercises: boolean;
  exerciseFetchError: string | null;
}

// Helper functions moved outside component
const formatRestTime = (seconds?: number): string => {
  if (seconds === undefined || seconds === null) return '-- sec';
  return `${seconds}s`;
};

const formatWeight = (weight?: number): string => {
  if (weight === undefined || weight === null) return 'BW';
  return `${weight} kg`;
};

const formatRIR = (rir?: number): string => {
  if (rir === undefined || rir === null) return '--';
  return rir.toString();
};

// Custom hook for dialog management
function useExerciseDialog(
  exercises: StoreWorkoutExercise[],
  addExercise: (exercise: StoreWorkoutExercise) => void,
  updateExercise: (index: number, exercise: StoreWorkoutExercise) => void
) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [exerciseData, setExerciseData] = useState<StoreWorkoutExercise | null>(null);

  const getInitialExerciseState = useCallback((): StoreWorkoutExercise => ({
    id: nanoid(10),
    order: exercises.length,
    sets: 3,
    reps: "8-12",
    weight: undefined,
    restSeconds: 60,
    rir: 2,
    notes: "",
    exerciseId: "",
    exercise: {
      id: "",
      name: "",
      muscleGroup: "",
      equipment: undefined,
    },
  }), [exercises.length]);

  const openAddDialog = useCallback(() => {
    setExerciseData(getInitialExerciseState());
    setEditingIndex(null);
    setIsOpen(true);
  }, [getInitialExerciseState]);

  const openEditDialog = useCallback((index: number) => {
    const exerciseToEdit = exercises[index];
    if (exerciseToEdit) {
      setExerciseData({ ...getInitialExerciseState(), ...exerciseToEdit });
      setEditingIndex(index);
      setIsOpen(true);
    } else {
      console.error("Attempted to edit non-existent exercise at index:", index);
    }
  }, [exercises, getInitialExerciseState]);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setEditingIndex(null);
    setExerciseData(null);
  }, []);

  const saveExercise = useCallback((savedExercise: StoreWorkoutExercise) => {
    try {
      if (editingIndex !== null) {
        updateExercise(editingIndex, savedExercise);
      } else {
        addExercise(savedExercise);
      }
      closeDialog();
    } catch (error) {
      console.error("Failed to save exercise:", error);
      // Could add error handling UI here
    }
  }, [editingIndex, addExercise, updateExercise, closeDialog]);

  return {
    isOpen,
    editingIndex,
    exerciseData,
    openAddDialog,
    openEditDialog,
    closeDialog,
    saveExercise
  };
}

// Empty state component
const EmptyState = React.memo(() => (
  <Card className="border-dashed border-[#333333] bg-[#111111]">
    <CardContent className="flex flex-col items-center justify-center px-4 py-10 text-center sm:px-6 sm:py-12">
      <div className="mb-4 rounded-full bg-[#1A1A1A] p-4">
        <Dumbbell className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
      </div>
      <h3 className="mb-2 text-base sm:text-lg font-medium">No exercises added yet</h3>
      <p className="mb-6 max-w-md text-sm sm:text-base text-gray-400">
        Click &quot;Add Exercise&quot; to build your workout routine.
      </p>
    </CardContent>
  </Card>
));
EmptyState.displayName = 'EmptyState';

// Exercise card component
interface ExerciseCardProps {
  exercise: StoreWorkoutExercise;
  index: number;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
}

const ExerciseCard = React.memo(({ exercise, index, onEdit, onRemove }: ExerciseCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  return (
    <Card className="border-[#333333] bg-[#111111]">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-2 sm:gap-3">
          {/* Drag Handle - Hidden on smallest screens */}
          <div className="hidden sm:block mt-1 cursor-grab pt-0.5" title="Drag to reorder (feature coming soon)">
            <GripVertical className="h-5 w-5 text-gray-500" />
          </div>

          {/* Exercise Details */}
          <div className="flex-grow">
            {/* Top Row: Name, Badges, Actions */}
            <div className="flex items-start justify-between gap-2">
              {/* Left: Name & Badges */}
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <h3 className="font-medium leading-tight text-sm sm:text-base">
                    {index + 1}. {exercise.exercise?.name ?? 'Unknown Exercise'}
                  </h3>
                  {/* Mobile expand/collapse button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 sm:hidden"
                    onClick={toggleExpand}
                    aria-label={isExpanded ? "Collapse details" : "Expand details"}
                  >
                    {isExpanded ?
                      <ChevronUp className="h-4 w-4" /> :
                      <ChevronDown className="h-4 w-4" />
                    }
                  </Button>
                </div>

                {/* Always visible on desktop, conditionally on mobile */}
                <div className={`mt-1.5 flex flex-wrap gap-1.5 ${isExpanded ? 'block' : 'hidden sm:flex'}`}>
                  {exercise.exercise?.muscleGroup && (
                    <Badge variant="secondary" className="text-xs">{exercise.exercise.muscleGroup}</Badge>
                  )}
                  {exercise.exercise?.equipment && (
                    <Badge variant="outline" className="text-xs bg-[#1A1A1A] border-[#333333]">
                      {exercise.exercise.equipment}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex items-center gap-1">
                {/* Edit button - Text on desktop, icon on mobile */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 hidden sm:flex px-2 text-xs text-blue-400 hover:text-blue-300"
                  onClick={() => onEdit(index)}
                  aria-label={`Edit ${exercise.exercise?.name}`}
                >
                  Edit
                </Button>
                {/* Mobile edit button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 sm:hidden text-blue-400"
                  onClick={() => onEdit(index)}
                  aria-label={`Edit ${exercise.exercise?.name}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                  </svg>
                </Button>

                {/* Remove button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-500 hover:text-red-500 hover:bg-red-900/20"
                  onClick={() => onRemove(index)}
                  aria-label={`Remove ${exercise.exercise?.name}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Bottom Row: Stats Grid - Always visible on desktop, conditionally on mobile */}
            <div className={`mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-xs sm:text-sm sm:grid-cols-4 ${isExpanded ? 'block' : 'hidden sm:grid'}`}>
              <div className="flex justify-between sm:block">
                <p className="text-gray-400">Sets</p>
                <p className="font-medium sm:mt-0.5">{exercise.sets ?? '--'}</p>
              </div>
              <div className="flex justify-between sm:block">
                <p className="text-gray-400">Reps</p>
                <p className="font-medium sm:mt-0.5">{exercise.reps ?? '--'}</p>
              </div>
              <div className="flex justify-between sm:block">
                <p className="text-gray-400">Weight</p>
                <p className="font-medium sm:mt-0.5">{formatWeight(exercise.weight)}</p>
              </div>
              <div className="flex justify-between sm:block">
                <p className="text-gray-400">Rest</p>
                <p className="font-medium sm:mt-0.5">{formatRestTime(exercise.restSeconds)}</p>
              </div>

              {/* Conditionally display RIR if present */}
              {exercise.rir !== undefined && exercise.rir !== null && (
                <div className="flex justify-between sm:block">
                  <p className="text-gray-400">RIR</p>
                  <p className="font-medium sm:mt-0.5">{formatRIR(exercise.rir)}</p>
                </div>
              )}

              {/* Conditionally display notes */}
              {exercise.notes && (
                <div className="col-span-2 mt-1 sm:col-span-4">
                  <p className="text-xs text-gray-400">Notes:</p>
                  <p className="text-xs font-medium italic">{exercise.notes}</p>
                </div>
              )}
            </div>

            {/* Mobile-only compact view (when collapsed) */}
            <div className={`mt-1 grid grid-cols-4 gap-x-2 text-xs sm:hidden ${isExpanded ? 'hidden' : 'grid'}`}>
              <div className="text-center">
                <span className="text-gray-400">Sets</span>
                <p className="font-medium">{exercise.sets ?? '--'}</p>
              </div>
              <div className="text-center">
                <span className="text-gray-400">Reps</span>
                <p className="font-medium">{exercise.reps ?? '--'}</p>
              </div>
              <div className="text-center">
                <span className="text-gray-400">Wt</span>
                <p className="font-medium">{exercise.weight ?? 'BW'}</p>
              </div>
              <div className="text-center">
                <span className="text-gray-400">Rest</span>
                <p className="font-medium">{exercise.restSeconds ?? '--'}s</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
ExerciseCard.displayName = 'ExerciseCard';

// Main component
export default function WorkoutExerciseList({
  availableExercises,
  isLoadingAvailableExercises,
  exerciseFetchError
}: WorkoutExerciseListProps) {
  // Zustand store access
  const exercises = useWorkoutStore((state) => state.currentWorkout.exercises);
  const addExercise = useWorkoutStore((state) => state.addExercise);
  const updateExercise = useWorkoutStore((state) => state.updateExercise);
  const removeExercise = useWorkoutStore((state) => state.removeExercise);

  // Use custom dialog hook
  const {
    isOpen: isExerciseDialogOpen,
    editingIndex: editingExerciseIndex,
    exerciseData: exerciseForDialog,
    openAddDialog: handleOpenAddDialog,
    openEditDialog: handleOpenEditDialog,
    closeDialog: handleCloseDialog,
    saveExercise: handleSaveExercise
  } = useExerciseDialog(exercises, addExercise, updateExercise);

  // Memoize the handler to prevent unnecessary re-renders
  const handleRemoveExercise = useCallback((index: number) => {
    try {
      removeExercise(index);
    } catch (error) {
      console.error("Failed to remove exercise:", error);
    }
  }, [removeExercise]);

  // Memoize the exercise list to prevent unnecessary re-renders
  const exerciseList = useMemo(() => (
    exercises.map((exerciseItem, index) => (
      <ExerciseCard
        key={exerciseItem.id}
        exercise={exerciseItem}
        index={index}
        onEdit={handleOpenEditDialog}
        onRemove={handleRemoveExercise}
      />
    ))
  ), [exercises, handleOpenEditDialog, handleRemoveExercise]);

  return (
    <div className="space-y-4">
      {/* Header: Title + Add Button */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg sm:text-xl font-medium">Exercises</h2>
        <Button
          onClick={handleOpenAddDialog}
          className="h-8 sm:h-9 gap-1 sm:gap-2 text-xs sm:text-sm bg-white text-black hover:bg-gray-200"
          disabled={isLoadingAvailableExercises}
          aria-label="Add exercise to workout"
        >
          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Add Exercise
        </Button>
      </div>

      {/* Display fetch error if occurred */}
      {exerciseFetchError && (
        <p className="text-xs sm:text-sm text-red-500 -mt-2" role="alert">
          {exerciseFetchError}
        </p>
      )}

      {/* Conditional Rendering: Empty State vs. Exercise List */}
      {exercises.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {exerciseList}
        </div>
      )}

      {/* Exercise Dialog Component */}
      {isExerciseDialogOpen && exerciseForDialog && (
        <ExerciseDialog
          open={isExerciseDialogOpen}
          onClose={handleCloseDialog}
          onSave={handleSaveExercise}
          exercise={exerciseForDialog}
          isEditing={editingExerciseIndex !== null}
          availableExercises={availableExercises}
          isLoadingExercises={isLoadingAvailableExercises}
          fetchError={exerciseFetchError}
        />
      )}
    </div>
  );
}


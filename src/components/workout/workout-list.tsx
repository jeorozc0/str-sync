// src/components/workout/workout-list.tsx
"use client";

import React, { useState } from "react";
import { Plus, Dumbbell, GripVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useWorkoutStore from "@/stores/workout-store"; // Use specific type from store
import { type StoreWorkoutExercise } from "@/types/store";
import ExerciseDialog from "./workout-add-dialogue"; // The dialog component for adding/editing
import { type Exercise as PrismaExercise } from '@prisma/client'; // Type for the master exercise list
import { nanoid } from "nanoid"; // For generating temporary client-side IDs if needed

// Props for the component
interface WorkoutExerciseListProps {
  availableExercises: PrismaExercise[]; // Full list fetched by parent
  isLoadingAvailableExercises: boolean; // Loading state from parent
  exerciseFetchError: string | null; // Error state from parent
}

export default function WorkoutExerciseList({
  availableExercises,
  isLoadingAvailableExercises,
  exerciseFetchError
}: WorkoutExerciseListProps) {
  // --- Zustand Store Access ---
  // Select only the parts of the store needed by this component and its direct actions
  const exercises = useWorkoutStore((state) => state.currentWorkout.exercises);
  const addExercise = useWorkoutStore((state) => state.addExercise);
  const updateExercise = useWorkoutStore((state) => state.updateExercise);
  const removeExercise = useWorkoutStore((state) => state.removeExercise);
  // Note: Reordering (drag and drop) would require `reorderExercises` and likely a DnD library

  // --- Local State for Dialog Management ---
  const [isExerciseDialogOpen, setIsExerciseDialogOpen] = useState(false);
  // Index of the exercise being edited (null if adding)
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<number | null>(null);
  // Holds the exercise data being passed TO the dialog (either initial state or existing exercise)
  const [exerciseForDialog, setExerciseForDialog] = useState<StoreWorkoutExercise | null>(null);

  // --- Initial State for a NEW Exercise (to pass to dialog) ---
  const getInitialExerciseState = (): StoreWorkoutExercise => ({
    id: nanoid(10), // Generate a temporary client-side ID for React keys etc.
    // The actual DB ID will be generated on save.
    order: exercises.length, // Set order based on current list length
    sets: 3,
    reps: "8-12", // Default reps
    weight: undefined,
    restSeconds: 60, // Default rest
    rir: 2, // Default RIR
    notes: "",
    exerciseId: "", // No master exercise selected initially
    exercise: { // Empty nested exercise details
      id: "",
      name: "",
      muscleGroup: "",
      equipment: undefined,
    },
  });

  // --- Event Handlers ---
  const handleOpenAddDialog = () => {
    setExerciseForDialog(getInitialExerciseState()); // Prepare dialog with initial state
    setEditingExerciseIndex(null); // Ensure we are in "add" mode
    setIsExerciseDialogOpen(true);
  };

  const handleOpenEditDialog = (index: number) => {
    const exerciseToEdit = exercises[index];
    if (exerciseToEdit) {
      // Ensure the exercise object passed to the dialog has all necessary fields,
      // potentially merging with defaults if some are missing (though store should be complete)
      setExerciseForDialog({ ...getInitialExerciseState(), ...exerciseToEdit });
      setEditingExerciseIndex(index); // Set index for "edit" mode
      setIsExerciseDialogOpen(true);
    } else {
      console.error("Attempted to edit non-existent exercise at index:", index);
    }
  };

  const handleCloseDialog = () => {
    setIsExerciseDialogOpen(false);
    setEditingExerciseIndex(null); // Reset editing state on close
    setExerciseForDialog(null); // Clear dialog state
  };

  const handleSaveExercise = (savedExercise: StoreWorkoutExercise) => {
    if (editingExerciseIndex !== null) {
      // Update existing exercise in the store
      updateExercise(editingExerciseIndex, savedExercise);
    } else {
      // Add new exercise to the store (order should be handled within addExercise or is correct from initial state)
      addExercise(savedExercise);
    }
    handleCloseDialog(); // Close dialog after saving
  };

  const handleRemoveExercise = (index: number) => {
    removeExercise(index); // Call store action to remove
  };

  // Helper function for displaying rest time
  const formatRestTime = (seconds?: number) => {
    if (seconds === undefined || seconds === null) return '-- sec';
    return `${seconds}s`; // Simplified format
  };

  // Helper function for displaying weight
  const formatWeight = (weight?: number) => {
    if (weight === undefined || weight === null) return 'BW'; // Bodyweight as default
    // Add unit preference later if needed
    return `${weight} kg`;
  };

  // Helper function for displaying RIR
  const formatRIR = (rir?: number) => {
    if (rir === undefined || rir === null) return '--';
    return rir.toString();
  }

  return (
    <div className="space-y-4">
      {/* Header: Title + Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium">Exercises</h2>
        <Button
          onClick={handleOpenAddDialog}
          className="h-9 gap-2 bg-white text-black hover:bg-gray-200"
          disabled={isLoadingAvailableExercises} // Disable button while base exercises load
        >
          <Plus className="h-4 w-4" />
          Add Exercise
        </Button>
        {/* Display fetch error if occurred */}
        {exerciseFetchError && <p className="text-sm text-red-500">{exerciseFetchError}</p>}
      </div>

      {/* Conditional Rendering: Empty State vs. Exercise List */}
      {exercises.length === 0 ? (
        // Empty State Card
        <Card className="border-dashed border-[#333333] bg-[#111111]">
          <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-4 rounded-full bg-[#1A1A1A] p-4">
              <Dumbbell className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium">No exercises added yet</h3>
            <p className="mb-6 max-w-md text-gray-400">
              Click &quot;Add Exercise&quot; to build your workout routine.
            </p>
          </CardContent>
        </Card>
      ) : (
        // List of Exercises (Consider Drag and Drop wrapper here later)
        <div className="space-y-3">
          {exercises.map((exerciseItem, index) => (
            <Card key={exerciseItem.id} className="border-[#333333] bg-[#111111]">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Drag Handle */}
                  <div className="mt-1 cursor-grab pt-0.5" title="Drag to reorder (feature coming soon)">
                    <GripVertical className="h-5 w-5 text-gray-500" />
                  </div>

                  {/* Exercise Details */}
                  <div className="flex-grow">
                    {/* Top Row: Name, Badges, Actions */}
                    <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                      {/* Left: Name & Badges */}
                      <div className="flex-1">
                        <h3 className="font-medium leading-tight">
                          {/* Use index+1 for visual order, exerciseItem.order for actual data order */}
                          {index + 1}. {exerciseItem.exercise?.name ?? 'Unknown Exercise'}
                        </h3>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {exerciseItem.exercise?.muscleGroup && (
                            <Badge variant="secondary" className="text-xs">{exerciseItem.exercise.muscleGroup}</Badge>
                          )}
                          {exerciseItem.exercise?.equipment && (
                            <Badge variant="outline" className="text-xs bg-[#1A1A1A] border-[#333333]">{exerciseItem.exercise.equipment}</Badge>
                          )}
                        </div>
                      </div>
                      {/* Right: Action Buttons */}
                      <div className="flex items-center gap-1 self-start sm:self-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-blue-400 hover:text-blue-300"
                          onClick={() => handleOpenEditDialog(index)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-gray-500 hover:text-red-500 hover:bg-red-900/20"
                          onClick={() => handleRemoveExercise(index)}
                          aria-label="Remove exercise"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Bottom Row: Stats Grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
                      <div>
                        <p className="text-gray-400">Sets</p>
                        <p className="font-medium">{exerciseItem.sets ?? '--'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Reps</p>
                        <p className="font-medium">{exerciseItem.reps ?? '--'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Weight</p>
                        <p className="font-medium">{formatWeight(exerciseItem.weight)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Rest</p>
                        <p className="font-medium">{formatRestTime(exerciseItem.restSeconds)}</p>
                      </div>
                      {/* Conditionally display RIR if present */}
                      {exerciseItem.rir !== undefined && exerciseItem.rir !== null && (
                        <div>
                          <p className="text-gray-400">RIR</p>
                          <p className="font-medium">{formatRIR(exerciseItem.rir)}</p>
                        </div>
                      )}
                      {/* Conditionally display notes */}
                      {exerciseItem.notes && (
                        <div className="col-span-2 mt-1 sm:col-span-4">
                          <p className="text-xs text-gray-400">Notes:</p>
                          <p className="text-xs font-medium italic">{exerciseItem.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Exercise Dialog Component */}
      {isExerciseDialogOpen && (
        <ExerciseDialog
          open={isExerciseDialogOpen}
          onClose={handleCloseDialog}
          onSave={handleSaveExercise}
          // Pass the specific exercise state being configured for the dialog
          exercise={exerciseForDialog}
          isEditing={editingExerciseIndex !== null}
          // Pass down the fetched list and loading state from parent
          availableExercises={availableExercises}
          isLoadingExercises={isLoadingAvailableExercises}
          fetchError={exerciseFetchError}
        />
      )}
    </div>
  );
}

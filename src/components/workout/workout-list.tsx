"use client";

import React, { useState } from "react";
import { Plus, Dumbbell, GripVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useWorkoutStore, { type WorkoutExercise } from "@/stores/workout-store";
import ExerciseDialog from "./workout-add-dialogue";

export default function WorkoutExerciseList() {
  const { currentWorkout, addExercise, updateExercise, removeExercise } =
    useWorkoutStore();
  const [showExerciseDialog, setShowExerciseDialog] = useState(false);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<
    number | null
  >(null);
  const [currentExercise, setCurrentExercise] =
    useState<WorkoutExercise | null>(null);

  // Initial exercise state when adding a new exercise
  const initialExerciseState = {
    id: "",
    order: 0,
    sets: 3,
    reps: "8-12",
    weight: undefined,
    restSeconds: 60,
    notes: "",
    exerciseId: "",
    exercise: {
      id: "",
      name: "",
      muscleGroup: "",
      equipment: "",
      category: "Strength", // This is for display purposes in the UI
    },
  };

  const handleAddExercise = () => {
    setCurrentExercise(initialExerciseState);
    setEditingExerciseIndex(null);
    setShowExerciseDialog(true);
  };

  const handleEditExercise = (index: number) => {
    if (currentWorkout.exercises[index]) {
      setCurrentExercise(currentWorkout.exercises[index]);
    } else {
      setCurrentExercise(null);
    }
    setEditingExerciseIndex(index);
    setShowExerciseDialog(true);
  };

  const handleRemoveExercise = (index: number) => {
    removeExercise(index);
  };

  const handleSaveExercise = (exercise: WorkoutExercise) => {
    if (editingExerciseIndex !== null) {
      updateExercise(editingExerciseIndex, exercise);
    } else {
      addExercise(exercise);
    }

    setShowExerciseDialog(false);
  };

  // Helper function for displaying rest time
  const formatRestTime = (seconds?: number) => {
    if (!seconds) return "0 sec";
    return `${seconds} sec`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium">Exercises</h2>
        <Button
          onClick={handleAddExercise}
          className="h-9 gap-2 bg-white text-black hover:bg-gray-200"
        >
          <Plus className="h-4 w-4" />
          Add Exercise
        </Button>
      </div>

      {currentWorkout.exercises.length === 0 ? (
        <Card className="border-dashed border-[#333333] bg-[#111111]">
          <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-4 rounded-full bg-[#1A1A1A] p-4">
              <Dumbbell className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium">No exercises added yet</h3>
            <p className="mb-6 max-w-md text-gray-400">
              Add exercises to build your workout routine. You can specify sets,
              reps, intensity, and rest time for each exercise.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {currentWorkout.exercises.map((exercise, index) => (
            <Card key={index} className="border-[#333333] bg-[#111111]">
              <CardContent className="p-4">
                <div className="flex items-start">
                  <div className="mr-3 mt-1 cursor-move">
                    <GripVertical className="h-5 w-5 text-gray-500" />
                  </div>

                  <div className="flex-1">
                    <div className="mb-3 flex flex-col justify-between sm:flex-row sm:items-center">
                      <div>
                        <h3 className="font-medium">
                          {exercise.exercise.name}
                        </h3>
                        <div className="mt-1 flex flex-wrap gap-2">
                          <Badge
                            variant="outline"
                            className="border-[#333333] bg-[#1A1A1A] text-xs"
                          >
                            {exercise.exercise.muscleGroup}
                          </Badge>
                          {exercise.exercise.equipment && (
                            <Badge
                              variant="outline"
                              className="border-[#333333] bg-[#1A1A1A] text-xs"
                            >
                              {exercise.exercise.equipment}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2 sm:mt-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={() => handleEditExercise(index)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-white"
                          onClick={() => handleRemoveExercise(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                      <div>
                        <p className="text-gray-400">Sets</p>
                        <p className="font-medium">{exercise.sets}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Reps</p>
                        <p className="font-medium">{exercise.reps}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Weight</p>
                        <p className="font-medium">
                          {exercise.weight
                            ? `${exercise.weight} kg`
                            : "Bodyweight"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Rest</p>
                        <p className="font-medium">
                          {formatRestTime(exercise.restSeconds)}
                        </p>
                      </div>
                      {exercise.notes && (
                        <div className="col-span-2 sm:col-span-4">
                          <p className="text-gray-400">Notes</p>
                          <p className="font-medium">{exercise.notes}</p>
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

      {/* Exercise Dialog (add/edit) - to be implemented */}
      {showExerciseDialog && (
        <ExerciseDialog
          open={showExerciseDialog}
          onClose={() => setShowExerciseDialog(false)}
          onSave={handleSaveExercise}
          exercise={currentExercise}
          isEditing={editingExerciseIndex !== null}
        />
      )}
    </div>
  );
}

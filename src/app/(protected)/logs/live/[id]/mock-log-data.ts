
// data/mock-log-data.ts (or define within the component file)

import { type WorkoutLog, type Exercise, type Workout, type LiveLogState } from "./mock-log-types";


const mockExerciseDb: Record<string, Exercise> = {
  ex1: { id: 'ex1', name: 'Barbell Bench Press', muscleGroup: 'Chest' },
  ex2: { id: 'ex2', name: 'Barbell Squat', muscleGroup: 'Legs' },
  ex3: { id: 'ex3', name: 'Pull Ups', muscleGroup: 'Back' },
};

export const mockWorkoutTemplate: Workout = {
  id: 'tmpl1',
  name: 'Full Body Strength',
  exercises: [
    {
      id: 'wex1', order: 1, sets: 3, reps: '5', weight: 135, restSeconds: 90, notes: 'Focus on form', exerciseId: 'ex1', workoutId: 'tmpl1',
      exercise: mockExerciseDb.ex1,
    },
    {
      id: 'wex2', order: 2, sets: 3, reps: '5', weight: 185, restSeconds: 120, notes: null, exerciseId: 'ex2', workoutId: 'tmpl1',
      exercise: mockExerciseDb.ex2,
    },
    {
      id: 'wex3', order: 3, sets: 3, reps: 'AMRAP', weight: null, restSeconds: 60, notes: 'As many reps as possible', exerciseId: 'ex3', workoutId: 'tmpl1',
      exercise: mockExerciseDb.ex3,
    },
  ],
};

export const mockWorkoutLog: WorkoutLog = {
  id: 'log123',
  startedAt: new Date(), // Set dynamically on component load
  completedAt: null,
  duration: null,
  notes: null,
  userId: 'user1',
  workoutId: 'tmpl1',
};

// Function to create initial log entries based on the template
export const createInitialLiveLogState = (logId: string, template: Workout): LiveLogState => {
  const initialState: LiveLogState = {};
  template.exercises.forEach((tmplEx) => {
    const entryId = `entry_${tmplEx.id}_${logId}`; // Create a unique ID for the log entry
    initialState[entryId] = {
      id: entryId,
      workoutLogId: logId,
      workoutExerciseId: tmplEx.id,
      sets: [], // Start with no sets logged
      templateExercise: tmplEx, // Include template details
    };
  });
  return initialState;
};

// src/lib/data.ts
import { type Workout, type Exercise, type WorkoutTemplate } from '@/types/workout';
import { notFound } from 'next/navigation';

// Dummy Data - Replace with actual Prisma client and calls
const dummyExercises: Exercise[] = [
  { name: "Barbell Bench Press", sets: 4, reps: 8, rir: 2, restTime: 90, category: "Chest", equipment: "Barbell" },
  { name: "Overhead Press", sets: 3, reps: 10, rir: 3, restTime: 75, category: "Shoulders", equipment: "Barbell" },
  { name: "Pull Ups", sets: 3, reps: 6, rir: 1, restTime: 120, category: "Back", equipment: "Bodyweight" },
  { name: "Barbell Rows", sets: 4, reps: 10, rir: 2, restTime: 90, category: "Back", equipment: "Barbell" },
  { name: "Tricep Pushdowns", sets: 3, reps: 12, rir: 1, restTime: 60, category: "Triceps", equipment: "Cable" },
];

const dummyWorkouts: Workout[] = [
  {
    id: "z_YciwFGhJ",
    folderId: "f1",
    name: "Full Body Strength A",
    date: "2024-07-28",
    duration: "75 min",
    exercises: dummyExercises,
    totalWeight: 15000, // Example value
    isPR: false,
    notes: "Felt strong today, especially on bench press. Pull ups were tough.",
  },
  {
    id: "wk2",
    folderId: "f1",
    name: "Leg Day",
    date: "2024-07-26",
    duration: "60 min",
    exercises: [
      { name: "Squats", sets: 5, reps: 5, rir: 2, restTime: 180, category: "Legs", equipment: "Barbell" },
      { name: "Romanian Deadlifts", sets: 3, reps: 10, rir: 3, restTime: 120, category: "Hamstrings", equipment: "Barbell" },
      { name: "Leg Press", sets: 3, reps: 15, rir: 1, restTime: 90, category: "Legs", equipment: "Machine" },
    ],
    totalWeight: 20000,
    notes: "Solid leg session.",
  },
  {
    id: "wk3",
    folderId: "f2", // Different folder
    name: "Upper Body Hypertrophy",
    date: "2024-07-29",
    duration: "80 min",
    exercises: [
      { name: "Incline DB Press", sets: 4, reps: 12, rir: 2, restTime: 75, category: "Chest", equipment: "Dumbbell" },
      { name: "Lat Pulldowns", sets: 4, reps: 12, rir: 2, restTime: 75, category: "Back", equipment: "Machine" },
      { name: "Lateral Raises", sets: 3, reps: 15, rir: 1, restTime: 60, category: "Shoulders", equipment: "Dumbbell" },
      { name: "Bicep Curls", sets: 3, reps: 12, rir: 1, restTime: 60, category: "Biceps", equipment: "Dumbbell" },
      { name: "Skullcrushers", sets: 3, reps: 12, rir: 2, restTime: 60, category: "Triceps", equipment: "EZ Bar" },
    ],
    totalWeight: 12000,
    notes: "Good pump.",
  },
];

// Simulate fetching a workout by ID
export async function getWorkoutById(id: string): Promise<Workout> {
  console.log(`Fetching workout with id: ${id}`);
  // In a real app:
  // const workout = await prisma.workout.findUnique({
  //   where: { id },
  //   include: { exercises: true }, // Adjust includes as needed
  // });

  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network delay

  const workout = dummyWorkouts.find((w) => w.id === id);

  if (!workout) {
    console.error(`Workout with id ${id} not found.`);
    notFound(); // Use Next.js notFound helper
  }

  // Simulate data transformation if needed (e.g., date formatting)
  return workout;
}

// Simulate deleting a workout by ID
export async function deleteWorkoutById(id: string): Promise<{ success: boolean }> {
  console.log(`Attempting to delete workout with id: ${id}`);
  // In a real app:
  // try {
  //   await prisma.workout.delete({ where: { id } });
  //   return { success: true };
  // } catch (error) {
  //   console.error("Failed to delete workout:", error);
  //   return { success: false };
  // }

  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay

  const index = dummyWorkouts.findIndex(w => w.id === id);
  if (index > -1) {
    // dummyWorkouts.splice(index, 1); // Don't modify dummy data in this example unless intended
    console.log(`Successfully simulated deletion of workout: ${id}`);
    return { success: true };
  } else {
    console.error(`Failed to find workout ${id} for deletion.`);
    return { success: false };
  }
}

const dummyTemplates: WorkoutTemplate[] = [
  {
    id: "z_YciwFGhJ",
    folderId: "f1",
    name: "Upper Body A",
    description: "Focuses on horizontal push/pull and shoulder accessory work.",
    createdAt: new Date("2024-07-01T10:00:00Z"),
    updatedAt: new Date("2024-07-15T11:30:00Z"),
    plannedExercises: [
      { id: "pe1", exerciseId: "ex_bench", name: "Barbell Bench Press", targetSets: 4, targetReps: "6-8", targetRir: 2, targetRestTime: 120, category: "Chest", equipment: "Barbell" },
      { id: "pe2", exerciseId: "ex_row", name: "Barbell Rows", targetSets: 4, targetReps: "8-10", targetRir: 2, targetRestTime: 90, category: "Back", equipment: "Barbell" },
      { id: "pe3", exerciseId: "ex_ohp", name: "Overhead Press", targetSets: 3, targetReps: "8-12", targetRir: 3, targetRestTime: 75, category: "Shoulders", equipment: "Barbell" },
      { id: "pe4", exerciseId: "ex_latraise", name: "Lateral Raises", targetSets: 3, targetReps: "12-15", targetRir: 1, targetRestTime: 60, category: "Shoulders", equipment: "Dumbbell" },
      { id: "pe5", exerciseId: "ex_pushdown", name: "Tricep Pushdowns", targetSets: 3, targetReps: "10-15", targetRir: 1, targetRestTime: 60, category: "Triceps", equipment: "Cable" },
    ],
    // Simple calculation examples (implement properly in utils if needed)
    estimatedDurationMinutes: 70,
    primaryMuscleGroups: ["Chest", "Back", "Shoulders"],
  },
  {
    id: "tpl_lower_b",
    folderId: "f1",
    name: "Lower Body B",
    description: "Squat focused lower body day with hamstring and calf work.",
    createdAt: new Date("2024-07-02T10:00:00Z"),
    updatedAt: new Date("2024-07-16T14:00:00Z"),
    plannedExercises: [
      { id: "pe6", exerciseId: "ex_squat", name: "Barbell Squats", targetSets: 5, targetReps: "5", targetRir: 2, targetRestTime: 180, category: "Legs", equipment: "Barbell" },
      { id: "pe7", exerciseId: "ex_rdl", name: "Romanian Deadlifts", targetSets: 3, targetReps: "8-12", targetRir: 3, targetRestTime: 120, category: "Hamstrings", equipment: "Barbell" },
      { id: "pe8", exerciseId: "ex_legpress", name: "Leg Press", targetSets: 3, targetReps: "10-15", targetRir: 1, targetRestTime: 90, category: "Legs", equipment: "Machine" },
      { id: "pe9", exerciseId: "ex_calfraise", name: "Standing Calf Raises", targetSets: 4, targetReps: "15-20", targetRir: 1, targetRestTime: 60, category: "Calves", equipment: "Machine" },
    ],
    estimatedDurationMinutes: 65,
    primaryMuscleGroups: ["Legs", "Hamstrings", "Calves"],
  },
  // Add more templates...
];


// --- Data Fetching Functions ---

// Existing: getWorkoutById, deleteWorkoutById...

// Simulate fetching a workout template by ID
export async function getWorkoutTemplateById(id: string): Promise<WorkoutTemplate> {
  console.log(`Fetching workout template with id: ${id}`);
  // In a real app:
  // const template = await prisma.workoutTemplate.findUnique({
  //   where: { id },
  //   include: { plannedExercises: true }, // Adjust includes as needed
  // });

  await new Promise(resolve => setTimeout(resolve, 60)); // Simulate network delay

  const template = dummyTemplates.find((t) => t.id === id);

  if (!template) {
    console.error(`Workout template with id ${id} not found.`);
    notFound(); // Use Next.js notFound helper
  }

  // TODO: Implement proper calculation logic if needed here or in utils
  // For now, using dummy pre-calculated values

  return template;
}

// Simulate deleting a workout template by ID
export async function deleteWorkoutTemplateById(id: string): Promise<{ success: boolean }> {
  console.log(`Attempting to delete workout template with id: ${id}`);
  // In a real app:
  // await prisma.workoutTemplate.delete({ where: { id } });

  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay

  const index = dummyTemplates.findIndex(t => t.id === id);
  if (index > -1) {
    console.log(`Successfully simulated deletion of template: ${id}`);
    return { success: true };
  } else {
    console.error(`Failed to find template ${id} for deletion.`);
    return { success: false };
  }
}

// You might also need functions like:
// - getWorkoutTemplatesByFolderId(folderId: string)
// - createWorkoutLogFromTemplate(templateId: string)
// - etc.

import { type Exercise, type MuscleGroupData, type IntensityData, type VolumeData } from '@/types/workout';

// Constants
export const CHART_COLORS = [
  "#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c",
  "#d0ed57", "#ffc658", "#ff8042", "#ff6b6b", "#c44dff",
];

// Helper Functions
export function getRIRDescription(rir: number): string {
  switch (rir) {
    case 0: return "Failure (0 RIR)";
    case 1: return "Almost Failure (1 RIR)";
    case 2: return "Hard (2 RIR)";
    case 3: return "Moderate (3 RIR)";
    case 4: return "Light (4 RIR)";
    default: return `Very Light (${rir}+ RIR)`;
  }
}

export function getIntensityLabel(avgRIR: number): string {
  if (isNaN(avgRIR)) return "N/A";
  if (avgRIR <= 1) return "Maximum";
  if (avgRIR <= 2) return "Hard";
  if (avgRIR <= 3) return "Challenging";
  if (avgRIR <= 4) return "Moderate";
  return "Light";
}

export function calculateAverageRIR(exercises: Exercise[]): number | null {
  if (!exercises || exercises.length === 0) return null;
  const totalRIR = exercises.reduce((sum, ex) => sum + (ex.rir ?? 0), 0);
  return totalRIR / exercises.length;
}

// Calculation Functions
export function calculateMuscleGroupDistribution(exercises: Exercise[]): MuscleGroupData[] {
  if (!exercises || exercises.length === 0) return [];

  const muscleGroups: Record<string, number> = {};
  let totalSets = 0;

  exercises.forEach((exercise) => {
    if (!exercise.category) return;
    const sets = exercise.sets || 0; // Ensure sets is a number
    if (!muscleGroups[exercise.category]) {
      muscleGroups[exercise.category] = 0;
    }
    muscleGroups[exercise.category] += sets;
    totalSets += sets;
  });

  if (totalSets === 0) return [];

  return Object.entries(muscleGroups)
    .map(([name, count]) => ({
      name,
      value: count,
      percentage: Math.round((count / totalSets) * 100),
    }))
    .sort((a, b) => b.value - a.value);
}

export function calculateIntensityDistribution(exercises: Exercise[]): IntensityData[] {
  if (!exercises || exercises.length === 0) return [];

  const intensityCounts: Record<string, number> = {};

  exercises.forEach((exercise) => {
    if (exercise.rir === undefined || exercise.rir === null) return;
    const label = getRIRDescription(exercise.rir);
    if (!intensityCounts[label]) {
      intensityCounts[label] = 0;
    }
    intensityCounts[label]++;
  });

  return Object.entries(intensityCounts)
    .filter(([_, count]) => count > 0)
    .map(([name, count]) => ({ name, count }))
    // Optional: Sort by RIR level for better chart order
    .sort((a, b) => {
      const rirA = parseInt((/\((\d+)/.exec(a.name))?.[1] ?? '5');
      const rirB = parseInt((/\((\d+)/.exec(b.name))?.[1] ?? '5');
      return rirA - rirB;
    });
}

export function calculateVolumePerExercise(exercises: Exercise[]): VolumeData[] {
  if (!exercises || exercises.length === 0) return [];

  return exercises.map((exercise) => ({
    name: exercise.name,
    volume: (exercise.sets || 0) * (exercise.reps || 0), // Ensure numeric calculation
  })).filter(item => item.volume > 0); // Only include exercises with volume
}

export function calculateTotalSets(exercises: Exercise[]): number {
  return exercises.reduce((total, ex) => total + (ex.sets || 0), 0);
}

export function calculateTotalReps(exercises: Exercise[]): number {
  return exercises.reduce((total, ex) => total + (ex.sets || 0) * (ex.reps || 0), 0);
}

// Add other calculations if needed (e.g., total duration estimate)

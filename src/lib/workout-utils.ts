import { type Exercise } from "@/types/exercises"

// Calculate estimated workout duration
export function calculateDuration(exercises: Exercise[]): string {
  if (exercises.length === 0) return "0 min"

  let totalMinutes = 0

  // Add up exercise time (sets * reps * 3 seconds per rep + rest time between sets)
  exercises.forEach((exercise) => {
    const exerciseTime = (exercise.sets * exercise.reps * 3) / 60 // Time doing reps in minutes
    const restTime = (exercise.sets - 1) * (exercise.restTime / 60) // Rest time in minutes
    totalMinutes += exerciseTime + restTime
  })

  // Add transition time between exercises (1 minute per transition)
  totalMinutes += (exercises.length - 1) * 1

  // Add warm-up and cool-down time
  totalMinutes += 5 // 5 min warm-up

  return `${Math.round(totalMinutes)} min`
}

// Get the average RIR across all exercises
export function getAverageIntensity(exercises: Exercise[]): string {
  if (exercises.length === 0) return "N/A"

  const totalRIR = exercises.reduce((sum, exercise) => sum + exercise.rir, 0)
  const avgRIR = totalRIR / exercises.length

  // Convert average RIR to intensity label
  if (avgRIR <= 1) return "Maximum"
  if (avgRIR <= 2) return "Hard"
  if (avgRIR <= 3) return "Challenging"
  if (avgRIR <= 4) return "Moderate"
  return "Light"
}


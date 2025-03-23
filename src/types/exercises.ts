export interface Exercise {
  id: string
  name: string
  category: string
  equipment: string
  sets: number
  reps: number
  rir: number // Reps In Reserve - intensity measure
  restTime: number
}

// Initial exercise state
export const initialExerciseState: Exercise = {
  id: "",
  name: "",
  category: "",
  equipment: "",
  sets: 3,
  reps: 10,
  rir: 2,
  restTime: 60,
}

// Sample exercise database
export const exerciseDatabase = [
  { id: "e1", name: "Bench Press", category: "Chest", equipment: "Barbell" },
  { id: "e2", name: "Squat", category: "Legs", equipment: "Barbell" },
  { id: "e3", name: "Deadlift", category: "Back", equipment: "Barbell" },
  { id: "e4", name: "Pull-up", category: "Back", equipment: "Bodyweight" },
  { id: "e5", name: "Push-up", category: "Chest", equipment: "Bodyweight" },
  { id: "e6", name: "Dumbbell Curl", category: "Arms", equipment: "Dumbbell" },
  { id: "e7", name: "Tricep Pushdown", category: "Arms", equipment: "Cable" },
  { id: "e8", name: "Lateral Raise", category: "Shoulders", equipment: "Dumbbell" },
  { id: "e9", name: "Leg Press", category: "Legs", equipment: "Machine" },
  { id: "e10", name: "Leg Extension", category: "Legs", equipment: "Machine" },
  { id: "e11", name: "Leg Curl", category: "Legs", equipment: "Machine" },
  { id: "e12", name: "Calf Raise", category: "Legs", equipment: "Machine" },
  { id: "e13", name: "Shoulder Press", category: "Shoulders", equipment: "Dumbbell" },
  { id: "e14", name: "Incline Bench Press", category: "Chest", equipment: "Barbell" },
  { id: "e15", name: "Decline Bench Press", category: "Chest", equipment: "Barbell" },
  { id: "e16", name: "Dumbbell Fly", category: "Chest", equipment: "Dumbbell" },
  { id: "e17", name: "Bent Over Row", category: "Back", equipment: "Barbell" },
  { id: "e18", name: "Lat Pulldown", category: "Back", equipment: "Cable" },
  { id: "e19", name: "Seated Row", category: "Back", equipment: "Cable" },
  { id: "e20", name: "Face Pull", category: "Shoulders", equipment: "Cable" },
  { id: "e21", name: "Plank", category: "Core", equipment: "Bodyweight" },
  { id: "e22", name: "Russian Twist", category: "Core", equipment: "Bodyweight" },
  { id: "e23", name: "Crunch", category: "Core", equipment: "Bodyweight" },
  { id: "e24", name: "Leg Raise", category: "Core", equipment: "Bodyweight" },
  { id: "e25", name: "Hammer Curl", category: "Arms", equipment: "Dumbbell" },
  { id: "e26", name: "Skull Crusher", category: "Arms", equipment: "Barbell" },
  { id: "e27", name: "Dips", category: "Chest", equipment: "Bodyweight" },
  { id: "e28", name: "Lunges", category: "Legs", equipment: "Bodyweight" },
  { id: "e29", name: "Romanian Deadlift", category: "Legs", equipment: "Barbell" },
  { id: "e30", name: "Cable Fly", category: "Chest", equipment: "Cable" },
]

// Sample folder data
export const folderData = [
  { id: 1, name: "Upper Body", workoutCount: 8, lastUsed: "2 days ago" },
  { id: 2, name: "Lower Body", workoutCount: 6, lastUsed: "Yesterday" },
  { id: 3, name: "Full Body", workoutCount: 4, lastUsed: "3 days ago" },
  { id: 4, name: "Core", workoutCount: 5, lastUsed: "1 week ago" },
  { id: 5, name: "Cardio", workoutCount: 3, lastUsed: "4 days ago" },
  { id: 6, name: "Mobility", workoutCount: 2, lastUsed: "2 weeks ago" },
]

// Helper function to get RIR description
export function getRIRDescription(rir: number): string {
  switch (rir) {
    case 0:
      return "Failure (0 RIR)"
    case 1:
      return "Almost Failure (1 RIR)"
    case 2:
      return "Hard (2 RIR)"
    case 3:
      return "Moderate (3 RIR)"
    case 4:
      return "Light (4 RIR)"
    default:
      return "Very Light (5+ RIR)"
  }
}


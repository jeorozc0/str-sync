"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  BarChart2,
  Calendar,
  Clock,
  Dumbbell,
  LineChart,
  PieChart,
  Target,
  Flame,
  Share2,
  Download,
  Edit,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Inter } from "next/font/google"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart as RePieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const inter = Inter({ subsets: ["latin"] })

export default function WorkoutDetailPage() {
  const params = useParams()
  const router = useRouter()
  const workoutId = params.workoutId as string
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // In a real app, you would fetch this data from your API
  const workout = workouts.find((w) => w.id.toString() === workoutId) ?? {
    id: 0,
    folderId: 1,
    name: "Unknown Workout",
    date: "Unknown Date",
    duration: "0 min",
    exercises: [],
    totalWeight: 0,
    isPR: false,
    notes: "No notes available for this workout.",
  }

  // Calculate muscle group distribution
  const muscleGroupData = calculateMuscleGroupDistribution(workout.exercises)

  // Calculate intensity distribution
  const intensityData = calculateIntensityDistribution(workout.exercises)

  // Calculate volume per exercise
  const volumeData = calculateVolumePerExercise(workout.exercises)

  const handleDeleteWorkout = () => {
    console.log("Deleting workout:", workoutId)
    // In a real app, you would call an API to delete the workout
    setDeleteDialogOpen(false)
    // Navigate back to the folder page
    router.push(`/folders/${workout.folderId}`)
  }

  return (
    <div className={`min-h-screen bg-black text-white ${inter.className}`}>
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href={`/folders/${workout.folderId}`}>
              <Button variant="outline" size="icon" className="h-8 w-8 border-[#333333]">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold">{workout.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{workout.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{workout.duration}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-[#333333] gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              className="border-[#333333] text-red-500"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="bg-[#111111] border border-[#333333]">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="exercises">Exercises</TabsTrigger>
                <TabsTrigger value="charts">Charts</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-[#111111] border-[#333333]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Dumbbell className="h-4 w-4" />
                        Workout Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Total Exercises</span>
                          <span className="font-medium">{workout.exercises.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Total Sets</span>
                          <span className="font-medium">
                            {workout.exercises.reduce((total, ex) => total + ex.sets, 0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Total Reps</span>
                          <span className="font-medium">
                            {workout.exercises.reduce((total, ex) => total + ex.sets * ex.reps, 0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Total Weight</span>
                          <span className="font-medium">{workout.totalWeight} lbs</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Avg. Intensity (RIR)</span>
                          <span className="font-medium">
                            {workout.exercises.length > 0
                              ? (
                                workout.exercises.reduce((total, ex) => total + ex.rir, 0) / workout.exercises.length
                              ).toFixed(1)
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#111111] border-[#333333]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <PieChart className="h-4 w-4" />
                        Muscle Groups
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[180px]">
                        {muscleGroupData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                              <Pie
                                data={muscleGroupData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {muscleGroupData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{ backgroundColor: "#111111", borderColor: "#333333" }}
                                itemStyle={{ color: "#ffffff" }}
                              />
                              <Legend
                                layout="vertical"
                                verticalAlign="middle"
                                align="right"
                                wrapperStyle={{ fontSize: "12px" }}
                              />
                            </RePieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            No muscle group data available
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {workout.notes && (
                  <Card className="bg-[#111111] border-[#333333]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400">{workout.notes}</p>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-[#111111] border-[#333333]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart2 className="h-4 w-4" />
                      Volume per Exercise
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {volumeData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={volumeData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                            <XAxis type="number" stroke="#666666" />
                            <YAxis
                              type="category"
                              dataKey="name"
                              width={120}
                              stroke="#666666"
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip
                              contentStyle={{ backgroundColor: "#111111", borderColor: "#333333" }}
                              itemStyle={{ color: "#ffffff" }}
                              formatter={(value) => [`${value} total reps`, "Volume"]}
                            />
                            <Bar dataKey="volume" fill="#8884d8" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          No exercise data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="exercises" className="space-y-4 mt-6">
                {workout.exercises.length > 0 ? (
                  workout.exercises.map((exercise, index) => (
                    <Card key={index} className="bg-[#111111] border-[#333333]">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                          <div>
                            <h3 className="font-medium">{exercise.name}</h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <Badge variant="outline" className="text-xs bg-[#1A1A1A] border-[#333333]">
                                {exercise.category}
                              </Badge>
                              {exercise.equipment && (
                                <Badge variant="outline" className="text-xs bg-[#1A1A1A] border-[#333333]">
                                  {exercise.equipment}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Sets</p>
                            <p className="font-medium">{exercise.sets}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Reps</p>
                            <p className="font-medium">{exercise.reps}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Intensity</p>
                            <p className="font-medium">{getRIRDescription(exercise.rir)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Rest</p>
                            <p className="font-medium">{exercise.restTime} sec</p>
                          </div>
                        </div>

                        {/* Exercise-specific performance data could go here */}
                        <div className="mt-4 pt-4 border-t border-[#333333]">
                          <h4 className="text-sm font-medium mb-2">Set Details</h4>
                          <div className="space-y-2">
                            {Array.from({ length: exercise.sets }).map((_, setIndex) => (
                              <div key={setIndex} className="flex items-center gap-2 text-sm">
                                <span className="text-gray-400 w-8">#{setIndex + 1}</span>
                                <span className="font-medium">{exercise.reps} reps</span>
                                <span className="text-gray-400 ml-auto">RIR: {exercise.rir}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">No exercises found for this workout.</div>
                )}
              </TabsContent>

              <TabsContent value="charts" className="space-y-6 mt-6">
                <Card className="bg-[#111111] border-[#333333]">
                  <CardHeader>
                    <CardTitle className="text-base">Intensity Distribution</CardTitle>
                    <CardDescription>RIR (Reps in Reserve) across exercises</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {intensityData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={intensityData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                            <XAxis dataKey="name" stroke="#666666" />
                            <YAxis stroke="#666666" />
                            <Tooltip
                              contentStyle={{ backgroundColor: "#111111", borderColor: "#333333" }}
                              itemStyle={{ color: "#ffffff" }}
                            />
                            <Bar dataKey="count" fill="#ff4d4f" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          No intensity data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#111111] border-[#333333]">
                  <CardHeader>
                    <CardTitle className="text-base">Exercise Duration</CardTitle>
                    <CardDescription>Estimated time spent on each exercise</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      {workout.exercises.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={workout.exercises.map((ex) => ({
                              name: ex.name,
                              duration: ((ex.sets * ex.reps * 3) / 60 + (ex.sets - 1) * (ex.restTime / 60)).toFixed(1),
                            }))}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                            <XAxis dataKey="name" stroke="#666666" />
                            <YAxis stroke="#666666" />
                            <Tooltip
                              contentStyle={{ backgroundColor: "#111111", borderColor: "#333333" }}
                              itemStyle={{ color: "#ffffff" }}
                              formatter={(value) => [`${value} minutes`, "Duration"]}
                            />
                            <Area
                              type="monotone"
                              dataKey="duration"
                              stroke="#8884d8"
                              fill="#8884d8"
                              fillOpacity={0.3}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          No exercise data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-6 mt-6">
                <Card className="bg-[#111111] border-[#333333]">
                  <CardHeader>
                    <CardTitle className="text-base">Workout History</CardTitle>
                    <CardDescription>Compare with previous sessions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-400">
                      <p>Historical data will be shown here once you have multiple sessions of this workout.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-[#111111] border-[#333333] sticky top-4">
              <CardHeader>
                <CardTitle className="text-base">Performance Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-[#1A1A1A] p-2">
                      <Target className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Workout Intensity</p>
                      <p className="text-xs text-gray-400">
                        Average RIR:{" "}
                        {workout.exercises.length > 0
                          ? (
                            workout.exercises.reduce((total, ex) => total + ex.rir, 0) / workout.exercises.length
                          ).toFixed(1)
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Intensity Level</span>
                      <span>
                        {workout.exercises.length > 0
                          ? getIntensityLabel(
                            workout.exercises.reduce((total, ex) => total + ex.rir, 0) / workout.exercises.length,
                          )
                          : "N/A"}
                      </span>
                    </div>
                    <Progress
                      value={
                        workout.exercises.length > 0
                          ? 100 -
                          (workout.exercises.reduce((total, ex) => total + ex.rir, 0) / workout.exercises.length) * 20
                          : 0
                      }
                      className="h-2 bg-[#333333]"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-[#1A1A1A] p-2">
                      <Flame className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Primary Focus</p>
                      <p className="text-xs text-gray-400">
                        {muscleGroupData.length > 0
                          ? `${muscleGroupData[0].name} (${muscleGroupData[0].percentage}%)`
                          : "No data"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {muscleGroupData.slice(0, 3).map((group, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-xs mb-1">
                          <span>{group.name}</span>
                          <span>{group.percentage}%</span>
                        </div>
                        <Progress value={group.percentage} className="h-1.5 bg-[#333333]" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <Button className="w-full gap-2 h-9">
                    <LineChart className="h-4 w-4" />
                    Track Progress
                  </Button>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 gap-2 border-[#333333]">
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2 border-[#333333]">
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#111111] border-[#333333] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will permanently delete this workout and remove all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-[#333333] text-white hover:bg-[#1A1A1A]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWorkout} className="bg-red-600 text-white hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Helper functions
function getRIRDescription(rir: number) {
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

function getIntensityLabel(avgRIR: number) {
  if (avgRIR <= 1) return "Maximum"
  if (avgRIR <= 2) return "Hard"
  if (avgRIR <= 3) return "Challenging"
  if (avgRIR <= 4) return "Moderate"
  return "Light"
}

function calculateMuscleGroupDistribution(exercises: any[]) {
  if (!exercises || exercises.length === 0) return []

  const muscleGroups: Record<string, number> = {}

  exercises.forEach((exercise) => {
    if (!exercise.category) return

    if (!muscleGroups[exercise.category]) {
      muscleGroups[exercise.category] = 0
    }
    muscleGroups[exercise.category] += exercise.sets
  })

  const total = Object.values(muscleGroups).reduce((sum, count) => sum + count, 0)

  return Object.entries(muscleGroups)
    .map(([name, count]) => ({
      name,
      value: count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.value - a.value)
}

function calculateIntensityDistribution(exercises: any[]) {
  if (!exercises || exercises.length === 0) return []

  const intensityCounts: Record<string, number> = {
    "Failure (0 RIR)": 0,
    "Almost Failure (1 RIR)": 0,
    "Hard (2 RIR)": 0,
    "Moderate (3 RIR)": 0,
    "Light (4 RIR)": 0,
    "Very Light (5+ RIR)": 0,
  }

  exercises.forEach((exercise) => {
    if (exercise.rir === undefined) return

    const label = getRIRDescription(exercise.rir)
    intensityCounts[label]++
  })

  return Object.entries(intensityCounts)
    .filter(([_, count]) => count > 0)
    .map(([name, count]) => ({ name, count }))
}

function calculateVolumePerExercise(exercises: any[]) {
  if (!exercises || exercises.length === 0) return []

  return exercises.map((exercise) => ({
    name: exercise.name,
    volume: exercise.sets * exercise.reps,
  }))
}

// Chart colors
const CHART_COLORS = [
  "#8884d8",
  "#83a6ed",
  "#8dd1e1",
  "#82ca9d",
  "#a4de6c",
  "#d0ed57",
  "#ffc658",
  "#ff8042",
  "#ff6b6b",
  "#c44dff",
]

// Sample data - using the same workout data from the folder page
const workouts = [
  {
    id: 1,
    folderId: 1,
    name: "Chest & Triceps",
    date: "March 15, 2025",
    duration: "55 min",
    totalWeight: 5400,
    isPR: true,
    exercises: [
      {
        name: "Bench Press",
        category: "Chest",
        equipment: "Barbell",
        sets: 4,
        reps: 8,
        weight: 185,
        rir: 2,
        restTime: 120,
      },
      {
        name: "Incline Dumbbell Press",
        category: "Chest",
        equipment: "Dumbbell",
        sets: 3,
        reps: 10,
        weight: 65,
        rir: 2,
        restTime: 90,
      },
      {
        name: "Cable Flyes",
        category: "Chest",
        equipment: "Cable",
        sets: 3,
        reps: 12,
        weight: 40,
        rir: 3,
        restTime: 60,
      },
      {
        name: "Tricep Pushdowns",
        category: "Arms",
        equipment: "Cable",
        sets: 3,
        reps: 12,
        weight: 50,
        rir: 2,
        restTime: 60,
      },
      {
        name: "Overhead Tricep Extension",
        category: "Arms",
        equipment: "Dumbbell",
        sets: 3,
        reps: 10,
        weight: 30,
        rir: 2,
        restTime: 60,
      },
    ],
    notes:
      "Felt strong on bench press today. Increased weight by 5 lbs from last session. Triceps were fatigued by the end.",
  },
  {
    id: 2,
    folderId: 1,
    name: "Back & Biceps",
    date: "March 12, 2025",
    duration: "60 min",
    totalWeight: 6200,
    isPR: false,
    exercises: [
      {
        name: "Pull-ups",
        category: "Back",
        equipment: "Bodyweight",
        sets: 4,
        reps: 8,
        weight: 0,
        rir: 1,
        restTime: 90,
      },
      {
        name: "Barbell Rows",
        category: "Back",
        equipment: "Barbell",
        sets: 4,
        reps: 8,
        weight: 135,
        rir: 2,
        restTime: 90,
      },
      {
        name: "Lat Pulldowns",
        category: "Back",
        equipment: "Cable",
        sets: 3,
        reps: 10,
        weight: 120,
        rir: 2,
        restTime: 60,
      },
      {
        name: "Dumbbell Curls",
        category: "Arms",
        equipment: "Dumbbell",
        sets: 3,
        reps: 12,
        weight: 30,
        rir: 2,
        restTime: 60,
      },
      {
        name: "Hammer Curls",
        category: "Arms",
        equipment: "Dumbbell",
        sets: 3,
        reps: 12,
        weight: 25,
        rir: 3,
        restTime: 60,
      },
    ],
    notes: "Good back session. Need to work on pull-up form. Biceps felt pumped by the end.",
  },
  {
    id: 3,
    folderId: 1,
    name: "Shoulders & Arms",
    date: "March 10, 2025",
    duration: "50 min",
    totalWeight: 3800,
    isPR: false,
    exercises: [
      {
        name: "Overhead Press",
        category: "Shoulders",
        equipment: "Barbell",
        sets: 4,
        reps: 8,
        weight: 95,
        rir: 2,
        restTime: 90,
      },
      {
        name: "Lateral Raises",
        category: "Shoulders",
        equipment: "Dumbbell",
        sets: 3,
        reps: 12,
        weight: 15,
        rir: 2,
        restTime: 60,
      },
      {
        name: "Face Pulls",
        category: "Shoulders",
        equipment: "Cable",
        sets: 3,
        reps: 15,
        weight: 40,
        rir: 3,
        restTime: 60,
      },
      {
        name: "EZ Bar Curls",
        category: "Arms",
        equipment: "Barbell",
        sets: 3,
        reps: 10,
        weight: 65,
        rir: 2,
        restTime: 60,
      },
      {
        name: "Skull Crushers",
        category: "Arms",
        equipment: "Barbell",
        sets: 3,
        reps: 10,
        weight: 65,
        rir: 2,
        restTime: 60,
      },
    ],
    notes: "Shoulders felt good today. Need to increase weight on lateral raises next time.",
  },
  {
    id: 4,
    folderId: 2,
    name: "Quad Focus",
    date: "March 14, 2025",
    duration: "65 min",
    totalWeight: 8500,
    isPR: true,
    exercises: [
      {
        name: "Squats",
        category: "Legs",
        equipment: "Barbell",
        sets: 5,
        reps: 5,
        weight: 225,
        rir: 1,
        restTime: 180,
      },
      {
        name: "Leg Press",
        category: "Legs",
        equipment: "Machine",
        sets: 3,
        reps: 10,
        weight: 360,
        rir: 2,
        restTime: 120,
      },
      {
        name: "Leg Extensions",
        category: "Legs",
        equipment: "Machine",
        sets: 3,
        reps: 12,
        weight: 110,
        rir: 2,
        restTime: 60,
      },
      {
        name: "Walking Lunges",
        category: "Legs",
        equipment: "Dumbbell",
        sets: 3,
        reps: 10,
        weight: 40,
        rir: 3,
        restTime: 60,
      },
      {
        name: "Calf Raises",
        category: "Legs",
        equipment: "Machine",
        sets: 4,
        reps: 15,
        weight: 150,
        rir: 2,
        restTime: 60,
      },
    ],
    notes: "New PR on squats! Legs were shaking by the end. Need to stretch more next time.",
  },
  {
    id: 5,
    folderId: 2,
    name: "Hamstring & Glutes",
    date: "March 11, 2025",
    duration: "55 min",
    totalWeight: 7200,
    isPR: false,
    exercises: [
      {
        name: "Deadlifts",
        category: "Legs",
        equipment: "Barbell",
        sets: 4,
        reps: 6,
        weight: 275,
        rir: 2,
        restTime: 180,
      },
      {
        name: "Romanian Deadlifts",
        category: "Legs",
        equipment: "Barbell",
        sets: 3,
        reps: 10,
        weight: 185,
        rir: 2,
        restTime: 120,
      },
      {
        name: "Leg Curls",
        category: "Legs",
        equipment: "Machine",
        sets: 3,
        reps: 12,
        weight: 90,
        rir: 2,
        restTime: 60,
      },
      {
        name: "Hip Thrusts",
        category: "Legs",
        equipment: "Barbell",
        sets: 3,
        reps: 12,
        weight: 185,
        rir: 2,
        restTime: 90,
      },
      {
        name: "Glute Bridges",
        category: "Legs",
        equipment: "Barbell",
        sets: 3,
        reps: 15,
        weight: 135,
        rir: 3,
        restTime: 60,
      },
    ],
    notes: "Good hamstring session. Lower back was a bit tight during deadlifts.",
  },
  {
    id: 6,
    folderId: 3,
    name: "Full Body Strength",
    date: "March 13, 2025",
    duration: "75 min",
    totalWeight: 9800,
    isPR: false,
    exercises: [
      {
        name: "Squats",
        category: "Legs",
        equipment: "Barbell",
        sets: 3,
        reps: 8,
        weight: 185,
        rir: 2,
        restTime: 120,
      },
      {
        name: "Bench Press",
        category: "Chest",
        equipment: "Barbell",
        sets: 3,
        reps: 8,
        weight: 165,
        rir: 2,
        restTime: 120,
      },
      {
        name: "Barbell Rows",
        category: "Back",
        equipment: "Barbell",
        sets: 3,
        reps: 8,
        weight: 135,
        rir: 2,
        restTime: 90,
      },
      {
        name: "Overhead Press",
        category: "Shoulders",
        equipment: "Barbell",
        sets: 3,
        reps: 8,
        weight: 85,
        rir: 2,
        restTime: 90,
      },
      {
        name: "Deadlifts",
        category: "Legs",
        equipment: "Barbell",
        sets: 3,
        reps: 6,
        weight: 225,
        rir: 2,
        restTime: 180,
      },
      {
        name: "Pull-ups",
        category: "Back",
        equipment: "Bodyweight",
        sets: 3,
        reps: 8,
        weight: 0,
        rir: 1,
        restTime: 90,
      },
    ],
    notes: "Solid full body session. Felt strong on all lifts. Need to increase weight on bench press next time.",
  },
]



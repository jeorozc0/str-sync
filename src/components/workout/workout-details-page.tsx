"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Inter } from "next/font/google";

import { type Workout } from "@/types/workout";
import {
  calculateMuscleGroupDistribution, calculateIntensityDistribution,
  calculateVolumePerExercise, calculateAverageRIR, calculateTotalSets, calculateTotalReps
} from "@/utils/workout-utils";
import { deleteWorkoutById } from "@/lib/data";
import { WorkoutHeader } from "./workout-header";
import { WorkoutTabsManager } from "./workout-tabs-manager";
import { DeleteWorkoutDialog } from "./delete-workout-dialogue";
import { PerformanceSidebar } from "./performance-side-bar";

// Import the new components

const inter = Inter({ subsets: ["latin"] });

interface WorkoutDetailClientProps {
  workout: Workout;
}

export default function WorkoutDetailClient({ workout }: WorkoutDetailClientProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Calculations ---
  // (Could be memoized with useMemo if workout data changes dynamically without full reload)
  const muscleGroupData = calculateMuscleGroupDistribution(workout.exercises);
  const intensityData = calculateIntensityDistribution(workout.exercises);
  const volumeData = calculateVolumePerExercise(workout.exercises);
  const avgRIR = calculateAverageRIR(workout.exercises);
  const totalSets = calculateTotalSets(workout.exercises);
  const totalReps = calculateTotalReps(workout.exercises);

  // --- Handlers ---
  const handleDeleteWorkout = async () => {
    setIsDeleting(true);
    console.log("Deleting workout:", workout.id);
    try {
      const result = await deleteWorkoutById(workout.id);
      if (result.success) {
        console.log("Workout deleted successfully.");
        setDeleteDialogOpen(false);
        router.push(`/f/${workout.folderId}`); // Navigate back
        router.refresh(); // Refresh server data on the target page
      } else {
        console.error("Failed to delete workout.");
        alert("Failed to delete workout. Please try again."); // Simple error feedback
      }
    } catch (error) {
      console.error("Error during workout deletion:", error);
      alert("An error occurred while deleting the workout.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = () => {
    // Navigate to an edit page or open an edit modal
    alert('Edit functionality not implemented.');
    // Example navigation: router.push(`/workouts/${workout.id}/edit`);
  }

  return (
    <div className={`min-h-screen bg-black text-white ${inter.className}`}>
      <main className="container mx-auto px-4 py-8">
        <WorkoutHeader
          workout={workout}
          onEditClick={handleEditClick}
          onDeleteClick={() => setDeleteDialogOpen(true)}
          isDeleting={isDeleting}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area (Tabs) */}
          <div className="lg:col-span-2 space-y-6">
            <WorkoutTabsManager
              workout={workout}
              totalSets={totalSets}
              totalReps={totalReps}
              avgRIR={avgRIR}
              muscleGroupData={muscleGroupData}
              intensityData={intensityData}
              volumeData={volumeData}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <PerformanceSidebar
              avgRIR={avgRIR}
              muscleGroupData={muscleGroupData}
            // Pass down any action handlers if needed from here
            />
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <DeleteWorkoutDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirmDelete={handleDeleteWorkout}
        workoutName={workout.name}
        workoutDate={workout.date}
        isDeleting={isDeleting}
      />
    </div>
  );
}

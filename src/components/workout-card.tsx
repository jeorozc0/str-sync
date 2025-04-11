"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, Play, Dumbbell, Edit, Trash2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { type WorkoutCardData } from "@/server/queries/folders";
import { startWorkoutFromTemplate } from "@/actions/logging";
import { deleteWorkoutAction } from "@/actions/workouts";

interface WorkoutCardsProps {
  workouts: WorkoutCardData[];
  folderId?: string;
}
export default function WorkoutCards({ workouts }: WorkoutCardsProps) {
  const router = useRouter();
  const [workoutToDelete, setWorkoutToDelete] = useState<WorkoutCardData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [startingWorkoutId, setStartingWorkoutId] = useState<string | null>(null);
  const [deletingWorkoutId, setDeletingWorkoutId] = useState<string | null>(null);
  const [hoveringCard, setHoveringCard] = useState<string | null>(null);

  const handleDeleteInitiate = (
    event: React.MouseEvent | Event,
    workout: WorkoutCardData
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (deletingWorkoutId) return;
    setWorkoutToDelete(workout);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!workoutToDelete || deletingWorkoutId === workoutToDelete.id) return;
    setDeletingWorkoutId(workoutToDelete.id);
    try {
      const result = await deleteWorkoutAction(
        workoutToDelete.id,
        workoutToDelete.folderId!
      );
      if (result.success) {
        toast.success(`Template "${workoutToDelete.name}" deleted.`);
      } else {
        toast.error(`Failed to delete template "${workoutToDelete.name}".`);
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("An error occurred while deleting the template.");
    } finally {
      setDeletingWorkoutId(null);
      setIsDeleteDialogOpen(false);
      setWorkoutToDelete(null);
    }
  };

  const handleEdit = (
    event: React.MouseEvent | Event,
    workoutId: string
  ) => {
    event.preventDefault();
    event.stopPropagation();
    router.push(`/w/${workoutId}/edit`);
  };

  const handleStartWorkout = async (
    event: React.MouseEvent | Event,
    workoutId: string
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (startingWorkoutId) return;
    setStartingWorkoutId(workoutId);
    const toastId = toast.loading("Starting workout session...");
    try {
      const result = await startWorkoutFromTemplate(workoutId);
      toast.dismiss(toastId);
      if (result.success && result.workoutLogId) {
        toast.success("Workout started!");
        router.push(`/logs/live/${result.workoutLogId}`);
      } else {
        toast.error(result.error ?? "Failed to start workout.");
        setStartingWorkoutId(null);
      }
    } catch (error) {
      toast.dismiss(toastId);
      console.error("Error starting workout:", error);
      toast.error("An unexpected error occurred while starting the workout.");
      setStartingWorkoutId(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workouts.map((workout) => (
          <Link href={`/w/${workout.id}`} key={workout.id} passHref>
            <Card
              className={cn(
                "h-full cursor-pointer transition-all duration-200",
                hoveringCard === workout.id ? "shadow-md translate-y-[-2px]" : "shadow-sm"
              )}
              onMouseEnter={() => setHoveringCard(workout.id)}
              onMouseLeave={() => setHoveringCard(null)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Dumbbell className="h-5 w-5 text-neutral-500" />
                    <h3 className="font-medium text-lg line-clamp-1">{workout.name}</h3>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={!!startingWorkoutId || !!deletingWorkoutId}
                      >
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => handleEdit(e, workout.id)}
                        disabled={!!startingWorkoutId || !!deletingWorkoutId}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => handleDeleteInitiate(e, workout)}
                        disabled={deletingWorkoutId === workout.id}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {workout.description && (
                  <p className="text-sm text-neutral-600 line-clamp-2 mb-2">
                    {workout.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>{workout._count?.exercises ?? 0} exercises</span>
                  <span>
                    Updated {formatDistanceToNow(workout.updatedAt, { addSuffix: true })}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button
                  onClick={(e) => handleStartWorkout(e, workout.id)}
                  disabled={startingWorkoutId === workout.id}
                  className="w-full bg-black hover:bg-neutral-800 text-white"
                  size="lg"
                >
                  {startingWorkoutId === workout.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Start Workout
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{workoutToDelete?.name}&quot;? This action cannot be undone.
              <br /><br />
              Workout logs previously created using this template will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setWorkoutToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={deletingWorkoutId === workoutToDelete?.id}
            >
              {deletingWorkoutId === workoutToDelete?.id && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {deletingWorkoutId === workoutToDelete?.id
                ? "Deleting..."
                : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


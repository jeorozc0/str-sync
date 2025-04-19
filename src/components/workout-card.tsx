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

  const handleStartWorkout = (
    workoutId: string,
    // Refine type: Expect a React MouseEvent specifically, make it optional
    event?: React.MouseEvent<HTMLElement> // Use HTMLElement or a more specific element like HTMLButtonElement
  ) => {

    // Check if event exists and has the necessary methods before calling them
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    if (event && typeof event.stopPropagation === 'function') {
      event.stopPropagation();
    }

    // Prevent starting multiple workouts simultaneously
    if (startingWorkoutId) {
      console.log("Start workout already in progress for:", startingWorkoutId);
      return;
    }

    // Set loading state for this specific workout ID
    setStartingWorkoutId(workoutId);

    // Show immediate feedback
    const toastId = toast.loading("Preparing workout session...");

    try {
      // Construct the URL for the live logging page
      const targetPath = `/logs/live/${workoutId}`;
      console.log(`Navigating to start workout: ${targetPath}`);

      // Dismiss loading toast *before* navigation starts
      toast.dismiss(toastId);

      // Navigate
      router.push(targetPath);

    } catch (error) {
      // Catch potential errors during navigation setup
      toast.dismiss(toastId);
      console.error("Error navigating to start workout:", error);
      toast.error("Could not load the workout session page.");
      // Reset loading state on error
      setStartingWorkoutId(null);
    }
    // Consider resetting startingWorkoutId in a finally block or on component unmount
    // if navigation failure needs specific handling. For now, we assume navigation succeeds
    // or the component unmounts.
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workouts.map((workout) => (
          <Link href={`/w/${workout.id}`} key={workout.id} passHref>
            <Card
              className={cn(
                "h-full cursor-pointer",
                hoveringCard === workout.id ? "shadow-md" : "shadow-sm"
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
                  onClick={(e) => handleStartWorkout(workout.id, e)}
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


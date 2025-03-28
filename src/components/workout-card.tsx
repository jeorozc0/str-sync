"use client"

import { useState } from "react";
import {
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Dumbbell,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import Link from "next/link";

interface Workout {
  id: string;
  name: string;
  description?: string | null;
  isArchived: boolean;
  updatedAt: string;
  date: string;
  _count: { exercises: number };
  exercises?: Array<{
    name: string;
    sets: number;
    reps: number;
    weight: number;
  }>;
}

interface WorkoutCardsProps {
  workouts: Workout[];
}

export default function WorkoutCards({ workouts }: WorkoutCardsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);

  const handleDeleteClick = (workoutId: string) => {
    setWorkoutToDelete(workoutId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    console.log("Deleting workout:", workoutToDelete);
    // Here you would call a server action or API to delete the workout
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <div className="space-y-4">

        {workouts.map((workout) => (
          <Link href={`/workouts/${workout.id}`} key={workout.id} className="block">
            <Card key={workout.id} className="bg-[#111111] border-[#333333]">
              <div className="flex items-start p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{workout.name}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    {workout.exercises?.slice(0, 4).map((exercise, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Dumbbell className="h-4 w-4 text-gray-400" />
                        <span>{exercise.name}</span>
                        <span className="text-gray-400">
                          {exercise.sets} × {exercise.reps} • {exercise.weight} lbs
                        </span>
                      </div>
                    ))}
                    {workout.exercises && workout.exercises.length > 4 && (
                      <div className="text-sm text-gray-400">
                        +{workout.exercises.length - 4} more exercises
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{workout.date}</span>
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#111111] border-[#333333] text-white">
                    <DropdownMenuItem className="cursor-pointer">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Workout
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#333333]" />
                    <DropdownMenuItem
                      className="text-red-500 cursor-pointer"
                      onSelect={() => handleDeleteClick(workout.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          </Link>
        ))}
      </div>

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
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 text-white hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

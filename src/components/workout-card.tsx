"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Import router for navigation
import {
  MoreVertical,
  Edit,
  Trash2,
  Calendar, // Keep Calendar for 'Last Updated'
  ListChecks, // Icon for exercise count
  Play, // Icon for starting workout
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
import { toast } from "sonner"; // For confirmation toast
import Link from "next/link";

// TODO: Import your actual delete action
// import { deleteWorkoutTemplateAction } from "@/actions/workouts";

// Use a more specific type if available, otherwise define inline
interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string | null;
  isArchived: boolean; // Keep if relevant for filtering/display
  updatedAt: Date; // Use Date object for better formatting
  _count?: { // Make count optional as it might not always be present
    exercises?: number; // Count of planned exercises
  };
  // Remove unnecessary fields from log type (date, exercises array with reps/weight)
}

interface WorkoutCardsProps {
  workouts: WorkoutTemplate[]; // Expecting array of templates
  folderId?: string; // Optional: Pass folderId if needed for context/actions
}

// Helper function to format update date
const formatLastUpdated = (date: Date): string => {
  try {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    // Format as date if older than a week
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (error) {
    console.error("Error formatting date:", date, error);
    return "Invalid Date";
  }
};

export default function WorkoutCards({ workouts, folderId }: WorkoutCardsProps) {
  const router = useRouter();
  const [workoutToDelete, setWorkoutToDelete] = useState<WorkoutTemplate | null>(null);

  // --- Delete Confirmation Handling ---
  const handleDeleteInitiate = (event: React.MouseEvent | Event, workout: WorkoutTemplate) => {
    event.preventDefault();
    event.stopPropagation();
    setWorkoutToDelete(workout); // Store the whole workout object for context in toast/dialog
    toast.warning(`Delete "${workout.name}" template?`, {
      description: "This action cannot be undone. Workout logs using this template will NOT be deleted.",
      action: {
        label: "Delete",
        onClick: async () => {
          if (!workoutToDelete) return;
          console.log("Confirmed delete for template:", workoutToDelete.id);
          // --- Replace with actual Server Action call ---
          // const result = await deleteWorkoutTemplateAction(workoutToDelete.id);
          // if(result.success) {
          //     toast.success(`Template "${workoutToDelete.name}" deleted.`);
          //     // Revalidation should happen in action
          // } else {
          //     toast.error(result.error || "Failed to delete template.");
          // }
          // --- ---
          toast.info(`Delete action (not implemented) confirmed for: ${workoutToDelete.name}`);
          setWorkoutToDelete(null); // Clear after confirmation/action
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => setWorkoutToDelete(null), // Clear on cancel
      },
      duration: 10000,
      id: `delete-confirm-${workout.id}`, // Unique ID for the toast
    });
  };

  // --- Other Actions ---
  const handleEdit = (event: React.MouseEvent | Event, workoutId: string) => {
    event.preventDefault();
    event.stopPropagation();
    router.push(`/w/${workoutId}/edit`);
  };

  const handleStartWorkout = (event: React.MouseEvent | Event, workoutId: string) => {
    event.preventDefault();
    event.stopPropagation();
    // TODO: Call the actual start workout action which creates a log and redirects
    console.log("Attempting to start workout from template:", workoutId);
    toast.info("Starting workout... (Redirect functionality not implemented yet)");
    // Example redirect if action handles creation and returns log ID:
    // const result = await startWorkoutFromTemplate(workoutId);
    // if (result.success && result.workoutLogId) router.push(`/log/live/${result.workoutLogId}`);
    // else toast.error(...)
  }

  return (
    <>
      <div className="space-y-3"> {/* Reduced spacing */}
        {workouts.map((workout) => (
          <Link href={`/w/${workout.id}`} key={workout.id} passHref legacyBehavior>
            <a className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-white/80">
              {/* Vercel Style Card: Subtle hover, clean borders */}
              <Card className="bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors duration-150 rounded-lg shadow-sm group">
                <div className="flex items-center justify-between p-4 gap-3"> {/* Use center alignment */}
                  {/* Left side: Name, Description, Stats */}
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-medium truncate text-neutral-100 group-hover:text-white">
                      {workout.name}
                    </h3>
                    {/* Optional Description */}
                    {workout.description && (
                      <p className="text-xs text-neutral-400 truncate mt-1">
                        {workout.description}
                      </p>
                    )}
                    {/* Stats Row */}
                    <div className="flex items-center gap-x-4 gap-y-1 text-xs text-neutral-500 mt-2">
                      <div className="flex items-center gap-1" title="Number of Exercises">
                        <ListChecks className="h-3.5 w-3.5" />
                        <span>{workout._count?.exercises ?? 0} Exercises</span>
                      </div>
                      <div className="flex items-center gap-1" title="Last Updated">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatLastUpdated(new Date(workout.updatedAt))}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right side: Actions (visible on hover/focus) */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150">
                    {/* Start Workout Button */}
                    <Button
                      aria-label={`Start workout ${workout.name}`}
                      title="Start Workout"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-blue-600/20"
                      onClick={(e) => handleStartWorkout(e, workout.id)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    {/* More Options Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-label="Workout template options" variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-700/50">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#1D1D1D] border-[#444444] text-neutral-200 shadow-lg w-48">
                        <DropdownMenuItem className="cursor-pointer focus:bg-neutral-700/50" onSelect={(e) => handleStartWorkout(e, workout.id)}>
                          <Play className="mr-2 h-4 w-4" /> Start Workout
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer focus:bg-neutral-700/50" onSelect={(e) => handleEdit(e, workout.id)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit Template
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem className="cursor-pointer focus:bg-neutral-700/50">
                          <Copy className="mr-2 h-4 w-4" /> Duplicate
                        </DropdownMenuItem> */}
                        <DropdownMenuSeparator className="bg-neutral-700/50" />
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-400 focus:bg-red-900/30 cursor-pointer"
                          onSelect={(e) => handleDeleteInitiate(e, workout)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Template
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                </div>
              </Card>
            </a>
          </Link>
        ))}
      </div>

      {/* AlertDialog removed - using toast confirmation instead */}
    </>
  );
}

// src/components/logs/log-list-item.tsx
"use client";

import Link from 'next/link';
import React from 'react'; // Import React
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Dumbbell, MoreVertical, Trash2 } from 'lucide-react';
import type { WorkoutLogRow } from '@/server/queries/logs'; // Assuming path is correct
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner'; // For feedback
// TODO: Import your delete log server action when created
// import { deleteWorkoutLogAction } from '@/actions/logging';

interface LogListItemProps {
  log: WorkoutLogRow;
}

// Helper function to format date/time nicely
const formatDateTime = (date: Date | null | undefined): string => {
  if (!date) return 'N/A';
  try {
    // Format: July 31, 2024, 5:30 PM - Adjust 'en-US' locale and options as needed
    return new Date(date).toLocaleString('en-US', {
      month: 'long', // Use 'short' or 'numeric' if preferred
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true, // Use false for 24-hour time
    });
  } catch (error) {
    console.error("Error formatting date:", date, error);
    return 'Invalid Date';
  }
};

// Helper function to format duration
const formatDuration = (durationMinutes: number | null | undefined): string => {
  if (durationMinutes === null || durationMinutes === undefined) return '-- min';
  return `${durationMinutes} min`;
};

export default function LogListItem({ log }: LogListItemProps) {

  // Handler for initiating delete (shows confirmation, etc.)
  // Accepts Event type for compatibility with onSelect
  const handleDeleteInitiate = (event: React.MouseEvent | Event) => {
    event.preventDefault(); // Prevent link navigation and default dropdown behavior
    event.stopPropagation(); // Stop event from bubbling further

    // TODO: Implement confirmation dialog before actually deleting
    console.log("Initiating delete for log:", log.id);
    toast.warning(`Are you sure you want to delete the log for "${log.workout.name}"?`, {
      action: {
        label: "Delete",
        onClick: async () => {
          console.log(`Confirmed delete for log ${log.id}`);
          // --- Replace with actual Server Action call ---
          // const result = await deleteWorkoutLogAction(log.id);
          // if(result.success) {
          //     toast.success("Log deleted successfully.");
          //     // Revalidation should happen in the action
          // } else {
          //     toast.error(result.error || "Failed to delete log.");
          // }
          // --- ---
          toast.info("Delete action (not implemented) confirmed for log: " + log.id);
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => console.log("Delete cancelled"),
      },
      duration: 10000, // Keep toast longer for confirmation
    });
  };

  return (
    // Link the whole card to the detailed log page
    <Link
      href={`/logs/${log.id}`}
      className="block rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-blue-500"
      aria-label={`View log details for ${log.workout.name} on ${formatDateTime(log.startedAt)}`}
    >
      <Card className="bg-[#111111] border-[#333333] hover:border-[#444444] transition-colors duration-150 rounded-lg"> {/* Ensure rounded corners */}
        {/* Flex container for content and menu */}
        <div className="flex items-center justify-between p-4 gap-2">

          {/* Left side: Log details */}
          <div className="flex-1 space-y-1.5 overflow-hidden"> {/* Increased spacing slightly */}
            <h3 className="font-medium truncate pr-2 text-neutral-100">{log.workout.name}</h3> {/* Slightly brighter text */}
            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400"> {/* Use neutral-400 */}
              <div className="flex items-center gap-1.5"> {/* Increased gap */}
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDateTime(log.startedAt)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatDuration(log.duration)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Dumbbell className="h-3.5 w-3.5" />
                <span>{log._count.exercises} {log._count.exercises === 1 ? 'Exercise' : 'Exercises'}</span>
              </div>
            </div>
            {/* Optional Notes */}
            {log.notes && (
              <p className="text-xs text-neutral-500 italic truncate pt-1">Note: {log.notes}</p>
            )}
          </div>

          {/* Right side: Actions Menu */}
          <div onClick={(e) => { e.stopPropagation(); e.preventDefault(); }} > {/* Wrapper div to capture clicks only for the menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {/* Make button slightly more visible on hover */}
                <Button
                  aria-label="Log options"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0 text-neutral-400 hover:text-white hover:bg-neutral-700/50 focus-visible:ring-1 focus-visible:ring-neutral-400 focus-visible:ring-offset-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-[#1D1D1D] border-[#444444] text-neutral-200 shadow-lg w-40" // Darker dropdown, slightly wider
                // Prevent dropdown content click from triggering link
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                // Close dropdown when focus leaves the content area
                onFocusOutside={(e) => e.preventDefault()} // Keep open if clicking inside toast confirmation
                onPointerDownOutside={(e) => e.preventDefault()} // Keep open if clicking inside toast confirmation
              >
                {/* TODO: Add other actions like 'Repeat Workout' later */}
                {/* <DropdownMenuItem className="cursor-pointer focus:bg-neutral-700/50">
                     <Copy className="mr-2 h-4 w-4" /> Repeat Workout
                 </DropdownMenuItem> */}
                <DropdownMenuItem
                  className="text-red-500 focus:text-red-400 focus:bg-red-900/30 cursor-pointer"
                  // Use onSelect for proper keyboard/click handling
                  onSelect={handleDeleteInitiate}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Log
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

        </div>
      </Card>
    </Link>
  );
}

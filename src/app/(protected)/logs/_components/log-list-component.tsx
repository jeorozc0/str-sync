"use client";

import Link from 'next/link';
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Dumbbell, MoreVertical, Trash2 } from 'lucide-react';
import { deleteWorkoutLogAction, type WorkoutLogRow } from '@/server/queries/logs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// Import the new reusable component
import { toast } from 'sonner';
import { ResponsiveConfirm } from '@/components/ui/responsive-dialogue';

interface LogListItemProps {
  log: WorkoutLogRow;
}

type Result = {
  success: boolean;
  error?: string;
};

// Helper functions (formatDateTime, formatDuration) remain the same...
const formatDateTime = (date: Date | null | undefined): string => {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
  } catch (error) {
    console.error("Error formatting date:", date, error);
    return 'Invalid Date';
  }
};

function formatDuration(seconds: number | null | undefined) {
  if (seconds === null || seconds === undefined || seconds < 0) return '--:--';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const parts = [];
  if (hours > 0) parts.push(`${hours} hr${hours !== 1 ? 's' : ''}`);
  if (minutes > 0 || hours === 0) parts.push(`${minutes} min${minutes !== 1 ? 's' : ''}`);
  return parts.length > 0 ? parts.join(' ') : '0 min';
}


export default function LogListItem({ log }: LogListItemProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // No need for useMediaQuery here anymore

  // --- Actual Delete Function (passed to ResponsiveConfirm) ---
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    console.log(`Confirmed delete for log ${log.id}`);
    const toastId = toast.loading("Deleting log...");

    try {
      const result: Result = await deleteWorkoutLogAction(log.id);

      toast.dismiss(toastId);

      if (result.success) {
        toast.success("Log deleted successfully.");
        setIsConfirmOpen(false); // Close dialog on success
        // Revalidation should happen in the action
      } else {

        toast.error(result.error ?? "Failed to delete log.");
      }
    } catch (error) {
      toast.dismiss(toastId);
      console.error("Error deleting log:", error);
      toast.error("An unexpected error occurred while deleting.");
      // Keep dialog open on error? Optional.
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false); // Can close here always if preferred
    }
  };

  // --- Handler to open the confirmation ---
  const handleDeleteInitiate = (event: React.MouseEvent | Event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsConfirmOpen(true);
  };

  return (
    <>
      <Link
        href={`/logs/${log.id}`}
        className="block rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-blue-500"
        aria-label={`View log details for ${log.workout.name} on ${formatDateTime(log.startedAt)}`}
      >
        <Card className="bg-[#111111] border-[#333333] hover:border-[#444444] transition-colors duration-150 rounded-lg">
          <div className="flex items-center justify-between p-4 gap-2">
            {/* Left side: Log details */}
            <div className="flex-1 space-y-1.5 overflow-hidden">
              <h3 className="font-medium truncate pr-2 text-neutral-100">{log.workout.name}</h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400">
                <div className="flex items-center gap-1.5">
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
              {log.notes && (
                <p className="text-xs text-neutral-500 italic truncate pt-1">Note: {log.notes}</p>
              )}
            </div>

            {/* Right side: Actions Menu */}
            <div onClick={(e) => { e.stopPropagation(); e.preventDefault(); }} >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
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
                  className="bg-[#1D1D1D] border-[#444444] text-neutral-200 shadow-lg w-40"
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                >
                  <DropdownMenuItem
                    className="text-red-500 focus:text-red-400 focus:bg-red-900/30 cursor-pointer"
                    onSelect={handleDeleteInitiate} // Trigger opening the confirmation
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

      {/* Use the reusable component */}
      <ResponsiveConfirm
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Are you absolutely sure?"
        description={ // Pass JSX for dynamic description
          <>
            This action cannot be undone. This will permanently delete the workout log
            for <span className="font-semibold">{log.workout.name}</span> recorded on {formatDateTime(log.startedAt)}.
          </>
        }
        onConfirm={handleDeleteConfirm}
        isConfirming={isDeleting}
        confirmText="Delete"
        confirmVariant="destructive" // Use destructive variant for styling
      />
    </>
  );
}


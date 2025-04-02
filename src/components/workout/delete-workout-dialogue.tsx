"use client";

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
  workoutName: string;
  workoutDate: string;
  isDeleting: boolean;
}

export function DeleteWorkoutDialog({
  open,
  onOpenChange,
  onConfirmDelete,
  workoutName,
  workoutDate,
  isDeleting,
}: DeleteWorkoutDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#111111] border-[#333333] text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Workout?</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            This action will permanently delete the workout &apos;{workoutName}&apos; ({workoutDate}). This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="bg-transparent border-[#333333] text-white hover:bg-[#2a2a2a]"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)} // Ensure dialog closes on cancel
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmDelete}
            className="bg-red-600 text-white hover:bg-red-700"
            disabled={isDeleting}
          // Use Shadcn's default Button styling for actions
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

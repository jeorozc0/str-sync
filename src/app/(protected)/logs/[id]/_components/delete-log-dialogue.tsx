"use client";

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface DeleteLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void; // Callback for confirmation
  logName: string; // Name of the workout (template name)
  logDate: string; // Formatted date of the log
  isDeleting: boolean; // Loading state from parent
}

export function DeleteLogDialog({
  open,
  onOpenChange,
  onConfirmDelete,
  logName,
  logDate,
  isDeleting,
}: DeleteLogDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#111111] border-[#333333] text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Workout Log?</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            Are you sure you want to delete the log for{' '}
            <strong className="px-1 text-gray-200">{logName}</strong>{' '}
            from <strong className="px-1 text-gray-200">{logDate}</strong>?
            <br />
            This action permanently removes this specific log entry and its recorded sets. It cannot be undone.
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
            onClick={onConfirmDelete} // Call the provided confirm handler
            className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting ? "Deleting..." : "Delete Log"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

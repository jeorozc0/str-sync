"use client";

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
  templateName: string;
  isDeleting: boolean;
}

export function DeleteTemplateDialog({
  open,
  onOpenChange,
  onConfirmDelete,
  templateName,
  isDeleting,
}: DeleteTemplateDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#111111] border-[#333333] text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Workout Template?</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            Are you sure you want to delete the template &apos;{templateName}&apos;? This will remove the plan structure but **will not** delete any past workout logs created from it. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="bg-transparent border-[#333333] text-white hover:bg-[#2a2a2a]"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmDelete}
            className="bg-red-600 text-white hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Template"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

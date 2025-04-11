// src/app/(app)/_components/add-item-button.tsx (or wherever you place it)
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react"; // Use simple Plus icon for the main button

// Import the new choice sheet and the existing folder form sheet
import { toast } from "sonner";
import { AddItemChoiceSheet, type AddItemChoice } from "@/app/(protected)/dashboard/_components/add-item-choice-sheet";
import { ResponsiveCreateFolderSheet } from "@/app/(protected)/dashboard/_components/responsive-create-folder-dialogue";

interface AddItemButtonProps {
  userId: string;
  // Add className for styling from parent if needed
  className?: string;
}

export function AddItemButton({ userId, className }: AddItemButtonProps) {
  const router = useRouter();

  // State for the choice sheet
  const [isChoiceSheetOpen, setIsChoiceSheetOpen] = useState(false);
  // State for the folder creation form sheet
  const [isFolderFormSheetOpen, setIsFolderFormSheetOpen] = useState(false);

  // Handler for when a choice is made in the AddItemChoiceSheet
  const handleChoiceSelect = (choice: AddItemChoice) => {
    setIsChoiceSheetOpen(false); // Close the choice sheet first

    // Use a short timeout to allow the choice sheet to start closing before opening the next one
    // This can sometimes improve the perceived transition smoothness. Optional.
    setTimeout(() => {
      if (choice === 'folder') {
        setIsFolderFormSheetOpen(true); // Open the folder form sheet
      } else if (choice === 'workout') {
        router.push(`/w/create`); // Navigate to workout creation
      } else if (choice === 'ai') {
        // Handle AI choice (e.g., show a toast message)
        toast.info("AI Workout generation is coming soon!");
      }
    }, 50); // Small delay in ms
  };

  return (
    <>
      {/* The main trigger button */}
      <Button
        variant="outline" // Or your preferred variant
        size="icon" // Make it an icon button for potentially better mobile layout
        className={className} // Apply passed className
        onClick={() => setIsChoiceSheetOpen(true)} // Open the choice sheet
      >
        <Plus className="h-5 w-5" /> {/* Simple Plus Icon */}
        <span className="sr-only">Add New Item</span> {/* Accessibility */}
      </Button>

      {/* Render the choice sheet (Dialog/Drawer for Folder/Workout/AI choice) */}
      <AddItemChoiceSheet
        open={isChoiceSheetOpen}
        onOpenChange={setIsChoiceSheetOpen}
        onSelectChoice={handleChoiceSelect}
      />

      {/* Render the folder creation sheet (Dialog/Drawer for the actual form) */}
      {/* It's only opened when 'folder' is chosen */}
      <ResponsiveCreateFolderSheet
        userId={userId}
        open={isFolderFormSheetOpen}
        onOpenChange={setIsFolderFormSheetOpen}
      />
    </>
  );
}

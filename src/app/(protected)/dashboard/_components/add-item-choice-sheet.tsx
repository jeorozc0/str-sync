"use client";

import * as React from "react";
import { FolderPlus, Plus, Sparkles } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

// Define the possible choices
export type AddItemChoice = 'folder' | 'workout' | 'ai';

interface AddItemChoiceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectChoice: (choice: AddItemChoice) => void; // Callback when a choice is made
  // Trigger is now handled externally by AddFolderButton
}

export function AddItemChoiceSheet({
  open,
  onOpenChange,
  onSelectChoice,
}: AddItemChoiceSheetProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleSelect = (choice: AddItemChoice) => {
    onSelectChoice(choice); // Pass the choice up
    // No need to close here, parent (AddFolderButton) will close it
  };

  // Reusable content with large tappable buttons
  const ChoiceContent = () => (
    <div className="grid gap-3 p-4">
      <Button
        variant="outline"
        size="lg"
        className="h-auto min-h-[4rem] justify-start border-[#333] bg-[#1A1A1A] px-4 py-3 text-left text-white hover:bg-[#222]" // Adjusted styles
        onClick={() => handleSelect('folder')}
      >
        <FolderPlus className="mr-4 h-5 w-5 flex-shrink-0" /> {/* Increased margin */}
        <div>
          <p className="font-semibold">Folder</p>
          <p className="text-sm text-gray-400">Organize your workouts into folders.</p>
        </div>
      </Button>
      <Button
        variant="outline"
        size="lg"
        className="h-auto min-h-[4rem] justify-start border-[#333] bg-[#1A1A1A] px-4 py-3 text-left text-white hover:bg-[#222]" // Adjusted styles
        onClick={() => handleSelect('workout')}
      >
        <Plus className="mr-4 h-5 w-5 flex-shrink-0" /> {/* Increased margin */}
        <div>
          <p className="font-semibold">Workout</p>
          <p className="text-sm text-gray-400">Create a new workout routine.</p>
        </div>
      </Button>
      <Button
        variant="outline"
        size="lg"
        className="h-auto min-h-[4rem] justify-start border-[#333] bg-[#1A1A1A] px-4 py-3 text-left text-white hover:bg-[#222]" // Adjusted styles
        onClick={() => handleSelect('ai')}
        disabled // Keep disabled for now
      >
        <Sparkles className="mr-4 h-5 w-5 flex-shrink-0" /> {/* Increased margin */}
        <div>
          <p className="font-semibold">AI Workout <span className="text-xs font-normal text-yellow-500">(Soon)</span></p>
          <p className="text-sm text-gray-400">Generate a workout plan with AI.</p>
        </div>
      </Button>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {/* Trigger is external */}
        <DialogContent className="bg-[#111111] border-[#333333] text-white sm:max-w-md"> {/* Adjusted max width */}
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription className="text-gray-400">
              What would you like to create?
            </DialogDescription>
          </DialogHeader>
          <ChoiceContent />
          {/* Optional: Add a cancel button if needed in Dialog Footer */}
          {/* <DialogFooter className="sm:justify-start">
                        <DialogClose asChild>
                          <Button type="button" variant="secondary">Close</Button>
                        </DialogClose>
                      </DialogFooter> */}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {/* Trigger is external */}
      <DrawerContent className="bg-[#111111] border-t-[#333333] text-white">
        <DrawerHeader className="text-left">
          <DrawerTitle>Add New Item</DrawerTitle>
          <DrawerDescription className="text-gray-400">
            What would you like to create?
          </DrawerDescription>
        </DrawerHeader>
        {/* Render the choices */}
        <ChoiceContent />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline" className="border-[#444] hover:bg-[#222] text-white">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

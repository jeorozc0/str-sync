"use client";

import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  // DialogTrigger, // Trigger is handled externally
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  // DrawerTrigger, // Trigger is handled externally
} from "@/components/ui/drawer";
import { FolderCreationForm } from "./add-folder-form";
import { FolderPlus } from "lucide-react";

interface ResponsiveCreateFolderSheetProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // No need for onFolderCreate prop here, handled by the form's onSuccess
}

export function ResponsiveCreateFolderSheet({
  userId,
  open,
  onOpenChange,
}: ResponsiveCreateFolderSheetProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)"); // md breakpoint

  const handleSuccess = () => {
    onOpenChange(false); // Close sheet on successful creation
  };

  const handleCancel = () => {
    onOpenChange(false); // Close sheet on cancel
  }

  const formContent = (
    <FolderCreationForm userId={userId} onSuccess={handleSuccess} onCancel={handleCancel} />
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-[#111111] border-[#333333] text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5" />
              Create Workout Folder
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a new folder to organize your workouts. Click Create when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          {/* Render the form */}
          {formContent}
          {/* DialogFooter could be used if form didn't include buttons */}
          {/* <DialogFooter> ... </DialogFooter> */}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-[#111111] border-t-[#333333] text-white">
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            Create Workout Folder
          </DrawerTitle>
          <DrawerDescription className="text-gray-400">
            Create a new folder to organize your workouts. Tap Create when you&apos;re done.
          </DrawerDescription>
        </DrawerHeader>
        {/* Render the form, add padding */}
        <div className="px-4">
          {formContent}
        </div>
        <DrawerFooter className="pt-4"> {/* Added padding-top */}
          {/* Standard Cancel button for drawers */}
          <DrawerClose asChild>
            <Button
              variant="outline"
              className="border-[#444] hover:bg-[#222] text-white"
            >
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

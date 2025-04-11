"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { createFolder } from "@/actions/folders"; // Assuming action path
import { toast } from "sonner"; // Using sonner for feedback

interface FolderCreationFormProps extends React.ComponentProps<"form"> {
  userId: string;
  onSuccess?: () => void; // Callback on successful creation
  onCancel?: () => void;  // Callback for explicit cancel
}

export function FolderCreationForm({
  userId,
  onSuccess,
  onCancel, // Added onCancel prop
  className,
  ...props
}: FolderCreationFormProps) {
  const [folderName, setFolderName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) {
      toast.error("Folder name cannot be empty.");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await createFolder({
        name: folderName,
        description,
        userId: userId,
      });
      if (result.success) {
        toast.success("Folder created successfully!");
        setFolderName(""); // Reset form
        setDescription("");
        onSuccess?.(); // Call success callback (closes dialog/drawer)
      } else {
        console.error("Failed to create folder:", result.error);
        toast.error(
          typeof result.error === 'string'
            ? result.error
            : "Failed to create folder."
        );
      }
    } catch (error) {
      console.error("Error during folder creation:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // We remove DialogHeader/Footer here, they belong in Dialog/Drawer
    <form onSubmit={handleSubmit} className={cn("grid items-start gap-4", className)} {...props}>
      {/* Inputs remain the same */}
      <div className="grid gap-2">
        <Label htmlFor="folder-name" className="text-white">
          Folder Name
        </Label>
        <Input
          id="folder-name" // Ensure unique ID if needed elsewhere
          placeholder="e.g., Upper Body, Cardio, Mobility"
          className="bg-[#1A1A1A] border-[#333333] text-white"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          autoFocus
          required // Added required for basic validation
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="folder-description" className="text-white">
          Description (optional)
        </Label>
        <Input
          id="folder-description" // Ensure unique ID
          placeholder="Brief description of this folder"
          className="bg-[#1A1A1A] border-[#333333] text-white"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      {/* Submit button specific to the form */}
      <Button
        type="submit"
        className="mt-2 w-full bg-white text-black hover:bg-gray-200" // Added mt-2 for spacing
        disabled={!folderName.trim() || isSubmitting}
      >
        {isSubmitting ? "Creating..." : "Create Folder"}
      </Button>
      {/* Add explicit cancel button for use within the form itself if needed */}
      {/* Or rely on DialogFooter/DrawerFooter's cancel */}
      {/* {onCancel && (
                 <Button
                    type="button"
                    variant="outline"
                    className="mt-2 w-full border-[#333333] text-white"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
             )} */}
    </form>
  );
}

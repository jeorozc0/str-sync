"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Use next/navigation
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, FolderPlus, Sparkles, ChevronDown } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { ResponsiveCreateFolderSheet } from "./responsive-create-folder-dialogue";

interface AddFolderButtonProps {
  userId: string;
}

export function AddFolderButton({ userId }: AddFolderButtonProps) {
  const router = useRouter();
  // State to control the responsive sheet's visibility
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // The handleFolderCreate logic is now inside FolderCreationForm

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {/* Button style from your original component */}
          <Button className="h-9 gap-2 bg-white text-black hover:bg-gray-200"> {/* Adjusted padding */}
            Add New... <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="border-[#333333] bg-[#111111] text-white"
        >
          {/* Updated onSelect to open the *sheet* */}
          <DropdownMenuItem onSelect={() => setIsSheetOpen(true)}>
            <FolderPlus className="mr-2 h-4 w-4" />
            Folder
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => router.push(`/w/create`)}>
            <Plus className="mr-2 h-4 w-4" />
            Workout
          </DropdownMenuItem>
          <DropdownMenuItem disabled> {/* Example: Disabled AI option */}
            <Sparkles className="mr-2 h-4 w-4" />
            AI Workout (Soon)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Render the responsive sheet, controlled by state */}
      <ResponsiveCreateFolderSheet
        userId={userId}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />

      <Toaster richColors theme="dark" />
    </>
  );
}

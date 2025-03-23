"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, FolderPlus, Sparkles, ChevronDown } from "lucide-react"
import { CreateFolderDialog } from "./create-folder-dialogue"
import { createFolder } from "@/lib/actions/folders"
import { useRouter } from "next/navigation"

interface AddFolderButtonProps {
  userId: string
}

export function AddFolderButton({ userId }: AddFolderButtonProps) {
  const router = useRouter()
  const [folderDialogOpen, setFolderDialogOpen] = useState(false)
  console.log(userId)
  const handleFolderCreate = async (folderName: string, description?: string) => {
    const result = await createFolder({
      name: folderName,
      description,
      userId: userId
    });

    if (result.success) {
      // Folder was created successfully
      // No need to call router.refresh() since we revalidate in the action
      setFolderDialogOpen(false);
    } else {
      // Handle error
      console.error(result.error);
      // Optionally show error to user
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-white text-black hover:bg-gray-200 gap-2 h-9">
            Add New... <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-[#111111] border-[#333333] text-white">
          <DropdownMenuItem onSelect={() => setFolderDialogOpen(true)}>
            <FolderPlus className="h-4 w-4 mr-2" />
            Folder
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => router.push(`/w/create`)}>
            <Plus className="h-4 w-4 mr-2" />
            Workout
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Sparkles className="h-4 w-4 mr-2" />
            AI Workout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu >

      <CreateFolderDialog
        open={folderDialogOpen}
        onOpenChange={setFolderDialogOpen}
        onFolderCreate={handleFolderCreate}
      />
    </>
  )
}

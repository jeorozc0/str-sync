"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FolderPlus } from "lucide-react"

interface CreateFolderDialogProps {
  onFolderCreate?: (folderName: string, description?: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateFolderDialog({ onFolderCreate, open, onOpenChange }: CreateFolderDialogProps) {
  const [folderName, setFolderName] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!folderName.trim()) return

    setIsSubmitting(true)

    if (onFolderCreate) {
      onFolderCreate(folderName, description)
    }
    // Reset the inputs
    setFolderName("")
    setDescription("")
    setIsSubmitting(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111111] border-[#333333] text-white sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5" />
              Create Workout Folder
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a new folder to organize your workouts.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-white">
                Folder Name
              </Label>
              <Input
                id="name"
                placeholder="e.g., Upper Body, Cardio, Mobility"
                className="bg-[#1A1A1A] border-[#333333] text-white"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-white">
                Description (optional)
              </Label>
              <Input
                id="description"
                placeholder="Brief description of this folder"
                className="bg-[#1A1A1A] border-[#333333] text-white"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-[#333333] text-white"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-white text-black hover:bg-gray-200"
              disabled={!folderName.trim() || isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Folder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


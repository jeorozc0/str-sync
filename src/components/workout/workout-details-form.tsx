"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useWorkoutStore from "@/stores/workout-store";

interface WorkoutDetailsFormProps {
  folders?: { id: string; name: string }[];
  folderId?: string;
}

// Special value to represent "no folder" selection
const NO_FOLDER_VALUE = "no-folder";

export default function WorkoutDetailsForm({
  folders = [],
  folderId,
}: WorkoutDetailsFormProps) {
  const router = useRouter();

  const {
    currentWorkout,
    setName,
    setDescription,
    setFolderId,
    saveWorkout,
    error,
  } = useWorkoutStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const workoutId = await saveWorkout();
    if (workoutId) {
      // Navigate to the newly created workout
      router.push(`/workouts/${workoutId}`);
    }
  };

  // Helper function to convert between null and NO_FOLDER_VALUE
  const getSelectValue = () => {
    return folderId === null ? NO_FOLDER_VALUE : (folderId ?? NO_FOLDER_VALUE);
  };

  // Handle select value change with special case for "no folder"
  const handleFolderChange = (value: string) => {
    setFolderId(value === NO_FOLDER_VALUE ? null : value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-[#333333] bg-[#111111]">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="workout-name">Workout Name</Label>
              <Input
                id="workout-name"
                placeholder="e.g., Upper Body Power"
                className="border-[#333333] bg-[#1A1A1A]"
                value={currentWorkout.name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="folder">Save to Folder</Label>
              <Select
                value={getSelectValue()}
                onValueChange={handleFolderChange}
              >
                <SelectTrigger className="border-[#333333] bg-[#1A1A1A]">
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent className="border-[#333333] bg-[#111111] text-white">
                  <SelectItem value={NO_FOLDER_VALUE}>No folder</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Description (Optional)</Label>
              <textarea
                id="notes"
                rows={3}
                placeholder="Add any notes about this workout..."
                className="w-full resize-none rounded-md border border-[#333333] bg-[#1A1A1A] p-3 focus:outline-none focus:ring-1 focus:ring-white"
                value={currentWorkout.description ?? ""}
                onChange={(e) => setDescription(e.target.value || null)}
              />
            </div>
            {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

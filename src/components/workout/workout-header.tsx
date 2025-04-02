"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Edit, Trash2 } from "lucide-react";
import { type Workout } from "@/types/workout";

interface WorkoutHeaderProps {
  workout: Workout;
  onEditClick: () => void; // Add handler for edit action
  onDeleteClick: () => void;
  isDeleting: boolean;
}

export function WorkoutHeader({ workout, onEditClick, onDeleteClick, isDeleting }: WorkoutHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-3">
        <Link href={`/folders/${workout.folderId}`} aria-label="Back to folder">
          <Button variant="outline" size="icon" className="h-8 w-8 border-[#333333]">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">{workout.name}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400 mt-1">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{workout.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{workout.duration}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="border-[#333333] gap-2"
          onClick={onEditClick}
        >
          <Edit className="h-4 w-4" />
          Edit
        </Button>
        <Button
          variant="outline"
          className="border-[#333333] text-red-500 hover:bg-red-900/20 hover:text-red-400"
          onClick={onDeleteClick}
          disabled={isDeleting}
          aria-label="Delete workout"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

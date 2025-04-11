"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type PlannedExercise } from "@/types/workout";
import { Hash, Repeat, Target, Timer, NotebookText } from "lucide-react"; // Target instead of Activity

interface TemplateExerciseCardProps {
  exercise: PlannedExercise;
  index: number;
}

export function TemplateExerciseCard({ exercise, index }: TemplateExerciseCardProps) {
  return (
    <Card className="bg-[#111111] border-[#333333] overflow-hidden transition-colors duration-150 hover:bg-[#1a1a1a]">
      <CardContent className="p-4">
        {/* Exercise Name and Badges */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3">
          <div className="mb-2 sm:mb-0">
            <h4 className="font-medium text-base leading-tight flex items-center">
              <span className="text-primary/70 font-semibold mr-2 text-sm">#{index + 1}</span> {/* Order Number */}
              {exercise.name}
            </h4>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {exercise.category && <Badge variant="secondary" className="text-xs">{exercise.category}</Badge>}
              {exercise.equipment && <Badge variant="outline" className="text-xs bg-[#1A1A1A] border-[#333333]">{exercise.equipment}</Badge>}
            </div>
          </div>
          {/* Potential Actions (e.g., Quick Edit icon within edit mode) could go here */}
        </div>

        {/* Target Stats Grid - Consistent with Log Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 text-sm mb-3">
          <div title="Target Sets">
            <p className="text-gray-400 flex items-center gap-1"><Hash className="h-3.5 w-3.5" /> Sets</p>
            <p className="font-medium">{exercise.targetSets}</p>
          </div>
          <div title="Target Reps">
            <p className="text-gray-400 flex items-center gap-1"><Repeat className="h-3.5 w-3.5" /> Reps</p>
            <p className="font-medium">{exercise.targetReps}</p> {/* Display range/number */}
          </div>
          {exercise.targetRir !== undefined && (
            <div title="Target Reps In Reserve (RIR)">
              <p className="text-gray-400 flex items-center gap-1"><Target className="h-3.5 w-3.5" /> RIR</p>
              <p className="font-medium">{exercise.targetRir}</p>
            </div>
          )}
          <div title="Target Rest Time">
            <p className="text-gray-400 flex items-center gap-1"><Timer className="h-3.5 w-3.5" /> Rest</p>
            <p className="font-medium">{exercise.targetRestTime}s</p>
          </div>
        </div>

        {/* Exercise Notes */}
        {exercise.notes && (
          <div className="mt-3 pt-3 border-t border-[#333333]/70 flex items-start gap-2 text-xs text-muted-foreground">
            <NotebookText className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-gray-500" />
            <p className="italic">{exercise.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

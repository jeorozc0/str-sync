"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Exercise } from "@/types/workout";
import { getRIRDescription } from "@/utils/workout-utils";
import { Hash, Repeat, Activity, Timer } from "lucide-react"; // Import relevant icons

interface ExerciseCardProps {
  exercise: Exercise;
}

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  return (
    // Add a subtle hover effect
    <Card className="bg-[#111111] border-[#333333] hover:bg-[#1A1A1A] transition-colors duration-150">
      <CardContent className="p-4">
        {/* Top section: Name and Badges */}
        <div className="mb-4"> {/* Increased margin-bottom */}
          <h3 className="font-semibold text-lg mb-1.5">{exercise.name}</h3> {/* Larger, bolder name */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              {exercise.category}
            </Badge>
            {exercise.equipment && (
              <Badge variant="outline" className="text-xs bg-[#1A1A1A] border-[#333333]">
                {exercise.equipment}
              </Badge>
            )}
            {/* Potential Enhancement: Add a 'PR' badge if applicable */}
            {/* {exercise.isPR && <Badge variant="destructive" className="text-xs">PR</Badge>} */}
          </div>
        </div>

        {/* Stats Section: Use flexbox for better flow and icons */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm"> {/* Adjusted gaps */}
          {/* Sets */}
          <div className="flex items-center gap-1.5">
            <Hash className="h-3.5 w-3.5 text-muted-foreground" /> {/* Icon for Sets */}
            <span className="text-muted-foreground">Sets:</span>
            <span className="font-medium text-foreground">{exercise.sets}</span>
          </div>

          {/* Reps */}
          <div className="flex items-center gap-1.5">
            <Repeat className="h-3.5 w-3.5 text-muted-foreground" /> {/* Icon for Reps */}
            <span className="text-muted-foreground">Reps:</span>
            <span className="font-medium text-foreground">{exercise.reps}</span>
          </div>

          {/* Intensity (RIR) */}
          <div className="flex items-center gap-1.5">
            {/* Using Activity icon for intensity/effort */}
            <Activity className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">RIR:</span>
            <span className="font-medium text-foreground">{exercise.rir}</span>
            {/* Optional: Show full description in a tooltip or parentheses */}
            <span className="text-xs text-muted-foreground/80 ml-1">({getRIRDescription(exercise.rir).split(' ')[0]})</span>
          </div>

          {/* Rest Time */}
          <div className="flex items-center gap-1.5">
            <Timer className="h-3.5 w-3.5 text-muted-foreground" /> {/* Icon for Rest */}
            <span className="text-muted-foreground">Rest:</span>
            <span className="font-medium text-foreground">{exercise.restTime}s</span>
          </div>
        </div>

        {/* Potential Future Section: Detailed Set Tracking */}
        {/* <div className="mt-4 pt-4 border-t border-border/50">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Set Details</h4>
             <ul className="space-y-1 text-xs list-disc list-inside">
                <li>Set 1: 8 reps @ 100kg (RIR 2)</li>
                <li>Set 2: 8 reps @ 100kg (RIR 2)</li>
                <li>Set 3: 7 reps @ 100kg (RIR 1)</li>
             </ul>
        </div> */}
      </CardContent>
    </Card>
  );
}

// src/components/logging/workout-timer-footer.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useLiveLoggingStore } from "@/stores/logs-store"; // Correct path for the store hook
import { TimerIcon, X as SkipIcon, Flag } from "lucide-react";
// Removed useEffect, useState as they are no longer needed here

interface WorkoutTimerFooterProps {
  elapsedTime: string; // Receive formatted elapsed time as prop
  onFinish: () => void;
  isFinishing: boolean;
}

export function WorkoutTimerFooter({ elapsedTime, onFinish, isFinishing }: WorkoutTimerFooterProps) {
  // --- Select state slices individually ---
  const isResting = useLiveLoggingStore(state => state.isResting);
  const restTimerSeconds = useLiveLoggingStore(state => state.restTimerSeconds);
  const restTimerDuration = useLiveLoggingStore(state => state.restTimerDuration);
  const clearRestTimer = useLiveLoggingStore(state => state.clearRestTimer); // Select action separately
  // -----------------------------------------

  // Format rest timer display
  const restMinutes = Math.floor(restTimerSeconds / 60);
  const restSeconds = restTimerSeconds % 60;
  const restDisplayTime = `${restMinutes}:${restSeconds < 10 ? '0' : ''}${restSeconds}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-800 bg-black/80 px-4 py-3 backdrop-blur-sm">
      <div className="container mx-auto flex max-w-3xl items-center justify-between gap-4">
        {/* Elapsed Time */}
        <div className="text-sm w-24 text-left tabular-nums">
          <span className="text-neutral-400">Elapsed: </span>
          <span className="font-mono font-medium text-neutral-200">{elapsedTime}</span>
        </div>

        {/* Rest Timer (Conditional) */}
        {isResting && restTimerDuration > 0 ? (
          <div className="flex min-w-[140px] items-center justify-center gap-2 rounded-md bg-blue-900/40 px-3 py-1">
            <TimerIcon className="h-4 w-4 text-blue-300 flex-shrink-0" />
            <span className="font-mono text-lg font-semibold text-blue-200">{restDisplayTime}</span>
            {/* Use the selected clearRestTimer action */}
            <Button variant="ghost" size="sm" className="ml-1 h-6 px-1 text-xs text-neutral-400 hover:text-white" onClick={clearRestTimer}>
              <SkipIcon className="h-3 w-3 mr-1" /> Skip
            </Button>
          </div>
        ) : (
          <div className="h-8 min-w-[140px]"></div> // Placeholder
        )}

        {/* Finish Button */}
        <div className="w-auto flex justify-end">
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 h-9 px-4"
            onClick={onFinish}
            disabled={isFinishing}
          >
            <Flag className="mr-2 h-4 w-4" />
            {isFinishing ? 'Finishing...' : 'Finish Workout'}
          </Button>
        </div>
      </div>
    </div>
  );
}

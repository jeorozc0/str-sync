"use client";

import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Trash2,
  Plus,
  Save,
  Check,
  Loader2,
  SkipForward,
  MessageSquare,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { type WorkoutTemplateWithExercises } from '../page';
import { saveWorkoutSession, type SessionData } from '@/actions/logging'; // Import action and its input type
import { Badge } from "@/components/ui/badge";

// --- Internal State Types ---
type ClientSetData = {
  setNumber: number;
  weight: string;
  reps: string;
  rpe: string;
  isComplete: boolean;
};

type ClientLogExerciseEntry = {
  templateWorkoutExerciseId: string;
  order: number;
  name: string;
  templateNotes: string | null;
  templateSets: number;
  templateReps: string;
  templateWeight: number | null;
  setsData: ClientSetData[];
  isExerciseComplete: boolean;
  currentNotes: string;
};

// --- Props ---
interface LiveLoggingClientProps {
  workoutTemplate: WorkoutTemplateWithExercises | null | undefined;
  userId: string;
}

// --- Constants ---
const DEFAULT_REST_SECONDS = 60;

// --- Component ---
export default function LiveLoggingClient({ workoutTemplate, userId }: LiveLoggingClientProps) {
  const router = useRouter();

  // --- Core State ---
  const [liveExercises, setLiveExercises] = useState<Record<string, ClientLogExerciseEntry>>({});
  const [orderedExerciseIds, setOrderedExerciseIds] = useState<string[]>([]);

  // --- Other State ---
  const [startedAt] = useState(() => new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Rest Timer State ---
  const [isResting, setIsResting] = useState(false);
  const [restEndTime, setRestEndTime] = useState<number | null>(null);
  const [displayRestTime, setDisplayRestTime] = useState("00:00");
  const [nextExerciseName, setNextExerciseName] = useState<string | null>(null);
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- Refs ---
  const elapsedIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);

  // --- Initialization Effect ---
  useEffect(() => {
    if (!workoutTemplate || isInitialized.current) return;
    console.log("Initializing Live Logging Client with template:", workoutTemplate);
    const initialLiveState: Record<string, ClientLogExerciseEntry> = {};
    const orderedIds: string[] = [];
    workoutTemplate.exercises.forEach((plannedEx) => {
      const templateWorkoutExerciseId = plannedEx.id;
      orderedIds.push(templateWorkoutExerciseId);
      const initialSetsData: ClientSetData[] = [];
      for (let i = 1; i <= plannedEx.sets; i++) {
        initialSetsData.push({
          setNumber: i,
          weight: plannedEx.weight?.toString() ?? "",
          reps: /^\d+$/.test(plannedEx.reps) ? plannedEx.reps : "",
          rpe: "",
          isComplete: false,
        });
      }
      initialLiveState[templateWorkoutExerciseId] = {
        templateWorkoutExerciseId: templateWorkoutExerciseId,
        order: plannedEx.order,
        name: plannedEx.exercise?.name ?? "Unknown Exercise",
        templateNotes: plannedEx.notes,
        templateSets: plannedEx.sets,
        templateReps: plannedEx.reps,
        templateWeight: plannedEx.weight,
        setsData: initialSetsData,
        isExerciseComplete: false,
        currentNotes: "",
      };
    });
    setLiveExercises(initialLiveState);
    setOrderedExerciseIds(orderedIds);
    isInitialized.current = true;
    setElapsedTime(0);
    if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
    elapsedIntervalRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startedAt.getTime()) / 1000));
    }, 1000);
    return () => {
      if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, [workoutTemplate, startedAt]);

  // --- Rest Timer Controls ---
  const stopRestTimer = useCallback((notify = false) => {
    console.log("Stopping rest timer");
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    restIntervalRef.current = null;
    setIsResting(false);
    setRestEndTime(null);
    setNextExerciseName(null);
    setDisplayRestTime("00:00");
    if (notify) toast.info("Rest finished!", { duration: 2000 });
  }, []); // Stable reference

  const startRestTimer = useCallback((durationSeconds: number, nextExName: string | null) => {
    console.log(`Starting rest: ${durationSeconds}s, Next: ${nextExName}`);
    const endTime = Date.now() + durationSeconds * 1000;
    setRestEndTime(endTime);
    setNextExerciseName(nextExName);
    setIsResting(true); // This triggers the useEffect below
  }, []); // Stable reference

  // --- Rest Timer Effect ---
  useEffect(() => {
    const updateTimerDisplay = () => {
      if (!restEndTime) return;
      const now = Date.now();
      const remainingMs = restEndTime - now;
      if (remainingMs <= 0) {
        stopRestTimer(true); // Use memoized version
      } else {
        const remainingSeconds = Math.ceil(remainingMs / 1000);
        const mins = Math.floor(remainingSeconds / 60);
        const secs = remainingSeconds % 60;
        setDisplayRestTime(`${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`);
      }
    };
    if (isResting && restEndTime) {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
      updateTimerDisplay(); // Initial display
      restIntervalRef.current = setInterval(updateTimerDisplay, 500);
    } else {
      // Clear interval if not resting or no end time
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
        restIntervalRef.current = null;
      }
    }
    // Cleanup function
    return () => { if (restIntervalRef.current) clearInterval(restIntervalRef.current); };
  }, [isResting, restEndTime, stopRestTimer]); // Correct dependencies

  // --- Format Time ---
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // --- Event Handlers ---
  const handleSetInputChange = (
    templateWorkoutExerciseId: string,
    setNumber: number,
    field: 'weight' | 'reps' | 'rpe',
    value: string
  ) => {
    let processedValue = value;
    if (field === 'weight' || field === 'rpe') {
      processedValue = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    } else if (field === 'reps') {
      processedValue = value.replace(/[^0-9]/g, '');
    }
    setLiveExercises(prev => {
      const exercise = prev[templateWorkoutExerciseId];
      if (!exercise) return prev;
      const updatedSetsData = exercise.setsData.map(set =>
        set.setNumber === setNumber ? { ...set, [field]: processedValue } : set
      );
      return { ...prev, [templateWorkoutExerciseId]: { ...exercise, setsData: updatedSetsData } };
    });
  };

  const handleNotesChange = (templateWorkoutExerciseId: string, value: string) => {
    setLiveExercises(prev => {
      if (!prev[templateWorkoutExerciseId]) return prev;
      return { ...prev, [templateWorkoutExerciseId]: { ...prev[templateWorkoutExerciseId], currentNotes: value } };
    });
  };


  const toggleSetCompletion = useCallback((templateWorkoutExerciseId: string, setNumberToToggle: number) => {
    let shouldStartRest = false;
    let determinedNextExName: string | null = null;
    const wasResting = isResting;

    // --- Determine action and next state info BEFORE updating state ---
    let isCompletingAction = false;
    // isLastPlannedSet is no longer needed for the start decision, but keep for potential stop logic clarity
    let isLastPlannedSet = false;
    const currentExerciseState = liveExercises[templateWorkoutExerciseId];

    if (currentExerciseState) {
      const currentSetState = currentExerciseState.setsData.find(s => s.setNumber === setNumberToToggle);
      if (currentSetState) {
        isCompletingAction = !currentSetState.isComplete;
        isLastPlannedSet = setNumberToToggle >= currentExerciseState.templateSets; // Still calculate if needed elsewhere

        // *** MODIFIED CONDITION: Start rest if completing *any* set ***
        if (isCompletingAction) {
          shouldStartRest = true; // Always try to start rest when completing a set
          const currentExerciseIndex = orderedExerciseIds.findIndex(id => id === templateWorkoutExerciseId);
          // Find the next exercise in the list, regardless of current set number
          if (currentExerciseIndex !== -1 && currentExerciseIndex + 1 < orderedExerciseIds.length) {
            const nextEntryId = orderedExerciseIds[currentExerciseIndex + 1];
            // Access name safely from the current liveExercises state
            determinedNextExName = liveExercises[nextEntryId]?.name ?? null;
          } else {
            // If it's the last exercise, there's no "next"
            determinedNextExName = null;
          }
        }
      } else {
        console.error(`Set ${setNumberToToggle} not found in current state for exercise ${templateWorkoutExerciseId}`);
        return;
      }
    } else {
      console.error(`Exercise ${templateWorkoutExerciseId} not found in current state`);
      return;
    }
    // --- End determination ---


    // --- Update State ---
    setLiveExercises(prev => {
      const exercise = prev[templateWorkoutExerciseId];
      if (!exercise) return prev;

      const updatedSetsData = exercise.setsData.map(set => {
        if (set.setNumber === setNumberToToggle) {
          return { ...set, isComplete: isCompletingAction };
        }
        return set;
      });

      const completedPlannedSetsCount = updatedSetsData.filter(s => s.isComplete && s.setNumber <= exercise.templateSets).length;
      const isExerciseNowComplete = completedPlannedSetsCount >= exercise.templateSets;

      return {
        ...prev,
        [templateWorkoutExerciseId]: {
          ...exercise,
          setsData: updatedSetsData,
          isExerciseComplete: isExerciseNowComplete
        }
      };
    });
    // --- End Update State ---


    // --- Manage Rest Timer AFTER state update is queued ---
    // Stop only if un-completing a set while resting
    const shouldStopRest = !isCompletingAction && wasResting;

    if (shouldStartRest) {
      console.log("Condition met: Starting rest timer...");
      startRestTimer(DEFAULT_REST_SECONDS, determinedNextExName);
    } else if (shouldStopRest) {
      console.log("Condition met: Stopping rest timer (un-completing set)...");
      stopRestTimer();
    }
    // Note: The timer will now continue even after the last planned set is completed.
    // It will stop naturally when time runs out, if skipped, or if finishWorkout is called.
    // --- End Manage Rest Timer ---

  }, [isResting, orderedExerciseIds, startRestTimer, stopRestTimer, liveExercises]);


  const addSetRow = useCallback((templateWorkoutExerciseId: string) => {
    let nextSetNumber = 0; // To use in toast
    setLiveExercises(prev => {
      const exercise = prev[templateWorkoutExerciseId];
      if (!exercise) return prev;
      nextSetNumber = exercise.setsData.length + 1;
      const lastSet = exercise.setsData[exercise.setsData.length - 1];
      const newSet: ClientSetData = {
        setNumber: nextSetNumber,
        weight: lastSet?.weight ?? exercise.templateWeight?.toString() ?? "",
        reps: lastSet?.reps ?? (/^\d+$/.test(exercise.templateReps) ? exercise.templateReps : ""),
        rpe: lastSet?.rpe ?? "",
        isComplete: false,
      };
      return { ...prev, [templateWorkoutExerciseId]: { ...exercise, setsData: [...exercise.setsData, newSet], isExerciseComplete: false } };
    });
    // Show toast after state update is queued
    toast.info(`Added Set ${nextSetNumber}`);
  }, []); // Removed liveExercises dependency

  const deleteSetRow = useCallback((templateWorkoutExerciseId: string, setNumberToDelete: number) => {
    setLiveExercises(prev => {
      const exercise = prev[templateWorkoutExerciseId];
      if (!exercise) return prev;
      const updatedSetsData = exercise.setsData
        .filter(set => set.setNumber !== setNumberToDelete)
        .map((set, index) => ({ ...set, setNumber: index + 1 }));
      const completedPlannedSetsCount = updatedSetsData.filter(s => s.isComplete && s.setNumber <= exercise.templateSets).length;
      const isExerciseNowComplete = completedPlannedSetsCount >= exercise.templateSets;
      return { ...prev, [templateWorkoutExerciseId]: { ...exercise, setsData: updatedSetsData, isExerciseComplete: isExerciseNowComplete } };
    });
  }, []);

  // --- Finish Workout (Calls Server Action) ---
  // --- Finish Workout (Calls Server Action) ---
  const finishWorkout = async () => {
    if (!workoutTemplate) {
      toast.error("Workout template data is missing.");
      return;
    }
    setIsFinishing(true);
    setError(null);
    if (isResting) stopRestTimer();

    const finalDuration = Math.floor((Date.now() - startedAt.getTime()) / 1000);

    // Prepare data payload, filtering only *completed* sets with VALID data
    const sessionDataExercises = Object.values(liveExercises)
      .map(entry => {
        // Filter and map completed sets, ensuring correct types and validation
        const completedSets = entry.setsData
          .filter(set => set.isComplete) // Only completed sets
          .map(set => {
            // --- Perform conversions and validation ---
            const repsStr = set.reps.trim();
            const weightStr = set.weight.trim();
            const rpeStr = set.rpe.trim();
            const parsedRpe = rpeStr === "" ? null : parseFloat(rpeStr);

            const reps = repsStr === "" ? null : parseInt(repsStr, 10);
            const weight = weightStr === "" ? null : parseFloat(weightStr);
            const rpe = parsedRpe === null ? null : Math.round(parsedRpe);

            // --- Validation Checks ---
            // Reps must be a positive integer
            if (reps === null || isNaN(reps) || reps <= 0) {
              console.warn(`Invalid reps value "${set.reps}" for set ${set.setNumber} in exercise ${entry.name}. Skipping set.`);
              return null; // Mark set as invalid
            }
            // Weight must be a non-negative number if present
            if (weight !== null && (isNaN(weight) || weight < 0)) {
              console.warn(`Invalid weight value "${set.weight}" for set ${set.setNumber} in exercise ${entry.name}. Skipping set.`);
              return null; // Mark set as invalid
            }
            // RPE must be between 0-10 if present
            if (rpe !== null && (isNaN(rpe) || rpe < 0 || rpe > 10)) {
              console.warn(`Invalid RPE value "${set.rpe}" for set ${set.setNumber} in exercise ${entry.name}. Skipping set.`);
              return null;
            }

            // Return valid set data matching server schema expectation
            return {
              setNumber: set.setNumber,
              weight: weight, // Already number | null
              reps: reps,     // Already positive integer
              rpe: rpe,       // Already number (0-10) | null
            };
          })
          // Filter out any sets marked as invalid (null) during mapping
          .filter((set): set is { setNumber: number; weight: number | null; reps: number; rpe: number | null } => set !== null);

        // Return exercise entry only if it has valid completed sets
        if (completedSets.length > 0) {
          return {
            templateWorkoutExerciseId: entry.templateWorkoutExerciseId,
            notes: entry.currentNotes || null,
            sets: completedSets,
          };
        }
        return null; // Exclude exercise if it has no valid completed sets
      })
      // Filter out exercises that ended up with no valid sets
      .filter((ex): ex is { templateWorkoutExerciseId: string; notes: string | null; sets: Array<{ setNumber: number; weight: number | null; reps: number; rpe: number | null }> } => ex !== null);


    // Final payload structure matching SessionData type expected by action
    const sessionData: SessionData = {
      userId: userId,
      workoutId: workoutTemplate.id,
      startedAt: startedAt,
      completedAt: new Date(),
      duration: finalDuration >= 0 ? finalDuration : 0, // Ensure duration is non-negative
      notes: null, // Add state for overall notes if needed
      exercises: sessionDataExercises,
    };

    // --- Pre-submission Validation ---
    if (sessionData.exercises.length === 0) {
      toast.error("No valid completed sets found. Cannot finish workout.");
      console.warn("Attempted to finish workout with no valid completed sets.", liveExercises);
      setIsFinishing(false);
      return;
    }

    // --- Debugging: Log the exact data being sent ---
    console.log("Sending session data to server action:", JSON.stringify(sessionData, null, 2));
    // -------------------------------------------------

    try {
      const result = await saveWorkoutSession(sessionData); // Call server action

      if (result.success && result.logId) {
        toast.success("Workout session saved successfully!");
        router.push(`/logs/${result.logId}`);
      } else if (!result.success) {
        // Use the specific error from the server action if available
        const serverError = result.error ?? "Failed to save workout session.";
        throw new Error(serverError);
      } else {
        throw new Error("Save action succeeded but returned no log ID.");
      }
    } catch (err) {
      console.error("Error finishing workout:", err);
      const errorMsg = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMsg); // Display error in UI if needed
      toast.error(`Save failed: ${errorMsg}`);
    } finally {
      setIsFinishing(false);
    }
  };

  // --- Render Logic ---
  if (!isInitialized.current || !workoutTemplate) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#888]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans">
      {/* Sticky stats bar */}
      <div className="sticky top-0 z-20 bg-black border-b border-[#333] px-4 py-2.5">
        <div className="container mx-auto max-w-3xl flex justify-between items-center">
          {/* Stats */}
          <div className="flex items-center space-x-4 sm:space-x-5">
            <div className="flex items-center" title="Elapsed Time">
              <Clock className="h-4 w-4 mr-1.5 text-[#888]" />
              <span className="text-sm font-mono tabular-nums text-white">
                {formatTime(elapsedTime)}
              </span>
            </div>
            <div className="hidden sm:flex items-center" title="Sets Completed">
              <span className="text-sm font-mono tabular-nums text-white">
                {Object.values(liveExercises).reduce((sum, ex) => sum + ex.setsData.filter(s => s.isComplete).length, 0)}
              </span>
              <span className="ml-1.5 text-xs text-[#888]">sets complete</span>
            </div>
          </div>
          {/* Finish Button */}
          <Button
            onClick={finishWorkout}
            size="sm"
            className="bg-white text-black hover:bg-[#f0f0f0] rounded-md h-8 px-3 sm:px-4 text-sm font-medium"
            disabled={isFinishing}
          >
            {isFinishing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="flex items-center">
                <Save className="h-3.5 w-3.5 mr-1 sm:mr-1.5" />
                Finish
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Workout content */}
      <div className="flex-1 container mx-auto max-w-3xl px-2 sm:px-4 py-6 sm:py-8 space-y-4 pb-24">
        {error && (
          <div className="p-4 mb-4 text-center text-sm text-red-500 border border-red-800 bg-red-900/20 rounded-md">
            {error}
          </div>
        )}

        {orderedExerciseIds.map((templateWorkoutExerciseId) => {
          const entry = liveExercises[templateWorkoutExerciseId];
          if (!entry) return null;

          return (
            <Card
              key={templateWorkoutExerciseId}
              className={cn(
                "border border-[#333] bg-black text-white rounded-lg overflow-hidden",
                entry.isExerciseComplete && "text-neutral-400",
              )}
            >
              {/* Exercise Header */}
              <div className="p-3 sm:p-4 border-b border-[#333] flex items-center justify-between gap-2">
                <h2 className="text-base font-medium text-white truncate mr-2">{entry.name}</h2>
                <Badge variant="secondary" className="text-xs bg-[#111] border border-[#333] text-[#aaa] flex-shrink-0 whitespace-nowrap">
                  Plan: {entry.templateSets}x{entry.templateReps}
                  {entry.templateWeight !== null ? ` @${entry.templateWeight}lbs` : ''}
                </Badge>
              </div>

              {/* Sets Display & Input */}
              <div className="divide-y divide-[#333]">
                {entry.setsData?.map((set) => ( // Add safe access check
                  <div
                    key={set.setNumber}
                    className={cn(
                      "p-3 sm:p-4 grid grid-cols-[auto_1fr_1fr_0.8fr_auto] gap-2 items-center",
                      set.isComplete && "bg-[#0a0a0a]",
                    )}
                  >
                    {/* Set Number */}
                    <div className="text-[#888] font-mono text-sm w-5 sm:w-6 text-center flex-shrink-0">{set.setNumber}</div>
                    {/* Weight Input */}
                    <div className="flex items-center">
                      <Input type="number" inputMode="decimal" min="0" value={set.weight} onChange={(e) => handleSetInputChange(templateWorkoutExerciseId, set.setNumber, 'weight', e.target.value)} className="h-10 px-2 w-full text-center border-[#333] bg-[#111] text-white rounded-md focus:border-white focus:ring-1 focus:ring-white disabled:opacity-60" placeholder="--" disabled={set.isComplete} />
                      <span className="text-[10px] sm:text-xs text-[#666] ml-1.5">LBS</span>
                    </div>
                    {/* Reps Input */}
                    <div className="flex items-center">
                      <Input type="number" inputMode="numeric" min="0" value={set.reps} onChange={(e) => handleSetInputChange(templateWorkoutExerciseId, set.setNumber, 'reps', e.target.value)} className="h-10 px-2 w-full text-center border-[#333] bg-[#111] text-white rounded-md focus:border-white focus:ring-1 focus:ring-white disabled:opacity-60" placeholder="--" disabled={set.isComplete} />
                      <span className="text-[10px] sm:text-xs text-[#666] ml-1.5">REPS</span>
                    </div>
                    {/* RPE Input */}
                    <div className="flex items-center">
                      <Input type="number" inputMode="decimal" min="0" max="10" step="0.5" value={set.rpe} onChange={(e) => handleSetInputChange(templateWorkoutExerciseId, set.setNumber, 'rpe', e.target.value)} className="h-10 px-2 w-full text-center border-[#333] bg-[#111] text-white rounded-md focus:border-white focus:ring-1 focus:ring-white disabled:opacity-60" placeholder="--" disabled={set.isComplete} />
                      <span className="text-[10px] sm:text-xs text-[#666] ml-1.5">RPE</span>
                    </div>
                    {/* Set Actions */}
                    <div className="flex flex-col sm:flex-row items-center gap-1 sm:space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#666] hover:text-red-500 hover:bg-[#111]"
                        onClick={() => deleteSetRow(templateWorkoutExerciseId, set.setNumber)}
                        title="Delete Set Row"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-9 w-9 sm:h-8 sm:w-8 rounded-full flex-shrink-0 border",
                          set.isComplete
                            ? "bg-white border-white text-black hover:bg-[#f0f0f0]"
                            : "bg-transparent border-[#333] text-[#888] hover:border-[#555] hover:text-white",
                        )}
                        onClick={() => toggleSetCompletion(templateWorkoutExerciseId, set.setNumber)}
                        title={set.isComplete ? "Mark as Incomplete" : "Mark as Complete"}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add set button */}
              <Button
                variant="ghost"
                className="w-full py-3 h-auto rounded-none text-[#888] hover:text-white hover:bg-[#111] flex items-center justify-center border-t border-[#333]"
                onClick={() => addSetRow(templateWorkoutExerciseId)}
              >
                <Plus className="h-4 w-4 mr-2" />
                <span>Add Set</span>
              </Button>

              {/* Exercise Notes Section */}
              <div className="border-t border-[#333] p-3 sm:p-4 space-y-3">
                {entry.templateNotes && (
                  <div className="text-xs text-[#888]">
                    <span className="font-medium">Template Notes:</span> {entry.templateNotes}
                  </div>
                )}
                <div>
                  <label htmlFor={`notes-${templateWorkoutExerciseId}`} className="flex items-center text-sm font-medium text-[#888] mb-2">
                    <MessageSquare className="h-4 w-4 mr-2" /> Session Notes
                  </label>
                  <Textarea
                    id={`notes-${templateWorkoutExerciseId}`}
                    value={entry.currentNotes}
                    onChange={(e) => handleNotesChange(templateWorkoutExerciseId, e.target.value)}
                    placeholder="Add session notes..."
                    className="w-full bg-[#111] border-[#333] rounded-md text-sm min-h-[60px] focus:border-white focus:ring-1 focus:ring-white"
                    rows={2}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* --- Rest Timer Notification Bar --- */}
      <div
        className={cn(
          "fixed bottom-4 left-1/2 -translate-x-1/2 z-30",
          "w-[calc(100%-2rem)] sm:w-auto sm:max-w-sm",
          "bg-[#111] border border-[#333] rounded-lg shadow-md",
          "px-3 sm:px-4 py-3 flex items-center justify-between gap-3 sm:gap-4",
          "transition-all duration-300 ease-in-out",
          isResting
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none",
        )}
      >
        {isResting && (
          <>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Timer className="h-4 w-4 text-[#888] flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-white tabular-nums">
                  {displayRestTime}
                </span>
                {nextExerciseName && (
                  <span className="text-xs text-[#888] truncate">
                    Next: {nextExerciseName}
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="bg-[#222] text-[#ccc] hover:bg-[#333] rounded-md h-8 px-3 text-xs flex-shrink-0"
              onClick={() => stopRestTimer()}
            >
              <SkipForward className="h-3.5 w-3.5 mr-1" />
              Skip
            </Button>
          </>
        )}
      </div>
    </div>
  );
}


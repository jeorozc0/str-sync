"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area"; // Keep for Desktop Dialog
import { Badge } from "@/components/ui/badge";
import { Check, Search, ChevronDown, ChevronUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type StoreWorkoutExercise } from "@/types/store";
import { filterExercises } from "@/utils/filter-exercises";
import { type Exercise as PrismaExercise } from "@prisma/client";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/use-media-query";

// Default state for a NEW exercise when adding
const defaultNewExerciseState: Omit<StoreWorkoutExercise, "order"> = {
  id: "",
  sets: 3,
  reps: "8-12",
  weight: undefined,
  restSeconds: 60,
  rir: 2,
  notes: "",
  exerciseId: "",
  exercise: {
    id: "",
    name: "",
    muscleGroup: "",
    equipment: undefined,
  },
};

// Constants for Select Options
const SET_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const REP_OPTIONS = [
  "5",
  "6",
  "8",
  "10",
  "12",
  "15",
  "20",
  "5-8",
  "8-12",
  "10-15",
  "12-15",
  "15-20",
  "AMRAP",
];
const RIR_OPTIONS = [
  { value: "none", label: "None" },
  { value: "0", label: "0 (Failure)" },
  { value: "1", label: "1 (Near Failure)" },
  { value: "2", label: "2 (Hard)" },
  { value: "3", label: "3 (Moderate)" },
  { value: "4", label: "4 (Easy)" },
];
const REST_OPTIONS = [30, 45, 60, 75, 90, 120, 150, 180, 240];

interface ExerciseDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (configuredExercise: StoreWorkoutExercise) => void;
  exercise: StoreWorkoutExercise | null;
  isEditing: boolean;
  availableExercises: PrismaExercise[];
  isLoadingExercises: boolean;
  fetchError: string | null;
}

interface ExerciseFormProps {
  currentExercise: StoreWorkoutExercise;
  setCurrentExercise: React.Dispatch<React.SetStateAction<StoreWorkoutExercise>>;
  exerciseSearchQuery: string;
  setExerciseSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  showExerciseSelection: boolean;
  toggleExerciseSelection: () => void;
  filteredAvailableExercises: PrismaExercise[];
  handleSelectExercise: (dbExercise: PrismaExercise) => void;
  isLoadingExercises: boolean;
  fetchError: string | null;
  // Optional className prop if padding needs to be applied directly to the form root
  className?: string;
}

export default function ExerciseDialog({
  open,
  onClose,
  onSave,
  exercise,
  isEditing,
  availableExercises,
  isLoadingExercises,
  fetchError,
}: ExerciseDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [currentExercise, setCurrentExercise] = useState<StoreWorkoutExercise>(
    () =>
      exercise ? { ...exercise } : { ...defaultNewExerciseState, order: 0 },
  );
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState("");
  const [showExerciseSelection, setShowExerciseSelection] = useState(true);

  useEffect(() => {
    if (open) {
      setCurrentExercise(
        exercise ? { ...exercise } : { ...defaultNewExerciseState, order: 0 },
      );
      setExerciseSearchQuery("");
      setShowExerciseSelection(!isEditing);
    }
  }, [exercise, open, isEditing]);

  const handleSelectExercise = useCallback((dbExercise: PrismaExercise) => {
    setCurrentExercise((prev) => ({
      ...prev,
      exerciseId: dbExercise.id,
      exercise: {
        id: dbExercise.id,
        name: dbExercise.name,
        muscleGroup: dbExercise.muscleGroup,
        equipment: dbExercise.equipment ?? undefined,
      },
    }));
    setShowExerciseSelection(false);
  }, []);

  const toggleExerciseSelection = useCallback(() => {
    setShowExerciseSelection((prev) => !prev);
  }, []);

  const handleSaveClick = useCallback(() => {
    if (!currentExercise.exerciseId || !currentExercise.exercise.name) {
      toast.error("Please select an exercise from the list.");
      return;
    }
    onSave(currentExercise);
  }, [currentExercise, onSave]);

  // Memoize filtered exercises
  const filteredAvailableExercises = useMemo(() => {
    return filterExercises(availableExercises, exerciseSearchQuery);
  }, [availableExercises, exerciseSearchQuery]);

  // --- Desktop Dialog ---
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="border-[#333333] bg-[#111111] text-white sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? `Edit: ${exercise?.exercise.name}` : "Add Exercise"}
            </DialogTitle>
          </DialogHeader>

          {/* Desktop still uses ScrollArea or div for max-height */}
          <div className="max-h-[70vh] overflow-y-auto py-4 pr-2 pl-1 custom-scrollbar">
            <ExerciseForm
              currentExercise={currentExercise}
              setCurrentExercise={setCurrentExercise}
              exerciseSearchQuery={exerciseSearchQuery}
              setExerciseSearchQuery={setExerciseSearchQuery}
              showExerciseSelection={showExerciseSelection}
              toggleExerciseSelection={toggleExerciseSelection}
              filteredAvailableExercises={filteredAvailableExercises}
              handleSelectExercise={handleSelectExercise}
              isLoadingExercises={isLoadingExercises}
              fetchError={fetchError}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="border-[#333333] text-sm h-9"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveClick}
              className="bg-white text-black hover:bg-gray-200 text-sm h-9"
              disabled={!currentExercise.exerciseId}
            >
              {isEditing ? "Update Exercise" : "Add Exercise"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // --- Mobile Drawer ---
  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="bg-[#111111] text-white">
        {/* Header */}
        <DrawerHeader className="border-b border-[#333333] px-4 text-left">
          <DrawerTitle>
            {isEditing ? `Edit: ${exercise?.exercise.name}` : "Add Exercise"}
          </DrawerTitle>
        </DrawerHeader>

        {/* Content Area: Let DrawerContent handle scroll, add padding wrapper */}
        <div className="overflow-auto px-4 py-4">
          <ExerciseForm
            currentExercise={currentExercise}
            setCurrentExercise={setCurrentExercise}
            exerciseSearchQuery={exerciseSearchQuery}
            setExerciseSearchQuery={setExerciseSearchQuery}
            showExerciseSelection={showExerciseSelection}
            toggleExerciseSelection={toggleExerciseSelection}
            filteredAvailableExercises={filteredAvailableExercises}
            handleSelectExercise={handleSelectExercise}
            isLoadingExercises={isLoadingExercises}
            fetchError={fetchError}
          />
        </div>

        {/* Footer */}
        <DrawerFooter className="border-t border-[#333333] px-4 py-3 mt-auto">
          <div className="flex justify-between w-full">
            <DrawerClose asChild>
              <Button variant="outline" className="border-[#333333] text-sm h-9">
                Cancel
              </Button>
            </DrawerClose>
            <Button
              onClick={handleSaveClick}
              className="bg-white text-black hover:bg-gray-200 text-sm h-9"
              disabled={!currentExercise.exerciseId}
            >
              {isEditing ? "Update Exercise" : "Add Exercise"}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

// --- Exercise Form Component (with fixes) ---
function ExerciseForm({
  currentExercise,
  setCurrentExercise,
  exerciseSearchQuery,
  setExerciseSearchQuery,
  showExerciseSelection,
  toggleExerciseSelection,
  filteredAvailableExercises,
  handleSelectExercise,
  isLoadingExercises,
  fetchError,
  className, // Accept className prop if needed
}: ExerciseFormProps) {
  const handleInputChange = useCallback(
    <K extends keyof StoreWorkoutExercise>(
      field: K,
      value: StoreWorkoutExercise[K] | string | number,
    ) => {
      setCurrentExercise((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [setCurrentExercise],
  );

  // Note: Using Shadcn's ScrollArea *inside* the form for the exercise list
  // This is generally fine as it's a contained scrolling area.
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Exercise Selection Section */}
      <div className="space-y-3">
        {currentExercise.exerciseId && (
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-400">
              {showExerciseSelection ? "Select Exercise" : "Exercise"}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={toggleExerciseSelection}
            >
              {showExerciseSelection ? (
                <>
                  Hide Selection <ChevronUp className="ml-1 h-3 w-3" />
                </>
              ) : (
                <>
                  Change Exercise <ChevronDown className="ml-1 h-3 w-3" />
                </>
              )}
            </Button>
          </div>
        )}

        {(showExerciseSelection || !currentExercise.exerciseId) && (
          <Tabs defaultValue="search" className="w-full">
            <TabsContent value="search" className="mt-2 space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search exercises by name, muscle, equipment..."
                  // FIX: Use text-base on mobile to prevent zoom
                  className="border-[#333333] bg-[#1A1A1A] pl-9 text-base md:text-sm"
                  value={exerciseSearchQuery}
                  onChange={(e) => setExerciseSearchQuery(e.target.value)}
                  aria-label="Search exercises"
                />
              </div>

              {/* Use Shadcn ScrollArea for the list */}
              <ScrollArea className="h-[200px] rounded-md border border-[#333333] p-2">
                {isLoadingExercises ? (
                  <div className="py-8 text-center text-gray-400">
                    Loading...
                  </div>
                ) : fetchError ? (
                  <div className="py-8 text-center text-red-400">
                    {fetchError}
                  </div>
                ) : filteredAvailableExercises.length > 0 ? (
                  <div className="space-y-1.5">
                    {filteredAvailableExercises.map((dbExercise) => (
                      <div
                        key={dbExercise.id}
                        role="button"
                        tabIndex={0}
                        className={`flex justify-between items-center cursor-pointer rounded p-2 hover:bg-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-blue-500 ${currentExercise.exerciseId === dbExercise.id
                          ? "border border-blue-500 bg-[#1A1A1A]"
                          : "border border-transparent"
                          }`}
                        onClick={() => handleSelectExercise(dbExercise)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSelectExercise(dbExercise)
                        }
                      >
                        <div>
                          <div className="font-medium text-sm">
                            {dbExercise.name}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                            <span>{dbExercise.muscleGroup}</span>
                            {dbExercise.equipment && (
                              <>
                                <span className="opacity-50">•</span>
                                <span>{dbExercise.equipment}</span>
                              </>
                            )}
                          </div>
                        </div>
                        {currentExercise.exerciseId === dbExercise.id && (
                          <Check className="h-4 w-4 text-blue-400 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-400 text-sm">
                    No exercises match &quot;{exerciseSearchQuery}&quot;.
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Configuration Section */}
      {currentExercise.exerciseId && (
        <div
          className={`space-y-4 ${showExerciseSelection ? "border-t border-[#333333] pt-4" : ""
            }`}
        >
          <div>
            <h3 className="mb-2 text-base font-semibold text-blue-300">
              Configure: {currentExercise.exercise.name}
            </h3>
            <div className="flex gap-1.5">
              <Badge variant="secondary" className="text-xs">
                {currentExercise.exercise.muscleGroup}
              </Badge>
              {currentExercise.exercise.equipment && (
                <Badge
                  variant="outline"
                  className="text-xs bg-[#1A1A1A] border-[#333333]"
                >
                  {currentExercise.exercise.equipment}
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Sets */}
            <div className="space-y-1.5">
              <Label htmlFor="sets" className="text-xs">
                Target Sets
              </Label>
              <Select
                value={currentExercise.sets?.toString() ?? "3"}
                onValueChange={(value) =>
                  handleInputChange("sets", Number.parseInt(value))
                }
              >
                <SelectTrigger
                  id="sets"
                  // FIX: Use text-base on mobile to prevent zoom
                  className="border-[#333333] bg-[#1A1A1A] h-9 text-base md:text-sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#333333] bg-[#111111] text-white">
                  {SET_OPTIONS.map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reps */}
            <div className="space-y-1.5">
              <Label htmlFor="reps" className="text-xs">
                Target Reps
              </Label>
              <Select
                value={currentExercise.reps ?? "8-12"}
                onValueChange={(value) => handleInputChange("reps", value)}
              >
                <SelectTrigger
                  id="reps"
                  // FIX: Use text-base on mobile to prevent zoom
                  className="border-[#333333] bg-[#1A1A1A] h-9 text-base md:text-sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#333333] bg-[#111111] text-white">
                  {REP_OPTIONS.map((rep) => (
                    <SelectItem key={rep} value={rep}>
                      {rep}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* RIR (Optional) */}
            <div className="space-y-1.5">
              <Label htmlFor="intensity" className="text-xs">
                Target RIR (Optional)
              </Label>
              <Select
                value={
                  currentExercise.rir !== undefined
                    ? currentExercise.rir.toString()
                    : "none"
                }
                onValueChange={(value) => {
                  handleInputChange(
                    "rir",
                    value === "none" ? undefined : Number.parseInt(value),
                  );
                }}
              >
                <SelectTrigger
                  id="intensity"
                  // FIX: Use text-base on mobile to prevent zoom
                  className="border-[#333333] bg-[#1A1A1A] h-9 text-base md:text-sm"
                >
                  <SelectValue placeholder="Select RIR" />
                </SelectTrigger>
                <SelectContent className="border-[#333333] bg-[#111111] text-white">
                  {RIR_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rest Time */}
            <div className="space-y-1.5">
              <Label htmlFor="rest-time" className="text-xs">
                Rest (sec)
              </Label>
              <Select
                value={currentExercise.restSeconds?.toString() ?? "60"}
                onValueChange={(value) =>
                  handleInputChange("restSeconds", Number.parseInt(value))
                }
              >
                <SelectTrigger
                  id="rest-time"
                  // FIX: Use text-base on mobile to prevent zoom
                  className="border-[#333333] bg-[#1A1A1A] h-9 text-base md:text-sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#333333] bg-[#111111] text-white">
                  {REST_OPTIONS.map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}s
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Weight (Optional) */}
            <div className="space-y-1.5">
              <Label htmlFor="weight" className="text-xs">
                Target Wt (kg) (Optional)
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.5"
                placeholder="e.g., 50.5"
                value={currentExercise.weight ?? ""}
                onChange={(e) =>
                  handleInputChange(
                    "weight",
                    e.target.value ? parseFloat(e.target.value) : undefined,
                  )
                }
                // FIX: Use text-base on mobile to prevent zoom
                // FIX: Add inputMode for better mobile keyboard
                className="border-[#333333] bg-[#1A1A1A] h-9 text-base md:text-sm"
                inputMode="decimal"
              />
            </div>

            {/* Notes (Optional) */}
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="notes" className="text-xs">
                Notes (Optional)
              </Label>
              <Input
                id="notes"
                placeholder="e.g., Focus on form, Use slow eccentric"
                value={currentExercise.notes ?? ""}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                // FIX: Use text-base on mobile to prevent zoom
                className="border-[#333333] bg-[#1A1A1A] h-9 text-base md:text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


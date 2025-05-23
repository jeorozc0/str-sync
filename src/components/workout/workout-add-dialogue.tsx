"use client";

import { useState, useEffect, useCallback, useMemo } from "react"; // Added useMemo
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Check, Search, ChevronDown, ChevronUp, ListPlus } from "lucide-react"; // Added ListPlus
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

// Constants for Select Options (moved outside for readability)
const SET_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const REP_OPTIONS = [
  "5", "6", "8", "10", "12", "15", "20", "5-8", "8-12", "10-15", "12-15", "15-20", "AMRAP",
];
const RIR_OPTIONS = [
  { value: "none", label: "None" }, { value: "0", label: "0 (Failure)" }, { value: "1", label: "1 (Near Failure)" },
  { value: "2", label: "2 (Hard)" }, { value: "3", label: "3 (Moderate)" }, { value: "4", label: "4 (Easy)" },
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
  // Default to true, will only be set to false if user explicitly hides it AFTER selecting
  const [showExerciseSelection, setShowExerciseSelection] = useState(true);

  useEffect(() => {
    if (open) {
      const initialState = exercise
        ? { ...exercise }
        : { ...defaultNewExerciseState, order: 0 };
      setCurrentExercise(initialState);
      setExerciseSearchQuery("");
      // Always show selection on open, unless editing an existing exercise
      setShowExerciseSelection(!isEditing || !initialState.exerciseId);
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
    // Keep selection open by default after selecting, user can hide it
    // setShowExerciseSelection(false); // Removed this line
  }, []);

  const toggleExerciseSelection = useCallback(() => {
    // Only allow toggling if an exercise is actually selected
    if (currentExercise.exerciseId) {
      setShowExerciseSelection((prev) => !prev);
    }
  }, [currentExercise.exerciseId]);

  const handleSaveClick = useCallback(() => {
    if (!currentExercise.exerciseId || !currentExercise.exercise.name) {
      toast.error("Please select an exercise from the list first.");
      return;
    }
    onSave(currentExercise);
  }, [currentExercise, onSave]);

  // Memoize filtered exercises
  const filteredAvailableExercises = useMemo(() => {
    return filterExercises(availableExercises, exerciseSearchQuery);
  }, [availableExercises, exerciseSearchQuery]); // Added useMemo dependencies

  // --- Desktop Dialog ---
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="border-[#333333] bg-[#111111] text-white sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? `Edit Exercise` : "Add Exercise"}
            </DialogTitle>
          </DialogHeader>

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
              disabled={!currentExercise.exerciseId} // Disable save if no exercise selected
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
        <DrawerHeader className="border-b border-[#333333] px-4 text-left">
          <DrawerTitle>
            {isEditing ? `Edit Exercise` : "Add Exercise"}
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
              disabled={!currentExercise.exerciseId} // Disable save if no exercise selected
            >
              {isEditing ? "Update Exercise" : "Add Exercise"}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

// --- Exercise Form Component (Refactored) ---
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

  // Determine if the selection section should be visible
  // Show if explicitly toggled on OR if no exercise is selected yet.
  const isSelectionVisible = showExerciseSelection || !currentExercise.exerciseId;

  return (
    <div className="space-y-4">
      {/* --- Exercise Selection Section (Conditionally Visible Content) --- */}
      <div className="space-y-3">
        {/* Toggle Button - Only show if an exercise IS selected */}
        {currentExercise.exerciseId && (
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-400">
              {showExerciseSelection ? "Select Exercise" : "Selected Exercise"}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={toggleExerciseSelection}
            >
              {showExerciseSelection ? (
                <> Hide Selection <ChevronUp className="ml-1 h-3 w-3" /> </>
              ) : (
                <> Change Exercise <ChevronDown className="ml-1 h-3 w-3" /> </>
              )}
            </Button>
          </div>
        )}

        {/* Selection Content (Search, List) - Render based on isSelectionVisible */}
        {isSelectionVisible && (
          <Tabs defaultValue="search" className="w-full">
            <TabsContent value="search" className="mt-2 space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search exercises by name, muscle, equipment..."
                  className="border-[#333333] bg-[#1A1A1A] pl-9 text-base md:text-sm" // Keep mobile zoom fix
                  value={exerciseSearchQuery}
                  onChange={(e) => setExerciseSearchQuery(e.target.value)}
                  aria-label="Search exercises"
                />
              </div>

              <ScrollArea className="h-[200px] rounded-md border border-[#333333] p-2">
                {/* Loading/Error/List/No Results Logic */}
                {isLoadingExercises ? (
                  <div className="py-8 text-center text-gray-400">Loading...</div>
                ) : fetchError ? (
                  <div className="py-8 text-center text-red-400">{fetchError}</div>
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
                        onKeyDown={(e) => e.key === 'Enter' && handleSelectExercise(dbExercise)}
                      >
                        {/* ... exercise details ... */}
                        <div>
                          <div className="font-medium text-sm">{dbExercise.name}</div>
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

      {/* --- Configuration Section (Always Present Wrapper) --- */}
      {/* Add padding top only if the selection section is visible and an exercise is selected */}
      <div className={`space-y-4 ${isSelectionVisible && currentExercise.exerciseId ? 'pt-4 border-t border-[#333333]' : ''}`}>
        {/* Conditional Content: Placeholder or Inputs */}
        {!currentExercise.exerciseId ? (
          // Placeholder when no exercise is selected
          <div className="flex flex-col items-center justify-center h-48 text-center text-gray-500 border border-dashed border-[#333333] rounded-md p-4">
            <ListPlus className="w-8 h-8 mb-2 text-gray-600" />
            <span className="text-sm font-medium">No Exercise Selected</span>
            <span className="text-xs mt-1">Choose an exercise from the list above to configure its sets, reps, and other details.</span>
          </div>
        ) : (
          // Actual Configuration Inputs when an exercise IS selected
          <>
            {/* Heading and Badges */}
            <div>
              <h3 className="mb-2 text-base font-semibold text-blue-300">
                Configure: {currentExercise.exercise.name}
              </h3>
              <div className="flex gap-1.5">
                <Badge variant="secondary" className="text-xs">
                  {currentExercise.exercise.muscleGroup}
                </Badge>
                {currentExercise.exercise.equipment && (
                  <Badge variant="outline" className="text-xs bg-[#1A1A1A] border-[#333333]">
                    {currentExercise.exercise.equipment}
                  </Badge>
                )}
              </div>
            </div>

            {/* Grid for Inputs */}
            <div className="grid grid-cols-2 gap-4">
              {/* Sets */}
              <div className="space-y-1.5">
                <Label htmlFor="sets" className="text-xs">Target Sets</Label>
                <Select
                  value={currentExercise.sets?.toString() ?? "3"}
                  onValueChange={(value) => handleInputChange('sets', Number.parseInt(value))}
                >
                  <SelectTrigger id="sets" className="border-[#333333] bg-[#1A1A1A] h-9 text-base md:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-[#333333] bg-[#111111] text-white">
                    {SET_OPTIONS.map(num => (<SelectItem key={num} value={num.toString()}>{num}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reps */}
              <div className="space-y-1.5">
                <Label htmlFor="reps" className="text-xs">Target Reps</Label>
                <Select
                  value={currentExercise.reps ?? "8-12"}
                  onValueChange={(value) => handleInputChange('reps', value)}
                >
                  <SelectTrigger id="reps" className="border-[#333333] bg-[#1A1A1A] h-9 text-base md:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-[#333333] bg-[#111111] text-white">
                    {REP_OPTIONS.map(rep => (<SelectItem key={rep} value={rep}>{rep}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              {/* RIR */}
              <div className="space-y-1.5">
                <Label htmlFor="intensity" className="text-xs">Target RIR (Optional)</Label>
                <Select
                  value={currentExercise.rir !== undefined ? currentExercise.rir.toString() : "none"}
                  onValueChange={(value) => handleInputChange('rir', value === "none" ? undefined : Number.parseInt(value))}
                >
                  <SelectTrigger id="intensity" className="border-[#333333] bg-[#1A1A1A] h-9 text-base md:text-sm">
                    <SelectValue placeholder="Select RIR" />
                  </SelectTrigger>
                  <SelectContent className="border-[#333333] bg-[#111111] text-white">
                    {RIR_OPTIONS.map(option => (<SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rest Time */}
              <div className="space-y-1.5">
                <Label htmlFor="rest-time" className="text-xs">Rest (sec)</Label>
                <Select
                  value={currentExercise.restSeconds?.toString() ?? "60"}
                  onValueChange={(value) => handleInputChange('restSeconds', Number.parseInt(value))}
                >
                  <SelectTrigger id="rest-time" className="border-[#333333] bg-[#1A1A1A] h-9 text-base md:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-[#333333] bg-[#111111] text-white">
                    {REST_OPTIONS.map(num => (<SelectItem key={num} value={num.toString()}>{num}s</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              {/* Weight */}
              <div className="space-y-1.5">
                <Label htmlFor="weight" className="text-xs">Target Wt (kg) (Optional)</Label>
                <Input
                  id="weight" type="number" step="0.5" placeholder="e.g., 50.5"
                  value={currentExercise.weight ?? ""}
                  onChange={(e) => handleInputChange('weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="border-[#333333] bg-[#1A1A1A] h-9 text-base md:text-sm"
                  inputMode="decimal"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="notes" className="text-xs">Notes (Optional)</Label>
                <Input
                  id="notes" placeholder="e.g., Focus on form, Use slow eccentric"
                  value={currentExercise.notes ?? ""}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="border-[#333333] bg-[#1A1A1A] h-9 text-base md:text-sm"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


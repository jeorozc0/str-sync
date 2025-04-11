"use client";

import { useState, useEffect, useCallback } from "react";
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
import { type Exercise as PrismaExercise } from '@prisma/client';
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/use-media-query";

// Default state for a NEW exercise when adding
const defaultNewExerciseState: Omit<StoreWorkoutExercise, 'order'> = {
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

// Interface for the ExerciseForm component props
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

  // Internal state for the exercise being configured
  const [currentExercise, setCurrentExercise] = useState<StoreWorkoutExercise>(
    () => exercise ? { ...exercise } : { ...defaultNewExerciseState, order: 0 }
  );
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState("");
  const [showExerciseSelection, setShowExerciseSelection] = useState(true);

  // Reset internal state when dialog opens or exercise changes
  useEffect(() => {
    if (open) {
      setCurrentExercise(exercise ? { ...exercise } : { ...defaultNewExerciseState, order: 0 });
      setExerciseSearchQuery("");
      // If editing an existing exercise, collapse the selection section
      setShowExerciseSelection(!isEditing);
    }
  }, [exercise, open, isEditing]);

  // Handler when a master exercise is selected
  const handleSelectExercise = useCallback((dbExercise: PrismaExercise) => {
    setCurrentExercise(prev => ({
      ...prev,
      exerciseId: dbExercise.id,
      exercise: {
        id: dbExercise.id,
        name: dbExercise.name,
        muscleGroup: dbExercise.muscleGroup,
        equipment: dbExercise.equipment ?? undefined,
      },
    }));
    // Collapse the exercise selection section after selecting
    setShowExerciseSelection(false);
  }, []);

  // Toggle exercise selection visibility
  const toggleExerciseSelection = useCallback(() => {
    setShowExerciseSelection(prev => !prev);
  }, []);

  // Handler for save button click
  const handleSaveClick = useCallback(() => {
    if (!currentExercise.exerciseId || !currentExercise.exercise.name) {
      toast.error("Please select an exercise from the list.");
      return;
    }
    onSave(currentExercise);
  }, [currentExercise, onSave]);

  // Filter available exercises based on search query
  const filteredAvailableExercises = filterExercises(availableExercises, exerciseSearchQuery);

  // Render Dialog for desktop
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="border-[#333333] bg-[#111111] text-white sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? `Edit: ${exercise?.exercise.name}` : "Add Exercise"}
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
              disabled={!currentExercise.exerciseId}
            >
              {isEditing ? "Update Exercise" : "Add Exercise"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Render Drawer for mobile
  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="bg-[#111111] text-white">
        <DrawerHeader className="border-b border-[#333333] px-4">
          <DrawerTitle>
            {isEditing ? `Edit: ${exercise?.exercise.name}` : "Add Exercise"}
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 py-4 overflow-y-auto max-h-[calc(100vh-10rem)]">
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

        <DrawerFooter className="border-t border-[#333333] px-4 py-3">
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

// Separate form component to handle inputs
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
  // Handler for input changes
  const handleInputChange = useCallback(<K extends keyof StoreWorkoutExercise>(
    field: K,
    value: StoreWorkoutExercise[K] | string | number
  ) => {
    setCurrentExercise(prev => ({
      ...prev,
      [field]: value
    }));
  }, [setCurrentExercise]);

  return (
    <div className="space-y-4">
      {/* Exercise Selection Section with Toggle */}
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
                <>Hide Selection <ChevronUp className="ml-1 h-3 w-3" /></>
              ) : (
                <>Change Exercise <ChevronDown className="ml-1 h-3 w-3" /></>
              )}
            </Button>
          </div>
        )}

        {/* Exercise Selection Area - Collapsible */}
        {(showExerciseSelection || !currentExercise.exerciseId) && (
          <Tabs defaultValue="search" className="w-full">
            <TabsContent value="search" className="mt-2 space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search exercises by name, muscle, equipment..."
                  className="border-[#333333] bg-[#1A1A1A] pl-9"
                  value={exerciseSearchQuery}
                  onChange={(e) => setExerciseSearchQuery(e.target.value)}
                  aria-label="Search exercises"
                />
              </div>

              {/* Exercise List Scroll Area */}
              <ScrollArea className="h-[200px] rounded-md border border-[#333333] p-2">
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

      {/* Configuration Section */}
      {currentExercise.exerciseId && (
        <div className={`space-y-4 ${showExerciseSelection ? 'border-t border-[#333333] pt-4' : ''}`}>
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

          {/* Grid for Sets, Reps, RIR, Rest */}
          <div className="grid grid-cols-2 gap-4">
            {/* Sets */}
            <div className="space-y-1.5">
              <Label htmlFor="sets" className="text-xs">Target Sets</Label>
              <Select
                value={currentExercise.sets?.toString() ?? "3"}
                onValueChange={(value) => handleInputChange('sets', Number.parseInt(value))}
              >
                <SelectTrigger id="sets" className="border-[#333333] bg-[#1A1A1A] h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#333333] bg-[#111111] text-white">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                  ))}
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
                <SelectTrigger id="reps" className="border-[#333333] bg-[#1A1A1A] h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#333333] bg-[#111111] text-white">
                  {["5", "6", "8", "10", "12", "15", "20", "5-8", "8-12", "10-15", "12-15", "15-20", "AMRAP"].map(num => (
                    <SelectItem key={num} value={num}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* RIR (Optional) */}
            <div className="space-y-1.5">
              <Label htmlFor="intensity" className="text-xs">Target RIR (Optional)</Label>
              <Select
                value={currentExercise.rir !== undefined ? currentExercise.rir.toString() : "none"}
                onValueChange={(value) => {
                  if (value === "none") {
                    handleInputChange('rir', undefined);
                  } else {
                    handleInputChange('rir', Number.parseInt(value));
                  }
                }}
              >
                <SelectTrigger id="intensity" className="border-[#333333] bg-[#1A1A1A] h-9 text-sm">
                  <SelectValue placeholder="Select RIR" />
                </SelectTrigger>
                <SelectContent className="border-[#333333] bg-[#111111] text-white">
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="0">0 (Failure)</SelectItem>
                  <SelectItem value="1">1 (Near Failure)</SelectItem>
                  <SelectItem value="2">2 (Hard)</SelectItem>
                  <SelectItem value="3">3 (Moderate)</SelectItem>
                  <SelectItem value="4">4 (Easy)</SelectItem>
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
                <SelectTrigger id="rest-time" className="border-[#333333] bg-[#1A1A1A] h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[#333333] bg-[#111111] text-white">
                  {[30, 45, 60, 75, 90, 120, 150, 180, 240].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num}s</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Weight (Optional) */}
            <div className="space-y-1.5">
              <Label htmlFor="weight" className="text-xs">Target Wt (kg) (Optional)</Label>
              <Input
                id="weight"
                type="number"
                step="0.5"
                placeholder="e.g., 50.5"
                value={currentExercise.weight ?? ""}
                onChange={(e) => handleInputChange('weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="border-[#333333] bg-[#1A1A1A] h-9 text-sm"
              />
            </div>

            {/* Notes (Optional) */}
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="notes" className="text-xs">Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="e.g., Focus on form, Use slow eccentric"
                value={currentExercise.notes ?? ""}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="border-[#333333] bg-[#1A1A1A] h-9 text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


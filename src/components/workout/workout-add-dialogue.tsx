// src/components/workout/workout-add-dialogue.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Check, Search } from "lucide-react"; // Added Info icon
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type StoreWorkoutExercise } from "@/types/store"; // Use the store type
import { filterExercises } from "@/utils/filter-exercises";
import { type Exercise as PrismaExercise } from "@prisma/client"; // Use Prisma type for available list
import { toast } from "sonner";

// Default state for a NEW exercise when adding
// Note: ID might be overridden by parent initially if needed for temporary keying
const defaultNewExerciseState: Omit<StoreWorkoutExercise, 'order'> = {
  id: "", // Parent might provide a temp ID via `exercise` prop
  sets: 3,
  reps: "8-12", // Common default
  weight: undefined,
  restSeconds: 60,
  rir: 2, // Common default RIR
  notes: "",
  exerciseId: "", // No master exercise selected yet
  exercise: { // Empty nested details
    id: "",
    name: "",
    muscleGroup: "",
    equipment: undefined,
  },
};

interface ExerciseDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (configuredExercise: StoreWorkoutExercise) => void; // Callback with the final configured exercise
  exercise: StoreWorkoutExercise | null; // The exercise being added/edited (passed from parent)
  isEditing: boolean;
  // --- Props containing data fetched by parent ---
  availableExercises: PrismaExercise[];
  isLoadingExercises: boolean;
  fetchError: string | null;
  // ----------------------------------------------
}

export default function ExerciseDialog({
  open,
  onClose,
  onSave,
  exercise, // The specific exercise passed for edit/add config
  isEditing,
  availableExercises, // Full list from parent
  isLoadingExercises, // Loading state from parent
  fetchError, // Error state from parent
}: ExerciseDialogProps) {

  // --- Internal State for the Exercise being configured in THIS dialog ---
  // Initialize based on the 'exercise' prop passed in.
  // Ensure a deep copy or structured initialization to avoid mutating parent state.
  const [currentExercise, setCurrentExercise] = useState<StoreWorkoutExercise>(
    () => exercise ? { ...exercise } : { ...defaultNewExerciseState, order: 0 } // order will be set by parent on save
  );
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState("");
  // ----------------------------------------------------------------------

  // Effect to reset internal state when the dialog is opened for a new/different exercise
  useEffect(() => {
    if (open) {
      console.log("Dialog opened/exercise prop changed. Initializing internal state.", exercise);
      // Reset internal state based on the exercise prop passed for this instance
      setCurrentExercise(exercise ? { ...exercise } : { ...defaultNewExerciseState, order: 0 });
      setExerciseSearchQuery(""); // Clear search on open
    }
    // Note: No cleanup needed here, parent manages store state reset
  }, [exercise, open]); // Re-run if the exercise prop changes or dialog opens

  // Filter the *available* exercises based on the search query
  const filteredAvailableExercises = filterExercises(availableExercises, exerciseSearchQuery);

  // Handler when a master exercise is selected from the list
  const handleSelectExercise = (dbExercise: PrismaExercise) => {
    // Update the internal state ('currentExercise') of the dialog
    setCurrentExercise(prev => ({
      ...prev, // Keep existing sets, reps, etc.
      exerciseId: dbExercise.id, // Link to the master exercise ID
      exercise: { // Update nested details
        id: dbExercise.id,
        name: dbExercise.name,
        muscleGroup: dbExercise.muscleGroup,
        equipment: dbExercise.equipment ?? undefined,
      },
    }));
    // Optional: Clear search after selection?
    // setExerciseSearchQuery("");
  };

  // Handler for input changes on sets, reps, etc.
  const handleInputChange = <K extends keyof StoreWorkoutExercise>(
    field: K,
    value: StoreWorkoutExercise[K] | string | number // Accept various input types
  ) => {
    setCurrentExercise(prev => ({
      ...prev,
      [field]: value // Update the specific field
    }));
  }

  // Handler for the Save/Update button click
  const handleSaveClick = () => {
    // Validation: Ensure a master exercise has been selected
    if (!currentExercise.exerciseId || !currentExercise.exercise.name) {
      toast.error("Please select an exercise from the list.");
      return;
    }
    // Pass the final configured internal state back to the parent via the onSave callback
    onSave(currentExercise);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* Keep max-width for consistency */}
      <DialogContent className="border-[#333333] bg-[#111111] text-white sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit: ${exercise?.exercise.name}` : "Add Exercise"}
          </DialogTitle>
        </DialogHeader>

        {/* Main Content Area */}
        <div className="max-h-[70vh] overflow-y-auto space-y-4 py-4 pr-2 pl-1 custom-scrollbar">
          {/* Tabs for Exercise Selection */}
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="border border-[#333333] bg-[#1A1A1A]">
              <TabsTrigger value="search">Search</TabsTrigger>
              {/* Add Recent/Favorites later */}
              {/* <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger> */}
            </TabsList>

            <TabsContent value="search" className="mt-4 space-y-4">
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
                        tabIndex={0} // Make it focusable
                        className={`flex justify-between items-center cursor-pointer rounded p-2 hover:bg-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                          // Highlight based on the internal state's selected exerciseId
                          currentExercise.exerciseId === dbExercise.id
                            ? "border border-blue-500 bg-[#1A1A1A]"
                            : "border border-transparent" // Keep consistent height
                          }`}
                        onClick={() => handleSelectExercise(dbExercise)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSelectExercise(dbExercise)} // Allow selection with Enter key
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
                        {/* Show checkmark if selected */}
                        {currentExercise.exerciseId === dbExercise.id && (
                          <Check className="h-4 w-4 text-blue-400 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-400 text-sm">No exercises match &quot;{exerciseSearchQuery}&quot;.</div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Add Recent/Favorites Tabs Content later */}
            {/* <TabsContent value="recent" className="mt-4">...</TabsContent> */}
            {/* <TabsContent value="favorites" className="mt-4">...</TabsContent> */}
          </Tabs>

          {/* Configuration Section (only shows after an exercise is selected) */}
          {/* Binds to internal 'currentExercise' state */}
          {currentExercise.exerciseId && (
            <div className="space-y-4 border-t border-[#333333] pt-4">
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
                    value={currentExercise.sets?.toString()}
                    onValueChange={(value) => handleInputChange('sets', Number.parseInt(value))}
                  >
                    <SelectTrigger id="sets" className="border-[#333333] bg-[#1A1A1A] h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent className="border-[#333333] bg-[#111111] text-white">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => <SelectItem key={num} value={num.toString()}>{num}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Reps */}
                <div className="space-y-1.5">
                  <Label htmlFor="reps" className="text-xs">Target Reps</Label>
                  {/* Consider using Input for flexibility if needed, or keep Select */}
                  <Select
                    value={currentExercise.reps}
                    onValueChange={(value) => handleInputChange('reps', value)}
                  >
                    <SelectTrigger id="reps" className="border-[#333333] bg-[#1A1A1A] h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent className="border-[#333333] bg-[#111111] text-white">
                      {["5", "6", "8", "10", "12", "15", "20", "5-8", "8-12", "10-15", "12-15", "15-20", "AMRAP"].map(num => <SelectItem key={num} value={num}>{num}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {/* Alternative Input:
                   <Input id="reps" value={currentExercise.reps} onChange={(e) => handleInputChange('reps', e.target.value)} className="border-[#333333] bg-[#1A1A1A] h-9 text-sm" placeholder="e.g., 8-12"/>
                  */}
                </div>

                {/* RIR (Optional) */}
                <div className="space-y-1.5">
                  <Label htmlFor="intensity" className="text-xs">Target RIR (Optional)</Label>
                  <Select
                    value={currentExercise.rir?.toString() ?? ""} // Use empty string for placeholder if undefined
                    onValueChange={(value) => handleInputChange('rir', value ? Number.parseInt(value) as any : undefined)}
                  >
                    <SelectTrigger id="intensity" className="border-[#333333] bg-[#1A1A1A] h-9 text-sm"><SelectValue placeholder="Select RIR" /></SelectTrigger>
                    <SelectContent className="border-[#333333] bg-[#111111] text-white">
                      <SelectItem value="none">None</SelectItem> {/* Option for no RIR target */}
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
                    value={currentExercise.restSeconds?.toString()}
                    onValueChange={(value) => handleInputChange('restSeconds', Number.parseInt(value))}
                  >
                    <SelectTrigger id="rest-time" className="border-[#333333] bg-[#1A1A1A] h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent className="border-[#333333] bg-[#111111] text-white">
                      {[30, 45, 60, 75, 90, 120, 150, 180, 240].map(num => <SelectItem key={num} value={num.toString()}>{num}s</SelectItem>)}
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

        {/* Footer with Action Buttons */}
        <DialogFooter>
          <Button variant="outline" className="border-[#333333] text-sm h-9" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSaveClick}
            className="bg-white text-black hover:bg-gray-200 text-sm h-9"
            // Disable save if no exercise is selected in the internal state
            disabled={!currentExercise.exerciseId}
          >
            {isEditing ? "Update Exercise" : "Add Exercise"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper CSS for custom scrollbar (add to your global CSS or Tailwind config)
/*

*/

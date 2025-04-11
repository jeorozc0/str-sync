// src/components/logging/set-input-form.tsx
"use client";

import { useState, useEffect, useRef } from 'react'; // Import useEffect and useRef
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { toast } from 'sonner';

interface SetInputFormProps {
  exerciseIndex: number; // Keep exerciseIndex for potential context if needed later
  setNumber: number; // The number of the set being logged (e.g., 1, 2, 3)
  targetReps: string; // The planned rep target (e.g., "8-12", "5")
  targetWeight?: number | null; // The planned weight target (optional)
  onCompleteSet: (reps: number, weight: number | null, rpe: number | null) => void; // Callback when set is completed
  isSaving: boolean; // Prop to indicate if the parent is currently saving this set
}

/**
 * Form component for inputting details (reps, weight, RPE) for a single workout set.
 */
export function SetInputForm({
  // exerciseIndex, // Not directly used in this component's logic currently
  setNumber,
  targetReps,
  targetWeight,
  onCompleteSet,
  isSaving,
}: SetInputFormProps) {
  // --- State for input fields ---
  // Initialize with empty strings, placeholder will show target
  const [reps, setReps] = useState<string>('');
  // Initialize weight input with target weight if available, otherwise empty
  const [weight, setWeight] = useState<string>(targetWeight?.toString() ?? '');
  // Initialize RPE input as empty
  const [rpe, setRpe] = useState<string>('');
  // -----------------------------

  // --- Ref for focusing the first input ---
  const repsInputRef = useRef<HTMLInputElement>(null);

  // --- Effect to focus the 'Reps' input when the set number changes (i.e., new set becomes active) ---
  useEffect(() => {
    // Only focus if it's likely becoming active (setNumber > 1 could imply previous set just completed)
    // Or simply focus whenever it renders (might be too aggressive)
    // A better trigger might be needed if parent re-renders unnecessarily
    repsInputRef.current?.focus();
    repsInputRef.current?.select(); // Select text for easy overwrite
  }, [setNumber]); // Depend on setNumber to refocus when it changes

  // --- Effect to reset weight input based on targetWeight when setNumber changes ---
  // This ensures the placeholder or target value is shown correctly for the *new* current set
  useEffect(() => {
    setWeight(targetWeight?.toString() ?? '');
    // Do NOT reset reps or rpe here, as user might be typing
  }, [setNumber, targetWeight]);


  // --- Handler for form submission (button click) ---
  const handleComplete = () => {
    // 1. Validation
    const repsNum = parseInt(reps, 10);
    if (isNaN(repsNum) || repsNum < 0) {
      toast.error("Please enter a valid number for Reps.");
      repsInputRef.current?.focus(); // Focus the invalid field
      return;
    }

    const weightNum = weight.trim() === '' ? null : parseFloat(weight); // Allow empty weight (means BW or no weight)
    if (weight.trim() !== '' && isNaN(weightNum)) {
      toast.error("Please enter a valid number for Weight or leave it blank.");
      // Ideally focus the weight input here
      return;
    }
    // Ensure negative weight isn't entered
    if (weightNum !== null && weightNum < 0) {
      toast.error("Weight cannot be negative.");
      return;
    }


    const rpeNum = rpe.trim() === '' ? null : parseInt(rpe, 10); // Allow empty RPE
    if (rpe.trim() !== '' && (isNaN(rpeNum) || rpeNum < 1 || rpeNum > 10)) {
      toast.error("RPE must be a number between 1 and 10, or leave it blank.");
      // Ideally focus the RPE input here
      return;
    }

    // 2. Call parent callback with validated data
    onCompleteSet(repsNum, weightNum, rpeNum);

    // 3. Reset local input state for the *next* set (or when component re-renders for next set)
    //    Weight is reset via useEffect based on targetWeight for the *new* set number
    setReps(''); // Clear reps input
    setRpe(''); // Clear RPE input

    // Optional: Focus reps input again, preparing for the *next* potential set input form instance
    // This might not be strictly necessary if the useEffect handles it
    // repsInputRef.current?.focus();
  };

  // --- Handler for keydown events on inputs (e.g., Enter key) ---
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      // Prevent default form submission if wrapped in <form>
      event.preventDefault();
      handleComplete(); // Trigger completion logic on Enter
    }
  };


  return (
    // Vercel-inspired styling: Subtle background, border, clear focus states
    <div className="space-y-3 rounded-md bg-neutral-900/50 p-4 border border-neutral-800 shadow-sm">
      {/* Header: Set Number and Target */}
      <p className="text-sm font-medium text-center text-neutral-300">
        Log Set {setNumber}
        <span className="text-neutral-500 ml-2">(Target: {targetReps})</span>
      </p>

      {/* Input Grid */}
      <div className="grid grid-cols-3 gap-3 items-end">
        {/* Reps Input */}
        <div className="space-y-1">
          <Label htmlFor={`reps-${setNumber}`} className="text-xs text-neutral-400 px-1">Reps</Label>
          <Input
            ref={repsInputRef} // Assign ref to the reps input
            id={`reps-${setNumber}`}
            type="number"
            inputMode="numeric" // Improve mobile experience
            placeholder={targetReps} // Show target as placeholder
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            onKeyDown={handleKeyDown} // Add keydown handler
            className="h-9 border-neutral-700 bg-neutral-800/60 focus:ring-1 focus:ring-offset-0 focus:ring-white/50 focus:border-white/50 text-center" // Center text
            min="0"
            required // Indicate field is important
          />
        </div>

        {/* Weight Input */}
        <div className="space-y-1">
          <Label htmlFor={`weight-${setNumber}`} className="text-xs text-neutral-400 px-1">Weight (kg)</Label>
          <Input
            id={`weight-${setNumber}`}
            type="number"
            inputMode="decimal" // Improve mobile experience
            step="0.5" // Allow common weight increments
            placeholder={targetWeight ? `${targetWeight}` : "BW"} // Show target or BW
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onKeyDown={handleKeyDown} // Add keydown handler
            className="h-9 border-neutral-700 bg-neutral-800/60 focus:ring-1 focus:ring-offset-0 focus:ring-white/50 focus:border-white/50 text-center" // Center text
            min="0"
          />
        </div>

        {/* RPE Input */}
        <div className="space-y-1">
          <Label htmlFor={`rpe-${setNumber}`} className="text-xs text-neutral-400 px-1">RPE</Label>
          <Input
            id={`rpe-${setNumber}`}
            type="number"
            inputMode="numeric"
            placeholder="1-10"
            value={rpe}
            onChange={(e) => setRpe(e.target.value)}
            onKeyDown={handleKeyDown} // Add keydown handler
            className="h-9 border-neutral-700 bg-neutral-800/60 focus:ring-1 focus:ring-offset-0 focus:ring-white/50 focus:border-white/50 text-center" // Center text
            min="1" max="10"
          />
        </div>
      </div>

      {/* Complete Button */}
      <Button
        onClick={handleComplete}
        disabled={isSaving} // Disable while parent is saving
        className="w-full h-9 bg-white text-black hover:bg-neutral-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-white/80"
      >
        {isSaving ? (
          // Add a simple loading indicator
          <span className="animate-pulse">Saving...</span>
        ) : (
          <>
            <Check className="mr-2 h-4 w-4" /> Complete Set {setNumber}
          </>
        )}
      </Button>
    </div>
  );
}

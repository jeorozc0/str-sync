import { type LoggedSet } from '@/stores/logs-store';
import { Check } from 'lucide-react';

interface LoggedSetDisplayProps {
  set: LoggedSet;
  setNumber: number; // Display set number based on index + 1
}

// Helper function moved here or keep in client if preferred
const formatWeight = (weight?: number | null) => {
  if (weight === undefined || weight === null) return 'BW'; // Bodyweight
  return `${weight} kg`; // Add unit preference later
};

export function LoggedSetDisplay({ set, setNumber }: LoggedSetDisplayProps) {
  // Determine background/text based on status if needed (e.g., skipped sets)
  const isSkipped = set.status === 'skipped';

  return (
    <div className={`flex items-center justify-between text-sm px-3 py-1.5 rounded ${isSkipped ? 'bg-neutral-800/40 text-neutral-500 italic' : 'text-neutral-300'}`}>
      <div className="flex items-center gap-2">
        <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium ${isSkipped ? 'bg-neutral-600 text-neutral-400' : 'bg-neutral-700 text-neutral-200'}`}>
          {setNumber}
        </span>
        <span>{set.reps} reps</span>
        <span className="text-neutral-500">@</span>
        <span>{formatWeight(set.weight)}</span>
      </div>
      <div className='flex items-center gap-2'>
        {set.rpe !== null && !isSkipped && (
          <span className="text-xs text-neutral-400">(RPE {set.rpe})</span>
        )}
        {set.status === 'completed' && <Check className="h-4 w-4 text-green-500" />}
        {/* Add Edit/Delete buttons later if needed */}
      </div>
    </div>
  );
}

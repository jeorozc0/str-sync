import { Skeleton } from "@/components/ui/skeleton";

// Loading skeleton component
export default function CreateWorkoutLoading() {
  return (
    <div className={`h-full overflow-y-auto bg-black text-white animate-pulse`}> {/* Optional font */}
      <div className="container mx-auto max-w-5xl px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-8 flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-md bg-gray-700" /> {/* Back Button */}
          <Skeleton className="h-8 w-64 bg-gray-700" /> {/* Title */}
        </div>
        {/* Main Grid Skeleton */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column Skeleton */}
          <div className="space-y-6 lg:col-span-2">
            {/* Form Skeleton */}
            <Skeleton className="h-56 w-full rounded-lg bg-[#111111]" />
            {/* Exercise List Header Skeleton */}
            <div className="flex justify-between items-center">
              <Skeleton className="h-7 w-36 bg-gray-700" /> {/* "Exercises" Title */}
              <Skeleton className="h-9 w-32 rounded-md bg-gray-600" /> {/* Add Button */}
            </div>
            {/* Exercise List Body Skeleton (Empty State Placeholder) */}
            <Skeleton className="h-48 w-full rounded-lg border border-dashed border-[#333333] bg-[#111111]/50" />
          </div>
          {/* Right Column Skeleton */}
          <div className="lg:col-span-1">
            {/* Summary Skeleton */}
            <Skeleton className="sticky top-4 h-64 w-full rounded-lg border border-[#333333] bg-[#111111]" />
          </div>
        </div>
      </div>
    </div>
  );
}

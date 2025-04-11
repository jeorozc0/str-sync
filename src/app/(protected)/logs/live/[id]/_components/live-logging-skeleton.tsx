
import { Skeleton } from "@/components/ui/skeleton";

// Loading skeleton for the Live Logging interface
export function LiveLogLoadingSkeleton() { // Export if needed elsewhere
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 animate-pulse"> {/* Add animate-pulse */}
      {/* Header Skeleton */}
      <div className='mb-6 text-center flex flex-col items-center'>
        <Skeleton className="h-4 w-32 mb-2 bg-gray-700/50" /> {/* Template Name */}
        <Skeleton className="h-8 w-64 mb-1 bg-gray-700" /> {/* Title */}
        <Skeleton className="h-3 w-40 bg-gray-800/50" /> {/* Log ID */}
      </div>

      {/* Exercise Navigation Skeleton */}
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-10 w-10 rounded-md bg-gray-700" /> {/* Prev Button */}
        <div className="text-center">
          <Skeleton className="h-6 w-48 mb-1 bg-gray-700" /> {/* Exercise Name */}
          <Skeleton className="h-4 w-32 bg-gray-700/50" /> {/* Exercise x of y */}
        </div>
        <Skeleton className="h-10 w-10 rounded-md bg-gray-700" /> {/* Next Button */}
      </div>

      {/* Main Content Card Skeleton */}
      <div className="bg-[#111111] border border-[#333333] rounded-lg mb-6 p-4 space-y-4">
        {/* Card Header Skeleton */}
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-5 w-40 bg-gray-600" />
        </div>
        <Skeleton className="h-3 w-52 bg-gray-700/50 mb-4" /> {/* Notes placeholder */}

        {/* Completed Sets Skeleton (Optional, shows structure) */}
        <div className='space-y-1 text-sm border-b border-[#333333] pb-3 mb-3'>
          <Skeleton className="h-3 w-24 bg-gray-700/50 mb-2" />
          <Skeleton className="h-4 w-full bg-gray-800/30" />
          <Skeleton className="h-4 w-full bg-gray-800/30" />
        </div>

        {/* Set Input Form Skeleton */}
        <div className="space-y-3 rounded-md border border-[#333333] bg-[#1a1a1a] p-4">
          <Skeleton className="h-4 w-20 mx-auto bg-gray-600/50" /> {/* Set X */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Skeleton className="h-3 w-8 bg-gray-700/50" />
              <Skeleton className="h-9 w-full rounded-md bg-[#2a2a2a]" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-12 bg-gray-700/50" />
              <Skeleton className="h-9 w-full rounded-md bg-[#2a2a2a]" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-10 bg-gray-700/50" />
              <Skeleton className="h-9 w-full rounded-md bg-[#2a2a2a]" />
            </div>
          </div>
          <Skeleton className="h-9 w-full rounded-md bg-blue-900/50" /> {/* Button placeholder */}
        </div>
      </div>

      {/* Finish Button Skeleton */}
      <div className="text-center mt-8">
        <Skeleton className="h-12 w-48 mx-auto rounded-lg bg-green-900/50" />
      </div>
    </div>
  );
}

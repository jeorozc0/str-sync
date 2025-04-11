import { Skeleton } from "@/components/ui/skeleton";

export default function LogsLoadingSkeleton() {
  return (
    // Container matching the page layout
    <div className="container mx-auto px-4 py-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-48 bg-gray-700" /> {/* Title */}
        {/* Optional: Skeleton for action button if you add one */}
        {/* <Skeleton className="h-9 w-32 rounded-md bg-gray-600" /> */}
      </div>

      {/* List Item Skeletons */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => ( // Show several skeleton items
          <Skeleton key={i} className="h-[76px] w-full rounded-lg bg-[#111111] border border-[#333333]"> {/* Approx height of LogListItem */}
            <div className="flex items-center justify-between p-4 gap-3 h-full">
              {/* Left side skeleton */}
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/5 bg-neutral-700/60" /> {/* Name */}
                {/* Stats row skeleton */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <Skeleton className="h-3 w-24 bg-neutral-700/40" /> {/* Date */}
                  <Skeleton className="h-3 w-16 bg-neutral-700/40" /> {/* Duration */}
                  <Skeleton className="h-3 w-20 bg-neutral-700/40" /> {/* Exercises */}
                </div>
              </div>
              {/* Right side actions skeleton */}
              <Skeleton className="h-8 w-8 rounded-md bg-neutral-700/50" /> {/* Menu Trigger */}
            </div>
          </Skeleton>
        ))}
      </div>
    </div>
  );
}

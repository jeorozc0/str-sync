import { Skeleton } from "@/components/ui/skeleton";

export default function FolderLoading() {
  const numberOfSkeletonCards = 3; // Define how many cards to show

  return (
    <div className="min-h-screen bg-black text-white animate-pulse">
      <main className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="flex items-center gap-3 mb-8">
          <Skeleton className="h-8 w-8 rounded-md bg-gray-700" /> {/* Back Button */}
          <Skeleton className="h-8 w-48 bg-gray-700" /> {/* Folder Title */}
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content Area Skeleton */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-7 w-40 bg-gray-700" /> {/* "Workouts (Count)" Title */}
              <Skeleton className="h-9 w-32 rounded-md bg-gray-600" /> {/* Add Button */}
            </div>

            {/* Workout Cards Skeleton - More detailed */}
            <div className="space-y-3">
              {/* --- REVISED ARRAY CREATION --- */}
              {Array.from({ length: numberOfSkeletonCards }).map((_, i) => (
                <Skeleton key={i} className="rounded-lg bg-neutral-900/50 border border-neutral-800 h-[92px]">
                  <div className="flex items-center justify-between p-4 gap-3 h-full">
                    {/* Left side skeleton */}
                    <div className="flex-1 overflow-hidden space-y-2">
                      <Skeleton className="h-5 w-3/5 bg-neutral-700/60" /> {/* Name */}
                      <Skeleton className="h-3 w-4/5 bg-neutral-700/40" /> {/* Description (optional) */}
                      {/* Stats Row Skeleton */}
                      <div className="flex items-center gap-x-4 gap-y-1 mt-2">
                        <Skeleton className="h-3 w-20 bg-neutral-700/40" /> {/* Exercises count */}
                        <Skeleton className="h-3 w-16 bg-neutral-700/40" /> {/* Last updated */}
                      </div>
                    </div>
                    {/* Right side actions skeleton (omitted) */}
                  </div>
                </Skeleton>
              ))}
              {/* --- END REVISION --- */}
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="w-full md:w-80 space-y-6">
            <Skeleton className="h-96 w-full rounded-lg bg-[#111111] border border-[#333333]" /> {/* Stats Card */}
          </div>
        </div>
      </main>
    </div>
  );
}


import { Skeleton } from "@/components/ui/skeleton";

export default function WorkoutTemplateLoading() {
  return (
    <div className="min-h-screen bg-black text-white animate-pulse">
      <main className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-4">
          {/* Left Side */}
          <div className="flex items-center gap-3 flex-grow min-w-0">
            <Skeleton className="h-8 w-8 rounded-md bg-gray-700 flex-shrink-0" /> {/* Back Button */}
            <div className="space-y-2 min-w-0">
              <Skeleton className="h-8 w-48 md:w-64 bg-gray-600" /> {/* Title */}
              <Skeleton className="h-5 w-24 md:w-32 bg-gray-700" /> {/* Folder Link */}
            </div>
          </div>
          {/* Right Side */}
          <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
            <Skeleton className="h-9 w-20 rounded-md bg-gray-700" /> {/* Edit Button */}
            <Skeleton className="h-9 w-20 rounded-md bg-gray-600" /> {/* Start Button */}
            <Skeleton className="h-9 w-9 rounded-md bg-gray-700" /> {/* Delete Button */}
          </div>
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Exercises List Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-7 w-48 bg-gray-700" /> {/* Title */}
            {/* Exercise Card Skeletons */}
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="rounded-lg border border-[#333333] bg-[#111111] h-[110px]"> {/* Approx height */}
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-5 w-3/4 bg-neutral-700/60" /> {/* Name */}
                    <Skeleton className="h-3 w-1/2 bg-neutral-700/40" /> {/* Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-sm pt-2">
                      <Skeleton className="h-4 w-12 bg-neutral-700/40" /> {/* Stat */}
                      <Skeleton className="h-4 w-16 bg-neutral-700/40" /> {/* Stat */}
                      <Skeleton className="h-4 w-10 bg-neutral-700/40" /> {/* Stat */}
                      <Skeleton className="h-4 w-14 bg-neutral-700/40" /> {/* Stat */}
                    </div>
                  </div>
                </Skeleton>
              ))}
            </div>
          </div>

          {/* Right Column: Template Info Card Skeleton */}
          <div className="space-y-6">
            <Skeleton className="rounded-lg border border-[#333333] bg-[#111111] sticky top-4 h-[400px]"> {/* Approx height */}
              <div className="p-4 space-y-4">
                <Skeleton className="h-6 w-3/5 bg-neutral-700/60" /> {/* Title */}
                <Skeleton className="h-4 w-full bg-neutral-700/40" /> {/* Description line 1 */}
                <Skeleton className="h-4 w-4/5 bg-neutral-700/40" /> {/* Description line 2 */}
                <div className="border-t border-[#333333] pt-4 space-y-3">
                  <Skeleton className="h-5 w-full bg-neutral-700/50" /> {/* Stat row */}
                  <Skeleton className="h-5 w-full bg-neutral-700/50" /> {/* Stat row */}
                  <Skeleton className="h-5 w-full bg-neutral-700/50" /> {/* Stat row */}
                </div>
                <div className="border-t border-[#333333] pt-3">
                  <Skeleton className="h-8 w-full rounded-md bg-neutral-700/50" /> {/* History Button */}
                </div>
              </div>
            </Skeleton>
          </div>
        </div>
      </main>
    </div>
  );
}

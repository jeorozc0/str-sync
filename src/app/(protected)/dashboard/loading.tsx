import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <main className="container mx-auto px-4 py-8 animate-pulse">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Main Content Area Skeleton (Folders) */}
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <Skeleton className="h-8 w-48 bg-gray-700" /> {/* Folders Title */}
            <div className="flex gap-2">
              <Skeleton className="h-9 w-32 rounded-md bg-gray-600" /> {/* Add Button */}
            </div>
          </div>

          {/* Folder Grid Skeleton */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => ( // Show 6 skeleton cards
              <Skeleton key={i} className="rounded-lg border border-[#333333] bg-[#111111] h-[104px]"> {/* Approx height */}
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4 bg-neutral-700/60" /> {/* Title */}
                  <Skeleton className="h-4 w-1/2 bg-neutral-700/40" /> {/* Description */}
                  <div className="pt-2">
                    <Skeleton className="h-3 w-1/3 bg-neutral-700/40" /> {/* Footer */}
                  </div>
                </div>
              </Skeleton>
            ))}
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="w-full space-y-6 md:w-80">
          {/* Quick Stats Card Skeleton */}
          <Skeleton className="rounded-lg border border-[#333333] bg-[#111111] h-48">
            <div className="p-4 space-y-3">
              <Skeleton className="h-6 w-24 bg-neutral-700/60 mb-3" /> {/* Title */}
              <Skeleton className="h-8 w-full bg-neutral-700/40" />
              <Skeleton className="h-8 w-full bg-neutral-700/40" />
              <Skeleton className="h-8 w-full bg-neutral-700/40" />
            </div>
          </Skeleton>

          {/* Recent Workouts Card Skeleton */}
          <Skeleton className="rounded-lg border border-[#333333] bg-[#111111] h-64">
            <div className="p-4 space-y-4">
              <Skeleton className="h-6 w-32 bg-neutral-700/60 mb-3" /> {/* Title */}
              <Skeleton className="h-10 w-full bg-neutral-700/40" />
              <Skeleton className="h-10 w-full bg-neutral-700/40" />
              <Skeleton className="h-10 w-full bg-neutral-700/40" />
            </div>
          </Skeleton>
        </div>
      </div>
    </main>
  );
}

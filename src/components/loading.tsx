import { Skeleton } from "./ui/skeleton";

export default function TemplateDetailLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0a0a0a] to-[#111111] text-white">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-5 w-32 mb-4 bg-gray-700/50" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <Skeleton className="h-10 w-64 mb-2 bg-gray-700" />
              <Skeleton className="h-5 w-80 bg-gray-700/50" />
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Skeleton className="h-9 w-20 rounded-md bg-gray-700" />
              <Skeleton className="h-9 w-32 rounded-md bg-gray-600" />
            </div>
          </div>
          <Skeleton className="h-px w-full my-4 bg-[#333333]" />
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-sm">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <Skeleton className="h-5 w-20 bg-gray-700/50" />
              <Skeleton className="h-5 w-32 bg-gray-700/50" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-28 rounded-md bg-gray-800/50" />
              <Skeleton className="h-8 w-20 rounded-md bg-gray-800/50" />
            </div>
          </div>
        </div>

        <Skeleton className="h-px w-full my-6 lg:my-8 bg-[#333333]" />

        {/* Exercises List Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-7 w-48 mb-4 bg-gray-700" />
          <Skeleton className="h-28 w-full rounded-lg bg-[#1C1C1C]/60 border border-[#333333]" />
          <Skeleton className="h-28 w-full rounded-lg bg-[#1C1C1C]/60 border border-[#333333]" />
          <Skeleton className="h-28 w-full rounded-lg bg-[#1C1C1C]/60 border border-[#333333]" />
        </div>
      </div>
    </div>
  );
}


import { Skeleton } from "@/components/ui/skeleton";

export default function LogDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-4">
        {/* Left Side */}
        <div className="flex items-center gap-3 flex-grow min-w-0">
          <Skeleton className="h-8 w-8 rounded-md bg-gray-700 flex-shrink-0" /> {/* Back Button */}
          <div className="space-y-2 min-w-0">
            <Skeleton className="h-8 w-48 md:w-64 bg-gray-600" /> {/* Log Title (Template Name) */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1"> {/* Metadata */}
              <Skeleton className="h-4 w-32 bg-gray-700" /> {/* Date/Time */}
              <Skeleton className="h-4 w-20 bg-gray-700" /> {/* Duration */}
            </div>
          </div>
        </div>
        {/* Right Side (Optional Actions like Repeat/Delete Log) */}
        <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
          <Skeleton className="h-9 w-20 rounded-md bg-gray-700" /> {/* Example Action */}
          <Skeleton className="h-9 w-9 rounded-md bg-gray-700" /> {/* Example Action */}
        </div>
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs Skeleton (if using tabs for Log Overview/Exercises) */}
          <Skeleton className="h-10 w-1/2 rounded-md mb-6" />
          {/* Logged Exercise Card Skeletons */}
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-lg bg-[#111111] border border-[#333333]" />
            <Skeleton className="h-32 w-full rounded-lg bg-[#111111] border border-[#333333]" />
            <Skeleton className="h-32 w-full rounded-lg bg-[#111111] border border-[#333333]" />
          </div>
        </div>
        <div className="space-y-6">
          {/* Sidebar Skeleton (e.g., performance summary or notes) */}
          <Skeleton className="h-96 rounded-lg sticky top-4 bg-[#111111] border border-[#333333]" />
        </div>
      </div>
    </div>
  );
}

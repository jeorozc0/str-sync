import { Suspense } from "react"; // Import Suspense
import {
  FolderPlus,
  Activity as ActivityIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { getUserFolders } from "@/server/queries/folders";
import { authenticateAndGetUserId } from "@/lib/auth";
import { FoldersSection } from "./_components/folder-section";
import { ActivitySection } from "./_components/activity-section";

// --- Loading Skeleton for Activity Section ---
function ActivitySkeleton() {
  return (
    // Mimic the outer spacing of ActivitySection
    <div className="space-y-6 animate-pulse">
      {/* Skeleton for Quick Stats Card */}
      <Card className="border-[#333333] bg-[#111111]">
        <CardHeader className="pb-3">
          {/* Skeleton Title */}
          <div className="h-5 w-2/5 rounded bg-[#222222]"></div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Skeleton Stat Item */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 flex-shrink-0 rounded-full bg-[#1A1A1A]"></div>
            <div className="flex-grow space-y-1.5">
              <div className="h-4 w-24 rounded bg-[#222222]"></div>
              <div className="h-3 w-32 rounded bg-[#222222]"></div>
            </div>
          </div>
          {/* Repeat Skeleton Stat Item */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 flex-shrink-0 rounded-full bg-[#1A1A1A]"></div>
            <div className="flex-grow space-y-1.5">
              <div className="h-4 w-32 rounded bg-[#222222]"></div>
              <div className="h-3 w-40 rounded bg-[#222222]"></div>
            </div>
          </div>
          {/* Repeat Skeleton Stat Item */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 flex-shrink-0 rounded-full bg-[#1A1A1A]"></div>
            <div className="flex-grow space-y-1.5">
              <div className="h-4 w-28 rounded bg-[#222222]"></div>
              <div className="h-3 w-36 rounded bg-[#222222]"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skeleton for Recent Workouts Card */}
      <Card className="border-[#333333] bg-[#111111]">
        <CardHeader className="pb-3">
          {/* Skeleton Title */}
          <div className="h-5 w-2/5 rounded bg-[#222222]"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Skeleton Workout Item */}
          <div className="mb-4 border-b border-[#222222] pb-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-3/4 rounded bg-[#222222]"></div>
                <div className="h-3 w-1/2 rounded bg-[#222222]"></div>
              </div>
              <div className="h-8 w-16 flex-shrink-0 rounded bg-[#1A1A1A]"></div>
            </div>
          </div>
          {/* Repeat Skeleton Workout Item */}
          <div className="mb-4 border-b border-[#222222] pb-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-2/3 rounded bg-[#222222]"></div>
                <div className="h-3 w-5/6 rounded bg-[#222222]"></div>
              </div>
              <div className="h-8 w-16 flex-shrink-0 rounded bg-[#1A1A1A]"></div>
            </div>
          </div>
          {/* Repeat Skeleton Workout Item */}
          <div> {/* No bottom border on the last item */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-4/5 rounded bg-[#222222]"></div>
                <div className="h-3 w-2/3 rounded bg-[#222222]"></div>
              </div>
              <div className="h-8 w-16 flex-shrink-0 rounded bg-[#1A1A1A]"></div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-center pb-3 pt-2">
          {/* Skeleton Button */}
          <div className="h-9 w-full rounded bg-[#1A1A1A]"></div>
        </CardFooter>
      </Card>
    </div>
  );
}

// --- Main Page Component ---
export default async function Home() {
  // 1. Authenticate and get user ID first
  const userId = await authenticateAndGetUserId();

  // 2. Fetch only the essential data needed for the *initial* paint (Folders)
  // Activity data will be fetched within its own component via Suspense
  const foldersResult = await getUserFolders(userId);
  const { folders, error: foldersError } = foldersResult;

  // 3. Handle critical error for initial data fetch
  // If folders fail, we can't render the main part of the page meaningfully
  if (foldersError) {
    console.error("Critical Data Fetching Error (Folders):", foldersError);
    return (
      <>
        <div className="container mx-auto px-4 py-6">
          <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>
          <Card className="border-destructive bg-destructive/10 text-destructive">
            <CardHeader>
              <CardTitle>Error Loading Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                There was an error loading essential dashboard data (folders). Please try again later.
              </p>
              {/* Optionally show details in dev */}
              {process.env.NODE_ENV === 'development' && (
                <pre className="mt-2 text-xs whitespace-pre-wrap">
                  {foldersError}
                </pre>
              )}
            </CardContent>
          </Card>
        </div>
        <Toaster richColors theme="dark" position="bottom-right" />
      </>
    );
  }

  // 4. Render the page structure with Suspense for deferred content
  return (
    <>
      {/* --- Mobile Tab Structure --- */}
      <Tabs defaultValue="folders" className="md:hidden">
        {/* Sticky TabsList for mobile */}
        <div className="sticky top-0 z-10 bg-transparent px-4 py-3 shadow-sm"> {/* Adjust bg color if needed */}
          <TabsList className="grid h-auto w-full grid-cols-2 bg-[#111111] px-1 py-1">
            <TabsTrigger
              value="folders"
              className="flex items-center justify-center gap-2 rounded-md py-3 text-sm data-[state=active]:bg-[#222222] data-[state=active]:text-white"
            >
              <FolderPlus className="h-4 w-4 flex-shrink-0" />
              <span className="truncate font-medium">Folders</span>
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="flex items-center justify-center gap-2 rounded-md py-3 text-sm data-[state=active]:bg-[#222222] data-[state=active]:text-white"
            >
              <ActivityIcon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate font-medium">Activity</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content Area */}
        <div className="px-4 pt-6 pb-24"> {/* Add padding for content below sticky tabs */}
          <TabsContent value="folders">
            {/* Render FoldersSection directly - data is ready */}
            <FoldersSection userId={userId} folders={folders} />
          </TabsContent>
          <TabsContent value="activity">
            {/* Use Suspense for Activity: Show skeleton while loading */}
            <Suspense fallback={<ActivitySkeleton />}>
              {/* ActivitySection fetches its own data */}
              <ActivitySection userId={userId} />
            </Suspense>
          </TabsContent>
        </div>
      </Tabs>

      {/* --- Desktop Layout Container --- */}
      <div className="container mx-auto hidden px-4 py-8 md:flex md:flex-row md:gap-8">
        {/* Left Column (Folders) */}
        <div className="flex-1 md:order-first">
          {/* Render FoldersSection directly - data is ready */}
          <FoldersSection userId={userId} folders={folders} />
        </div>
        {/* Right Column (Activity Sidebar) */}
        <div className="w-full  md:w-96 md:order-last">
          {/* Use Suspense for Activity: Show skeleton while loading */}
          <Suspense fallback={<ActivitySkeleton />}>
            {/* ActivitySection fetches its own data */}
            <ActivitySection userId={userId} />
          </Suspense>
        </div>
      </div>

      {/* Global Toaster */}
      <Toaster richColors theme="dark" position="bottom-right" />
    </>
  );
}


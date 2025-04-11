import Link from "next/link";
import { BarChart2, Calendar, Clock, Award, FolderPlus, Activity as ActivityIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserFolders } from "@/server/queries/folders"; // Assuming the type exists
import { authenticateAndGetUserId } from "@/lib/auth";
import { AddItemButton } from "@/components/add-folder-button";

type FoldersType = Awaited<ReturnType<typeof getUserFolders>>['folders'];

interface FoldersSectionProps {
  userId: string;
  folders: FoldersType; // Use the inferred type
}

// Define a type for the Workout object
interface RecentWorkout {
  id: number;
  name: string;
  date: string;
  duration: string;
}

// Mock data with explicit type
const recentWorkouts: RecentWorkout[] = [
  { id: 1, name: "Upper Body Strength", date: "Today", duration: "45 min" },
  { id: 2, name: "Leg Day", date: "Yesterday", duration: "60 min" },
  { id: 3, name: "Quick Core", date: "3 days ago", duration: "20 min" },
];

export default async function Home() {
  const userId = await authenticateAndGetUserId();
  // Include description if needed by FoldersSection Card
  const { folders, error } = await getUserFolders(userId);

  if (error) {
    return (
      <>
        {/* Add container and padding for error state */}
        <div className="container mx-auto px-4 py-6">
          <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
            <p>There was an error loading your folders: {error}</p>
          </div>
        </div>
        <Toaster richColors theme="dark" position="bottom-right" />
      </>
    );
  }

  return (
    <>
      {/* Mobile Tab Structure */}
      {/* This entire Tabs component is hidden on desktop */}
      <Tabs defaultValue="folders" className="md:hidden px-4 py-4">
        {/* Sticky Tabs List for mobile navigation with improved styling */}
        <TabsList className="sticky z-10 grid w-full h-auto grid-cols-2 bg-[#111111] px-1 py-1 shadow-sm mx-auto max-w-screen-xl">
          <TabsTrigger value="folders" className="flex items-center justify-center gap-2 rounded-md py-3 text-sm data-[state=active]:bg-[#222222] data-[state=active]:text-white">
            <FolderPlus className="h-4 w-4 flex-shrink-0" />
            <span className="truncate font-medium">Folders</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center justify-center gap-2 rounded-md py-3 text-sm data-[state=active]:bg-[#222222] data-[state=active]:text-white">
            <ActivityIcon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate font-medium">Activity</span>
          </TabsTrigger>
        </TabsList>

        {/* Mobile-only TabsContent wrappers with consistent padding */}
        <TabsContent value="folders" className="mt-6 pb-24">
          {/* Render Folders section */}
          <FoldersSection userId={userId} folders={folders} />
        </TabsContent>
        <TabsContent value="activity" className="mt-6 pb-24">
          {/* Render Activity section */}
          <ActivitySection recentWorkouts={recentWorkouts} />
        </TabsContent>
      </Tabs>

      {/* --- Desktop Layout Container --- */}
      {/* This div renders the sections side-by-side, hidden on mobile */}
      <div className="container mx-auto hidden px-4 py-8 md:flex md:flex-row md:gap-8">
        {/* Always render Folder section on desktop */}
        <div className="flex-1 md:order-first">
          <FoldersSection userId={userId} folders={folders} />
        </div>
        {/* Always render Activity section on desktop */}
        <div className="w-full space-y-6 md:w-96 md:order-last">
          <ActivitySection recentWorkouts={recentWorkouts} />
        </div>
      </div>

      {/* Global Toaster */}
      <Toaster richColors theme="dark" position="bottom-right" />
    </>
  );
}

function FoldersSection({ userId, folders }: FoldersSectionProps) {
  return (
    <>
      {/* Folder Header: Title, Add button */}
      <div className="mb-5 flex flex-col gap-4">
        {/* Top row: Title and Add Button */}
        <div className="flex w-full items-center justify-between">
          <h2 className="text-xl font-semibold md:text-2xl">Workout Folders</h2>
          <AddItemButton userId={userId} className="bg-[#1A1A1A] border-[#333333] text-white hover:bg-[#222222]" />
        </div>
      </div>

      {/* Folder Grid / Empty State */}
      {folders && folders.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map((folder) => (
            <Link href={`/f/${folder.id}`} key={folder.id} passHref>
              <Card className="flex h-full cursor-pointer flex-col border-[#333333] bg-[#111111] transition-all hover:bg-[#1A1A1A] hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{folder.name}</CardTitle>
                  <CardDescription>
                    {/* Access _count safely */}
                    {folder._count?.workouts ?? 0} workout{(folder._count?.workouts ?? 0) !== 1 ? 's' : ''}
                    {/* Display description if it exists */}
                    {folder.description && (
                      <span className="mt-1 block truncate text-xs italic text-gray-500" title={folder.description}>
                        {folder.description}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto pt-2 text-xs text-gray-400">
                  Last updated{" "}
                  {new Date(folder.updatedAt).toLocaleDateString()}
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-[#333333] bg-[#111111]">
          <CardContent className="flex flex-col items-center justify-center px-6 py-10 text-center">
            <div className="mb-4 rounded-full bg-[#1A1A1A] p-4">
              <FolderPlus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium">
              No workout folders yet
            </h3>
            <p className="mb-6 max-w-xs text-gray-400">
              Click the &apos;+&apos; button above to create your first folder or workout.
            </p>
            <Button
              variant="outline"
              className="bg-[#1A1A1A] border-[#333333] text-white hover:bg-[#222222]"
              onClick={() => {/* This would trigger the same action as AddItemButton */ }}
            >
              Create Folder
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}

// --- Helper Component for Activity Section ---
// Type definition for props uses the explicit Workout type
interface ActivitySectionProps {
  recentWorkouts: RecentWorkout[];
}

function ActivitySection({ recentWorkouts }: ActivitySectionProps) {
  return (
    <div className="space-y-6">
      {/* Quick Stats Card */}
      <Card className="border-[#333333] bg-[#111111] shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Stat items */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A1A1A]">
              <Award className="h-5 w-5 text-gray-300" />
            </div>
            <div>
              <p className="text-sm font-medium">5 day streak</p>
              <p className="text-xs text-gray-400">Keep it up!</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A1A1A]">
              <Calendar className="h-5 w-5 text-gray-300" />
            </div>
            <div>
              <p className="text-sm font-medium">12 workouts this month</p>
              <p className="text-xs text-gray-400">
                3 more than last month
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A1A1A]">
              <BarChart2 className="h-5 w-5 text-gray-300" />
            </div>
            <div>
              <p className="text-sm font-medium">New PR: Bench Press</p>
              <p className="text-xs text-gray-400">185 lbs × 5 reps</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Workouts Card */}
      <Card className="border-[#333333] bg-[#111111] shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Workouts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Map over the typed recentWorkouts array */}
          {recentWorkouts.map((workout, index) => (
            <div
              key={workout.id}
              className={`${index !== recentWorkouts.length - 1 ? "border-b border-[#222222] pb-4 mb-4" : ""
                }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-medium">{workout.name}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      <span>{workout.date}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      <span>{workout.duration}</span>
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 flex-shrink-0 text-xs bg-[#1A1A1A] rounded-md hover:bg-[#222222]">
                  Repeat
                </Button>
              </div>
            </div>
          ))}
          {/* Check length safely */}
          {recentWorkouts.length === 0 && (
            <div className="py-6 text-center">
              <Clock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-400">No recent workouts recorded.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-center pt-2 pb-3">
          <Button variant="outline" size="sm" className="w-full bg-[#1A1A1A] border-[#333333] text-white hover:bg-[#222222]">
            View All Workouts
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

import Link from "next/link";
import {
  BarChart2,
  Calendar,
  Clock,
  Award,
  FolderPlus,
  Activity as ActivityIcon,
} from "lucide-react";
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
import { getUserFolders } from "@/server/queries/folders";
// Import the new query functions and types
import {
  getRecentWorkoutLogs,
  getWorkoutStats,
  type RecentWorkoutLogData, // Import the type
  type WorkoutStatsData, // Import the type
} from "@/server/queries/activities";
import { authenticateAndGetUserId } from "@/lib/auth";
import { AddItemButton } from "@/components/add-folder-button";
import { formatDistanceToNow, format } from "date-fns"; // For date formatting

// Type for Folders remains the same
type FoldersType = Awaited<ReturnType<typeof getUserFolders>>["folders"];

interface FoldersSectionProps {
  userId: string;
  folders: FoldersType;
}

export default async function Home() {
  const userId = await authenticateAndGetUserId();

  // Fetch all data concurrently
  const [foldersResult, recentLogsResult, statsResult] = await Promise.all([
    getUserFolders(userId),
    getRecentWorkoutLogs(userId),
    getWorkoutStats(userId),
  ]);

  const { folders, error: foldersError } = foldersResult;
  const { logs: recentWorkouts, error: recentWorkoutsError } =
    recentLogsResult;
  const { stats, error: statsError } = statsResult;

  // Handle potential errors (you might want more granular error display)
  const anyError = (foldersError ?? recentWorkoutsError) ?? statsError;
  if (anyError) {
    // Log the specific errors for debugging
    console.error("Data fetching errors:", {
      foldersError,
      recentWorkoutsError,
      statsError,
    });
    return (
      <>
        <div className="container mx-auto px-4 py-6">
          <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
            <p>
              There was an error loading dashboard data. Please try again later.
            </p>
            {/* Optionally display specific errors */}
            {/* <p>Details: {anyError}</p> */}
          </div>
        </div>
        <Toaster richColors theme="dark" position="bottom-right" />
      </>
    );
  }

  return (
    <>
      {/* Mobile Tab Structure */}
      <Tabs defaultValue="folders" className="md:hidden px-4 py-4">
        <TabsList className="sticky z-10 grid w-full h-auto grid-cols-2 bg-[#111111] px-1 py-1 shadow-sm mx-auto max-w-screen-xl">
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

        <TabsContent value="folders" className="mt-6 pb-24">
          <FoldersSection userId={userId} folders={folders} />
        </TabsContent>
        <TabsContent value="activity" className="mt-6 pb-24">
          {/* Pass real data to ActivitySection */}
          <ActivitySection recentWorkouts={recentWorkouts} stats={stats} />
        </TabsContent>
      </Tabs>

      {/* --- Desktop Layout Container --- */}
      <div className="container mx-auto hidden px-4 py-8 md:flex md:flex-row md:gap-8">
        <div className="flex-1 md:order-first">
          <FoldersSection userId={userId} folders={folders} />
        </div>
        <div className="w-full space-y-6 md:w-96 md:order-last">
          {/* Pass real data to ActivitySection */}
          <ActivitySection recentWorkouts={recentWorkouts} stats={stats} />
        </div>
      </div>

      {/* Global Toaster */}
      <Toaster richColors theme="dark" position="bottom-right" />
    </>
  );
}

// --- FoldersSection Component (No changes needed here) ---
function FoldersSection({ userId, folders }: FoldersSectionProps) {
  // ... (keep existing implementation)
  return (
    <>
      {/* Folder Header: Title, Add button */}
      <div className="mb-5 flex flex-col gap-4">
        {/* Top row: Title and Add Button */}
        <div className="flex w-full items-center justify-between">
          <h2 className="text-xl font-semibold md:text-2xl">Workout Folders</h2>
          <AddItemButton
            userId={userId}
            className="bg-[#1A1A1A] border-[#333333] text-white hover:bg-[#222222]"
          />
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
                    {folder._count?.workouts ?? 0} workout
                    {(folder._count?.workouts ?? 0) !== 1 ? "s" : ""}
                    {/* Display description if it exists */}
                    {folder.description && (
                      <span
                        className="mt-1 block truncate text-xs italic text-gray-500"
                        title={folder.description}
                      >
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
              Click the &apos;+&apos; button above to create your first folder
              or workout.
            </p>
            <AddItemButton
              userId={userId}
            />
          </CardContent>
        </Card>
      )}
    </>
  );
}

// --- Helper Component for Activity Section ---

// Update props to use the new types from activity.ts
interface ActivitySectionProps {
  recentWorkouts: RecentWorkoutLogData; // Use the imported type
  stats: WorkoutStatsData; // Use the imported type
}

// Helper function for relative date formatting
function formatRelativeDate(date: Date | null): string {
  if (!date) return "N/A";
  const now = new Date();
  const logDate = new Date(date);
  const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24);

  if (diffDays < 1 && now.getDate() === logDate.getDate()) {
    return "Today";
  } else if (diffDays < 2 && now.getDate() - 1 === logDate.getDate()) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return formatDistanceToNow(logDate, { addSuffix: true });
  } else {
    return format(logDate, "MMM d, yyyy"); // e.g., Apr 15, 2025
  }
}

function ActivitySection({ recentWorkouts, stats }: ActivitySectionProps) {
  const workoutsThisMonth = stats?.workoutsThisMonth ?? 0;
  const workoutsLastMonth = stats?.workoutsLastMonth ?? 0;
  const monthDifference = workoutsThisMonth - workoutsLastMonth;

  return (
    <div className="space-y-6">
      {/* Quick Stats Card */}
      <Card className="border-[#333333] bg-[#111111] shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Stat items using real data */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A1A1A]">
              <Award className="h-5 w-5 text-gray-300" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {stats?.streak ?? 0} day streak
              </p>
              <p className="text-xs text-gray-400">
                {(stats?.streak ?? 0) > 0 ? "Keep it up!" : "Log a workout!"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A1A1A]">
              <Calendar className="h-5 w-5 text-gray-300" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {workoutsThisMonth} workout{workoutsThisMonth !== 1 ? "s" : ""}{" "}
                this month
              </p>
              <p className="text-xs text-gray-400">
                {monthDifference > 0
                  ? `${monthDifference} more than last month`
                  : monthDifference < 0
                    ? `${Math.abs(monthDifference)} fewer than last month`
                    : "Same as last month"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A1A1A]">
              <BarChart2 className="h-5 w-5 text-gray-300" />
            </div>
            {stats?.recentPR ? (
              <div>
                <p className="text-sm font-medium">
                  Recent PR: {stats.recentPR.exerciseName}
                </p>
                <p className="text-xs text-gray-400">
                  {stats.recentPR.weight} lbs × {stats.recentPR.reps} reps
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium">No recent PRs</p>
                <p className="text-xs text-gray-400">
                  Keep logging to find new records!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Workouts Card */}
      <Card className="border-[#333333] bg-[#111111] shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Workouts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Map over the real recentWorkouts array */}
          {recentWorkouts && recentWorkouts.length > 0 ? (
            recentWorkouts.map((log, index) => (
              <div
                key={log.id}
                className={`${index !== recentWorkouts.length - 1 ? "border-b border-[#222222] pb-4 mb-4" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate font-medium">
                      {log.workout?.name ?? "Workout"} {/* Handle potential null workout name */}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {/* Format the date nicely */}
                        <span>{formatRelativeDate(log.completedAt)}</span>
                      </span>
                      {log.duration && ( // Only show duration if it exists
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          <span>{Math.round(log.duration / 60)} min</span>{" "}
                          {/* Assuming duration is in seconds */}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Add Link to repeat workout - needs workout ID */}
                  {/* You might need to adjust the href based on your routing */}
                  <Link href={`/w/${log.workout.id}/start`} passHref>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 flex-shrink-0 text-xs bg-[#1A1A1A] rounded-md hover:bg-[#222222]"
                    >
                      Repeat
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center">
              <Clock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-400">
                No recent workouts recorded.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-center pt-2 pb-3">
          {/* Link to a page showing all workout logs */}
          <Link href="/logs" passHref className="w-full">
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-[#1A1A1A] border-[#333333] text-white hover:bg-[#222222]"
            >
              View Workout History
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}


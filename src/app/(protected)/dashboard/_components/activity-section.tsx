import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import {
  Award,
  Calendar,
  Clock,
  BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getRecentWorkoutLogs,
  getWorkoutStats,
} from "@/server/queries/activities"; // Adjust path as needed

interface ActivitySectionProps {
  userId: string; // Receive userId to fetch data
}

// Helper function for relative date formatting
function formatRelativeDate(date: Date | null): string {
  if (!date) return "N/A";
  const now = new Date();
  const logDate = new Date(date);
  // Calculate difference in days, ignoring time component for simplicity here
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfLogDate = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate());
  const diffTime = startOfToday.getTime() - startOfLogDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));


  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    // Use distance for recent past within a week
    return formatDistanceToNow(logDate, { addSuffix: true });
  } else {
    // Use a specific format for older dates
    return format(logDate, "MMM d, yyyy"); // e.g., Apr 15, 2025
  }
}

// Make the component async to use await for data fetching
export async function ActivitySection({ userId }: ActivitySectionProps) {
  // Fetch activity data inside the component
  // Promise.all is still good here as these fetches belong to the same logical UI section
  const [recentLogsResult, statsResult] = await Promise.all([
    getRecentWorkoutLogs(userId),
    getWorkoutStats(userId),
  ]);

  // Destructure results safely
  const recentWorkouts = recentLogsResult?.logs ?? [];
  const recentWorkoutsError = recentLogsResult?.error;
  const stats = statsResult?.stats; // stats can be null/undefined based on query return
  const statsError = statsResult?.error;

  // Handle errors specific to this section
  // You might want a more user-friendly error display than just logging
  if (recentWorkoutsError || statsError) {
    console.error("Activity Section Data Fetching Error:", {
      recentWorkoutsError,
      statsError,
    });
    // Render an error state within this component's boundary
    // This will be shown *after* the Suspense fallback resolves if an error occurs
    return (
      <div className="space-y-6">
        <Card className="border-destructive bg-destructive/10 text-destructive">
          <CardHeader>
            <CardTitle>Error Loading Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Could not load workout activity data. Please try again later.</p>
            {/* Optionally show error details in development */}
            {process.env.NODE_ENV === 'development' && (
              <pre className="mt-2 text-xs whitespace-pre-wrap">
                {JSON.stringify({ recentWorkoutsError, statsError }, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate derived stats (ensure safe access to potentially null 'stats')
  const workoutsThisMonth = stats?.workoutsThisMonth ?? 0;
  const workoutsLastMonth = stats?.workoutsLastMonth ?? 0;
  const monthDifference = workoutsThisMonth - workoutsLastMonth;
  const currentStreak = stats?.streak ?? 0;
  const recentPR = stats?.recentPR; // Can be null or object

  return (
    <div className="space-y-6">
      {/* Quick Stats Card */}
      <Card className="border-[#333333] bg-[#111111] shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Stat: Streak */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A1A1A]">
              <Award className="h-5 w-5 text-gray-300" />
            </div>
            <div>
              <p className="text-sm font-medium">{currentStreak} day streak</p>
              <p className="text-xs text-gray-400">
                {currentStreak > 0 ? "Keep it up!" : "Log a workout!"}
              </p>
            </div>
          </div>
          {/* Stat: Workouts This Month */}
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
          {/* Stat: Recent PR */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A1A1A]">
              <BarChart2 className="h-5 w-5 text-gray-300" />
            </div>
            {recentPR ? (
              <div>
                <p className="text-sm font-medium">
                  Recent PR: {recentPR.exerciseName}
                </p>
                <p className="text-xs text-gray-400">
                  {recentPR.weight} lbs × {recentPR.reps} reps
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
      <Card className="border-[#333333] bg-[#111111] shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Workouts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentWorkouts && recentWorkouts.length > 0 ? (
            recentWorkouts.map((log, index) => (
              <div
                key={log.id}
                className={`${index !== recentWorkouts.length - 1
                  ? "mb-4 border-b border-[#222222] pb-4"
                  : ""
                  }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate font-medium">
                      {/* Safely access workout name */}
                      {log.workout?.name ?? "Workout"}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        <span>{formatRelativeDate(log.completedAt)}</span>
                      </span>
                      {/* Only show duration if it exists and is > 0 */}
                      {log.duration && log.duration > 0 && (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          <span>{Math.round(log.duration / 60)} min</span>
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Ensure workout ID exists before creating link */}
                  {log.workout?.id && (
                    <Link href={`/w/${log.workout.id}/start`} passHref>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 flex-shrink-0 rounded-md bg-[#1A1A1A] text-xs hover:bg-[#222222]"
                      >
                        Repeat
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center">
              <Clock className="mx-auto mb-2 h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-400">
                No recent workouts recorded.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-center pb-3 pt-2">
          <Link href="/logs" passHref className="w-full">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-[#333333] bg-[#1A1A1A] text-white hover:bg-[#222222]"
            >
              View Workout History
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

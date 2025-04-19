
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Target, Flame, Plus, Dumbbell, ChartBar } from 'lucide-react';
import { Inter } from 'next/font/google';
// Import the new query function and type
import { getFolderById, type GetFolderByIdResult } from '@/server/queries/folders';
import WorkoutCards from '@/components/workout-card';
import { Toaster } from "@/components/ui/sonner";
import { authenticateAndGetUserId } from '@/lib/auth';
import { type FolderStatsData, getFolderStats } from '@/server/queries/activities';

const inter = Inter({ subsets: ['latin'] });

interface FolderPageProps {
  params: { id: string }
}

export default async function FolderPage({ params }: FolderPageProps) {
  const { id: folderId } = params;
  const userId = await authenticateAndGetUserId();

  // Fetch folder details and stats concurrently
  const [folderResult, statsResult] = await Promise.all([
    getFolderById(folderId, userId),
    getFolderStats(folderId, userId)
  ]);

  const { folder, error: folderError } = folderResult;
  const { stats, error: statsError } = statsResult;

  // Handle errors (prioritize folder not found)
  if (folderError || !folder) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <Link href="/dashboard">
          <Button variant="outline" size="icon" className="h-8 w-8 border-[#333333] mb-4">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to dashboard</span>
          </Button>
        </Link>
        <h1 className="text-xl text-red-500">Error: {folderError ?? "Folder not found or access denied."}</h1>
      </div>
    );
  }

  // Handle stats error separately (show page but maybe indicate stats issue)
  if (statsError) {
    console.error("Stats Error:", statsError);
    // You could display a message in the stats section later
  }

  return (
    <div className={`min-h-screen bg-black text-white ${inter.className}`}>
      <main className="container mx-auto px-4"> {/* Added horizontal padding */}
        {/* Back Button & Title */}
        <div className="flex items-center gap-3 py-4 md:pt-8"> {/* Removed md:px-4 */}
          <Link href="/dashboard">
            <Button variant="outline" size="icon" className="h-8 w-8 border-[#333333] flex-shrink-0"> {/* Added flex-shrink-0 */}
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to dashboard</span>
            </Button>
          </Link>
          {/* Make title slightly smaller and allow wrapping if needed */}
          <h1 className="text-xl md:text-2xl font-semibold truncate">{folder.name}</h1>
        </div>

        {/* Mobile Tab Structure */}
        <Tabs defaultValue="workouts" className="md:hidden">
          <TabsList className="sticky top-0 z-10 grid w-full h-auto grid-cols-2 bg-[#111111] px-1 py-1 shadow-sm mx-auto max-w-screen-xl">
            <TabsTrigger value="workouts" className="flex items-center justify-center gap-2 rounded-md py-3 text-sm data-[state=active]:bg-[#222222] data-[state=active]:text-white">
              <Dumbbell className="h-4 w-4 flex-shrink-0" />
              <span className="truncate font-medium">Workouts</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center justify-center gap-2 rounded-md py-3 text-sm data-[state=active]:bg-[#222222] data-[state=active]:text-white">
              <ChartBar className="h-4 w-4 flex-shrink-0" />
              <span className="truncate font-medium">Stats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workouts" className="mt-6 pb-24">
            <WorkoutsSection folder={folder} />
          </TabsContent>
          <TabsContent value="stats" className="mt-6 pb-24">
            {/* Pass stats data */}
            <StatsSection folder={folder} stats={stats} error={statsError} />
          </TabsContent>
        </Tabs>

        {/* Desktop Layout */}
        <div className="hidden md:flex md:flex-row gap-8 pb-8"> {/* Removed px-4 */}
          <div className="flex-1 md:order-first">
            <WorkoutsSection folder={folder} />
          </div>
          <div className="w-full md:w-80 lg:w-96 space-y-6 md:order-last flex-shrink-0"> {/* Adjusted width and added flex-shrink-0 */}
            {/* Pass stats data */}
            <StatsSection folder={folder} stats={stats} error={statsError} />
          </div>
        </div>
      </main>
      <Toaster richColors theme="dark" position="bottom-right" />
    </div>
  );
}

// --- WorkoutsSection Component (No changes needed here) ---
interface WorkoutsSectionProps {
  folder: NonNullable<GetFolderByIdResult['folder']>;
}

function WorkoutsSection({ folder }: WorkoutsSectionProps) {
  // ... (keep existing implementation)
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium">Workouts</h2>
        <Link href={`/w/create?folderId=${folder.id}`}> {/* Pass folderId */}
          <Button className="bg-white text-black hover:bg-gray-200 gap-2 h-9">
            <Plus className="h-4 w-4" />
            Add Workout
          </Button>
        </Link>
      </div>

      {folder.workouts && folder.workouts.length > 0 ? (
        <WorkoutCards workouts={folder.workouts} />
      ) : (
        <Card className="bg-[#111111] border-[#333333] border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="rounded-full bg-[#1A1A1A] p-4 mb-4">
              <Dumbbell className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No workouts in this folder</h3>
            <p className="text-gray-400 mb-6 max-w-xs"> {/* Adjusted max-width */}
              Add your first workout template to start tracking sessions.
            </p>
            <Link href={`/w/create?folderId=${folder.id}`}> {/* Pass folderId */}
              <Button className="bg-white text-black hover:bg-gray-200 gap-2">
                <Plus className="h-4 w-4" />
                Add Workout
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </>
  );
}


// --- StatsSection Component ---
interface StatsSectionProps {
  folder: NonNullable<GetFolderByIdResult['folder']>;
  stats: FolderStatsData | null; // Accept the fetched stats
  error?: string | null; // Accept potential error message
}

// Helper to format large numbers (optional)
function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

function StatsSection({ stats, error }: StatsSectionProps) {
  // Sort muscle groups by percentage, descending
  const sortedMuscleGroups = stats?.muscleGroupDistribution
    ? Object.entries(stats.muscleGroupDistribution).sort(([, a], [, b]) => b - a)
    : [];

  return (
    <Card className="bg-[#111111] border-[#333333] shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>Folder Stats</CardTitle>
        {error && <p className="text-xs text-red-500 pt-1">{error}</p>}
      </CardHeader>
      <CardContent className="space-y-6">
        {stats ? (
          <>
            {/* General Stats */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-300">Total Weight Lifted</h3>
                {/* Optional: Add units, format large numbers */}
                <span className="text-lg font-semibold">
                  {formatNumber(Math.round(stats.totalWeightLifted))} lbs
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-300">Avg. Workout Duration</h3>
                <span className="text-lg font-semibold">
                  {stats.avgWorkoutDuration} min
                </span>
              </div>
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-300">Workouts Completed</h3>
                <span className="text-lg font-semibold">
                  {stats.workoutsCompletedCount}
                </span>
              </div>
            </div>

            {/* Muscle Group Distribution */}
            {sortedMuscleGroups.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-300">Muscle Groups Focus</h3>
                <div className="space-y-3">
                  {sortedMuscleGroups.map(([group, percentage]) => (
                    <div key={group}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="capitalize">{group.toLowerCase()}</span>
                        <span>{percentage}%</span>
                      </div>
                      <Progress value={percentage} className="h-1.5 bg-[#333333]" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Highlights */}
            {(stats.recentPRs.length > 0 || stats.mostFrequentExercise) && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-300">Highlights</h3>
                {/* Display Recent PRs */}
                {stats.recentPRs.length > 0 && (
                  <div className="flex items-start gap-3"> {/* Use items-start for multi-line */}
                    <div className="rounded-full bg-[#1A1A1A] p-2 mt-0.5 flex-shrink-0">
                      <Target className="h-4 w-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {stats.recentPRs.length} Recent PR{stats.recentPRs.length !== 1 ? 's' : ''}
                      </p>
                      {/* List first few PRs */}
                      <ul className="text-xs text-gray-400 list-disc list-inside">
                        {stats.recentPRs.slice(0, 2).map((pr, index) => (
                          <li key={index} className="truncate">
                            {pr.exerciseName}: {pr.weight} lbs x {pr.reps}
                          </li>
                        ))}
                        {stats.recentPRs.length > 2 && <li>...and more</li>}
                      </ul>
                    </div>
                  </div>
                )}
                {/* Display Most Frequent Exercise */}
                {stats.mostFrequentExercise && (
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-[#1A1A1A] p-2 flex-shrink-0">
                      <Flame className="h-4 w-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Most frequent exercise</p>
                      <p className="text-xs text-gray-400">
                        {stats.mostFrequentExercise.name} ({stats.mostFrequentExercise.count} times)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Message if no stats calculated yet */}
            {stats.workoutsCompletedCount === 0 && (
              <div className="text-center py-4">
                <ChartBar className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Complete some workouts in this folder to see stats here.</p>
              </div>
            )}

          </>
        ) : (
          // Loading or Initial State (before stats are loaded, though usually covered by error)
          <div className="text-center py-4">
            <p className="text-sm text-gray-400">Loading stats...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


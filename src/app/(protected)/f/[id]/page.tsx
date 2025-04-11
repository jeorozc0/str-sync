import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Target, Flame, Plus, Dumbbell, ChartBar } from 'lucide-react';
import { Inter } from 'next/font/google';
import { getFolderById, type GetFolderByIdResult } from '@/server/queries/folders';
import WorkoutCards from '@/components/workout-card';
import { Toaster } from "@/components/ui/sonner";
import { authenticateAndGetUserId } from '@/lib/auth';

const inter = Inter({ subsets: ['latin'] });

interface FolderPageProps {
  params: { id: string }
}

export default async function FolderPage({ params }: FolderPageProps) {
  const { id } = params;
  // Get the user's ID from the auth data
  const userId = await authenticateAndGetUserId()

  const { folder, error } = await getFolderById(id, userId);

  if (error || !folder) {
    return (
      <div className="min-h-screen bg-black text-white">
        Error: {error ?? "Folder not found"}
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-black text-white ${inter.className}`}>
      <main className="container mx-auto">
        {/* Back Button & Title - Visible on all screens */}
        <div className="flex items-center gap-3 py-4 md:pt-8 md:px-4">
          <Link href="/dashboard">
            <Button variant="outline" size="icon" className="h-8 w-8 border-[#333333]">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to folders</span>
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">{folder.name}</h1>
        </div>

        {/* Mobile Tab Structure - Hidden on desktop */}
        <Tabs defaultValue="workouts" className="md:hidden">
          <TabsList className="sticky z-10 grid w-full h-auto grid-cols-2 bg-[#111111] px-1 py-1 shadow-sm mx-auto max-w-screen-xl">
            <TabsTrigger value="workouts" className="flex items-center justify-center gap-2 rounded-md py-3 text-sm data-[state=active]:bg-[#222222] data-[state=active]:text-white">
              <Dumbbell className="h-4 w-4 flex-shrink-0" />
              <span className="truncate font-medium">Workouts</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center justify-center gap-2 rounded-md py-3 text-sm data-[state=active]:bg-[#222222] data-[state=active]:text-white">
              <ChartBar className="h-4 w-4 flex-shrink-0" />
              <span className="truncate font-medium">Stats</span>
            </TabsTrigger>
          </TabsList>

          {/* Mobile Tab Contents */}
          <TabsContent value="workouts" className="mt-6 pb-24">
            <WorkoutsSection folder={folder} />
          </TabsContent>
          <TabsContent value="stats" className="mt-6 pb-24">
            <StatsSection folder={folder} />
          </TabsContent>
        </Tabs>

        {/* Desktop Layout - Hidden on mobile */}
        <div className="hidden md:flex md:flex-row gap-8 px-4 pb-8">
          <div className="flex-1 md:order-first">
            <WorkoutsSection folder={folder} />
          </div>
          <div className="w-full md:w-80 space-y-6 md:order-last">
            <StatsSection folder={folder} />
          </div>
        </div>
      </main>
      <Toaster richColors theme="dark" position="bottom-right" />
    </div>
  );
}

interface WorkoutsSectionProps {
  folder: NonNullable<GetFolderByIdResult['folder']>;
}

// Extracted Workouts Section Component
function WorkoutsSection({ folder }: WorkoutsSectionProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium">Workouts</h2>
        <Link href={`/w/create?folder=${folder.id}`}>
          <Button className="bg-white text-black hover:bg-gray-200 gap-2 h-9">
            <Plus className="h-4 w-4" />
            Add Workout
          </Button>
        </Link>
      </div>

      {/* Render the workout cards as a client component */}
      {folder.workouts && folder.workouts.length > 0 ? (
        <WorkoutCards workouts={folder.workouts} />
      ) : (
        <Card className="bg-[#111111] border-[#333333] border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="rounded-full bg-[#1A1A1A] p-4 mb-4">
              <Dumbbell className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No workouts in this folder</h3>
            <p className="text-gray-400 mb-6 max-w-md">
              Add your first workout to start tracking your progress.
            </p>
            <Link href={`/w/create?folder=${folder.id}`}>
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

interface StatsSectionProps {
  folder: NonNullable<GetFolderByIdResult['folder']>;
}

// Extracted Stats Section Component
function StatsSection({ folder }: StatsSectionProps) {
  return (
    <Card className="bg-[#111111] border-[#333333] shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>Folder Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Total Weight Lifted</h3>
            <span className="text-lg font-semibold">0 kg</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Avg. Workout Duration</h3>
            <span className="text-lg font-semibold">0 min</span>
          </div>
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Workouts Completed</h3>
            <span className="text-lg font-semibold">
              {folder.workouts?.length || 0}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Muscle Groups</h3>
          {/* Static/dummy muscle group stats */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Chest</span>
              <span>65%</span>
            </div>
            <Progress value={65} className="h-1.5 bg-[#333333]" />
            <div className="flex justify-between text-xs mb-1">
              <span>Back</span>
              <span>45%</span>
            </div>
            <Progress value={45} className="h-1.5 bg-[#333333]" />
            <div className="flex justify-between text-xs mb-1">
              <span>Shoulders</span>
              <span>30%</span>
            </div>
            <Progress value={30} className="h-1.5 bg-[#333333]" />
            <div className="flex justify-between text-xs mb-1">
              <span>Arms</span>
              <span>55%</span>
            </div>
            <Progress value={55} className="h-1.5 bg-[#333333]" />
            <div className="flex justify-between text-xs mb-1">
              <span>Legs</span>
              <span>20%</span>
            </div>
            <Progress value={20} className="h-1.5 bg-[#333333]" />
            <div className="flex justify-between text-xs mb-1">
              <span>Core</span>
              <span>35%</span>
            </div>
            <Progress value={35} className="h-1.5 bg-[#333333]" />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium">Highlights</h3>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[#1A1A1A] p-2">
              <Target className="h-4 w-4 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium">2 PRs this month</p>
              <p className="text-xs text-gray-400">Bench Press, Deadlift</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[#1A1A1A] p-2">
              <Flame className="h-4 w-4 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Most frequent exercise</p>
              <p className="text-xs text-gray-400">Bench Press (8 times)</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

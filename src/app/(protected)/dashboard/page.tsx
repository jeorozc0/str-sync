import Link from "next/link";
import { BarChart2, Calendar, Clock, Award, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { redirect } from "next/navigation";
import { AddFolderButton } from "@/components/add-folder-button";
import { createClient } from "@/utils/supabase/server";
import { getUserFolders } from "@/server/queries/folders";

const recentWorkouts = [
  { id: 1, name: "Upper Body Strength", date: "Today", duration: "45 min" },
  { id: 2, name: "Leg Day", date: "Yesterday", duration: "60 min" },
  { id: 3, name: "Quick Core", date: "3 days ago", duration: "20 min" },
];

export default async function Home() {
  const supabase = await createClient();

  const { data, error: authError } = await supabase.auth.getUser();
  if (authError || !data?.user) {
    redirect("/login");
  }

  // Get the user's ID from the auth data
  const userId = data.user.id;

  // Fetch the user's folders using the query
  const { folders, error } = await getUserFolders(userId);

  if (error) {
    // Handle the error gracefully
    return (
      <div className="container mx-auto p-4">
        <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          <p>There was an error loading your folders: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Workout Folders</h2>
            <div className="flex gap-2">
              <Tabs defaultValue="grid">
                <TabsList className="border border-[#333333] bg-[#111111]">
                  <TabsTrigger value="grid">Grid</TabsTrigger>
                  <TabsTrigger value="list">List</TabsTrigger>
                </TabsList>
              </Tabs>
              <Separator orientation="vertical" className="h-8" />
              <AddFolderButton userId={userId} />
            </div>
          </div>
          {folders && folders.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {folders.map((folder) => (
                <Link href={`/f/${folder.id}`} key={folder.id}>
                  <Card className="border-[#333333] bg-[#111111] transition-colors hover:bg-[#1A1A1A]">
                    <CardHeader className="pb-2">
                      <CardTitle>{folder.name}</CardTitle>
                      <CardDescription>
                        {folder._count.workouts} workouts
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-2 text-xs text-gray-400">
                      Last updated{" "}
                      {new Date(folder.updatedAt).toLocaleDateString()}
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-[#333333] bg-[#111111]">
              <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <div className="mb-4 rounded-full bg-[#1A1A1A] p-4">
                  <FolderPlus className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-medium">
                  No workout folders yet
                </h3>
                <p className="mb-6 max-w-md text-gray-400">
                  Create your first workout folder to organize your training
                  routines and track your progress.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="w-full space-y-6 md:w-80">
          <Card className="border-[#333333] bg-[#111111]">
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">5 day streak</p>
                  <p className="text-xs text-gray-400">Keep it up!</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">12 workouts this month</p>
                  <p className="text-xs text-gray-400">
                    3 more than last month
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BarChart2 className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">New PR: Bench Press</p>
                  <p className="text-xs text-gray-400">185 lbs × 5 reps</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#333333] bg-[#111111]">
            <CardHeader>
              <CardTitle>Recent Workouts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="border-b border-[#333333] pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{workout.name}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                        <Calendar className="h-3 w-3" />
                        <span>{workout.date}</span>
                        <Clock className="ml-2 h-3 w-3" />
                        <span>{workout.duration}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      Repeat
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

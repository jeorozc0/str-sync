import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Inter } from "next/font/google";
import { getFoldersName } from "@/server/queries/folders";
import WorkoutDetailsForm from "@/components/workout/workout-details-form";
import WorkoutExerciseList from "@/components/workout/workout-list";
import WorkoutSummary from "@/components/workout/workout-summary";

const inter = Inter({ subsets: ["latin"] });

export default async function CreateWorkoutPage({
  searchParams,
}: {
  searchParams: { folder?: string };
}) {
  // Fetch folders on the server
  const folderId = searchParams.folder;
  const folders = await getFoldersName();

  return (
    <div
      className={`h-full overflow-y-auto bg-black text-white ${inter.className}`}
    >
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8 flex items-center gap-3">
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-[#333333] bg-background/10 hover:bg-background/20"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Create Workout</h1>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Pass the folders data to the form */}
            <WorkoutDetailsForm folders={folders} folderId={folderId} />

            {/* Exercise list component */}
            <WorkoutExerciseList />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-4 rounded-lg border border-[#333333] bg-[#111111] p-4">
              <h2 className="mb-4 text-lg font-medium">Workout Summary</h2>
              <WorkoutSummary />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

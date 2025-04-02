import { Inter } from "next/font/google";
import { getFoldersName } from "@/server/queries/folders"; // Fetch folders server-side
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import CreateWorkoutClient from "./_components/create-workout-client";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

// Define props for the server page, including searchParams
interface CreateWorkoutPageProps {
  searchParams: { folder?: string };
}

// Loading skeleton for the page content
function CreateWorkoutLoading() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-md bg-gray-700" />
        <Skeleton className="h-8 w-48 bg-gray-700" />
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Form Skeleton */}
          <Skeleton className="h-64 w-full rounded-lg bg-[#111111]" />
          {/* Exercise List Skeleton */}
          <Skeleton className="h-10 w-48 bg-gray-700" />
          <Skeleton className="h-48 w-full rounded-lg border border-dashed border-[#333333] bg-[#111111]/50" />
        </div>
        <div className="lg:col-span-1">
          {/* Summary Skeleton */}
          <Skeleton className="sticky top-4 h-64 w-full rounded-lg border border-[#333333] bg-[#111111]" />
        </div>
      </div>
    </div>
  );
}


// Make the page component async to fetch data
export default async function CreateWorkoutPage({ searchParams }: CreateWorkoutPageProps) {
  const initialFolderId = searchParams.folder;
  const supabase = await createClient();

  const { data, error: authError } = await supabase.auth.getUser();
  if (authError || !data?.user) {
    redirect("/login");
  }

  // Get the user's ID from the auth data
  const userId = data.user.id;

  // Fetch folders data on the server
  // Error handling might be needed here depending on getFoldersName implementation
  const folders = await getFoldersName(userId);

  return (
    <div className={`h-full overflow-y-auto bg-black text-white ${inter.className}`}>
      {/* Use Suspense if folder fetching can take time */}
      <Suspense fallback={<CreateWorkoutLoading />}>
        {/* Render the Client Component, passing server-fetched data */}
        <CreateWorkoutClient
          folders={folders}
          initialFolderId={initialFolderId}
        />
      </Suspense>
    </div>
  );
}

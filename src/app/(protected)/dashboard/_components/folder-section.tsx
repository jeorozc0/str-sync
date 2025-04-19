// src/components/folders-section.tsx
import Link from "next/link";
import { FolderPlus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddItemButton } from "@/components/add-folder-button"; // Assuming this path
import type { getUserFolders } from "@/server/queries/folders"; // Import the query return type

// Define the expected type for folders based on the query result
type FoldersType = Awaited<ReturnType<typeof getUserFolders>>["folders"];

interface FoldersSectionProps {
  userId: string;
  folders: FoldersType; // Use the specific type
}

export function FoldersSection({ userId, folders }: FoldersSectionProps) {
  return (
    <>
      {/* Folder Header: Title, Add button */}
      <div className="mb-5 flex flex-col gap-4">
        {/* Top row: Title and Add Button */}
        <div className="flex w-full items-center justify-between">
          <h2 className="text-xl font-semibold md:text-2xl">Workout Folders</h2>
          <AddItemButton
            userId={userId}
            className="border-[#333333] bg-[#1A1A1A] text-white hover:bg-[#222222]"
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
                  {/* Consider using date-fns here too for consistency */}
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
            {/* Ensure AddItemButton is correctly imported and used */}
            <AddItemButton userId={userId} />
          </CardContent>
        </Card>
      )}
    </>
  );
}


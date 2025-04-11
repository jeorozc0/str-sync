import { type Folder, type Workout } from "@prisma/client";
import { db } from "../db";
import { nanoid } from "nanoid";

// --- RESULT TYPES ---

// Type for the getUserFolders function result (Unchanged)
type GetUserFoldersResult = {
  folders: (Folder & {
    _count: {
      workouts: number;
    };
  })[];
  error?: string;
};

// Type for the data needed by individual workout cards (Exported for use in components)
export type WorkoutCardData = Pick<Workout, 'id' | 'name' | 'description' | 'updatedAt' | 'isArchived' | 'folderId'> & {
  _count: {
    exercises: number;
  };
};

// --- MODIFIED: Type for the getFolderById function result ---
// Now includes the workouts array directly
export type GetFolderByIdResult = {
  folder:
  | (Folder & {
    // Include the array of workouts matching WorkoutCardData structure
    workouts: WorkoutCardData[];
    // Keep the count too, although workouts.length could also be used
    _count: {
      workouts: number;
    }
  })
  | null; // Folder might not be found or authorized
  error?: string; // Optional error message
};


// --- QUERY FUNCTIONS ---

/**
 * Fetches all folders for a specific user, including the count of non-archived workouts.
 * Optimized for dashboard display.
 * (Function unchanged)
 */
export async function getUserFolders(
  userId: string,
): Promise<GetUserFoldersResult> {
  try {
    if (!userId) {
      throw new Error("User ID is required to fetch folders.");
    }
    console.log(`Query: Fetching folders for User ID: ${userId}`);

    const folders = await db.folder.findMany({
      where: { userId: userId },
      orderBy: { name: "asc" },
      select: {
        id: true, name: true, description: true, createdAt: true, updatedAt: true, userId: true,
        _count: { select: { workouts: { where: { isArchived: false } } } },
      },
    });

    console.log(`Query: Found ${folders.length} folders for user ${userId}.`);
    return { folders };
  } catch (error) {
    console.error("Failed to fetch user folders:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch folders";
    return { folders: [], error: message };
  }
}

/**
 * Fetches details for a single folder by ID, including its non-archived workouts,
 * ensuring it belongs to the specified user.
 *
 * @param folderId - The ID of the folder.
 * @param userId - The ID of the user performing the request.
 * @returns A Promise that resolves to the folder details (with workouts) or null with an error message.
 */
export async function getFolderById(
  folderId: string,
  userId: string,
): Promise<GetFolderByIdResult> { // Uses the MODIFIED result type
  try {
    if (!folderId || !userId) {
      throw new Error("Folder ID and User ID are required.");
    }
    console.log(`Query: Fetching folder details AND workouts for ID: ${folderId}, User: ${userId}`);

    const folder = await db.folder.findFirst({
      where: {
        id: folderId,
        userId: userId, // Authorization check
      },
      // --- MODIFIED: Include workouts directly again ---
      select: {
        // Select all Folder fields
        id: true, name: true, description: true, createdAt: true, updatedAt: true, userId: true,
        // Re-add the workouts include
        workouts: {
          where: {
            isArchived: false, // Only include non-archived workouts
          },
          select: { // Select fields matching WorkoutCardData
            id: true,
            name: true,
            description: true,
            isArchived: true,
            updatedAt: true,
            folderId: true,
            _count: {
              select: {
                exercises: true, // Count exercises for each workout
              },
            },
          },
          orderBy: {
            updatedAt: 'desc',
          },
          // Remove pagination for now if reverting
          // take: pageSize,
          // skip: skip,
        },
        // We still need the count for the header display
        _count: {
          select: {
            workouts: { where: { isArchived: false } }
          }
        }
      },
      // --- End Modification ---
    });

    if (!folder) {
      console.log(`Query: Folder ${folderId} not found or user ${userId} not authorized.`);
      return { folder: null, error: "Folder not found or not authorized." };
    }

    // We need to cast the workouts part if Prisma doesn't automatically infer the exact nested select type matches WorkoutCardData[]
    // This assumes the select statement accurately produces the WorkoutCardData shape.
    const folderResult = {
      ...folder,
      workouts: folder.workouts as WorkoutCardData[],
    };

    console.log(`Query: Found folder: ${folderResult.name} (Workout count: ${folderResult._count.workouts}). Fetched ${folderResult.workouts.length} workouts.`);
    return { folder: folderResult };

  } catch (error) {
    console.error(`Failed to fetch folder ${folderId}:`, error);
    const message = error instanceof Error ? error.message : "An error occurred while fetching the folder.";
    return { folder: null, error: message };
  }
}

/**
 * Fetches a paginated list of non-archived workouts (formatted for cards)
 * for a specific folder and user.
 * (Keeping this function definition, even if not used by FolderPage currently,
 * as it might be useful later or elsewhere)
 *
 * @param folderId - The ID of the folder.
 * @param userId - The ID of the user performing the request (for authorization).
 * @param page - The page number (1-based). Default is 1.
 * @param pageSize - The number of items per page. Default is 12.
 * @returns A Promise resolving to an array of WorkoutCardData.
 * @throws Throws error if database query fails or inputs are invalid.
 */
export async function getWorkoutsInFolderPaginated(
  folderId: string,
  userId: string,
  page = 1,
  pageSize = 12 // Example page size
): Promise<WorkoutCardData[]> {
  try {
    if (!folderId || !userId) { throw new Error("Folder ID and User ID are required."); }
    if (page < 1) page = 1;
    if (pageSize < 1) pageSize = 12;
    const skip = (page - 1) * pageSize;

    console.log(`Query: Fetching workouts page ${page} (size ${pageSize}) for Folder ${folderId}, User ${userId}`);

    const workouts = await db.workout.findMany({
      where: { folderId: folderId, userId: userId, isArchived: false },
      select: {
        id: true, name: true, description: true, isArchived: true, updatedAt: true,
        _count: { select: { exercises: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: pageSize, skip: skip,
    });

    console.log(`Query: Found ${workouts.length} workouts for page ${page}.`);
    return workouts as WorkoutCardData[];
  } catch (error) {
    console.error(`Database error fetching workouts for folder ${folderId}:`, error);
    throw new Error("Failed to fetch workouts for the folder.");
  }
}

/**
 * Creates a new folder for a user.
 *
 * @param data - Object containing folder name, optional description, and userId.
 * @returns A Promise resolving to the created folder or null with an error message.
 */
export async function createFolderQuery(data: {
  name: string;
  description?: string | null;
  userId: string;
}): Promise<{ folder: Folder | null; error?: string }> {
  try {
    const { name, description, userId } = data;
    // Basic validation
    if (!name?.trim()) {
      return { folder: null, error: "Folder name cannot be empty." };
    }
    if (!userId) {
      return { folder: null, error: "User ID is required." };
    }
    console.log(`Query: Creating folder "${name}" for User ID: ${userId}`);

    const folder = await db.folder.create({
      data: {
        id: nanoid(10), // Generate unique ID
        name: name.trim(),
        description: description?.trim() ?? null,
        userId: userId, // Link directly using the foreign key field
        // user: { connect: { id: userId } }, // Alternative using relation connect
      },
    });

    console.log(`Query: Folder created with ID: ${folder.id}`);
    return { folder };
  } catch (error) {
    console.error("Failed to create folder:", error);
    // Check for specific Prisma errors if needed (e.g., unique constraint)
    const message = error instanceof Error ? error.message : "Failed to create folder.";
    return { folder: null, error: message };
  }
}

/**
 * Updates an existing folder owned by the specified user.
 *
 * @param folderId - The ID of the folder to update.
 * @param userId - The ID of the user performing the update (for authorization).
 * @param data - Object containing the folder fields to update (name, description).
 * @returns A Promise resolving to the updated folder or null with an error message.
 */
export async function updateFolder(
  folderId: string,
  userId: string,
  data: { name?: string; description?: string | null },
): Promise<{ folder: Folder | null; error?: string }> {
  try {
    // Input validation
    if (!folderId || !userId) {
      throw new Error("Folder ID and User ID are required for update.");
    }
    if (!data.name?.trim() && data.description === undefined) {
      return { folder: null, error: "No update data provided." };
    }
    console.log(`Query: Updating folder ${folderId} for User ${userId}`);

    // Use updateMany for combined check and update (more efficient)
    // Or keep findFirst + update if you need the existing data for complex logic
    const updateResult = await db.folder.updateMany({
      where: {
        id: folderId,
        userId: userId, // Authorization check within the query
      },
      data: {
        // Only include fields if they are provided and valid
        ...(data.name?.trim() && { name: data.name.trim() }),
        ...(data.description !== undefined && { description: data.description?.trim() ?? null }),
        updatedAt: new Date(), // Explicitly set updatedAt on modification
      },
    });

    if (updateResult.count === 0) {
      console.log(`Query: Folder ${folderId} not found or user ${userId} not authorized for update.`);
      return { folder: null, error: "Folder not found or update permission denied." };
    }

    // Optionally fetch the updated folder if needed by the caller
    const updatedFolder = await db.folder.findUnique({ where: { id: folderId } });

    console.log(`Query: Folder ${folderId} updated successfully.`);
    return { folder: updatedFolder };

  } catch (error) {
    console.error(`Failed to update folder ${folderId}:`, error);
    const message = error instanceof Error ? error.message : "Failed to update folder.";
    return { folder: null, error: message };
  }
}

/**
 * Deletes a folder owned by the specified user.
 * Performs an authorization check before deletion.
 *
 * @param folderId - The ID of the folder to delete.
 * @param userId - The ID of the user performing the deletion (for authorization).
 * @returns A Promise resolving to an object indicating success or containing an error message.
 */
export async function deleteFolder(
  folderId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!folderId || !userId) {
      throw new Error("Folder ID and User ID are required for deletion.");
    }
    console.log(`Query: Attempting to delete folder ${folderId} by User ${userId}`);

    // Use deleteMany to combine the check and delete operation
    const result = await db.folder.deleteMany({
      where: {
        id: folderId,
        userId: userId, // Authorization check
      },
    });

    // Check if any record was actually deleted
    if (result.count === 0) {
      console.log(`Query: Folder ${folderId} not found or user ${userId} not authorized for deletion.`);
      return { success: false, error: "Folder not found or permission denied." };
    }

    console.log(`Query: Folder ${folderId} deleted successfully.`);
    return { success: true };
  } catch (error) {
    console.error(`Failed to delete folder ${folderId}:`, error);
    // Handle potential foreign key constraint errors if needed, though `onDelete` rules might cover it
    const message = error instanceof Error ? error.message : "Failed to delete folder.";
    return { success: false, error: message };
  }
}

/**
 * Fetches only the names and IDs of folders for a specific user.
 * Optimized for populating dropdowns or simple lists.
 *
 * @param userId - The UUID of the user.
 * @returns A Promise resolving to an array of { id, name } objects. Returns empty array on error.
 */
export async function getFoldersName(userId: string): Promise<{ id: string; name: string }[]> {
  try {
    if (!userId) {
      console.warn("getFoldersName called without userId.");
      return []; // Return empty if no user ID
    }
    console.log(`Query: Fetching folder names for User ID: ${userId}`);

    const folders = await db.folder.findMany({
      where: {
        userId: userId,
      },
      select: { // Select only necessary fields
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc", // Order alphabetically
      },
    });

    return folders;
  } catch (error) {
    console.error("Error fetching folder names:", error);
    return []; // Return empty array on error to prevent breaking UI
  }
}

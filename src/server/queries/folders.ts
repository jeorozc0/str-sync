import { type Folder } from "@prisma/client";
import { db } from "../db";
import { nanoid } from "nanoid";

// Return type for getUserFolders
type GetUserFoldersResult = {
  folders: (Folder & {
    _count: {
      workouts: number;
    };
  })[];
  error?: string;
};

// Return type for getFolderById
type GetFolderByIdResult = {
  folder:
    | (Folder & {
        workouts: {
          id: string;
          name: string;
          description: string | null;
          isArchived: boolean;
          updatedAt: Date;
          _count: {
            exercises: number;
          };
        }[];
      })
    | null;
  error?: string;
};

/**
 * Fetch all folders for a specific user
 *
 * @param userId - The UUID of the user
 * @returns A Promise that resolves to an array of folders and any potential error
 */
export async function getUserFolders(
  userId: string,
): Promise<GetUserFoldersResult> {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const folders = await db.folder.findMany({
      where: {
        userId: userId, // Use the model field name "userId"
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        userId: true, // Use "userId" here as well
        _count: {
          select: {
            workouts: true,
          },
        },
      },
    });

    return { folders };
  } catch (error) {
    console.error("Failed to fetch user folders:", error);
    return { folders: [], error: "Failed to fetch folders" };
  }
}

/**
 * Fetch a single folder by ID, ensuring it belongs to the specified user
 *
 * @param folderId - The UUID of the folder
 * @param userId - The UUID of the user
 * @returns A Promise that resolves to the folder with its workouts or null with an error
 */
export async function getFolderById(
  folderId: string,
  userId: string,
): Promise<GetFolderByIdResult> {
  try {
    if (!folderId || !userId) {
      throw new Error("Folder ID and User ID are required");
    }

    const folder = await db.folder.findFirst({
      where: {
        id: folderId,
        userId: userId, // Use model property name "userId"
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        userId: true, // Use model property name "userId" here as well
        workouts: {
          select: {
            id: true,
            name: true,
            description: true,
            isArchived: true,
            updatedAt: true,
            _count: {
              select: {
                exercises: true,
              },
            },
          },
          where: {
            isArchived: false,
          },
          orderBy: {
            updatedAt: "desc",
          },
        },
      },
    });

    if (!folder) {
      return { folder: null, error: "Folder not found" };
    }

    return { folder };
  } catch (error) {
    console.error("Failed to fetch folder:", error);
    return { folder: null, error: "Failed to fetch folder" };
  }
}

/**
 * Create a new folder for a user
 *
 * @param data - Object containing folder data
 * @returns A Promise that resolves to the created folder or null with an error
 */
export async function createFolderQuery(data: {
  name: string;
  description?: string | null;
  userId: string;
}): Promise<{ folder: Folder | null; error?: string }> {
  try {
    const { name, description, userId } = data;
    if (!name || !userId) {
      throw new Error("Folder name and User ID are required");
    }

    const folder = await db.folder.create({
      data: {
        id: nanoid(10),
        name,
        description: description ?? null,
        user: { connect: { id: userId } }, // Correct: using nested relation
      },
    });

    return { folder };
  } catch (error) {
    console.error("Failed to create folder:", error);
    return { folder: null, error: "Failed to create folder" };
  }
}

/**
 * Update an existing folder
 *
 * @param folderId - The UUID of the folder to update
 * @param userId - The UUID of the user who owns the folder
 * @param data - Object containing folder data to update
 * @returns A Promise that resolves to the updated folder or null with an error
 */
export async function updateFolder(
  folderId: string,
  userId: string,
  data: { name?: string; description?: string | null },
): Promise<{ folder: Folder | null; error?: string }> {
  try {
    if (!folderId || !userId) {
      throw new Error("Folder ID and User ID are required");
    }

    // First check if the folder exists and belongs to the user
    const existingFolder = await db.folder.findFirst({
      where: {
        id: folderId,
        userId: userId,
      },
    });

    if (!existingFolder) {
      return {
        folder: null,
        error: "Folder not found or you do not have permission to update it",
      };
    }

    // Update the folder
    const folder = await db.folder.update({
      where: {
        id: folderId,
      },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.description !== undefined && {
          description: data.description?.trim() ?? null,
        }),
      },
    });

    return { folder };
  } catch (error) {
    console.error("Failed to update folder:", error);
    return { folder: null, error: "Failed to update folder" };
  }
}

/**
 * Delete a folder
 *
 * @param folderId - The UUID of the folder to delete
 * @param userId - The UUID of the user who owns the folder
 * @returns A Promise that resolves to success or error
 */
export async function deleteFolder(
  folderId: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!folderId || !userId) {
      throw new Error("Folder ID and User ID are required");
    }

    // First check if the folder exists and belongs to the user
    const existingFolder = await db.folder.findFirst({
      where: {
        id: folderId,
        userId: userId,
      },
    });

    if (!existingFolder) {
      return {
        success: false,
        error: "Folder not found or you do not have permission to delete it",
      };
    }

    // Delete the folder
    await db.folder.delete({
      where: {
        id: folderId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete folder:", error);
    return { success: false, error: "Failed to delete folder" };
  }
}

export async function getFoldersName() {
  try {
    const folders = await db.folder.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return folders;
  } catch (error) {
    console.error("Error fetching folders:", error);
    return [];
  }
}

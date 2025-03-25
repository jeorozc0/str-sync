"use server"

import { createFolderQuery } from "@/server/queries/folders";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Create a schema for validation
const folderSchema = z.object({
  name: z.string().min(1, "Folder name is required").max(100, "Folder name is too long"),
  description: z.string().max(500, "Description is too long").nullable().optional(),
  userId: z.string().uuid("Invalid user ID"),
});

type CreateFolderInput = z.infer<typeof folderSchema>;

/**
 * Creates a new folder for a user
 * 
 * @param data Object containing folder data (name, description, userId)
 * @returns Object with the created folder or an error message
 */
export async function createFolder(data: CreateFolderInput) {
  try {
    // Validate the input data
    console.log(data)
    const validated = folderSchema.parse(data);

    // Create the folder in the database
    const { folder, error } = await createFolderQuery({
      name: validated.name.trim(),
      description: validated.description?.trim() ?? null,
      userId: validated.userId,
    });

    if (error || !folder) {
      return { success: false, error: error ?? error };
    }
    // Revalidate the home page to show the new folder
    revalidatePath('/dashboard');

    return { success: true, folder };
  } catch (error) {
    console.error("Failed to create folder:", error);

    // Return validation errors if any
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => err.message).join(", ");
      return { success: false, error: errorMessages };
    }

    return { success: false, error: error };
  }
}

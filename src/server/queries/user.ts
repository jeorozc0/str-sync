/**
 * User database queries for Prisma
 * This file contains functions for retrieving user data from the database
 */

import { db } from "../db";

/**
 * Retrieves a user's profile information including their avatar
 *
 * @param userId - The unique identifier of the user
 * @returns The user object containing selected fields or null if not found
 * @example
 * // Get full profile for user
 * const profile = await getUserProfile('user-123');
 * console.log(profile.avatar_url);
 */
export const getUserProfile = async (userId: string) => {
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      email: true,
      avatarUrl: true,
      // Add other fields you need
    },
  });

  return user;
};

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

/**
 * Authenticates the user on the server side using Supabase.
 * - Creates a server Supabase client.
 * - Fetches the current user session.
 * - Redirects to '/login' if the user is not authenticated.
 * - Throws an error if there's an issue communicating with Supabase auth.
 *
 * @returns {Promise<string>} The authenticated user's ID if successful.
 * @throws {Error} If Supabase auth check itself fails.
 * @throws {RedirectError} If user is not authenticated (Next.js handles this via `redirect`).
 */
export async function authenticateAndGetUserId(): Promise<string> {
  const supabase = await createClient();

  const { data, error: authError } = await supabase.auth.getUser();

  // Handle potential Supabase errors during the authentication check
  if (authError) {
    console.error("Supabase authentication error:", authError);
    // Throw an error to indicate a problem with the auth service itself
    throw new Error("Failed to check user authentication status.");
  }

  // Handle the case where the user is not logged in
  if (!data?.user) {
    console.log("User not authenticated. Redirecting to /login.");
    redirect("/login"); // Redirect triggers a special Next.js error
    // Execution stops here due to redirect, but needed for type safety if TS doesn't infer throw
    // throw new Error("Redirecting...");
  }

  // If we reach here, the user is authenticated
  return data.user.id;
}

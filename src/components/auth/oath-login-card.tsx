"use client";

import { createClient } from "@/utils/supabase/client";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { toast } from "sonner"; // Import toast from sonner

export default function OAuthGoogleCard() {
  // Helper function to determine the base URL for redirection
  const getBaseURL = (): string => {
    // Prioritize NEXT_PUBLIC_SITE_URL, then VERCEL_URL, then fallback to localhost
    let url =
      process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set in production env
      process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Set by Vercel
      "http://localhost:3000/"; // Default development URL

    // Ensure URL starts with 'http' (handles localhost) or 'https://'
    url = url.startsWith("http") ? url : `https://${url}`;
    // Ensure URL ends with a trailing slash for consistency
    url = url.endsWith("/") ? url : `${url}/`;
    return url;
  };

  // Merged handler for OAuth login
  const handleLogin = async () => {
    // 1. Create the Supabase client instance *inside* the handler
    const supabase = createClient();

    // 2. Construct the full redirect URL using the helper
    const redirectUrl = `${getBaseURL()}auth/callback`;

    // 3. Call signInWithOAuth with the specified provider and options
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });

    // 4. Error Handling with Toast
    if (error) {
      console.error(`Error during google OAuth sign-in:`, error.message);
      // Display a toast notification on error
      toast.error(`Login failed: ${error.message}`, {
        description: "Please try again or contact support if the issue persists.",
      });
    }
    // No explicit success handling needed here, Supabase handles the redirect.
  };

  return (
    <Card className="w-full max-w-md space-y-8 p-8 bg-[#111111] border-[#333333]">
      <div className="space-y-2 flex flex-col items-center">
        <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
        <p className="text-sm text-gray-400">
          Sign in to continue to StrengthSync
        </p>
      </div>
      {/* Ensure the onClick calls handleLogin without arguments */}
      <Button
        variant="outline"
        className="w-full border-[#333333] hover:bg-[#1A1A1A] text-white h-12 text-base"
        onClick={handleLogin} // Correctly call handleLogin
      >
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
          {/* SVG paths for Google icon */}
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Sign in with Google
      </Button>
    </Card>
  );
}


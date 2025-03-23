"use client";

import React from "react";
import { BarChart2, Search, Command, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Header({ user }) {  // Accept user prop from parent
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  // Get avatar URL from user metadata if available
  const avatarUrl = user?.user_metadata?.avatar_url ||
    user?.identities?.[0]?.identity_data?.avatar_url;

  return (
    <header className="border-b border-[#333333] px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <BarChart2 className="h-6 w-6" />
        <h1 className="text-lg font-semibold">StrengthSync</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search workouts..."
            className="bg-[#111111] border border-[#333333] rounded-md pl-9 pr-4 py-2 w-64 focus:outline-none focus:ring-1 focus:ring-white"
          />
        </div>
        <Button variant="outline" size="icon" className="border-[#333333]">
          <Command className="h-4 w-4" />
          <span className="sr-only">Open command menu</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full border-[#333333] overflow-hidden">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="User profile"
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-4 w-4" />
              )}
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {user && (
              <div className="px-2 py-1.5 text-sm font-medium">
                {user.email}
              </div>
            )}
            <DropdownMenuItem onClick={() => console.log("Settings clicked")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

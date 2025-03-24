"use client";
import React from "react";
import {
  BarChart2,
  Search,
  Command,
  User as UserIcon,
  Settings,
  LogOut,
} from "lucide-react";
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
import { type User } from "@prisma/client";

// Fix: Change the props type definition
interface HeaderProps {
  user: Partial<User> | null;
}

export default function Header({ user }: HeaderProps) {
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <header className="flex items-center justify-between border-b border-[#333333] px-4 py-3">
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
            className="w-64 rounded-md border border-[#333333] bg-[#111111] py-2 pl-9 pr-4 focus:outline-none focus:ring-1 focus:ring-white"
          />
        </div>
        <Button variant="outline" size="icon" className="border-[#333333]">
          <Command className="h-4 w-4" />
          <span className="sr-only">Open command menu</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full border-[#333333]"
            >
              {user ? (
                <Image
                  src={user.avatarUrl!}
                  alt="User profile"
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserIcon className="h-4 w-4" />
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

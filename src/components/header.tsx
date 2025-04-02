// src/components/header.tsx
"use client"; // This component uses client-side hooks (useRouter, usePathname)

import React from "react";
import Link from "next/link"; // Import Link for navigation
import { usePathname, useRouter } from "next/navigation"; // Import usePathname for active state
import Image from "next/image";
import {
  LayoutDashboard, // Icon for Dashboard
  ScrollText,      // Icon for Logs
  BarChart2,       // Original Logo Icon
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
import { type User } from "@prisma/client";
import { cn } from "@/lib/utils"; // Utility for conditional classes

interface HeaderProps {
  user: Partial<User> | null;
}

// Navigation items configuration
const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/logs", label: "Logs", icon: ScrollText },
  // Add other items like Stats when ready
  // { href: "/stats", label: "Stats", icon: LineChart },
];

export default function Header({ user }: HeaderProps) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname(); // Get current path

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh(); // Refresh to update session state across app
    router.push('/login'); // Redirect to login after logout
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b border-[#333333] bg-black px-4 lg:px-6">

      {/* Left Section: Logo + Navigation */}
      <div className="flex items-center gap-6"> {/* Increased gap */}
        {/* Logo/Brand */}
        <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
          <BarChart2 className="h-6 w-6 text-primary" /> {/* Use primary color? */}
          <span className="text-lg font-semibold text-foreground">StrengthSync</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden items-center gap-5 md:flex"> {/* Hide on small screens */}
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href)); // Basic active check
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-foreground",
                  isActive
                    ? "text-foreground" // Active style
                    : "text-muted-foreground" // Inactive style
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right Section: Search + Actions */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Search (Optional) */}
        {/* Consider implementing a Command Palette (like Shadcn) instead of simple search */}
        {/* <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search..."
            className="w-48 lg:w-64 rounded-md border border-[#333333] bg-[#111111] h-9 py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-white"
          />
        </div> */}

        {/* Command Menu Button (Example - Wire up later) */}
        <Button variant="outline" size="icon" className="border-[#333333] h-8 w-8 hidden sm:inline-flex">
          <Command className="h-4 w-4" />
          <span className="sr-only">Open command menu</span>
        </Button>

        {/* User Menu Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full border-[#333333] h-8 w-8" // Consistent size
            >
              {user?.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.name ?? "User profile"}
                  width={32}
                  height={32}
                  className="h-full w-full object-cover" // Ensure image fills circle
                />
              ) : (
                <UserIcon className="h-4 w-4" /> // Fallback icon
              )}
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-[#333333] bg-[#111111] text-white">
            {user && (
              <div className="border-b border-[#333333] px-2 py-2">
                <p className="text-sm font-medium leading-none">{user.name ?? "User"}</p>
                <p className="text-xs leading-none text-muted-foreground mt-1">{user.email}</p>
              </div>
            )}
            <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/settings')}> {/* Example navigation */}
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

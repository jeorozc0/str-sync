"use client";

import { WorkoutStoreProvider } from "@/providers/store-provider";
import { type ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return <WorkoutStoreProvider>{children}</WorkoutStoreProvider>;
}

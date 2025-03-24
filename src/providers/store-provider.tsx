"use client";

import useWorkoutStore from "@/stores/workout-store";
import { type ReactNode, createContext, useContext, useRef } from "react";
import { type StoreApi, useStore } from "zustand";

// This is a provider pattern for Zustand with Next.js
// It helps ensure stores work properly with React Server Components

// Create a context for the workout store
const WorkoutStoreContext = createContext<StoreApi<
  ReturnType<typeof useWorkoutStore.getState>
> | null>(null);

// Provider component for the workout store
export const WorkoutStoreProvider = ({ children }: { children: ReactNode }) => {
  const storeRef =
    useRef<StoreApi<ReturnType<typeof useWorkoutStore.getState>>>();

  if (!storeRef.current) {
    storeRef.current = useWorkoutStore;
  }

  return (
    <WorkoutStoreContext.Provider value={storeRef.current}>
      {children}
    </WorkoutStoreContext.Provider>
  );
};

// Hook to access the workout store
export const useWorkoutStoreContext = <T,>(
  selector: (state: ReturnType<typeof useWorkoutStore.getState>) => T,
) => {
  const store = useContext(WorkoutStoreContext);

  if (!store) {
    throw new Error(
      "useWorkoutStoreContext must be used within WorkoutStoreProvider",
    );
  }

  return useStore(store, selector);
};

// Other stores can be added in the future following the same pattern

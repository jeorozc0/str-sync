import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/server/db';
import { notFound } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
// Import the client component that will handle logging
// Import necessary Prisma types
import type { Prisma } from '@prisma/client';
import LiveLoggingClient from './_components/log-live-client';

// Define the type for the workout template data needed by the client
export type WorkoutTemplateWithExercises = Prisma.WorkoutGetPayload<{
  include: {
    exercises: { // Relation field in Workout model
      include: {
        exercise: true // Include Exercise details within WorkoutExercise
      },
      orderBy: {
        order: 'asc' // Ensure consistent order
      }
    }
  }
}>;

interface StartLogPageProps {
  params: { id: string }; // The ID here is the Workout TEMPLATE ID
}

// Loading skeleton
function LiveLogLoadingSkeleton() {
  // ... (skeleton remains the same)
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Skeleton className="h-8 w-3/4 mb-6 bg-[#222]" />
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-lg bg-[#111] border border-[#333]" />
        <Skeleton className="h-32 w-full rounded-lg bg-[#111] border border-[#333]" />
        <Skeleton className="h-12 w-full rounded-lg bg-[#222]" />
      </div>
    </div>
  );
}


export default async function StartWorkoutLogPage({ params }: StartLogPageProps) {
  const workoutId = params.id; // This is the Workout Template ID

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Fetch the Workout TEMPLATE details
  const workoutTemplate = await db.workout.findUnique({
    where: {
      id: workoutId,
      // Optional: Add userId check if templates are user-specific
      // userId: user.id,
    },
    include: {
      exercises: { // Include the PLANNED exercises from the template
        include: {
          exercise: true // Include the master Exercise details
        },
        orderBy: {
          order: 'asc'
        }
      }
    }
  });

  if (!workoutTemplate) {
    console.error(`Workout Template ${workoutId} not found.`);
    notFound(); // Template missing
  }

  // Type assertion to match the defined type (optional but good practice)
  const templateData: WorkoutTemplateWithExercises = workoutTemplate;

  return (
    <div className="min-h-full bg-black text-white">
      <Suspense fallback={<LiveLogLoadingSkeleton />}>
        {/* Pass the workout template data to the client */}
        <LiveLoggingClient workoutTemplate={templateData} userId={user.id} />
      </Suspense>
    </div>
  );
}


import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { db } from '@/server/db';
import { notFound } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import LiveLoggingClient from './_components/log-live-client';

interface LiveLogPageProps {
  params: { id: string }; // The ID here is the WorkoutLog ID
}

// Loading skeleton for the live logging interface
function LiveLogLoadingSkeleton() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Skeleton className="h-8 w-3/4 mb-6 bg-gray-700" />
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-lg bg-[#111111] border border-[#333333]" />
        <Skeleton className="h-32 w-full rounded-lg bg-[#111111] border border-[#333333]" />
        <Skeleton className="h-12 w-full rounded-lg bg-gray-600" />
      </div>
    </div>
  );
}


export default async function LiveWorkoutLogPage({ params }: LiveLogPageProps) {
  const workoutLogId = params.id;

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Fetch the WorkoutLog and its *TEMPLATE* details including planned exercises
  // We need the plan structure to guide the logging session.
  const workoutLog = await db.workoutLog.findUnique({
    where: {
      id: workoutLogId,
      userId: user.id, // Ensure user owns this log
    },
    include: {
      workout: { // Include the Workout Template details
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
      },
      // IMPORTANT: We also need the newly created ExerciseLogEntry IDs
      // to link the saved sets correctly in the client store/actions.
      exercises: { // Include the ExerciseLogEntry records created for this log
        select: {
          id: true, // The ID of the ExerciseLogEntry
          workoutExerciseId: true // The ID of the WorkoutExercise it corresponds to
        },
        // Note: Ensure order matches workoutExercise order if possible,
        // or match them up in the client based on workoutExerciseId.
        // This depends on how ExerciseLogEntry is associated/ordered.
        // Assuming WorkoutExercise ID is the reliable link.
      }
    }
  });

  if (!workoutLog || !workoutLog.workout) {
    console.error(`Workout Log ${workoutLogId} or its associated Template not found.`);
    notFound(); // Log or template missing
  }

  // Structure data for the client component
  const initialData = {
    logId: workoutLog.id,
    template: workoutLog.workout, // Full template data
    // Match ExerciseLogEntries to WorkoutExercises to pass correct IDs to client store
    plannedExercisesWithLogEntryIds: workoutLog.workout.exercises.map(we => {
      const logEntry = workoutLog.exercises.find(entry => entry.workoutExerciseId === we.id);
      return {
        ...we, // includes nested exercise detail and all WorkoutExercise fields
        exerciseLogEntryId: logEntry?.id ?? `error-missing-entry-for-${we.id}` // Pass the LogEntry ID
      };
    })
  };

  return (
    <div className="min-h-full bg-black text-white">
      <Suspense fallback={<LiveLogLoadingSkeleton />}>
        <LiveLoggingClient initialData={initialData} />
      </Suspense>
    </div>
  );
}

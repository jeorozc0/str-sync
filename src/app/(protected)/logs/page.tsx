import { getUserWorkoutLogs } from '@/server/queries/logs'; // Import the query
import LogListClient from './_components/log-list-client';
import { authenticateAndGetUserId } from '@/lib/auth';



export default async function WorkoutLogsPage() {
  const userId = await authenticateAndGetUserId()

  // Fetch logs for the current user on the server
  // Error handling can be added here or let Suspense handle it
  const workoutLogs = await getUserWorkoutLogs(userId); // Use default limit/offset for now

  return (
    <div className="min-h-full bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Workout Log History</h1>
        </div>
        <LogListClient initialLogs={workoutLogs} userId={userId} />
      </div>
    </div>
  );
}

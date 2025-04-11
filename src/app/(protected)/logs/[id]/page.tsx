import { Suspense } from 'react';
import { authenticateAndGetUserId } from '@/lib/auth';
import { type WorkoutLogDetailsData, getWorkoutLogDetails } from '@/actions/logging';
import LogDetailLoading from './loading';
import LogDetailClient from './_components/log-details-client';
// TODO: Create or Rename the client component to display log details

// Define props for this page
interface LogDetailPageProps {
  params: { id: string }; // The log ID comes from the route parameter
  // searchParams could be added later if needed (e.g., for highlighting specific sets)
}

// --- Loading Skeleton (Renamed and potentially adapted) ---
// Consider moving this to loading.tsx


// --- Main Page Component ---
export default async function LogDetailPage({ params }: LogDetailPageProps) {
  const logId = params.id; // Get log ID from the route

  let userId: string;
  try {
    // Authenticate user and get their ID
    userId = await authenticateAndGetUserId();
  } catch (error) {
    console.error("Authentication failed loading log detail page:", error);
    // Redirects are handled by the helper, this catch is for other auth errors
    return <div>Authentication Error</div>; // Or a more specific error component
  }

  // Fetch the detailed workout log data using the query function
  // The query function handles not found / authorization errors by calling notFound()
  const logDetails: WorkoutLogDetailsData = await getWorkoutLogDetails(logId, userId);
  console.log(logDetails)

  // --- Render the page ---
  return (
    // Use Suspense for the client component rendering while data is fetched
    // Note: If getWorkoutLogDetails is very fast, Suspense might flash,
    // but it's good practice for potentially larger data fetches.
    // The loading.tsx file handles the initial server-side loading state.
    <Suspense fallback={<LogDetailLoading />}>
      {/* Render the Client Component responsible for displaying the log details */}
      {/* Pass the fetched logDetails data as a prop */}
      <LogDetailClient logDetails={logDetails} />
    </Suspense>
  );
}

// Optional: Add dynamic route segment config if needed
// export const dynamic = 'force-dynamic'; // Fetch fresh data on every request

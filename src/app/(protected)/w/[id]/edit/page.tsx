import { Suspense } from 'react';
import { getWorkoutTemplateDetails } from '@/server/queries/workouts'; // Use the real query
import TemplateDetailLoading from '@/components/loading';
import EditWorkoutTemplateClient from '@/components/workout/edit-workout-client';
import { getFoldersName } from '@/server/queries/folders';
import { authenticateAndGetUserId } from '@/lib/auth';

interface EditTemplatePageProps {
  params: { id: string };
}

export default async function EditWorkoutTemplatePage({ params }: EditTemplatePageProps) {
  const templateId = params.id;
  // Get the user's ID from the auth data
  const userId = await authenticateAndGetUserId();

  // Fetch the specific template data needed for editing
  const template = await getWorkoutTemplateDetails(templateId, userId);
  const fetchedFolders = await getFoldersName(userId)

  return (
    <Suspense fallback={<TemplateDetailLoading />}>
      {/* Pass the fetched template data to the client component */}
      <EditWorkoutTemplateClient initialTemplateData={template} fetchedFolders={fetchedFolders} />
    </Suspense>
  );
}

import { Suspense } from 'react';
import { getWorkoutTemplateDetails } from '@/server/queries/workouts'; // Use the real query
import TemplateDetailLoading from '@/components/loading';
import EditWorkoutTemplateClient from '@/components/workout/edit-workout-client';
import { getFoldersName } from '@/server/queries/folders';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
// Use a loading skeleton, potentially reuse or adapt TemplateDetailLoading

interface EditTemplatePageProps {
  params: { id: string };
}

export default async function EditWorkoutTemplatePage({ params }: EditTemplatePageProps) {
  const templateId = params.id;
  const supabase = await createClient();

  const { data, error: authError } = await supabase.auth.getUser();
  if (authError || !data?.user) {
    redirect("/login");
  }

  // Get the user's ID from the auth data
  const userId = data.user.id;

  // Fetch the specific template data needed for editing
  const template = await getWorkoutTemplateDetails(templateId);
  // Note: Error handling/not found is handled within getWorkoutTemplateDetails
  const fetchedFolders = await getFoldersName(userId)

  return (
    <Suspense fallback={<TemplateDetailLoading />}>
      {/* Pass the fetched template data to the client component */}
      <EditWorkoutTemplateClient initialTemplateData={template} fetchedFolders={fetchedFolders} />
    </Suspense>
  );
}

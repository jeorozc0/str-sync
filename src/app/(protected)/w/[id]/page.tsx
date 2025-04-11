
import TemplateDetailClient from '@/components/workout/template-details-client';
import { authenticateAndGetUserId } from '@/lib/auth';
import { getWorkoutTemplateDetails } from '@/server/queries/workouts';


interface TemplatePageProps {
  params: { id: string };
}


export default async function WorkoutTemplatePage({ params }: TemplatePageProps) {
  const templateId = params.id;

  const userId = await authenticateAndGetUserId();
  // Fetch template data on the server
  // notFound() inside getWorkoutTemplateById handles errors
  const template = await getWorkoutTemplateDetails(templateId, userId);

  // Fetch folder name separately if needed, or rely on template.folderName from include
  const folderName = template.folderName ?? `Folder ${template.folderId}`;
  console.log(folderName)

  return (
    <TemplateDetailClient template={template} folderName={folderName} />
  );
}

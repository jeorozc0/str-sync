
import { Suspense } from 'react';
import TemplateDetailClient from '@/components/workout/template-details-client';
import { getWorkoutTemplateDetails } from '@/server/queries/workouts';
import TemplateDetailLoading from '@/components/loading';


interface TemplatePageProps {
  params: { id: string };
}

// Optional Metadata
// export async function generateMetadata({ params }: TemplatePageProps): Promise<Metadata> {
//   const template = await getWorkoutTemplateById(params.id); // Fetch might be duplicated, consider caching
//   return {
//     title: `${template.name} - Workout Template`,
//     description: template.description || `Plan details for ${template.name}`,
//   };
// }


// Loading Skeleton

export default async function WorkoutTemplatePage({ params }: TemplatePageProps) {
  const templateId = params.id;

  // Fetch template data on the server
  // notFound() inside getWorkoutTemplateById handles errors
  const template = await getWorkoutTemplateDetails(templateId);

  // Fetch folder name separately if needed, or rely on template.folderName from include
  const folderName = template.folderName ?? `Folder ${template.folderId}`;
  console.log(folderName)

  return (
    <Suspense fallback={<TemplateDetailLoading />}>
      <TemplateDetailClient template={template} folderName={folderName} />
    </Suspense>
  );
}

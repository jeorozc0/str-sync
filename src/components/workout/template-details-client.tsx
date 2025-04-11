// src/components/templates/TemplateDetailClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
import { type WorkoutTemplate } from "@/types/workout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Play, Edit, Trash2, History, Folder, Clock,
  BarChart3, ListChecks, Info, Loader2, Dumbbell, FileText
} from "lucide-react";
import { DeleteTemplateDialog } from "./delete-template-dialogue";
import { TemplateExerciseCard } from "./template-exercise-card";
import { startWorkoutFromTemplate } from "@/actions/logging";
import { toast } from "sonner";
import { deleteWorkoutAction } from "@/actions/workouts";

const inter = Inter({ subsets: ["latin"] });

interface TemplateDetailClientProps {
  template: WorkoutTemplate;
  folderName?: string;
  logCount?: number;
}

export default function TemplateDetailClient({
  template,
  folderName = "Folder",
  logCount
}: TemplateDetailClientProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStartingWorkout, setIsStartingWorkout] = useState(false);

  const handleStartWorkout = async () => {
    if (isStartingWorkout) return;

    setIsStartingWorkout(true);
    console.log("Action Triggered: Starting workout from template:", template.id);
    toast.loading("Preparing your workout session...");

    try {
      const result = await startWorkoutFromTemplate(template.id);
      toast.dismiss();

      if (result.success && result.workoutLogId) {
        console.log("Action Success: Received new workoutLogId:", result.workoutLogId);
        toast.success(`Workout "${template.name}" started!`);
        router.push(`/logs/live/${result.workoutLogId}`);
      } else {
        console.error("Action Failed:", result.error);
        toast.error(result.error ?? "Failed to start workout session. Please try again.");
        setIsStartingWorkout(false);
      }
    } catch (error) {
      toast.dismiss();
      console.error("Unexpected error starting workout:", error);
      toast.error("An unexpected error occurred. Please try again.");
      setIsStartingWorkout(false);
    }
  };

  const handleEditTemplate = () => {
    router.push(`/w/${template.id}/edit`);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteWorkoutAction(template.id, template.folderId!);
      if (result.success) {
        toast.success(`Template "${template.name}" deleted.`);
        setDeleteDialogOpen(false);
        router.push(`/f/${template.folderId}`);
        router.refresh();
      } else {
        toast.error(`Failed to delete template "${template.name}".`);

      }
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("An error occurred while deleting the template.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewHistory = () => {
    router.push(`/logs?templateId=${template.id}`);
  }

  return (
    <div className={`min-h-screen bg-black text-white ${inter.className}`}>
      <main className="container mx-auto px-4 py-8">
        {/* Header - Similar structure to Log Detail */}
        <div className="flex items-start justify-between mb-6 gap-4">
          {/* Left Side: Back arrow, Title, Folder */}
          <div className="flex items-center gap-3">
            <Link href={`/f/${template.folderId}`} aria-label={`Back to ${folderName}`}>
              <Button variant="outline" size="icon" className="h-8 w-8 border-[#333333] flex-shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold">{template.name}</h1>
              {/* Link to Folder */}
              <Link href={`/folders/${template.folderId}`} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-200 transition-colors mt-1">
                <Folder className="h-3.5 w-3.5" />
                <span>{folderName}</span>
              </Link>
            </div>
          </div>

          {/* Right Side: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="outline" className="gap-2 h-9 hidden sm:flex" onClick={handleEditTemplate}>
              <Edit className="h-4 w-4" /> Edit
            </Button>
            {/* Make Start primary */}
            <Button className="bg-white text-black hover:bg-gray-200 gap-2 h-9" onClick={handleStartWorkout} disabled={isStartingWorkout}>
              {isStartingWorkout ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4" />}
              {isStartingWorkout ? "Starting..." : "Start"}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="border-[#333333] text-red-500 hover:bg-red-900/20 hover:text-red-400 h-9 w-9 gap-2 hidden sm:flex"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isDeleting}
              aria-label="Delete template"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Tab Structure - Hidden on desktop */}
        <Tabs defaultValue="exercises" className="md:hidden">
          <TabsList className="sticky z-10 grid w-full h-auto grid-cols-2 bg-[#111111] px-1 py-1 shadow-sm mx-auto max-w-screen-xl">
            <TabsTrigger value="exercises" className="flex items-center justify-center gap-2 rounded-md py-3 text-sm data-[state=active]:bg-[#222222] data-[state=active]:text-white">
              <Dumbbell className="h-4 w-4 flex-shrink-0" />
              <span className="truncate font-medium">Exercises</span>
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center justify-center gap-2 rounded-md py-3 text-sm data-[state=active]:bg-[#222222] data-[state=active]:text-white">
              <FileText className="h-4 w-4 flex-shrink-0" />
              <span className="truncate font-medium">Details</span>
            </TabsTrigger>
          </TabsList>

          {/* Mobile Tab Contents */}
          <TabsContent value="exercises" className="mt-6 pb-24">
            <ExercisesSection
              template={template}
              handleEditTemplate={handleEditTemplate}
            />
          </TabsContent>
          <TabsContent value="details" className="mt-6 pb-24">
            <DetailsSection
              template={template}
              logCount={logCount}
              handleViewHistory={handleViewHistory}
              handleEditTemplate={handleEditTemplate}
              setDeleteDialogOpen={setDeleteDialogOpen}
            />
          </TabsContent>
        </Tabs>

        {/* Desktop Layout - Hidden on mobile */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {/* Left Column: Exercises List */}
          <div className="md:col-span-2 space-y-6">
            <ExercisesSection
              template={template}
              handleEditTemplate={handleEditTemplate}
            />
          </div>

          {/* Right Column: Template Info Card */}
          <div className="space-y-6">
            <DetailsSection
              template={template}
              logCount={logCount}
              handleViewHistory={handleViewHistory}
              isDesktop={true}
            />
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <DeleteTemplateDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirmDelete={handleDeleteConfirm}
        templateName={template.name}
        isDeleting={isDeleting}
      />
    </div>
  );
}

// Extracted Exercises Section Component
function ExercisesSection({
  template,
  handleEditTemplate
}: {
  template: WorkoutTemplate,
  handleEditTemplate: () => void
}) {
  return (
    <>
      <h2 className="text-xl font-semibold">Planned Exercises ({template.plannedExercises.length})</h2>
      {template.plannedExercises.length > 0 ? (
        <div className="space-y-4 mt-4">
          {template.plannedExercises.map((exercise, index) => (
            <TemplateExerciseCard key={exercise.id || index} exercise={exercise} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-[#333333] rounded-lg bg-[#111111]/50 mt-4">
          <p>No exercises added to this template yet.</p>
          <Button variant="outline" size="sm" className="mt-4 border-[#333333]" onClick={handleEditTemplate}>
            <Edit className="h-4 w-4 mr-2" /> Add Exercises
          </Button>
        </div>
      )}
    </>
  );
}

// Extracted Details Section Component
function DetailsSection({
  template,
  logCount,
  handleViewHistory,
  handleEditTemplate,
  setDeleteDialogOpen,
  isDesktop = false
}: {
  template: WorkoutTemplate,
  logCount?: number,
  handleViewHistory: () => void,
  handleEditTemplate?: () => void,
  setDeleteDialogOpen?: (open: boolean) => void,
  isDesktop?: boolean
}) {
  return (
    <>
      {/* Mobile-only action buttons that appear in the Details tab */}
      {!isDesktop && (
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" className="gap-2 flex-1" onClick={handleEditTemplate}>
            <Edit className="h-4 w-4" /> Edit Template
          </Button>
          <Button
            variant="outline"
            className="gap-2 flex-1 text-red-500 hover:bg-red-900/20 hover:text-red-400 border-[#333333]"
            onClick={() => setDeleteDialogOpen?.(true)}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      )}

      <Card className={`bg-[#111111] border-[#333333] ${isDesktop ? "sticky top-4" : ""}`}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-400" /> Template Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-sm">
          {/* Description */}
          {template.description && (
            <div className="space-y-1.5">
              <p className="font-medium text-gray-300">Description</p>
              <p className="text-gray-400">{template.description}</p>
            </div>
          )}

          {/* Meta Stats */}
          <div className="space-y-3 border-t border-[#333333] pt-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 flex items-center gap-1.5"><ListChecks className="h-4 w-4" /> Exercises</span>
              <span className="font-medium">{template.plannedExercises.length}</span>
            </div>
            {template.estimatedDurationMinutes && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-1.5"><Clock className="h-4 w-4" /> Est. Duration</span>
                <span className="font-medium">~{template.estimatedDurationMinutes} min</span>
              </div>
            )}
            {template.primaryMuscleGroups && template.primaryMuscleGroups.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-1.5"><BarChart3 className="h-4 w-4" /> Focus</span>
                <span className="font-medium">{template.primaryMuscleGroups.join(', ')}</span>
              </div>
            )}
            {/* Log Count - Only show if provided */}
            {logCount !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-1.5"><History className="h-4 w-4" /> Times Logged</span>
                <span className="font-medium">{logCount}</span>
              </div>
            )}
          </div>

          {/* History Button */}
          <div className="pt-3 border-t border-[#333333]">
            <Button variant="outline" size="sm" className="w-full border-[#333333] gap-1.5" onClick={handleViewHistory}>
              <History className="h-4 w-4" /> View Log History
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}


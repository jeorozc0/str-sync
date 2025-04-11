"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // For navigation after delete
import Link from "next/link";
import { Inter } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock, Trash2, Check, StickyNote, Repeat, Loader2 } from "lucide-react";
import { LoggedExerciseCard } from "./logged-exercise-card"; // Import the new card
// TODO: Import the actual delete log action when created
// import { deleteWorkoutLogAction } from '@/actions/logging';
import { startWorkoutFromTemplate, type WorkoutLogDetailsData } from "@/actions/logging"; // For Repeat action
import { toast } from "sonner";
import { DeleteLogDialog } from "./delete-log-dialogue";

const inter = Inter({ subsets: ["latin"] });

// Props for this client component
interface LogDetailClientProps {
  logDetails: WorkoutLogDetailsData;
}

// --- Helper Functions (Keep or move to utils) ---
const formatDateTime = (date: Date | null | undefined): string => {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleString('en-US', {
      dateStyle: 'long', // e.g., July 31, 2024
      timeStyle: 'short',  // e.g., 5:30 PM
    });
  } catch (error) { return 'Invalid Date'; }
};
const formatDuration = (durationMinutes: number | null | undefined): string => {
  if (durationMinutes === null || durationMinutes === undefined) return '-- min';
  if (durationMinutes < 1) return '< 1 min';
  return `${durationMinutes} min`;
};
// --- End Helper Functions ---

export default function LogDetailClient({ logDetails }: LogDetailClientProps) {
  const router = useRouter();

  // --- State ---
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false); // State for repeat action

  // --- Action Handlers ---

  const handleEditLog = () => {
    // Editing logged sets/notes is complex. Placeholder for now.
    toast.info("Editing logged data is not yet implemented.");
  };

  const handleDeleteLogInitiate = () => {
    if (isDeleting || isRepeating) return; // Prevent dialog during other actions
    setDeleteDialogOpen(true); // Open the delete confirmation dialog
  };

  const handleConfirmDelete = async () => {
    if (isDeleting) return; // Prevent double submission
    setIsDeleting(true);

    try {
      // --- Replace with actual Server Action call ---
      // const result = await deleteWorkoutLogAction(logDetails.id);
      console.log(`Simulating delete for log: ${logDetails.id}`);
      await new Promise(res => setTimeout(res, 1000)); // Simulate API call
      const result = { success: true }; // Placeholder

      if (result.success) {
        toast.success("Workout log deleted successfully.");
        setDeleteDialogOpen(false);
        // Navigate back to the logs list page
        router.push('/logs');
        // Action should revalidate path, router.refresh() likely not needed
      } else {
        // toast.error(result.error || "Failed to delete workout log.");
        toast.error("Failed to delete workout log."); // Placeholder error
      }
    } catch (error) {
      console.error("Error deleting workout log:", error);
      toast.error("An error occurred while deleting the log.");
    } finally {
      setIsDeleting(false);
      // Keep dialog open on error unless explicitly closing it
    }
  };

  const handleRepeatWorkout = async () => {
    if (isRepeating || isDeleting) return;
    setIsRepeating(true);
    const toastId = toast.loading("Preparing new workout session...");

    try {
      // Call the action to start a NEW log based on the ORIGINAL template ID
      const result = await startWorkoutFromTemplate(logDetails.workout.id); // Use template ID from logDetails
      toast.dismiss(toastId);

      if (result.success && result.workoutLogId) {
        toast.success(`New workout started based on "${logDetails.workout.name}"!`);
        router.push(`/logs/live/${result.workoutLogId}`); // Go to live logging
      } else {
        toast.error(result.error ?? "Failed to repeat workout session.");
        setIsRepeating(false);
      }
    } catch (error) {
      toast.dismiss(toastId);
      console.error("Error repeating workout:", error);
      toast.error("An unexpected error occurred while repeating the workout.");
      setIsRepeating(false);
    }
  };


  // --- Render Logic ---
  return (
    <div className={`min-h-screen bg-black text-white ${inter.className}`}>
      <main className="container mx-auto px-4 py-8">
        {/* --- Header --- */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-4">
          {/* Left Side: Back, Title, Metadata */}
          <div className="flex items-center gap-3 flex-grow min-w-0">
            <Link href="/logs" aria-label="Back to Logs">
              <Button variant="outline" size="icon" className="h-8 w-8 border-[#333333] flex-shrink-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold truncate" title={logDetails.workout.name}>
                {logDetails.workout.name} {/* Show name of template used */}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400 mt-1">
                <div className="flex items-center gap-1" title="Workout Start Time">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDateTime(logDetails.startedAt)}</span>
                </div>
                {logDetails.duration !== null && (
                  <div className="flex items-center gap-1" title="Workout Duration">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(logDetails.duration)}</span>
                  </div>
                )}
                {logDetails.completedAt && (
                  <div className="flex items-center gap-1 text-green-400" title="Workout Completed">
                    <Check className="h-4 w-4" />
                    <span>Completed {formatDateTime(logDetails.completedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
            {/* Repeat Workout Button */}
            <Button variant="outline" className="gap-2 h-9" onClick={handleRepeatWorkout} disabled={isDeleting || isRepeating}>
              {isRepeating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Repeat className="h-4 w-4" />}
              {isRepeating ? "Starting..." : "Repeat"}
            </Button>
            {/* Delete Log Button */}
            <Button
              variant="outline" size="icon"
              className="border-[#333333] text-red-500 hover:bg-red-900/20 hover:text-red-400 h-9 w-9"
              onClick={handleDeleteLogInitiate} // Opens the delete dialog
              disabled={isDeleting || isRepeating}
              aria-label="Delete workout log"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* --- Main Content Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Logged Exercises */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold">Logged Exercises ({logDetails.exercises?.length ?? 0})</h2>
            {/* Check exercises array exists and is not empty */}
            {logDetails.exercises && logDetails.exercises.length > 0 ? (
              <div className="space-y-4">
                {/* Map over logged exercises and render the card component */}
                {logDetails.exercises.map((loggedEx, index) => (
                  <LoggedExerciseCard
                    key={loggedEx.id} // Use the unique log entry ID
                    loggedExercise={loggedEx}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              // Empty state if no exercises were logged
              <p className="py-8 text-center text-gray-400">
                No exercises were recorded for this workout session.
              </p>
            )}
          </div>

          {/* Right Column: Session Notes / Performance Summary */}
          <div className="space-y-6">
            {/* Session Notes Card (Conditional) */}
            {logDetails.notes && (
              <Card className="bg-[#111111] border-[#333333] sticky top-4">
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <StickyNote className="h-4 w-4 text-yellow-400" /> Session Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{logDetails.notes}</p>
                </CardContent>
              </Card>
            )}
            {/* TODO: Add Performance Summary Card (if desired) */}
            {/* Could calculate total volume, average RPE per exercise etc. here */}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <DeleteLogDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirmDelete={handleConfirmDelete} // Calls the log delete handler
        logName={logDetails.workout.name} // Pass template name used
        logDate={formatDateTime(logDetails.startedAt)} // Pass formatted date
        isDeleting={isDeleting} // Pass loading state
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type WorkoutExercise } from "@/stores/workout-store";

// Mock exercise database - replace with your actual database
const exerciseDatabase = [
  {
    id: "ex1",
    name: "Bench Press",
    category: "Chest",
    equipment: "Barbell",
  },
  {
    id: "ex2",
    name: "Pull-up",
    category: "Back",
    equipment: "Bodyweight",
  },
  {
    id: "ex3",
    name: "Squat",
    category: "Legs",
    equipment: "Barbell",
  },
  {
    id: "ex4",
    name: "Shoulder Press",
    category: "Shoulders",
    equipment: "Dumbbell",
  },
  {
    id: "ex5",
    name: "Deadlift",
    category: "Back",
    equipment: "Barbell",
  },
];

// Initial state for a new exercise
const initialExerciseState: WorkoutExercise = {
  id: "",
  order: 0,
  sets: 3,
  reps: "8",
  weight: undefined,
  restSeconds: 60,
  notes: "",
  exerciseId: "",
  exercise: {
    id: "",
    name: "",
    muscleGroup: "",
    equipment: "",
  },
};

interface ExerciseDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (exercise: WorkoutExercise) => void;
  exercise: WorkoutExercise | null;
  isEditing: boolean;
}

const ExerciseDialog: React.FC<ExerciseDialogProps> = ({
  open,
  onClose,
  onSave,
  exercise,
  isEditing,
}) => {
  const [currentExercise, setCurrentExercise] = useState<WorkoutExercise>(
    exercise ?? initialExerciseState,
  );
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState("");

  // Filter exercises based on search query
  const filteredExercises = exerciseDatabase.filter(
    (exercise) =>
      exercise.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase()) ||
      exercise.category
        .toLowerCase()
        .includes(exerciseSearchQuery.toLowerCase()) ||
      exercise.equipment
        .toLowerCase()
        .includes(exerciseSearchQuery.toLowerCase()),
  );

  // Handle selecting an exercise from the database
  const handleSelectExercise = (dbExercise: (typeof exerciseDatabase)[0]) => {
    setCurrentExercise({
      ...currentExercise,
      exerciseId: dbExercise.id,
      exercise: {
        id: dbExercise.id,
        name: dbExercise.name,
        muscleGroup: dbExercise.category,
        equipment: dbExercise.equipment,
      },
    });
  };

  // Add or update exercise
  const handleAddExercise = () => {
    if (!currentExercise.exercise.name) return;
    onSave(currentExercise);
    setExerciseSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="border-[#333333] bg-[#111111] text-white sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Exercise" : "Add Exercise"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="border border-[#333333] bg-[#1A1A1A]">
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="mt-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search exercises..."
                  className="border-[#333333] bg-[#1A1A1A] pl-9"
                  value={exerciseSearchQuery}
                  onChange={(e) => setExerciseSearchQuery(e.target.value)}
                />
              </div>

              <ScrollArea className="h-[200px] rounded-md border border-[#333333] p-2">
                {filteredExercises.length > 0 ? (
                  <div className="space-y-2">
                    {filteredExercises.map((dbExercise) => (
                      <div
                        key={dbExercise.id}
                        className={`cursor-pointer rounded p-2 hover:bg-[#1A1A1A] ${
                          currentExercise.exerciseId === dbExercise.id
                            ? "border border-[#333333] bg-[#1A1A1A]"
                            : ""
                        }`}
                        onClick={() => handleSelectExercise(dbExercise)}
                      >
                        <div className="font-medium">{dbExercise.name}</div>
                        <div className="mt-1 flex gap-2 text-xs text-gray-400">
                          <span>{dbExercise.category}</span>
                          {dbExercise.equipment && (
                            <>
                              <span>•</span>
                              <span>{dbExercise.equipment}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-400">
                    No exercises found. Try a different search term.
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="recent" className="mt-4">
              <div className="py-8 text-center text-gray-400">
                Your recently used exercises will appear here.
              </div>
            </TabsContent>

            <TabsContent value="favorites" className="mt-4">
              <div className="py-8 text-center text-gray-400">
                Your favorite exercises will appear here.
              </div>
            </TabsContent>
          </Tabs>

          {currentExercise.exercise.name && (
            <div className="space-y-4 border-t border-[#333333] pt-4">
              <div>
                <h3 className="mb-2 font-medium">
                  {currentExercise.exercise.name}
                </h3>
                <div className="flex gap-2">
                  <Badge
                    variant="outline"
                    className="border-[#333333] bg-[#1A1A1A] text-xs"
                  >
                    {currentExercise.exercise.muscleGroup}
                  </Badge>
                  {currentExercise.exercise.equipment && (
                    <Badge
                      variant="outline"
                      className="border-[#333333] bg-[#1A1A1A] text-xs"
                    >
                      {currentExercise.exercise.equipment}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sets">Sets</Label>
                  <Select
                    value={currentExercise.sets.toString()}
                    onValueChange={(value) =>
                      setCurrentExercise({
                        ...currentExercise,
                        sets: Number.parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger
                      id="sets"
                      className="border-[#333333] bg-[#1A1A1A]"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-[#333333] bg-[#111111] text-white">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reps">Reps</Label>
                  <Select
                    value={currentExercise.reps}
                    onValueChange={(value) =>
                      setCurrentExercise({ ...currentExercise, reps: value })
                    }
                  >
                    <SelectTrigger
                      id="reps"
                      className="border-[#333333] bg-[#1A1A1A]"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-[#333333] bg-[#111111] text-white">
                      {[
                        "1",
                        "2",
                        "3",
                        "4",
                        "5",
                        "6",
                        "8",
                        "10",
                        "12",
                        "15",
                        "20",
                        "8-12",
                        "12-15",
                        "AMRAP",
                      ].map((num) => (
                        <SelectItem key={num} value={num}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="intensity">Intensity (RIR)</Label>
                  <Select
                    value={currentExercise.rir?.toString() ?? "2"}
                    onValueChange={(value) =>
                      setCurrentExercise({
                        ...currentExercise,
                        rir: Number.parseInt(value) as 0 | 1 | 2 | 3 | 4 | 5,
                      })
                    }
                  >
                    <SelectTrigger
                      id="intensity"
                      className="border-[#333333] bg-[#1A1A1A]"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-[#333333] bg-[#111111] text-white">
                      <SelectItem value="0">Failure (0 RIR)</SelectItem>
                      <SelectItem value="1">Almost Failure (1 RIR)</SelectItem>
                      <SelectItem value="2">Hard (2 RIR)</SelectItem>
                      <SelectItem value="3">Moderate (3 RIR)</SelectItem>
                      <SelectItem value="4">Light (4 RIR)</SelectItem>
                      <SelectItem value="5">Very Light (5+ RIR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rest-time">Rest Time (sec)</Label>
                  <Select
                    value={currentExercise.restSeconds?.toString() ?? "60"}
                    onValueChange={(value) =>
                      setCurrentExercise({
                        ...currentExercise,
                        restSeconds: Number.parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger
                      id="rest-time"
                      className="border-[#333333] bg-[#1A1A1A]"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-[#333333] bg-[#111111] text-white">
                      {[30, 45, 60, 90, 120, 180, 240].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} sec
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className="border-[#333333]"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddExercise}
            className="bg-white text-black hover:bg-gray-200"
            disabled={!currentExercise.exercise.name}
          >
            {isEditing ? "Update" : "Add"} Exercise
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseDialog;

"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Workout, type MuscleGroupData, type IntensityData, type VolumeData } from "@/types/workout";
import { WorkoutOverviewTab } from "./workout-overview-tab";
import { WorkoutExercisesTab } from "./workout-exercise-tab";
import { WorkoutChartsTab } from "./workout-charts-tab";
import { WorkoutHistoryTab } from "./workout-history-tab";


interface WorkoutTabsManagerProps {
  workout: Workout;
  totalSets: number;
  totalReps: number;
  avgRIR: number | null;
  muscleGroupData: MuscleGroupData[];
  intensityData: IntensityData[];
  volumeData: VolumeData[];
}

export function WorkoutTabsManager({
  workout,
  totalSets,
  totalReps,
  avgRIR,
  muscleGroupData,
  intensityData,
  volumeData,
}: WorkoutTabsManagerProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="bg-[#111111] border border-[#333333]">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="exercises">Exercises</TabsTrigger>
        <TabsTrigger value="charts">Charts</TabsTrigger>
        <TabsTrigger value="history" disabled>History</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <WorkoutOverviewTab
          workout={workout}
          totalSets={totalSets}
          totalReps={totalReps}
          avgRIR={avgRIR}
          muscleGroupData={muscleGroupData}
          volumeData={volumeData}
        />
      </TabsContent>

      <TabsContent value="exercises">
        <WorkoutExercisesTab exercises={workout.exercises} />
      </TabsContent>

      <TabsContent value="charts">
        <WorkoutChartsTab intensityData={intensityData} exercises={workout.exercises} />
      </TabsContent>

      <TabsContent value="history">
        <WorkoutHistoryTab workoutName={workout.name} />
      </TabsContent>
    </Tabs>
  );
}

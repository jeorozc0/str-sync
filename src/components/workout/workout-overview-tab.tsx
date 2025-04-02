"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, PieChart as PieChartIcon, BarChart2 } from "lucide-react"; // Rename PieChart import
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"; // Still need some core recharts
import { type Workout, type MuscleGroupData, type VolumeData } from "@/types/workout";
import { CHART_COLORS } from "@/utils/workout-utils";
import type { ChartConfig } from "@/components/ui/chart" // Import ChartConfig type

interface WorkoutOverviewTabProps {
  workout: Workout;
  totalSets: number;
  totalReps: number;
  avgRIR: number | null;
  muscleGroupData: MuscleGroupData[];
  volumeData: VolumeData[];
}

export function WorkoutOverviewTab({
  workout,
  totalSets,
  totalReps,
  avgRIR,
  muscleGroupData,
  volumeData,
}: WorkoutOverviewTabProps) {

  // --- Chart Config Generation ---
  const muscleGroupChartConfig = Object.fromEntries(
    muscleGroupData.map((item, index) => [
      item.name, // Using name as key for config
      {
        label: item.name,
        color: CHART_COLORS[index % CHART_COLORS.length],
      },
    ])
  ) satisfies ChartConfig;

  const volumeChartConfig = {
    volume: {
      label: "Total Reps",
      color: "#8884d8",
    },
  } satisfies ChartConfig;


  return (
    <div className="space-y-6 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Workout Summary Card */}
        <Card className="bg-[#111111] border-[#333333]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Workout Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Exercises</span>
                <span className="font-medium">{workout.exercises.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Sets</span>
                <span className="font-medium">{totalSets}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Reps</span>
                <span className="font-medium">{totalReps}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Weight</span>
                <span className="font-medium">{workout.totalWeight?.toLocaleString() ?? 'N/A'} lbs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Avg. Intensity (RIR)</span>
                <span className="font-medium">{avgRIR !== null ? avgRIR.toFixed(1) : "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Muscle Groups Card */}
        <Card className="bg-[#111111] border-[#333333]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              Muscle Groups (by Sets)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              {muscleGroupData.length > 0 ? (
                <ChartContainer config={muscleGroupChartConfig} className="w-full h-full">
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel nameKey="name" formatter={(value, name, props) => `${props.payload.percentage}% (${value} sets)`} />}
                    />
                    <Pie
                      data={muscleGroupData}
                      dataKey="value"
                      nameKey="name" // Ensure nameKey is set for config lookup
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={3}
                      strokeWidth={1}
                      stroke="hsl(var(--border))" // Use Shadcn border color variable
                    >
                      {muscleGroupData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent layout="vertical" verticalAlign="middle" align="right" nameKey="name" />} />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-gray-400">
                  No muscle group data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes Card */}
      {workout.notes && (
        <Card className="bg-[#111111] border-[#333333]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{workout.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Volume per Exercise Card */}
      <Card className="bg-[#111111] border-[#333333]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Volume per Exercise (Total Reps)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {volumeData.length > 0 ? (
              <ChartContainer config={volumeChartConfig} className="w-full h-full">
                <BarChart data={volumeData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100} // Adjust width as needed
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={false} // Disable default cursor
                    content={<ChartTooltipContent indicator="line" labelClassName="font-semibold" className="bg-background" />} // Use Shadcn Tooltip
                    formatter={(value) => [`${value} total reps`, undefined]} // Format tooltip content
                    labelFormatter={(label) => <div className="font-medium">{label}</div>} // Custom label style
                  />
                  <Bar dataKey="volume" fill="var(--color-volume)" radius={[0, 4, 4, 0]} barSize={15} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">
                No volume data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

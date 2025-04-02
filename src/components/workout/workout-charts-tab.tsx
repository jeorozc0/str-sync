"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart as BarChartIcon, AreaChart as AreaChartIcon } from 'lucide-react'; // Rename icons
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts"; // Core recharts elements
import { type IntensityData, type Exercise } from "@/types/workout";
import type { ChartConfig } from "@/components/ui/chart";

interface WorkoutChartsTabProps {
  intensityData: IntensityData[];
  exercises: Exercise[];
}

export function WorkoutChartsTab({ intensityData, exercises }: WorkoutChartsTabProps) {

  const intensityChartConfig = Object.fromEntries(
    intensityData.map(item => [
      item.name, // Use RIR label as key
      { label: item.name, color: "#ff4d4f" } // Single color for intensity bars
    ])
  ) satisfies ChartConfig;

  // Calculate duration data inside the component or pass it pre-calculated
  const durationData = exercises
    .map((ex) => ({
      name: ex.name,
      duration: parseFloat(
        ((ex.sets * ex.reps * 3) / 60 + // time doing reps in minutes
          Math.max(0, ex.sets - 1) * (ex.restTime / 60) // time resting in minutes
        ).toFixed(1)
      ),
    }))
    .filter(item => item.duration > 0);

  const durationChartConfig = {
    duration: {
      label: "Est. Duration (min)",
      color: "#8884d8",
    },
  } satisfies ChartConfig;


  return (
    <div className="space-y-6 mt-6">
      {/* Intensity Distribution Chart */}
      <Card className="bg-[#111111] border-[#333333]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChartIcon className="h-4 w-4" />Intensity Distribution
          </CardTitle>
          <CardDescription className="text-sm text-gray-400">Reps in Reserve (RIR) across exercises</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {intensityData.length > 0 ? (
              <ChartContainer config={intensityChartConfig} className="w-full h-full">
                <BarChart data={intensityData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} angle={-15} textAnchor="end" height={40} interval={0} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" className="bg-background" />}
                    formatter={(value, _name) => [`${value} exercises`, undefined]} // Use name from config
                  />
                  <Bar dataKey="count" fill="var(--color-default, #ff4d4f)" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">
                No intensity data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Exercise Duration Chart */}
      <Card className="bg-[#111111] border-[#333333]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AreaChartIcon className="h-4 w-4" />Estimated Exercise Duration
          </CardTitle>
          <CardDescription className="text-sm text-gray-400">Rough estimate based on sets, reps, rest</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {durationData.length > 0 ? (
              <ChartContainer config={durationChartConfig} className="w-full h-full">
                <AreaChart
                  data={durationData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit="m" tickLine={false} axisLine={false} />
                  <ChartTooltip
                    cursor={true} // Show cursor line
                    content={<ChartTooltipContent indicator="line" labelClassName="font-semibold" className="bg-background" />}
                    formatter={(value) => [`${value} min`, undefined]}
                  />
                  <Area
                    dataKey="duration"
                    type="monotone"
                    fill="var(--color-duration)"
                    fillOpacity={0.3}
                    stroke="var(--color-duration)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">
                No duration data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

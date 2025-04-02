"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Flame, LineChart, Share2, Download } from "lucide-react";
import { type MuscleGroupData } from "@/types/workout";
import { getIntensityLabel } from "@/utils/workout-utils";

interface PerformanceSidebarProps {
  avgRIR: number | null;
  muscleGroupData: MuscleGroupData[];
  // Add any other props needed for actions, e.g., onTrackProgressClick
}

export function PerformanceSidebar({ avgRIR, muscleGroupData }: PerformanceSidebarProps) {
  const intensityValue = avgRIR !== null
    ? Math.max(0, Math.min(100, ((5 - avgRIR) / 5) * 100)) // Calculate intensity percentage
    : 0;

  const handleActionClick = (action: string) => {
    alert(`${action} functionality not implemented yet.`);
  }

  return (
    <Card className="bg-[#111111] border-[#333333] sticky top-4">
      <CardHeader>
        <CardTitle className="text-base">Performance Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Intensity Insight */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[#1A1A1A] p-2 border border-[#333333]">
              <Target className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Workout Intensity</p>
              <p className="text-xs text-gray-400">
                Average RIR: {avgRIR !== null ? avgRIR.toFixed(1) : "N/A"}
              </p>
            </div>
          </div>
          {avgRIR !== null && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">Intensity Level</span>
                <span className="text-gray-400">{getIntensityLabel(avgRIR)}</span>
              </div>
              <Progress
                value={intensityValue}
                className="h-2 bg-[#333333]"
                indicatorClassName="bg-gradient-to-r from-green-500 via-yellow-500 to-red-600"
              />
            </div>
          )}
        </div>

        {/* Muscle Focus Insight */}
        <div className="space-y-4 border-t border-[#333333] pt-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[#1A1A1A] p-2 border border-[#333333]">
              <Flame className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Primary Muscle Focus</p>
              <p className="text-xs text-gray-400">
                {muscleGroupData.length > 0
                  ? `${muscleGroupData[0].name} (${muscleGroupData[0].percentage}%)`
                  : "No data"}
              </p>
            </div>
          </div>
          {muscleGroupData.length > 0 && (
            <div className="space-y-3">
              {muscleGroupData.slice(0, 3).map((group, index) => (
                <div key={index}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300">{group.name}</span>
                    <span className="text-gray-400">{group.percentage}%</span>
                  </div>
                  <Progress
                    value={group.percentage}
                    className="h-1.5 bg-[#333333]"
                    // You might want dynamic colors based on muscle group?
                    indicatorClassName="bg-blue-500"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-[#333333] space-y-3">
          <Button className="w-full gap-2 h-9 bg-blue-600 hover:bg-blue-700" disabled>
            <LineChart className="h-4 w-4" />
            Track Progress (Soon)
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 gap-2 border-[#333333] h-9 text-sm" onClick={() => handleActionClick('Share')}>
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" className="flex-1 gap-2 border-[#333333] h-9 text-sm" onClick={() => handleActionClick('Export')}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

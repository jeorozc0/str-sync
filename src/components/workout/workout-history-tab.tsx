"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface WorkoutHistoryTabProps {
  workoutName: string;
}

export function WorkoutHistoryTab({ workoutName }: WorkoutHistoryTabProps) {
  return (
    <div className="space-y-6 mt-6">
      <Card className="bg-[#111111] border-[#333333]">
        <CardHeader>
          <CardTitle className="text-base">Workout History</CardTitle>
          <CardDescription className="text-sm text-gray-400">Compare with previous sessions of '{workoutName}'</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400 text-sm">
            <p>History comparison feature is not yet implemented.</p>
            <p>This would show trends for volume, intensity, PRs etc. over time.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

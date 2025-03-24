import { Button } from "../ui/button";

export default function WorkoutSummary() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm text-gray-400">Exercise Count</h3>
        <p className="text-lg font-medium">0 exercises</p>
      </div>

      <div>
        <h3 className="text-sm text-gray-400">Estimated Duration</h3>
        <p className="text-lg font-medium">--</p>
      </div>

      <div className="border-t border-[#333333] pt-4">
        <Button className="w-full bg-[#0070F3] font-medium text-white hover:bg-[#0060DF]">
          Save Workout
        </Button>
      </div>
    </div>
  );
}

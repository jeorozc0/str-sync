"use client";

import { useState } from 'react';
import type { WorkoutLogRow } from '@/server/queries/logs'; // Import the specific type
import { History } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import LogListItem from './log-list-component';
// Import pagination/filtering components if added later

interface LogListClientProps {
  initialLogs: WorkoutLogRow[];
  userId: string; // May need userId for future actions like deleting logs
}

export default function LogListClient({ initialLogs, userId }: LogListClientProps) {
  // State for logs (if implementing client-side pagination/filtering)
  const [logs, setLogs] = useState<WorkoutLogRow[]>(initialLogs);
  // Add state for filters, current page, etc. if needed

  return (
    <div className="space-y-3">
      {logs.length === 0 ? (
        <Card className="border-dashed border-[#333333] bg-[#111111]">
          <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-4 rounded-full bg-[#1A1A1A] p-4">
              <History className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium">No workout logs found</h3>
            <p className="mb-6 max-w-md text-gray-400">
              Start a workout from one of your templates to begin logging your sessions.
            </p>
            {/* Optional: Link back to dashboard or templates */}
            {/* <Link href="/dashboard"><Button variant="outline">Go to Dashboard</Button></Link> */}
          </CardContent>
        </Card>
      ) : (
        logs.map(log => (
          <LogListItem key={log.id} log={log} />
        ))
      )}

      {/* Add Pagination controls here later */}
    </div>
  );
}

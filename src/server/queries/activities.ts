
import { type Prisma } from "@prisma/client";
import { unstable_noStore as noStore } from "next/cache";
import { db } from "../db";

// Type definition for the return value (good practice)
export type RecentWorkoutLog = {
  id: string;
  completedAt: Date | null;
  duration: number | null;
  workout: {
    id: string;
    name: string;
  } | null; // Workout could potentially be null if relation constraint allows
};
export type RecentWorkoutLogsResult = {
  logs: RecentWorkoutLog[];
  error?: string;
};

export async function getRecentWorkoutLogs(
  userId: string,
): Promise<RecentWorkoutLogsResult> {
  noStore(); // Keep for dynamic data, or consider time-based revalidation

  if (!userId) {
    return { logs: [], error: "User ID is required." };
  }

  try {
    const logs = await db.workoutLog.findMany({
      where: {
        userId: userId,
        completedAt: { not: null }, // Only fetch completed logs
      },
      orderBy: {
        completedAt: "desc", // Index on [userId, completedAt] makes this efficient
      },
      take: 3, // Limit to 3 recent logs
      select: {
        id: true,
        completedAt: true,
        duration: true,
        workout: {
          // Include the related workout's name and ID
          select: {
            id: true, // Needed for the "Repeat" button link
            name: true,
          },
        },
      },
    });

    // Ensure the returned type matches RecentWorkoutLog[]
    // Prisma's select should guarantee this structure if workout relation exists
    return { logs: logs as RecentWorkoutLog[] };
  } catch (error) {
    console.error("Error fetching recent workout logs:", error);
    return { logs: [], error: "Failed to fetch recent workouts." };
  }
}

export type WorkoutStatsData = {
  stats: {
    streak: number;
    workoutsThisMonth: number;
    workoutsLastMonth: number;
    recentPR: {
      exerciseName: string;
      weight: number;
      reps: number;
      completedAt: Date; // Add date of PR
    } | null;
  } | null;
  error?: string;
};

export async function getWorkoutStats(
  userId: string,
): Promise<WorkoutStatsData> {
  noStore();

  if (!userId) {
    return { stats: null, error: "User ID is required." };
  }

  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const streakLookbackDays = 35;
    const prLookbackDays = 90;

    const streakStartDate = new Date(startOfToday);
    streakStartDate.setDate(startOfToday.getDate() - streakLookbackDays);

    const prStartDate = new Date(startOfToday);
    prStartDate.setDate(startOfToday.getDate() - prLookbackDays);

    // --- Fetch data concurrently ---
    const [
      recentLogDatesForStreak,
      prDataResult,
      workoutsThisMonth,
      workoutsLastMonth,
    ] = await Promise.all([
      // Promise 0: Get completion dates for streak calculation
      db.workoutLog.findMany({
        where: {
          userId: userId,
          completedAt: { gte: streakStartDate },
        },
        select: { completedAt: true }, // completedAt can be null in schema, but filtered by gte
        orderBy: { completedAt: "desc" },
      }),

      // Promise 1: Find the best ExerciseSet for PR
      db.exerciseSet.findFirst({
        where: {
          weight: { gt: 0 },
          reps: { gt: 0 },
          exerciseLogEntry: {
            workoutLog: {
              userId: userId,
              completedAt: { gte: prStartDate },
            },
          },
        },
        orderBy: [
          { weight: 'desc' },
          { reps: 'desc' },
          { exerciseLogEntry: { workoutLog: { completedAt: 'desc' } } },
        ],
        select: {
          weight: true,
          reps: true,
          exerciseLogEntry: {
            select: {
              workoutLog: { select: { completedAt: true } },
              workoutExercise: { select: { exercise: { select: { name: true } } } },
            },
          },
        },
      }),

      // Promise 2: Count workouts this month
      db.workoutLog.count({
        where: {
          userId: userId,
          completedAt: { gte: startOfMonth },
        },
      }),

      // Promise 3: Count workouts last month
      db.workoutLog.count({
        where: {
          userId: userId,
          completedAt: { gte: startOfLastMonth, lt: startOfMonth },
        },
      }),
    ]);

    // --- Process Results ---

    // Streak Calculation
    let streak = 0;
    if (recentLogDatesForStreak.length > 0) {
      // FIX 1: Safely get date strings and filter out potential undefined/nulls
      const dateStrings = recentLogDatesForStreak
        .map((log) => log.completedAt?.toISOString().split("T")[0]) // Use optional chaining
        .filter((dateStr): dateStr is string => typeof dateStr === 'string'); // Type guard filter

      const uniqueDateStrings = [...new Set(dateStrings)];

      // Create Date objects only from valid strings and sort
      const uniqueDates = uniqueDateStrings
        .map((dateStr) => new Date(dateStr)) // Now dateStr is guaranteed string
        .sort((a, b) => b.getTime() - a.getTime());

      const today = startOfToday;
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      if (uniqueDates.length > 0 && ( // Check uniqueDates has elements after filtering
        uniqueDates[0]?.getTime() === today.getTime() ||
        uniqueDates[0]?.getTime() === yesterday.getTime()
      )
      ) {
        streak = 1;
        for (let i = 0; i < uniqueDates.length - 1; i++) {
          const currentDay = uniqueDates[i];
          const previousDay = uniqueDates[i + 1];

          // FIX 2: Add guard for currentDay and previousDay
          if (currentDay && previousDay) {
            const diffTime = currentDay.getTime() - previousDay.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
              streak++;
            } else {
              break; // Streak broken
            }
          } else {
            // Should not happen based on loop condition, but satisfies TS
            break;
          }
        }
        // Reset check remains the same logic, but relies on the initial check above
        if (uniqueDates[0]?.getTime() !== today.getTime() && uniqueDates[0]?.getTime() !== yesterday.getTime()) {
          streak = 0;
        }
      }
    }

    // PR Processing
    let formattedPR = null;
    // FIX 3: Use optional chaining for nested properties
    if (prDataResult?.weight && prDataResult?.reps) { // Check direct properties first
      const completedAt = prDataResult.exerciseLogEntry?.workoutLog?.completedAt;
      const exerciseName = prDataResult.exerciseLogEntry?.workoutExercise?.exercise?.name;

      // Check the results of optional chaining *before* using them
      if (completedAt && exerciseName) {
        formattedPR = {
          exerciseName: exerciseName,
          weight: prDataResult.weight, // Known to be non-null from outer check
          reps: prDataResult.reps,     // Known to be non-null from outer check
          completedAt: completedAt,    // Known to be Date from inner check
        };
      }
    }


    return {
      stats: {
        streak,
        workoutsThisMonth,
        workoutsLastMonth,
        recentPR: formattedPR,
      },
    };
  } catch (error) {
    console.error("Error fetching workout stats:", error);
    return { stats: null, error: "Failed to fetch workout stats." };
  }
}

// --- New Types for Folder Stats ---
export type FolderStatsData = Prisma.PromiseReturnType<
  typeof getFolderStats
>["stats"];

// --- New Query Function for Folder Stats ---
export async function getFolderStats(folderId: string, userId: string) {
  noStore(); // Opt out of caching

  try {
    // --- Part 1: Calculate Stats Based on Workout Logs ---

    // 1a. Find all Workout IDs in this folder
    const workoutsInFolder = await db.workout.findMany({
      where: { folderId: folderId, userId: userId },
      select: { id: true },
    });
    const workoutIdsInFolder = workoutsInFolder.map((w) => w.id);

    let totalWeightLifted = 0;
    let avgWorkoutDuration = 0;
    let workoutsCompletedCount = 0;
    let recentPRs: { exerciseName: string; weight: number; reps: number }[] = [];
    let mostFrequentLoggedExercise: { name: string; count: number } | null = null;

    if (workoutIdsInFolder.length > 0) {
      // 1b. Find completed WorkoutLogs associated with these workouts
      const completedLogs = await db.workoutLog.findMany({
        where: {
          userId: userId,
          workoutId: { in: workoutIdsInFolder },
          completedAt: { not: null },
        },
        select: { id: true, duration: true },
      });
      const completedLogIds = completedLogs.map((log) => log.id);

      if (completedLogIds.length > 0) {
        workoutsCompletedCount = completedLogIds.length;

        // 1c. Calculate Aggregations (Avg Duration)
        const avgDurationResult = await db.workoutLog.aggregate({
          _avg: { duration: true },
          where: { id: { in: completedLogIds }, duration: { not: null } },
        });
        avgWorkoutDuration = Math.round(
          (avgDurationResult._avg.duration ?? 0) / 60,
        ); // Convert seconds to minutes

        // 1d. Fetch ExerciseSet data for Total Weight and Most Frequent Logged Exercise
        const setsInFolderLogs = await db.exerciseSet.findMany({
          where: {
            exerciseLogEntry: { workoutLogId: { in: completedLogIds } },
            weight: { not: null },
            reps: { gt: 0 },
          },
          select: {
            weight: true,
            reps: true,
            exerciseLogEntry: {
              select: {
                workoutExercise: {
                  select: {
                    exercise: { select: { id: true, name: true } }, // Get exercise name for frequency
                  },
                },
              },
            },
          },
        });

        // Process Logged Sets Data
        const loggedExerciseCounts: Record<
          string,
          { name: string; count: number }
        > = {};
        setsInFolderLogs.forEach((set) => {
          if (set.weight) {
            totalWeightLifted += set.weight * set.reps;
          }
          const exercise = set.exerciseLogEntry?.workoutExercise?.exercise;
          if (exercise) {
            loggedExerciseCounts[exercise.id] = {
              name: exercise.name,
              count: (loggedExerciseCounts[exercise.id]?.count ?? 0) + 1,
            };
          }
        });

        // Find most frequent logged exercise
        if (Object.keys(loggedExerciseCounts).length > 0) {
          mostFrequentLoggedExercise = Object.values(
            loggedExerciseCounts,
          ).reduce((max, current) =>
            current.count > max.count ? current : max,
          );
        }

        // 1e. Find Recent PRs (based on logs)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(new Date().getDate() - 30);
        const recentPRsRaw = await db.exerciseSet.findMany({
          where: {
            exerciseLogEntry: {
              workoutLogId: { in: completedLogIds },
              workoutLog: { completedAt: { gte: thirtyDaysAgo } },
            },
            weight: { not: null },
          },
          orderBy: { weight: "desc" },
          take: 5,
          select: {
            weight: true,
            reps: true,
            exerciseLogEntry: {
              select: {
                workoutExercise: {
                  select: { exercise: { select: { name: true } } },
                },
              },
            },
          },
        });
        recentPRs = recentPRsRaw.map((pr) => ({
          exerciseName:
            pr.exerciseLogEntry?.workoutExercise?.exercise?.name ??
            "Unknown Exercise",
          weight: pr.weight ?? 0,
          reps: pr.reps,
        }));
      }
    }

    // --- Part 2: Calculate Muscle Group Distribution Based on Workout Templates ---

    const muscleGroupDistribution: Record<string, number> = {};

    // Fetch workouts with their planned exercises and muscle groups
    const workoutsWithExercises = await db.workout.findMany({
      where: {
        folderId: folderId,
        userId: userId,
        isArchived: false, // Optionally exclude archived workouts
      },
      select: {
        exercises: { // Relation from Workout -> WorkoutExercise
          select: {
            exercise: { // Relation from WorkoutExercise -> Exercise
              select: {
                muscleGroup: true,
              },
            },
          },
        },
      },
    });

    const templateMuscleGroupCounts: Record<string, number> = {};
    let totalTemplateExercisesCounted = 0;

    workoutsWithExercises.forEach((workout) => {
      workout.exercises.forEach((workoutExercise) => {
        const muscleGroup = workoutExercise.exercise?.muscleGroup;
        if (muscleGroup) {
          templateMuscleGroupCounts[muscleGroup] =
            (templateMuscleGroupCounts[muscleGroup] ?? 0) + 1;
          totalTemplateExercisesCounted++;
        }
      });
    });

    // Calculate template muscle group percentages
    if (totalTemplateExercisesCounted > 0) {
      for (const group in templateMuscleGroupCounts) {
        muscleGroupDistribution[group] = Math.round(
          (templateMuscleGroupCounts[group] / totalTemplateExercisesCounted) *
          100,
        );
      }
    }

    // --- Combine Stats and Return ---
    return {
      stats: {
        // Log-based stats
        totalWeightLifted,
        avgWorkoutDuration,
        workoutsCompletedCount,
        recentPRs,
        mostFrequentExercise: mostFrequentLoggedExercise, // Renamed for clarity
        // Template-based stats
        muscleGroupDistribution,
      },
    };
  } catch (error) {
    console.error("Error fetching folder stats:", error);
    return {
      stats: {
        totalWeightLifted: 0,
        avgWorkoutDuration: 0,
        workoutsCompletedCount: 0,
        muscleGroupDistribution: {},
        recentPRs: [],
        mostFrequentExercise: null,
      },
      error: "Failed to load folder statistics.",
    };
  }
}

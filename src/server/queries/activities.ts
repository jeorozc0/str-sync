
import { type Prisma } from "@prisma/client";
import { unstable_noStore as noStore } from "next/cache";
import { db } from "../db";

// --- Types ---

// Type for the data returned by getRecentWorkoutLogs
export type RecentWorkoutLogData = Prisma.PromiseReturnType<
  typeof getRecentWorkoutLogs
>["logs"];

// Type for the data returned by getWorkoutStats
export type WorkoutStatsData = Prisma.PromiseReturnType<
  typeof getWorkoutStats
>["stats"];

// --- Query Functions ---

/**
 * Fetches the 3 most recently completed workout logs for a user.
 */
export async function getRecentWorkoutLogs(userId: string) {
  noStore(); // Opt out of caching for dynamic data
  try {
    const logs = await db.workoutLog.findMany({
      where: {
        userId: userId,
        completedAt: { not: null }, // Only fetch completed logs
      },
      orderBy: {
        completedAt: "desc", // Order by most recent completion
      },
      take: 3, // Limit to 3 recent logs
      select: {
        id: true,
        completedAt: true,
        duration: true,
        workout: {
          // Include the related workout's name
          select: {
            name: true,
            id: true,
          },
        },
      },
    });
    return { logs };
  } catch (error) {
    console.error("Error fetching recent workout logs:", error);
    return { logs: [], error: "Failed to fetch recent workouts." };
  }
}

/**
 * Calculates various workout statistics for the user.
 */
export async function getWorkoutStats(userId: string) {
  noStore(); // Opt out of caching for dynamic data
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // --- Workouts This Month & Last Month ---
    const [workoutsThisMonth, workoutsLastMonth] = await Promise.all([
      db.workoutLog.count({
        where: {
          userId: userId,
          completedAt: {
            gte: startOfMonth, // Greater than or equal to the start of the current month
          },
        },
      }),
      db.workoutLog.count({
        where: {
          userId: userId,
          completedAt: {
            gte: startOfLastMonth, // Greater than or equal to the start of last month
            lt: startOfMonth, // Less than the start of the current month
          },
        },
      }),
    ]);

    // --- Workout Streak ---
    // Fetch distinct completion dates in the last ~month (adjust take as needed)
    const recentLogDates = await db.workoutLog.findMany({
      where: {
        userId: userId,
        completedAt: { not: null },
      },
      select: {
        completedAt: true,
      },
      orderBy: {
        completedAt: "desc",
      },
      take: 35, // Fetch enough logs to likely cover a streak
    });

    // Calculate streak (simple version: consecutive days)
    let streak = 0;
    if (recentLogDates.length > 0) {
      const uniqueDates = [
        ...new Set(
          recentLogDates.map((log) =>
            log.completedAt!.toISOString().split("T")[0],
          ),
        ),
      ].map((dateStr) => new Date(dateStr)); // Get unique dates (YYYY-MM-DD)

      uniqueDates.sort((a, b) => b.getTime() - a.getTime()); // Sort descending

      const today = new Date(now.toISOString().split("T")[0]);
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      // Check if the most recent log was today or yesterday to start the streak count
      if (
        uniqueDates[0]?.getTime() === today.getTime() ||
        uniqueDates[0]?.getTime() === yesterday.getTime()
      ) {
        streak = 1;
        for (let i = 0; i < uniqueDates.length - 1; i++) {
          const currentDay = uniqueDates[i];
          const previousDay = uniqueDates[i + 1];
          const diffTime = currentDay.getTime() - previousDay.getTime();
          const diffDays = diffTime / (1000 * 60 * 60 * 24);

          if (diffDays === 1) {
            streak++;
          } else {
            break; // Streak broken
          }
        }
        // If the most recent log was yesterday, but today has no log yet, the streak still counts
        if (
          uniqueDates[0]?.getTime() === yesterday.getTime() &&
          !uniqueDates.find((d) => d.getTime() === today.getTime())
        ) {
          // Streak calculated above is correct
        } else if (uniqueDates[0]?.getTime() !== today.getTime()) {
          // If the most recent wasn't today or yesterday, streak is 0
          streak = 0;
        }
      }
    }

    // --- Recent PR (Example: Highest Weight Bench Press in last 30 days) ---
    // NOTE: This is a simplified PR example. Real PR tracking can be more complex.
    // You might want to store PRs separately or have a more robust query.
    const recentPR = await db.exerciseSet.findFirst({
      where: {
        weight: { not: null }, // Must have a weight logged
        exerciseLogEntry: {
          workoutLog: {
            userId: userId,
            completedAt: { gte: thirtyDaysAgo }, // Within the last 30 days
          },
          // You might need to adjust this based on how you identify exercises
          // This assumes an Exercise model linked via WorkoutExercise
          workoutExercise: {
            exercise: {
              // Case-insensitive search for common variations
              name: { contains: "Bench Press", mode: "insensitive" },
            },
          },
        },
      },
      orderBy: {
        weight: "desc", // Order by highest weight
      },
      select: {
        weight: true,
        reps: true,
        exerciseLogEntry: {
          select: {
            workoutExercise: {
              select: {
                exercise: {
                  select: { name: true }, // Get the actual exercise name
                },
              },
            },
          },
        },
      },
    });

    return {
      stats: {
        streak,
        workoutsThisMonth,
        workoutsLastMonth,
        recentPR: recentPR
          ? {
            exerciseName:
              recentPR.exerciseLogEntry.workoutExercise.exercise.name,
            weight: recentPR.weight,
            reps: recentPR.reps,
          }
          : null,
      },
    };
  } catch (error) {
    console.error("Error fetching workout stats:", error);
    return {
      stats: {
        streak: 0,
        workoutsThisMonth: 0,
        workoutsLastMonth: 0,
        recentPR: null,
      },
      error: "Failed to fetch workout stats.",
    };
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

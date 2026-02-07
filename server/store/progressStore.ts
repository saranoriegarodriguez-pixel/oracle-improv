// server/store/progressStore.ts

type ExerciseId = string;
type DayKey = string; // YYYY-MM-DD

type ExerciseProgress = {
  completedSessions: number;
  lastMode?: "train" | "scene" | "trial";
  lastCompletedAt?: number;
};

type UserProgress = {
  [exerciseId: string]: ExerciseProgress;
};

type ProgressDB = {
  [username: string]: {
    days: {
      [day: DayKey]: UserProgress;
    };
  };
};

const progressDB: ProgressDB = {};

function todayKey(): DayKey {
  return new Date().toISOString().slice(0, 10);
}

export function recordExerciseCompletion(opts: {
  username: string;
  exerciseId: ExerciseId;
  mode: "train" | "scene" | "trial";
}) {
  const { username, exerciseId, mode } = opts;
  const day = todayKey();

  progressDB[username] ??= { days: {} };
  progressDB[username].days[day] ??= {};
  progressDB[username].days[day][exerciseId] ??= {
    completedSessions: 0,
  };

  const entry = progressDB[username].days[day][exerciseId];
  entry.completedSessions += 1;
  entry.lastMode = mode;
  entry.lastCompletedAt = Date.now();
}

export function getUserProgress(username: string) {
  return progressDB[username] ?? { days: {} };
}

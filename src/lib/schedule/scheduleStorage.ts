import { shows as staticShows } from "@/content/shows";
import { isKvConfigured } from "@/lib/admin/config";
import { kv } from "@/lib/library/redis";
import type { ScheduleConfig } from "@/lib/schedule/scheduleTypes";
import type { Show } from "@/types/content";

const SCHEDULE_KEY = "schedule:config";

export const defaultScheduleConfig = (): ScheduleConfig => ({
  recurring: {},
  dateOverrides: [],
});

export async function readScheduleConfig(): Promise<ScheduleConfig | null> {
  if (!isKvConfigured()) {
    return null;
  }

  try {
    const data = await kv.get<ScheduleConfig>(SCHEDULE_KEY);
    return data ?? defaultScheduleConfig();
  } catch {
    return null;
  }
}

export async function writeScheduleConfig(config: ScheduleConfig): Promise<void> {
  await kv.set(SCHEDULE_KEY, config);
}

export function mergeShowsWithSchedule(
  baseShows: Show[],
  config: ScheduleConfig | null,
): Show[] {
  if (!config) {
    return baseShows;
  }

  return baseShows.map((show) => {
    const patch = config.recurring[show.id];
    if (!patch) {
      return show;
    }

    return {
      ...show,
      ...patch,
    };
  });
}

export async function fetchEffectiveShows(): Promise<Show[]> {
  const config = await readScheduleConfig();
  return mergeShowsWithSchedule(staticShows, config);
}

export async function fetchScheduleConfigForAdmin(): Promise<ScheduleConfig> {
  const config = await readScheduleConfig();
  return config ?? defaultScheduleConfig();
}

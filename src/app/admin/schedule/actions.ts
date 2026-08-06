"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/auth";
import {
  fetchScheduleConfigForAdmin,
  writeScheduleConfig,
} from "@/lib/schedule/scheduleStorage";
import { isKnownShowId } from "@/lib/schedule/showIds";
import type { AdminActionState } from "@/app/admin/actions";

const recurringSchema = z.object({
  showId: z.string().refine(isKnownShowId, "Unknown show."),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  scheduleConfirmed: z.boolean(),
  durationMinutes: z.number().min(15).max(240),
});

const overrideSchema = z.object({
  showId: z.string().refine(isKnownShowId, "Unknown show."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .nullable(),
  cancelled: z.boolean(),
});

export async function saveRecurringScheduleAction(
  input: z.infer<typeof recurringSchema>,
): Promise<AdminActionState> {
  try {
    await requireAdminSession();
    const parsed = recurringSchema.parse(input);
    const config = await fetchScheduleConfigForAdmin();

    config.recurring[parsed.showId] = {
      dayOfWeek: parsed.dayOfWeek,
      startTime: parsed.startTime,
      scheduleConfirmed: parsed.scheduleConfirmed,
      durationMinutes: parsed.durationMinutes,
    };

    await writeScheduleConfig(config);
    revalidatePath("/");
    revalidatePath("/admin/schedule");
    revalidatePath("/api/schedule");

    return { ok: true, message: "Weekly schedule updated." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save schedule.";
    return { ok: false, message };
  }
}

export async function saveDateOverrideAction(
  input: z.infer<typeof overrideSchema>,
): Promise<AdminActionState> {
  try {
    await requireAdminSession();
    const parsed = overrideSchema.parse(input);
    const config = await fetchScheduleConfigForAdmin();

    config.dateOverrides = config.dateOverrides.filter(
      (entry) => !(entry.showId === parsed.showId && entry.date === parsed.date),
    );

    config.dateOverrides.push({
      showId: parsed.showId,
      date: parsed.date,
      startTime: parsed.cancelled ? null : parsed.startTime,
      cancelled: parsed.cancelled,
    });

    await writeScheduleConfig(config);
    revalidatePath("/");
    revalidatePath("/admin/schedule");
    revalidatePath("/api/schedule");

    return { ok: true, message: "Calendar override saved." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save override.";
    return { ok: false, message };
  }
}

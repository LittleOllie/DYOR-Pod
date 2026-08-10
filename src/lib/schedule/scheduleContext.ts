import type { DateScheduleOverride } from "@/lib/schedule/scheduleTypes";

export type ScheduleContextValue = {
  dateOverrides: DateScheduleOverride[];
};

export const emptyScheduleContext: ScheduleContextValue = {
  dateOverrides: [],
};

"use client";

import { useMemo, useState, useTransition } from "react";
import {
  saveDateOverrideAction,
  saveRecurringScheduleAction,
} from "@/app/admin/schedule/actions";
import { Button } from "@/components/ui/Button";
import { getOccurrenceOnDate } from "@/lib/schedule/scheduleOverrides";
import type { DateScheduleOverride, ScheduleConfig } from "@/lib/schedule/scheduleTypes";
import type { Show } from "@/types/content";

type AdminScheduleEditorProps = {
  effectiveShows: Show[];
  config: ScheduleConfig;
};

const DAY_OPTIONS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

function formatDateLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00`);
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

type CalendarEvent = {
  show: Show;
  cancelled: boolean;
  start: Date;
};

export function AdminScheduleEditor({ effectiveShows, config }: AdminScheduleEditorProps) {
  const spaceShows = useMemo(
    () => effectiveShows.filter((show) => show.platform === "x" && show.isActive),
    [effectiveShows],
  );

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedShowId, setSelectedShowId] = useState<string>(spaceShows[0]?.id ?? "");
  const [overrideTime, setOverrideTime] = useState("16:00");
  const [cancelOverride, setCancelOverride] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const calendarDays = useMemo(() => {
    const days: string[] = [];
    const start = new Date();
    start.setHours(12, 0, 0, 0);

    for (let offset = 0; offset < 28; offset += 1) {
      const day = new Date(start);
      day.setDate(start.getDate() + offset);
      days.push(day.toISOString().slice(0, 10));
    }

    return days;
  }, []);

  function eventsForDate(dateKey: string): CalendarEvent[] {
    return spaceShows.flatMap((show) => {
      const occurrence = getOccurrenceOnDate(show, dateKey, config.dateOverrides);
      if (!occurrence) {
        return [];
      }

      return [
        {
          show,
          cancelled: occurrence.cancelled,
          start: occurrence.start,
        },
      ];
    });
  }

  function openDateEditor(dateKey: string, showId?: string) {
    setSelectedDate(dateKey);
    setSelectedShowId(showId ?? spaceShows[0]?.id ?? "");
    const existing = config.dateOverrides.find(
      (entry) => entry.showId === (showId ?? spaceShows[0]?.id) && entry.date === dateKey,
    );
    setOverrideTime(existing?.startTime ?? "16:00");
    setCancelOverride(Boolean(existing?.cancelled));
    setFeedback(null);
  }

  function saveRecurring(show: Show, formData: FormData) {
    startTransition(async () => {
      const result = await saveRecurringScheduleAction({
        showId: show.id,
        dayOfWeek: Number(formData.get(`day-${show.id}`)),
        startTime: String(formData.get(`time-${show.id}`) ?? ""),
        scheduleConfirmed: formData.get(`confirmed-${show.id}`) === "on",
        durationMinutes: Number(formData.get(`duration-${show.id}`) ?? show.durationMinutes ?? 60),
      });
      setFeedback(result.message);
    });
  }

  function saveOverride() {
    if (!selectedDate || !selectedShowId) {
      return;
    }

    startTransition(async () => {
      const result = await saveDateOverrideAction({
        showId: selectedShowId,
        date: selectedDate,
        startTime: cancelOverride ? null : overrideTime,
        cancelled: cancelOverride,
      });
      setFeedback(result.message);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-[var(--radius-xl)] border border-border bg-surface/70 p-5 md:p-6">
        <h2 className="font-heading text-lg font-bold text-text-primary">Weekly Space times</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Update the default day and time for each live X Space. Changes apply site-wide after save.
        </p>

        <div className="mt-5 space-y-5">
          {spaceShows.map((show) => (
            <form
              key={show.id}
              action={(formData) => saveRecurring(show, formData)}
              className="rounded-[var(--radius-large)] border border-border/80 p-4"
            >
              <p className="font-medium text-text-primary">{show.name}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <label className="block text-sm">
                  <span className="text-text-secondary">Day</span>
                  <select
                    name={`day-${show.id}`}
                    defaultValue={show.dayOfWeek}
                    className="mt-1 w-full rounded-[var(--radius-medium)] border border-border bg-surface px-3 py-2 text-text-primary"
                  >
                    {DAY_OPTIONS.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="text-text-secondary">Start time (ET)</span>
                  <input
                    name={`time-${show.id}`}
                    type="time"
                    defaultValue={show.startTime ?? "16:00"}
                    className="mt-1 w-full rounded-[var(--radius-medium)] border border-border bg-surface px-3 py-2 text-text-primary"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-text-secondary">Duration (minutes)</span>
                  <input
                    name={`duration-${show.id}`}
                    type="number"
                    min={15}
                    max={240}
                    defaultValue={show.durationMinutes ?? 60}
                    className="mt-1 w-full rounded-[var(--radius-medium)] border border-border bg-surface px-3 py-2 text-text-primary"
                  />
                </label>
                <label className="flex items-end gap-2 pb-2 text-sm text-text-primary">
                  <input
                    name={`confirmed-${show.id}`}
                    type="checkbox"
                    defaultChecked={show.scheduleConfirmed}
                  />
                  Schedule confirmed
                </label>
              </div>
              <Button type="submit" size="sm" className="mt-4" disabled={isPending}>
                Save {show.shortName}
              </Button>
            </form>
          ))}
        </div>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-border bg-surface/70 p-5 md:p-6">
        <h2 className="font-heading text-lg font-bold text-text-primary">Calendar overrides</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Tap a day to move, reschedule, or cancel a specific Space occurrence.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {calendarDays.map((dateKey) => {
            const events = eventsForDate(dateKey);
            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => openDateEditor(dateKey, events[0]?.show.id)}
                className={`min-h-[88px] rounded-[var(--radius-medium)] border p-2 text-left transition-colors focus-ring ${
                  selectedDate === dateKey
                    ? "border-brand bg-brand/10"
                    : "border-border/80 bg-bg-primary/40 hover:border-brand/40"
                }`}
              >
                <p className="text-xs font-semibold text-text-primary">{formatDateLabel(dateKey)}</p>
                <div className="mt-2 space-y-1">
                  {events.length === 0 ? (
                    <p className="text-[10px] text-text-secondary/70">—</p>
                  ) : (
                    events.map(({ show, cancelled, start }) => (
                      <p
                        key={show.id}
                        className={`text-[10px] leading-tight ${cancelled ? "text-live line-through" : "text-brand-bright"}`}
                      >
                        {show.shortName}
                        {!cancelled ? ` · ${start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}` : ""}
                      </p>
                    ))
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {selectedDate ? (
          <div className="mt-5 rounded-[var(--radius-large)] border border-border/80 p-4">
            <p className="text-sm font-medium text-text-primary">
              Edit {formatDateLabel(selectedDate)}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="text-text-secondary">Show</span>
                <select
                  value={selectedShowId}
                  onChange={(event) => setSelectedShowId(event.target.value)}
                  className="mt-1 w-full rounded-[var(--radius-medium)] border border-border bg-surface px-3 py-2 text-text-primary"
                >
                  {spaceShows.map((show) => (
                    <option key={show.id} value={show.id}>
                      {show.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="text-text-secondary">Override time (ET)</span>
                <input
                  type="time"
                  value={overrideTime}
                  disabled={cancelOverride}
                  onChange={(event) => setOverrideTime(event.target.value)}
                  className="mt-1 w-full rounded-[var(--radius-medium)] border border-border bg-surface px-3 py-2 text-text-primary disabled:opacity-50"
                />
              </label>
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm text-text-primary">
              <input
                type="checkbox"
                checked={cancelOverride}
                onChange={(event) => setCancelOverride(event.target.checked)}
              />
              Cancel this Space on this date
            </label>
            <Button type="button" size="sm" className="mt-4" disabled={isPending} onClick={saveOverride}>
              Save day override
            </Button>
          </div>
        ) : null}
      </section>

      {feedback ? <p className="text-sm text-brand-bright">{feedback}</p> : null}
    </div>
  );
}

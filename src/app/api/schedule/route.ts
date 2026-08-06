import { NextResponse } from "next/server";
import { shows as staticShows } from "@/content/shows";
import { buildUpcomingEvents } from "@/lib/schedule/getUpcomingEvents";
import {
  defaultScheduleConfig,
  fetchEffectiveShows,
  readScheduleConfig,
} from "@/lib/schedule/scheduleStorage";

export async function GET() {
  try {
    const shows = await fetchEffectiveShows();
    const config = await readScheduleConfig();
    const events = buildUpcomingEvents(
      shows,
      config?.dateOverrides ?? [],
      new Date(),
      21,
    );

    return NextResponse.json(
      { events },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    console.error("[api/schedule] Falling back to static schedule data.", error);
    const events = buildUpcomingEvents(
      staticShows,
      defaultScheduleConfig().dateOverrides,
      new Date(),
      21,
    );

    return NextResponse.json(
      { events, fallback: true },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  }
}

import { NextResponse } from "next/server";
import { isWebPushConfigured } from "@/lib/push/vapid";
import { runReminderScheduler } from "@/lib/push/sendReminders";

function isAuthorizedCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isWebPushConfigured()) {
    return NextResponse.json(
      { ok: false, reason: "web-push-not-configured" },
      { status: 503 },
    );
  }

  const startedAt = new Date().toISOString();
  const summary = await runReminderScheduler(new Date());

  const sent = summary.results.reduce((acc, item) => acc + item.sent, 0);
  const skipped = summary.results.reduce((acc, item) => acc + item.skipped, 0);
  const failed = summary.results.reduce((acc, item) => acc + item.failed, 0);
  const removed = summary.results.reduce((acc, item) => acc + item.removed, 0);

  console.info("[cron/send-reminders]", {
    startedAt,
    eligibleEvents: summary.eligibleEvents,
    subscriptionCount: summary.subscriptionCount,
    sent,
    skipped,
    failed,
    removed,
  });

  return NextResponse.json({
    ok: true,
    startedAt,
    eligibleEvents: summary.eligibleEvents,
    subscriptionCount: summary.subscriptionCount,
    sent,
    skipped,
    failed,
    removed,
  });
}

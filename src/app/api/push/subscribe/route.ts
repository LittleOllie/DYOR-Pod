import { NextResponse } from "next/server";
import { isWebPushConfigured } from "@/lib/push/vapid";
import { upsertPushSubscription } from "@/lib/push/subscriptions";
import { pushSubscriptionSchema } from "@/lib/push/types";
import { checkRateLimit } from "@/lib/security/rateLimit";

export async function POST(request: Request) {
  if (!isWebPushConfigured()) {
    return NextResponse.json(
      { error: "Push reminders are not configured." },
      { status: 503 },
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
  const rate = await checkRateLimit("push-subscribe", ip, 20, 3600);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = pushSubscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid push subscription." }, { status: 400 });
  }

  const userAgent = request.headers.get("user-agent") ?? undefined;
  const result = await upsertPushSubscription({
    endpoint: parsed.data.endpoint,
    keys: parsed.data.keys,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userAgent,
    active: true,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: "Could not save subscription. Storage may be unavailable." },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}

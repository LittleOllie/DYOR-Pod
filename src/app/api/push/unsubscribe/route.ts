import { NextResponse } from "next/server";
import { removePushSubscription } from "@/lib/push/subscriptions";
import { pushSubscriptionSchema } from "@/lib/push/types";
import { checkRateLimit } from "@/lib/security/rateLimit";

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
  const rate = await checkRateLimit("push-unsubscribe", ip, 20, 3600);
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

  await removePushSubscription(parsed.data.endpoint);
  return NextResponse.json({ ok: true });
}

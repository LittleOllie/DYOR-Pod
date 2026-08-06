import { NextResponse } from "next/server";
import { z } from "zod";
import { subscribeToNewsletter } from "@/lib/newsletter/subscribe";
import { checkRateLimit, getClientIdentifier } from "@/lib/security/rateLimit";

const schema = z.object({
  email: z.string().email("Please enter a valid email address."),
  honeypot: z.string().optional(),
  interests: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message ?? "Invalid input.",
        },
        { status: 400 },
      );
    }

    const clientId = getClientIdentifier(request.headers);
    const rateLimit = await checkRateLimit("newsletter", clientId, 5, 3600);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many signup attempts. Please try again later.",
        },
        { status: 429 },
      );
    }

    const result = await subscribeToNewsletter(parsed.data);

    if (!result.success) {
      const status = result.code === "NOT_CONFIGURED" ? 503 : 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

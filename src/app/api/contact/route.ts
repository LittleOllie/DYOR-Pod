import { NextResponse } from "next/server";
import { z } from "zod";
import { submitContactForm } from "@/lib/contact/submit";

const schema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Please enter a valid email address."),
  message: z.string().min(1, "Message is required.").max(5000, "Message is too long."),
  honeypot: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input." },
        { status: 400 },
      );
    }

    const result = await submitContactForm(parsed.data);

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

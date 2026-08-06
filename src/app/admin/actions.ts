"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isEmailAllowlisted } from "@/lib/admin/config";
import { requireAdminSession } from "@/lib/admin/auth";
import { verifyAdminPassword } from "@/lib/admin/password";
import { createAdminSession, clearAdminSession } from "@/lib/admin/session";
import {
  addSpaceRecording,
  addRecordingSchema,
  deleteSpaceRecording,
} from "@/lib/library/spaceRecordings";
import { lookupXRecordingMetadata } from "@/lib/library/xMetadata";
import { checkRateLimit, getClientIdentifier } from "@/lib/security/rateLimit";
import type { z } from "zod";

export type AdminActionState = {
  ok: boolean;
  message: string;
};

export type XRecordingLookupState = {
  ok: boolean;
  message: string;
  airedAt?: string;
  duration?: string;
  title?: string;
};

export async function signInAction(
  email: string,
  password: string,
): Promise<AdminActionState> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return { ok: false, message: "Enter your email and password." };
  }

  const requestHeaders = await headers();
  const clientId = getClientIdentifier(requestHeaders);
  const rateLimit = await checkRateLimit("admin-login", clientId, 10, 900);
  if (!rateLimit.allowed) {
    return {
      ok: false,
      message: "Too many login attempts. Please wait a few minutes and try again.",
    };
  }

  if (!isEmailAllowlisted(normalizedEmail) || !verifyAdminPassword(password)) {
    return { ok: false, message: "Invalid email or password." };
  }

  await createAdminSession(normalizedEmail);
  redirect("/admin");
}

export async function lookupXRecordingAction(
  xUrl: string,
): Promise<XRecordingLookupState> {
  try {
    await requireAdminSession();

    const metadata = await lookupXRecordingMetadata(xUrl);
    if (!metadata.airedAt && !metadata.duration && !metadata.title) {
      return {
        ok: false,
        message:
          "Could not read details from that X link. You can still fill the fields manually.",
      };
    }

    const parts: string[] = [];
    if (metadata.airedAt) parts.push("air date");
    if (metadata.duration) parts.push("duration");
    if (metadata.title) parts.push("title");

    return {
      ok: true,
      message: `Auto-filled ${parts.join(", ")} from X.`,
      airedAt: metadata.airedAt,
      duration: metadata.duration,
      title: metadata.title,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not look up that X link.";
    return { ok: false, message };
  }
}

export async function addRecordingAction(
  input: z.infer<typeof addRecordingSchema>,
): Promise<AdminActionState> {
  try {
    await requireAdminSession();
    await addSpaceRecording(input);
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true, message: "Recording added to the library." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not add recording.";
    return { ok: false, message };
  }
}

export async function deleteRecordingAction(id: string): Promise<AdminActionState> {
  try {
    await requireAdminSession();
    await deleteSpaceRecording(id);
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true, message: "Recording removed." };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not remove recording.";
    return { ok: false, message };
  }
}

export async function signOutAction() {
  await clearAdminSession();
  revalidatePath("/admin");
}

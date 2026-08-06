"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin/auth";
import {
  deleteContactEnquiry,
  deleteNewsletterSignup,
} from "@/lib/enquiries/storage";
import type { AdminActionState } from "@/app/admin/actions";

export async function deleteContactEnquiryAction(id: string): Promise<AdminActionState> {
  try {
    await requireAdminSession();
    const deleted = await deleteContactEnquiry(id);
    if (!deleted) {
      return { ok: false, message: "Could not find that message." };
    }
    revalidatePath("/admin/enquiries");
    return { ok: true, message: "Contact message removed." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not remove message.";
    return { ok: false, message };
  }
}

export async function deleteNewsletterSignupAction(id: string): Promise<AdminActionState> {
  try {
    await requireAdminSession();
    const deleted = await deleteNewsletterSignup(id);
    if (!deleted) {
      return { ok: false, message: "Could not find that signup." };
    }
    revalidatePath("/admin/enquiries");
    return { ok: true, message: "Briefing signup removed." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not remove signup.";
    return { ok: false, message };
  }
}

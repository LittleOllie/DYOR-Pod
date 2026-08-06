import { redirect } from "next/navigation";
import { isAdminAuthConfigured, isEmailAllowlisted } from "@/lib/admin/config";
import { getAdminSessionEmail } from "@/lib/admin/session";

export type AdminSession = {
  email: string;
};

export async function getAdminSession(): Promise<AdminSession | null> {
  if (!isAdminAuthConfigured()) {
    return null;
  }

  try {
    const email = await getAdminSessionEmail();
    if (!email || !isEmailAllowlisted(email)) {
      return null;
    }

    return { email };
  } catch {
    return null;
  }
}

export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

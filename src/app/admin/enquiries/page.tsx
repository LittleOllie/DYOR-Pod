import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signOutAction } from "@/app/admin/actions";
import { AdminEnquiriesPanel } from "@/components/admin/AdminEnquiriesPanel";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { requireAdminSession } from "@/lib/admin/auth";
import { isKvConfigured } from "@/lib/admin/config";
import { listContactEnquiries, listNewsletterSignups } from "@/lib/enquiries/storage";

export const metadata: Metadata = {
  title: "Admin · Enquiries",
  robots: { index: false, follow: false },
};

export default async function AdminEnquiriesPage() {
  const session = await requireAdminSession();
  const [contactEnquiries, newsletterSignups] = await Promise.all([
    listContactEnquiries(),
    listNewsletterSignups(),
  ]);

  async function handleSignOut() {
    "use server";
    await signOutAction();
    redirect("/admin/login");
  }

  return (
    <div className="mx-auto max-w-[var(--content-width)] px-4 py-10 md:px-6 md:py-12">
      <AdminHeader
        session={session}
        title="Enquiries"
        current="enquiries"
        publicLink={{ href: "/contact", label: "View contact page" }}
        signOutAction={handleSignOut}
      />

      {!isKvConfigured() && (
        <p className="mb-6 rounded-[var(--radius-medium)] border border-live/30 bg-live/10 px-4 py-3 text-sm text-live">
          Redis is not configured, so form submissions cannot be stored yet. Add Upstash Redis in
          Vercel (same as library admin) and redeploy.
        </p>
      )}

      <AdminEnquiriesPanel
        contactEnquiries={contactEnquiries}
        newsletterSignups={newsletterSignups}
      />
    </div>
  );
}

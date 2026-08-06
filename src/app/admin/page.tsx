import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutAction } from "@/app/admin/actions";
import { AdminAddRecordingForm } from "@/components/admin/AdminAddRecordingForm";
import { AdminRecordingList } from "@/components/admin/AdminRecordingList";
import { requireAdminSession } from "@/lib/admin/auth";
import { fetchAdminRecordings } from "@/lib/library/spaceRecordings";

export const metadata: Metadata = {
  title: "Admin · DYOR Library",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await requireAdminSession();
  const recordings = await fetchAdminRecordings();

  async function handleSignOut() {
    "use server";
    await signOutAction();
    redirect("/admin/login");
  }

  return (
    <div className="mx-auto max-w-[var(--content-width)] px-4 py-10 md:px-6 md:py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Mission Control
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-text-primary">
            Spaces Library Admin
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Signed in as {session.email}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/schedule"
            className="inline-flex min-h-[44px] items-center rounded-[var(--radius-medium)] border border-border px-4 text-sm font-medium text-text-secondary transition-colors hover:border-brand hover:text-brand-bright focus-ring"
          >
            Schedule admin
          </Link>
          <Link
            href="/#library"
            className="inline-flex min-h-[44px] items-center rounded-[var(--radius-medium)] border border-border px-4 text-sm font-medium text-text-secondary transition-colors hover:border-brand hover:text-brand-bright focus-ring"
          >
            View public library
          </Link>
          <form action={handleSignOut}>
            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center rounded-[var(--radius-medium)] border border-border px-4 text-sm font-medium text-text-secondary transition-colors hover:border-live hover:text-live focus-ring"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <AdminAddRecordingForm />
        <AdminRecordingList recordings={recordings} />
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signOutAction } from "@/app/admin/actions";
import { AdminAddRecordingForm } from "@/components/admin/AdminAddRecordingForm";
import { AdminHeader } from "@/components/admin/AdminHeader";
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
      <AdminHeader
        session={session}
        title="Spaces Library Admin"
        current="library"
        publicLink={{ href: "/#library", label: "View public library" }}
        signOutAction={handleSignOut}
      />

      <div className="flex flex-col gap-6">
        <AdminAddRecordingForm />
        <AdminRecordingList recordings={recordings} />
      </div>
    </div>
  );
}

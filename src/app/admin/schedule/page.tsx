import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signOutAction } from "@/app/admin/actions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminScheduleEditor } from "@/components/admin/AdminScheduleEditor";
import { requireAdminSession } from "@/lib/admin/auth";
import { getSchedulePageData } from "@/lib/schedule/getHeaderState";

export const metadata: Metadata = {
  title: "Admin · Schedule",
  robots: { index: false, follow: false },
};

export default async function AdminSchedulePage() {
  const session = await requireAdminSession();
  const { shows, config } = await getSchedulePageData();

  async function handleSignOut() {
    "use server";
    await signOutAction();
    redirect("/admin/login");
  }

  return (
    <div className="mx-auto max-w-[var(--content-width)] px-4 py-10 md:px-6 md:py-12">
      <AdminHeader
        session={session}
        title="Schedule Admin"
        current="schedule"
        publicLink={{ href: "/#schedule", label: "View public schedule" }}
        signOutAction={handleSignOut}
      />

      <AdminScheduleEditor effectiveShows={shows} config={config} />
    </div>
  );
}

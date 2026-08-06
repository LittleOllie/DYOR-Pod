import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getAdminSession } from "@/lib/admin/auth";
import { isAdminAuthConfigured, getAdminConfigMissing } from "@/lib/admin/config";

export const metadata: Metadata = {
  title: "Admin sign in · DYOR",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) {
    redirect("/admin");
  }

  const configured = isAdminAuthConfigured();
  const missing = getAdminConfigMissing();

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12 md:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
        Mission Control
      </p>
      <h1 className="mt-2 font-heading text-3xl font-bold text-text-primary">Admin sign in</h1>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        Sign in with your allowlisted DYOR team email and the shared team password.
      </p>

      <div className="mt-8 rounded-[var(--radius-xl)] border border-border bg-surface/70 p-5 md:p-6">
        {configured ? (
          <AdminLoginForm />
        ) : (
          <div className="space-y-3 text-sm leading-relaxed text-text-secondary">
            <p>Admin sign-in is not configured yet. Set these in Vercel → Environment Variables, then redeploy:</p>
            <ul className="list-inside list-disc space-y-1 text-text-primary/90">
              {missing.map((item) => (
                <li key={item}>
                  <code className="text-brand-bright">{item}</code>
                </li>
              ))}
            </ul>
            {missing.length === 0 ? (
              <p className="text-xs text-text-secondary/80">
                All variables appear set — try a hard refresh or wait for the latest deployment to finish.
              </p>
            ) : null}
          </div>
        )}
      </div>

      <Link
        href="/"
        className="mt-6 text-center text-sm text-text-secondary hover:text-brand-bright"
      >
        ← Back to site
      </Link>
    </div>
  );
}

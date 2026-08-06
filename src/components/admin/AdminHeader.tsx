import Link from "next/link";
import type { AdminSession } from "@/lib/admin/auth";
import { cn } from "@/lib/utils/cn";

type AdminSection = "library" | "schedule" | "enquiries";

type AdminHeaderProps = {
  session: AdminSession;
  title: string;
  current: AdminSection;
  publicLink?: { href: string; label: string };
  signOutAction: () => Promise<void>;
};

const adminLinks: { section: AdminSection; href: string; label: string }[] = [
  { section: "library", href: "/admin", label: "Library admin" },
  { section: "schedule", href: "/admin/schedule", label: "Schedule admin" },
  { section: "enquiries", href: "/admin/enquiries", label: "Enquiries" },
];

export function AdminHeader({
  session,
  title,
  current,
  publicLink,
  signOutAction,
}: AdminHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          Mission Control
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-text-primary">{title}</h1>
        <p className="mt-2 text-sm text-text-secondary">Signed in as {session.email}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={current === link.section ? "page" : undefined}
            className={cn(
              "inline-flex min-h-[44px] items-center rounded-[var(--radius-medium)] border px-4 text-sm font-medium transition-colors focus-ring",
              current === link.section
                ? "border-brand bg-brand/10 text-brand-bright"
                : "border-border text-text-secondary hover:border-brand hover:text-brand-bright",
            )}
          >
            {link.label}
          </Link>
        ))}
        {publicLink && (
          <Link
            href={publicLink.href}
            className="inline-flex min-h-[44px] items-center rounded-[var(--radius-medium)] border border-border px-4 text-sm font-medium text-text-secondary transition-colors hover:border-brand hover:text-brand-bright focus-ring"
          >
            {publicLink.label}
          </Link>
        )}
        <form action={signOutAction}>
          <button
            type="submit"
            className="inline-flex min-h-[44px] items-center rounded-[var(--radius-medium)] border border-border px-4 text-sm font-medium text-text-secondary transition-colors hover:border-live hover:text-live focus-ring"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

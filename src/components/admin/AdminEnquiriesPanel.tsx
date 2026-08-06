"use client";

import { format, parseISO } from "date-fns";
import { useState, useTransition } from "react";
import {
  deleteContactEnquiryAction,
  deleteNewsletterSignupAction,
} from "@/app/admin/enquiries/actions";
import type { ContactEnquiry, NewsletterSignup } from "@/lib/enquiries/types";
import { cn } from "@/lib/utils/cn";

type AdminEnquiriesPanelProps = {
  contactEnquiries: ContactEnquiry[];
  newsletterSignups: NewsletterSignup[];
};

function formatTimestamp(iso: string): string {
  return format(parseISO(iso), "MMM d, yyyy · h:mm a");
}

function DeleteButton({
  id,
  label,
  onDelete,
  isPending,
}: {
  id: string;
  label: string;
  onDelete: (id: string) => void;
  isPending: boolean;
}) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-live">Delete?</span>
        <button
          type="button"
          disabled={isPending}
          onClick={() => onDelete(id)}
          className="rounded-[var(--radius-medium)] border border-live bg-live/10 px-3 py-2 text-sm font-medium text-live transition-colors hover:bg-live/20 focus-ring disabled:opacity-50"
        >
          Yes, delete
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => setConfirming(false)}
          className="rounded-[var(--radius-medium)] border border-border px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-brand hover:text-brand-bright focus-ring disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => setConfirming(true)}
      aria-label={`Delete ${label}`}
      className={cn(
        "rounded-[var(--radius-medium)] border border-border px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-live hover:text-live focus-ring disabled:opacity-50",
      )}
    >
      Delete
    </button>
  );
}

export function AdminEnquiriesPanel({
  contactEnquiries,
  newsletterSignups,
}: AdminEnquiriesPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleDeleteContact = (id: string) => {
    startTransition(async () => {
      const result = await deleteContactEnquiryAction(id);
      setMessage(result.message);
    });
  };

  const handleDeleteNewsletter = (id: string) => {
    startTransition(async () => {
      const result = await deleteNewsletterSignupAction(id);
      setMessage(result.message);
    });
  };

  return (
    <div className="flex flex-col gap-8">
      {message && (
        <p className="rounded-[var(--radius-medium)] border border-border bg-surface px-4 py-3 text-sm text-text-secondary">
          {message}
        </p>
      )}

      <section className="rounded-[var(--radius-large)] border border-border bg-surface">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-heading text-xl font-bold text-text-primary">Contact messages</h2>
          <p className="mt-1 text-sm text-text-secondary">
            {contactEnquiries.length === 0
              ? "No contact form submissions yet."
              : `${contactEnquiries.length} submission${contactEnquiries.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {contactEnquiries.length > 0 ? (
          <ul className="divide-y divide-border">
            {contactEnquiries.map((enquiry) => (
              <li key={enquiry.id} className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                    {formatTimestamp(enquiry.createdAt)}
                  </p>
                  <p className="mt-2 font-heading text-base font-bold text-text-primary">
                    {enquiry.firstName} {enquiry.lastName}
                  </p>
                  <a
                    href={`mailto:${enquiry.email}`}
                    className="mt-1 inline-block text-sm text-brand-bright hover:underline"
                  >
                    {enquiry.email}
                  </a>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                    {enquiry.message}
                  </p>
                </div>
                <div className="shrink-0">
                  <DeleteButton
                    id={enquiry.id}
                    label={`message from ${enquiry.email}`}
                    onDelete={handleDeleteContact}
                    isPending={isPending}
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-6 text-sm text-text-secondary">
            Submissions from the contact page will appear here automatically.
          </p>
        )}
      </section>

      <section className="rounded-[var(--radius-large)] border border-border bg-surface">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-heading text-xl font-bold text-text-primary">Briefing signups</h2>
          <p className="mt-1 text-sm text-text-secondary">
            {newsletterSignups.length === 0
              ? "No briefing signups yet."
              : `${newsletterSignups.length} signup${newsletterSignups.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {newsletterSignups.length > 0 ? (
          <ul className="divide-y divide-border">
            {newsletterSignups.map((signup) => (
              <li key={signup.id} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                    {formatTimestamp(signup.createdAt)}
                  </p>
                  <a
                    href={`mailto:${signup.email}`}
                    className="mt-2 inline-block font-heading text-base font-bold text-text-primary hover:text-brand-bright"
                  >
                    {signup.email}
                  </a>
                  {signup.interests.length > 0 && (
                    <p className="mt-1 text-sm text-text-secondary">
                      Interests: {signup.interests.join(", ")}
                    </p>
                  )}
                </div>
                <div className="shrink-0">
                  <DeleteButton
                    id={signup.id}
                    label={`signup ${signup.email}`}
                    onDelete={handleDeleteNewsletter}
                    isPending={isPending}
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-6 text-sm text-text-secondary">
            Newsletter signups from the homepage briefing form will appear here automatically.
          </p>
        )}
      </section>
    </div>
  );
}

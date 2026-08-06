import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact/ContactForm";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { contactPage } from "@/content/contact";
import { site } from "@/content/site";
import { createPageMetadata } from "@/lib/seo/canonical";

export const metadata: Metadata = createPageMetadata({
  path: "/contact",
  title: "Contact | DYOR",
  description: contactPage.description,
});

export default function ContactPage() {
  return (
    <article className="relative z-10 mx-auto max-w-xl px-4 py-10 pb-28 md:px-6 md:py-16 md:pb-16">
      <Link
        href="/"
        className="mb-6 inline-flex text-sm text-brand-bright hover:underline focus-ring"
      >
        ← Back to home
      </Link>

      <h1 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">
        {contactPage.title}
      </h1>
      <p className="mt-4 text-lg text-text-secondary">{contactPage.description}</p>

      {site.social.x && (
        <p className="mt-3 text-sm text-text-secondary">
          Prefer X? <ExternalLink href={site.social.x}>Message @DYORPod</ExternalLink>
        </p>
      )}

      <div className="mt-8 rounded-[var(--radius-large)] border border-border bg-surface/60 p-5 md:p-8">
        <ContactForm />
      </div>
    </article>
  );
}

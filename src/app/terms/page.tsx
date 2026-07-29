import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use | DYOR",
  description: "Terms of use for the DYOR website.",
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
      <p className="mb-6 rounded-md border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">
        Starter content — requires owner and legal review before launch.
      </p>
      <h1 className="font-heading text-3xl font-bold text-text-primary">Terms of Use</h1>
      <p className="mt-4 text-text-secondary">Last updated: {new Date().getFullYear()}</p>

      <div className="mt-8 space-y-6 text-text-secondary">
        <section>
          <h2 className="text-xl font-semibold text-text-primary">Acceptance</h2>
          <p>
            By accessing dyorpod.com, you agree to these terms. If you do not agree, please
            do not use the site.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-text-primary">Content</h2>
          <p>
            All content on this site and in DYOR programmes is for informational and
            entertainment purposes. It does not constitute financial, investment, or legal
            advice.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-text-primary">External Links</h2>
          <p>
            Our site links to third-party platforms including X and Spotify. We are not
            responsible for content or policies on external sites.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-text-primary">Changes</h2>
          <p>We may update these terms at any time. Continued use constitutes acceptance.</p>
        </section>
      </div>

      <p className="mt-10">
        <Link href="/" className="text-brand-bright hover:underline focus-ring">
          ← Back to home
        </Link>
      </p>
    </article>
  );
}

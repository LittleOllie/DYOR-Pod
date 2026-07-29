import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | DYOR",
  description: "Privacy policy for the DYOR website.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
      <p className="mb-6 rounded-md border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">
        Starter content — requires owner and legal review before launch.
      </p>
      <h1 className="font-heading text-3xl font-bold text-text-primary">Privacy Policy</h1>
      <p className="mt-4 text-text-secondary">Last updated: {new Date().getFullYear()}</p>

      <div className="prose-dyor mt-8 space-y-6 text-text-secondary">
        <section>
          <h2 className="text-xl font-semibold text-text-primary">Overview</h2>
          <p>
            DYOR (&quot;we&quot;, &quot;us&quot;) operates dyorpod.com. This policy describes how we
            collect, use, and protect information when you visit our website or subscribe to
            our newsletter.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-text-primary">Information We Collect</h2>
          <p>
            We may collect your email address when you subscribe to the DYOR Briefing. We may
            also collect standard analytics data (page views, referral source) if analytics
            are enabled.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-text-primary">How We Use Information</h2>
          <p>
            Email addresses are used to send newsletter updates about DYOR Spaces, podcast
            releases, and related announcements. We do not sell personal information.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-text-primary">Third-Party Services</h2>
          <p>
            Our site may link to X, Spotify, Apple Podcasts, and newsletter providers. These
            services have their own privacy policies.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-text-primary">Contact</h2>
          <p>
            For privacy questions, contact the DYOR team through their official X account.
          </p>
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

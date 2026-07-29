import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Disclaimer | DYOR",
  description: "Disclaimer for DYOR content and website.",
};

export default function DisclaimerPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
      <p className="mb-6 rounded-md border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">
        Starter content — requires owner and legal review before launch.
      </p>
      <h1 className="font-heading text-3xl font-bold text-text-primary">Disclaimer</h1>

      <div className="mt-8 space-y-6 text-text-secondary">
        <p>
          Content shared by DYOR and its guests is provided for entertainment and
          informational purposes only and does not constitute financial advice. Always do
          your own research.
        </p>
        <section>
          <h2 className="text-xl font-semibold text-text-primary">No Financial Advice</h2>
          <p>
            Nothing on this website, in DYOR X Spaces, or on the DYOR Podcast should be
            interpreted as investment, trading, tax, or legal advice. Consult qualified
            professionals before making financial decisions.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-text-primary">Cryptocurrency Risk</h2>
          <p>
            Cryptocurrency and digital assets involve substantial risk, including total
            loss of capital. Past performance is not indicative of future results.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-text-primary">External Links</h2>
          <p>
            Links to third-party websites are provided for convenience. DYOR does not endorse
            or guarantee external content.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-text-primary">Guest Opinions</h2>
          <p>
            Views expressed by guests and contributors are their own and may not represent
            the views of DYOR or its hosts.
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

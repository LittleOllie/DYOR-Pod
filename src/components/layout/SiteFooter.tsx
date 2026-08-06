import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ApplePodcastsSocialLink } from "@/components/ui/ApplePodcastsSocialLink";
import { SpotifySocialLink } from "@/components/ui/SpotifySocialLink";
import { SocialIconLink } from "@/components/ui/SocialIconLink";
import { footerLinkGroups } from "@/content/navigation";
import { newsletter, site, footer as footerContent } from "@/content/site";
import { Mail } from "lucide-react";

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FooterSocialLinks() {
  return (
    <div className="flex gap-2">
      {site.social.x && (
        <SocialIconLink href={site.social.x} label="Follow DYOR on X">
          <XIcon />
        </SocialIconLink>
      )}
      {site.social.spotify && <SpotifySocialLink href={site.social.spotify} />}
      {site.social.applePodcasts && (
        <ApplePodcastsSocialLink href={site.social.applePodcasts} />
      )}
      {site.contactEmail && (
        <SocialIconLink href={`mailto:${site.contactEmail}`} label="Email DYOR">
          <Mail size={18} />
        </SocialIconLink>
      )}
    </div>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 overflow-hidden border-t border-border bg-transparent py-10 pb-[max(2rem,env(safe-area-inset-bottom))] md:px-6 md:py-16 lg:py-20">
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/25 to-transparent"
        aria-hidden="true"
      />

      <div className="mobile-page-container relative md:mx-auto md:max-w-[var(--content-width)] md:px-0">
        <p className="mb-7 text-center text-[10px] font-medium uppercase tracking-[0.25em] text-text-secondary/70 md:mb-10">
          {footerContent.eyebrow}
        </p>

        <div className="flex flex-col gap-8 md:gap-10 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)_minmax(0,0.9fr)] lg:items-start lg:gap-12 xl:gap-16">
          {/* Brand + social (mobile + desktop left) */}
          <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
            <BrandLogo size="sm" className="mx-auto md:mx-0" />
            <p className="max-w-xs font-heading text-lg font-semibold leading-snug text-text-primary lg:text-xl">
              {footerContent.tagline}
            </p>
            <div className="md:hidden">
              <FooterSocialLinks />
            </div>
            <div className="hidden md:block">
              <FooterSocialLinks />
            </div>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer navigation" className="w-full max-w-sm mx-auto md:mx-0 md:max-w-none">
            <div className="flex flex-col gap-5 border-t border-border/60 pt-6 md:hidden">
              {footerLinkGroups.map((group) => (
                <div key={group.title}>
                  <p className="footer-nav-label">{group.title}</p>
                  <ul
                    className={
                      group.items.length > 2
                        ? "mt-2 grid grid-cols-2 gap-x-6 gap-y-0.5"
                        : "mt-2 flex flex-wrap gap-x-6 gap-y-0.5"
                    }
                  >
                    {group.items.map((item) => (
                      <li key={item.href + item.label}>
                        <Link href={item.href} className="footer-link">
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="hidden md:grid md:grid-cols-2 md:gap-x-10 md:gap-y-0.5 lg:gap-x-12">
              {footerLinkGroups.map((group) => (
                <div key={group.title} className="mb-6 last:mb-0">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-brand/80">
                    {group.title}
                  </p>
                  <ul className="space-y-0.5">
                    {group.items.map((item) => (
                      <li key={item.href + item.label}>
                        <Link href={item.href} className="footer-link">
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </nav>

          {/* Newsletter reminder — desktop right column */}
          <div className="hidden flex-col gap-4 lg:flex">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand/80">
              Stay informed
            </p>
            <p className="text-base leading-relaxed text-text-secondary">
              {newsletter.description}
            </p>
            <Link
              href="/#newsletter"
              className="inline-flex min-h-[44px] items-center text-sm font-medium text-brand-bright underline-offset-4 hover:underline focus-ring"
            >
              Join the DYOR Briefing →
            </Link>
            <ul className="mt-2 space-y-0.5 border-t border-border/40 pt-4">
              <li>
                <Link href="/legal?tab=privacy" className="footer-link">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/legal?tab=terms" className="footer-link">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/legal?tab=disclaimer" className="footer-link">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border/60 pt-6 text-center text-sm text-text-secondary md:mt-12 lg:mt-14">
          <p>&copy; {year} DYOR. All rights reserved.</p>
          <p className="mt-2 text-xs text-text-secondary/60">
            Powered by {footerContent.poweredBy}
          </p>
        </div>
      </div>
    </footer>
  );
}

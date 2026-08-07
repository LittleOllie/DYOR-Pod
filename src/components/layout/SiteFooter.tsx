import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ApplePodcastsSocialLink } from "@/components/ui/ApplePodcastsSocialLink";
import { SpotifySocialLink } from "@/components/ui/SpotifySocialLink";
import { SocialIconLink } from "@/components/ui/SocialIconLink";
import { footerLinkGroups } from "@/content/navigation";
import { site, footer as footerContent } from "@/content/site";
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

        <div className="flex flex-col gap-8 md:gap-10 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)] lg:items-start lg:gap-12 xl:gap-16">
          {/* Brand + social (mobile + desktop left) */}
          <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
            <BrandLogo size="sm" className="mx-auto md:mx-0" />
            <p className="max-w-xs font-heading text-lg font-semibold leading-snug text-text-primary lg:text-xl">
              {footerContent.tagline}
            </p>
            <FooterSocialLinks />
          </div>

          {/* Navigation — three columns side by side instead of a long vertical stack */}
          <nav aria-label="Footer navigation" className="w-full border-t border-border/60 pt-6 md:border-t-0 md:pt-0">
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 md:gap-x-10 lg:gap-x-14">
              {footerLinkGroups.map((group) => (
                <div key={group.title}>
                  <p className="footer-nav-label mb-2">{group.title}</p>
                  <ul>
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

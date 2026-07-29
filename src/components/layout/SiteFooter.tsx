import { BrandLogo } from "@/components/brand/BrandLogo";
import { ApplePodcastsSocialLink } from "@/components/ui/ApplePodcastsSocialLink";
import { SpotifySocialLink } from "@/components/ui/SpotifySocialLink";
import { SocialIconLink } from "@/components/ui/SocialIconLink";
import { footerNav } from "@/content/navigation";
import { site, footer as footerContent } from "@/content/site";
import { Mail } from "lucide-react";

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 overflow-hidden border-t border-border bg-transparent px-4 py-10 pb-28 md:px-6 md:py-14 md:pb-14">
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/25 to-transparent"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[var(--content-width)]">
        <p className="mb-8 text-center text-[10px] font-medium uppercase tracking-[0.25em] text-text-secondary/50">
          {footerContent.eyebrow}
        </p>

        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4 text-center md:text-left">
            <BrandLogo size="sm" className="mx-auto md:mx-0" />
            <p className="mx-auto max-w-xs font-heading text-lg font-semibold text-text-primary md:mx-0">
              {footerContent.tagline}
            </p>
          </div>

          <nav aria-label="Footer navigation" className="mx-auto md:mx-0">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-2.5 sm:grid-cols-4">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="rounded-sm text-sm text-text-secondary transition-colors duration-[var(--motion-fast)] hover:text-brand-bright focus-ring"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col items-center gap-4 md:items-end">
            <p className="text-sm font-medium text-text-primary">Follow DYOR</p>
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
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-text-secondary">
          <p>&copy; {year} DYOR. All rights reserved.</p>
          <p className="mt-3 text-xs text-text-secondary/60">
            Powered by {footerContent.poweredBy}
          </p>
        </div>
      </div>
    </footer>
  );
}

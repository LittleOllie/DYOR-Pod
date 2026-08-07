import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { LinkButton } from "@/components/ui/Button";
import { HostRevealPortrait } from "@/components/hosts/HostRevealPortrait";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { countdownOSrc, COUNTDOWN_LETTER_CANVAS } from "@/content/brandLogo";
import type { Host } from "@/types/content";

type HostCardProps = {
  host: Host;
};

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/** Shared portrait stage — O watermark and PFP share one centered anchor. */
const HOST_O_SIZE = "16.75rem";
const HOST_PFP_SIZE = "10rem";

function HostPortraitWatermark() {
  return (
    <div className="host-portrait-watermark pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      <Image
        src={countdownOSrc}
        alt=""
        width={COUNTDOWN_LETTER_CANVAS.width}
        height={COUNTDOWN_LETTER_CANVAS.height}
        className="host-portrait-watermark__image logo-layer-blend"
        sizes="268px"
      />
    </div>
  );
}

function HostPortraitSection({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full justify-center overflow-visible pt-10 md:pt-12">
      <div
        className="host-portrait-stage relative shrink-0"
        style={
          {
            "--host-o-size": HOST_O_SIZE,
            "--host-pfp-size": HOST_PFP_SIZE,
          } as CSSProperties
        }
      >
        <HostPortraitWatermark />
        <div className="absolute inset-0 z-10 flex items-center justify-center">{children}</div>
      </div>
    </div>
  );
}

export function HostCard({ host }: HostCardProps) {
  return (
    <article className="group relative flex h-full min-w-0 flex-col items-center overflow-x-clip md:overflow-visible rounded-[var(--radius-xl)] border border-border bg-surface/70 p-6 text-center transition-[border-color,box-shadow] duration-[var(--motion-base)] hover:border-brand/30 hover:shadow-[var(--shadow-soft)] focus-within:ring-2 focus-within:ring-brand-bright">
      {host.fullImage ? (
        <HostPortraitSection>
          <HostRevealPortrait host={host} />
        </HostPortraitSection>
      ) : (
        <HostPortraitSection>
          <div className="relative mx-auto">
            <div
              className="orbital-ring absolute -inset-3 scale-110 opacity-40 transition-opacity duration-[var(--motion-base)] group-hover:opacity-70"
              aria-hidden="true"
            />
            <div className="host-portrait-glow relative h-[var(--host-pfp-size)] w-[var(--host-pfp-size)] overflow-hidden rounded-full border-2 border-brand ring-4 ring-brand/10">
              <ImageWithFallback
                src={host.image}
                alt={`${host.name} profile photo`}
                width={128}
                height={128}
                className="h-full w-full scale-[1.14] object-cover object-center"
                sizes="128px"
              />
            </div>
          </div>
        </HostPortraitSection>
      )}

      <h3 className="w-full font-heading text-xl font-bold text-text-primary">{host.name}</h3>
      <p className="mt-1 w-full text-sm font-medium text-brand-bright">{host.role}</p>
      {host.bio && (
        <p className="mt-3 w-full max-w-xs text-sm leading-relaxed text-text-secondary">{host.bio}</p>
      )}

      {host.xUrl && (
        <div className="mt-5 flex w-full justify-center">
          <LinkButton
            href={host.xUrl}
            variant="secondary"
            size="md"
            external
            className="min-h-[44px] w-full md:w-auto md:min-w-[10rem] md:px-5"
          >
            <XIcon />
            {host.handle ? `@${host.handle}` : "Follow on X"}
          </LinkButton>
        </div>
      )}
    </article>
  );
}

import Link from "next/link";
import { HostRevealPortrait } from "@/components/hosts/HostRevealPortrait";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { hostsDesktop } from "@/content/site";
import type { Host } from "@/types/content";
import { cn } from "@/lib/utils/cn";

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function DesktopHostCard({ host }: { host: Host }) {
  return (
    <article
      className={cn(
        "desktop-hover-lift group flex flex-col items-center rounded-[var(--radius-xl)] bg-surface/20 px-6 py-8 text-center",
        "lg:px-8 lg:py-10",
      )}
    >
      <div className="relative mb-6">
        {host.fullImage ? (
          <div className="relative size-[11rem] lg:size-[12rem]">
            <HostRevealPortrait host={host} />
          </div>
        ) : (
          <div className="host-portrait-glow relative h-32 w-32 overflow-hidden rounded-full ring-2 ring-brand/20 lg:h-36 lg:w-36">
            <ImageWithFallback
              src={host.image}
              alt={`${host.name} profile photo`}
              width={144}
              height={144}
              className="h-full w-full object-cover"
              sizes="144px"
            />
          </div>
        )}
      </div>

      <h3 className="font-heading text-2xl font-bold text-text-primary">{host.name}</h3>
      <p className="mt-1 text-sm font-medium text-brand-bright">{host.role}</p>
      {host.bio ? (
        <p className="mt-4 max-w-[16rem] text-sm leading-relaxed text-text-secondary">
          {host.bio}
        </p>
      ) : null}

      {host.xUrl ? (
        <Link
          href={host.xUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-brand-bright underline-offset-4 transition-colors hover:underline focus-ring"
        >
          <XIcon />
          {host.handle ? `@${host.handle}` : "Follow on X"}
        </Link>
      ) : null}
    </article>
  );
}

type DesktopHostTeamProps = {
  hosts: Host[];
};

export function DesktopHostTeam({ hosts }: DesktopHostTeamProps) {
  return (
    <div>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-end lg:gap-12 xl:gap-16">
        <SectionHeading
          title={hostsDesktop.title}
          accent={hostsDesktop.accent}
          description={hostsDesktop.description}
          className="mb-0 lg:pb-4"
        />

        <p className="hidden text-sm leading-relaxed text-text-secondary lg:block lg:max-w-md lg:justify-self-end lg:pb-4 lg:text-right">
          The people behind the weekly conversations — independent voices, one broadcast.
        </p>
      </div>

      <div className="relative mt-10 lg:mt-12">
        <div
          className="pointer-events-none absolute inset-x-[8%] top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-brand/20 to-transparent lg:block"
          aria-hidden="true"
        />
        <div className="grid gap-5 md:grid-cols-3 lg:gap-6">
          {hosts.map((host) => (
            <DesktopHostCard key={host.id} host={host} />
          ))}
        </div>
      </div>
    </div>
  );
}

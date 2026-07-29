import { LinkButton } from "@/components/ui/Button";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
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

export function HostCard({ host }: HostCardProps) {
  return (
    <article className="group flex flex-col items-center rounded-[var(--radius-xl)] border border-border bg-surface/70 p-6 text-center transition-all duration-[var(--motion-base)] hover:border-brand/30 hover:shadow-[var(--shadow-soft)] focus-within:ring-2 focus-within:ring-brand-bright">
      <div className="relative mb-5">
        <div
          className="orbital-ring absolute -inset-3 scale-110 opacity-40 transition-opacity duration-[var(--motion-base)] group-hover:opacity-70"
          aria-hidden="true"
        />
        <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-brand ring-4 ring-brand/10">
          <ImageWithFallback
            src={host.image}
            alt={`${host.name} profile photo`}
            width={128}
            height={128}
            className="h-full w-full object-cover"
            sizes="128px"
          />
        </div>
      </div>

      <h3 className="font-heading text-xl font-bold text-text-primary">{host.name}</h3>
      <p className="mt-1 text-sm font-medium text-brand-bright">{host.role}</p>
      {host.bio && (
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-text-secondary">{host.bio}</p>
      )}

      {host.xUrl && (
        <div className="mt-5 w-full">
          <LinkButton
            href={host.xUrl}
            variant="secondary"
            size="md"
            external
            className="min-h-[44px] w-full"
          >
            <XIcon />
            {host.handle ? `@${host.handle}` : "Follow on X"}
          </LinkButton>
        </div>
      )}
    </article>
  );
}

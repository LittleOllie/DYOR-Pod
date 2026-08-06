import Image from "next/image";
import { ExternalLink } from "@/components/ui/ExternalLink";
import type { Host } from "@/types/content";

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const hostSpecialisms: Record<string, string> = {
  dw: "Markets and technical analysis",
  "petey-k": "Crypto news and community",
  janner: "Long-form conversations and interviews",
};

type MobileHostRowProps = {
  host: Host;
};

export function MobileHostRow({ host }: MobileHostRowProps) {
  const specialism = hostSpecialisms[host.id] ?? host.role;

  return (
    <article className="flex gap-4 border-b border-border/80 py-4 last:border-b-0">
      <div className="host-portrait-glow relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-full border-2 border-brand/40">
        <Image
          src={host.image}
          alt={`${host.name} profile photo`}
          width={144}
          height={144}
          className="h-full w-full object-cover"
          sizes="72px"
        />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-heading text-lg font-bold text-text-primary">{host.name}</h3>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-brand">{host.role}</p>
        <p className="mt-1 text-sm leading-snug text-text-secondary">{specialism}</p>
        {host.xUrl ? (
          <ExternalLink
            href={host.xUrl}
            className="mt-2 inline-flex min-h-[44px] items-center gap-1.5 text-sm text-brand-bright hover:underline focus-ring"
          >
            <XIcon />
            {host.handle ? `@${host.handle}` : "Follow on X"}
          </ExternalLink>
        ) : null}
      </div>
    </article>
  );
}

type MobileHostListProps = {
  hosts: Host[];
};

export function MobileHostList({ hosts }: MobileHostListProps) {
  return (
    <div className="md:hidden" aria-label="DYOR hosts">
      {hosts.map((host) => (
        <MobileHostRow key={host.id} host={host} />
      ))}
    </div>
  );
}

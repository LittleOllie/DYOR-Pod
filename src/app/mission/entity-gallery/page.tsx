"use client";

import { EntityPreviewCanvas } from "@/features/mission-ascent/rendering/EntityPreviewCanvas";
import {
  collectibleDefinitions,
  getEntityRadius,
  hazardDefinitions,
  logoComponentDefinitions,
} from "@/features/mission-ascent/config/entityDefinitions";
import { missionVisuals } from "@/features/mission-ascent/config/visualConfig";
import { LOGO_COMPONENT_ORDER } from "@/features/mission-ascent/config/missionAssembly";

export default function EntityGalleryPage() {
  if (process.env.NODE_ENV === "production") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg-primary p-8 text-text-secondary">
        Entity gallery is available in development only.
      </main>
    );
  }

  const collectibles = Object.values(collectibleDefinitions);
  const hazards = Object.values(hazardDefinitions);
  const logos = LOGO_COMPONENT_ORDER.map((t) => logoComponentDefinitions[t]);

  return (
    <main className="min-h-screen bg-bg-primary px-4 py-10 text-text-primary sm:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-bright">
          Development only
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold">Mission Ascent — Entity Gallery</h1>
        <p className="mt-2 max-w-2xl text-sm text-text-secondary">
          Side-by-side preview of all gameplay entity renderers. Animations run live; reduced-effects
          variants shown below each standard preview.
        </p>

        <GallerySection title="Mission components (Tier 1)">
          {logos.map((item) => (
            <GalleryCard
              key={item.type}
              name={item.label}
              kind="logo-component"
              type={item.type}
              collisionR={item.radius}
            />
          ))}
        </GallerySection>

        <GallerySection title="Support pickups (Tier 2)">
          {collectibles.map((item) => (
            <GalleryCard
              key={item.type}
              name={item.label}
              kind="collectible"
              type={item.type}
              collisionR={item.radius}
            />
          ))}
        </GallerySection>

        <GallerySection title="Hazards (Tier 3)">
          {hazards.map((item) => (
            <GalleryCard
              key={item.type}
              name={item.label}
              kind="hazard"
              type={item.type}
              collisionR={item.radius}
              seedVariants={item.type === "asteroid" || item.type === "debris" ? 3 : 0}
            />
          ))}
        </GallerySection>

        <section className="mt-10 rounded-[var(--radius-xl)] border border-brand/25 bg-bg-deep/80 p-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand/80">Visual config</h2>
          <pre className="mt-3 overflow-x-auto text-[10px] leading-relaxed text-text-secondary">
            {JSON.stringify(missionVisuals.scales, null, 2)}
          </pre>
        </section>
      </div>
    </main>
  );
}

function GallerySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xs font-bold uppercase tracking-widest text-brand/80">{title}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{children}</div>
    </section>
  );
}

function GalleryCard({
  name,
  kind,
  type,
  collisionR,
  seedVariants = 0,
}: {
  name: string;
  kind: "collectible" | "hazard" | "logo-component";
  type: string;
  collisionR: number;
  seedVariants?: number;
}) {
  const renderR = getEntityRadius(kind, type as never);

  return (
    <div className="rounded-[var(--radius-medium)] border border-border/50 bg-bg-deep/70 p-4">
      <p className="text-xs font-bold text-text-primary">{name}</p>
      <p className="mt-0.5 font-mono text-[10px] text-text-secondary/70">{type}</p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <PreviewBlock label="Standard" kind={kind} type={type} size={72} />
        <PreviewBlock label="Reduced" kind={kind} type={type} size={72} reducedEffects quality="reduced" />
      </div>
      {seedVariants > 0 && (
        <div className="mt-3 flex gap-2">
          {Array.from({ length: seedVariants }, (_, i) => (
            <PreviewBlock key={i} label={`Seed ${i}`} kind={kind} type={type} size={56} seedOffset={i * 17} />
          ))}
        </div>
      )}
      <dl className="mt-3 grid grid-cols-2 gap-1 font-mono text-[9px] text-text-secondary/80">
        <dt>Render radius</dt>
        <dd>{renderR}px</dd>
        <dt>Collision</dt>
        <dd>{collisionR}px</dd>
      </dl>
    </div>
  );
}

function PreviewBlock({
  label,
  kind,
  type,
  size,
  reducedEffects,
  quality = "standard",
  seedOffset = 0,
}: {
  label: string;
  kind: "collectible" | "hazard" | "logo-component";
  type: string;
  size: number;
  reducedEffects?: boolean;
  quality?: "standard" | "reduced";
  seedOffset?: number;
}) {
  return (
    <div className="text-center">
      <EntityPreviewCanvas
        kind={kind}
        type={type}
        size={size}
        quality={quality}
        reducedEffects={reducedEffects}
        showBounds
      />
      <p className="mt-1 text-[9px] uppercase tracking-wider text-text-secondary/60">{label}</p>
    </div>
  );
}

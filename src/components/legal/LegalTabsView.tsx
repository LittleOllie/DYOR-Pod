"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";
import {
  getLegalDocument,
  isLegalTabId,
  legalDocuments,
  type LegalTabId,
} from "@/content/legal";
import { cn } from "@/lib/utils/cn";

type LegalTabsViewProps = {
  initialTab?: LegalTabId;
};

export function LegalTabsView({ initialTab = "privacy" }: LegalTabsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: LegalTabId = isLegalTabId(tabParam) ? tabParam : initialTab;
  const tabRefs = useRef<Partial<Record<LegalTabId, HTMLButtonElement | null>>>({});

  const selectTab = useCallback(
    (id: LegalTabId) => {
      router.replace(`/legal?tab=${id}`, { scroll: false });
      tabRefs.current[id]?.focus();
    },
    [router],
  );

  const handleTabKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, currentId: LegalTabId) => {
      const ids = legalDocuments.map((tab) => tab.id);
      const currentIndex = ids.indexOf(currentId);
      if (currentIndex === -1) return;

      let nextIndex: number | null = null;

      switch (event.key) {
        case "ArrowLeft":
          nextIndex = currentIndex === 0 ? ids.length - 1 : currentIndex - 1;
          break;
        case "ArrowRight":
          nextIndex = currentIndex === ids.length - 1 ? 0 : currentIndex + 1;
          break;
        case "Home":
          nextIndex = 0;
          break;
        case "End":
          nextIndex = ids.length - 1;
          break;
        default:
          return;
      }

      event.preventDefault();
      const nextId = ids[nextIndex];
      if (nextId) {
        selectTab(nextId);
      }
    },
    [selectTab],
  );

  const document = getLegalDocument(activeTab);
  const year = new Date().getFullYear();

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
      <div
        role="tablist"
        aria-label="Legal documents"
        className="flex flex-wrap gap-2 border-b border-border/60 pb-4"
      >
        {legalDocuments.map((tab) => {
          const selected = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              ref={(element) => {
                tabRefs.current[tab.id] = element;
              }}
              type="button"
              role="tab"
              id={`legal-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`legal-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => selectTab(tab.id)}
              onKeyDown={(event) => handleTabKeyDown(event, tab.id)}
              className={cn(
                "min-h-[44px] rounded-[var(--radius-medium)] px-4 py-2.5 text-sm font-medium transition-colors focus-ring",
                selected
                  ? "bg-brand/15 text-brand-bright ring-1 ring-brand/35"
                  : "text-text-secondary hover:bg-surface/60 hover:text-text-primary",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`legal-panel-${document.id}`}
        aria-labelledby={`legal-tab-${document.id}`}
        className="mt-8"
      >
        <h1 className="font-heading text-3xl font-bold text-text-primary">
          {document.title}
        </h1>
        {document.showLastUpdated && (
          <p className="mt-4 text-text-secondary">Last updated: {year}</p>
        )}

        <div className="prose-dyor mt-8 space-y-6 text-text-secondary">
          {document.intro && <p>{document.intro}</p>}
          {document.sections.map((section) => (
            <section key={section.heading ?? section.paragraphs[0]?.slice(0, 24)}>
              {section.heading && (
                <h2 className="text-xl font-semibold text-text-primary">
                  {section.heading}
                </h2>
              )}
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className={section.heading ? "mt-2" : undefined}>
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>

      <p className="mt-10">
        <Link href="/" className="text-brand-bright hover:underline focus-ring">
          ← Back to home
        </Link>
      </p>
    </article>
  );
}

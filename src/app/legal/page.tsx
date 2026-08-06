import type { Metadata } from "next";
import { Suspense } from "react";
import { LegalTabsView } from "@/components/legal/LegalTabsView";
import { isLegalTabId } from "@/content/legal";
import { createPageMetadata } from "@/lib/seo/canonical";

export const metadata: Metadata = createPageMetadata({
  path: "/legal",
  title: "Legal | DYOR",
  description: "Privacy policy, terms of use, and disclaimer for the DYOR website.",
});

type LegalPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function LegalPage({ searchParams }: LegalPageProps) {
  const params = await searchParams;
  const initialTab = isLegalTabId(params.tab) ? params.tab : "privacy";

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-16 text-text-secondary md:px-6 md:py-24">
          Loading…
        </div>
      }
    >
      <LegalTabsView initialTab={initialTab} />
    </Suspense>
  );
}

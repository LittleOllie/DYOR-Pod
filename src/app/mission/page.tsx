import type { Metadata } from "next";
import MissionPageClient from "./MissionPageClient";
import { createPageMetadata } from "@/lib/seo/canonical";

export const metadata: Metadata = createPageMetadata({
  path: "/mission",
  title: "DYOR: Mission Ascent | Mission Simulator",
  description:
    "Pilot the DYOR rocket in Mission Ascent — gather research, manage fuel and heat, and push for maximum altitude.",
});

export default function MissionPage() {
  return <MissionPageClient />;
}

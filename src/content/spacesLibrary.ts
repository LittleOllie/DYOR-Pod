import { getShowById } from "@/content/shows";

/** X Space recording — links to @DYORPod status posts with playable replays. */
export type SpaceRecording = {
  id: string;
  showId: string;
  episode: number;
  title: string;
  /** ISO date when the Space aired (YYYY-MM-DD). */
  airedAt: string;
  duration?: string;
  xUrl: string;
};

export const librarySection = {
  eyebrow: "Mission Archive",
  heading: "Spaces Library",
  headingAccent: "Library",
  description:
    "Recorded X Spaces from the DYOR lineup — browse by show and listen back on X.",
} as const;

/** Space shows that appear as library tabs (X Spaces only). */
export const libraryShowIds = [
  "dyor-sunday",
  "will-work-for-crypto",
  "no-fud-friday",
] as const;

export type LibraryShowId = (typeof libraryShowIds)[number];

export const spaceRecordings: SpaceRecording[] = [
  {
    id: "dyor-sunday-01",
    showId: "dyor-sunday",
    episode: 1,
    title: "DYOR Sunday • Weekly Crypto, Blockchain & NFT News",
    airedAt: "2026-06-28",
    duration: "2:01:57",
    xUrl: "https://x.com/DYORPod/status/2068828961132642395",
  },
  {
    id: "dyor-sunday-02",
    showId: "dyor-sunday",
    episode: 2,
    title: "DYOR Sunday • Crypto & NFT News!",
    airedAt: "2026-07-05",
    duration: "2:01:45",
    xUrl: "https://x.com/DYORPod/status/2071356191004106829",
  },
  {
    id: "dyor-sunday-03",
    showId: "dyor-sunday",
    episode: 3,
    title: "DYOR Sunday • Crypto & NFT News!",
    airedAt: "2026-07-12",
    duration: "2:00:52",
    xUrl: "https://x.com/DYORPod/status/2073932534971511234",
  },
  {
    id: "dyor-sunday-04",
    showId: "dyor-sunday",
    episode: 4,
    title: "DYOR Sunday • Crypto & NFT News!",
    airedAt: "2026-07-19",
    duration: "2:14:39",
    xUrl: "https://x.com/DYORPod/status/2076536197665726573",
  },
  {
    id: "dyor-sunday-05",
    showId: "dyor-sunday",
    episode: 5,
    title: "DYOR Sunday — Live Crypto and NFT News!",
    airedAt: "2026-07-26",
    duration: "2:02:31",
    xUrl: "https://x.com/DYORPod/status/2079964935170486666",
  },
  {
    id: "will-work-for-crypto-01",
    showId: "will-work-for-crypto",
    episode: 1,
    title: "Will Work for Crypto — Live Market & Chart Analysis",
    airedAt: "2026-07-14",
    duration: "1:04:20",
    xUrl: "https://x.com/DYORPod/status/2077151165373165817",
  },
  {
    id: "will-work-for-crypto-02",
    showId: "will-work-for-crypto",
    episode: 2,
    title: "Will Work for Crypto #2 — Live Market & Chart Analysis",
    airedAt: "2026-07-21",
    duration: "1:05:17",
    xUrl: "https://x.com/DYORPod/status/2078969678253408282",
  },
  {
    id: "will-work-for-crypto-03",
    showId: "will-work-for-crypto",
    episode: 3,
    title: "Will Work for Crypto #3 — Live Market & Chart Analysis",
    airedAt: "2026-07-28",
    duration: "1:01:43",
    xUrl: "https://x.com/DYORPod/status/2081502112438178252",
  },
];

export type LibraryCategory = {
  showId: LibraryShowId;
  name: string;
  shortName: string;
  recordings: SpaceRecording[];
};

export function getLibraryCategoriesFromRecordings(
  recordings: SpaceRecording[],
): LibraryCategory[] {
  return libraryShowIds.map((showId) => {
    const show = getShowById(showId);
    const showRecordings = recordings
      .filter((r) => r.showId === showId)
      .sort((a, b) => b.airedAt.localeCompare(a.airedAt));

    return {
      showId,
      name: show?.name ?? showId,
      shortName: show?.shortName ?? showId,
      recordings: showRecordings,
    };
  });
}

/** Static fallback when Redis storage is unavailable. */
export function getLibraryCategories(): LibraryCategory[] {
  return getLibraryCategoriesFromRecordings(spaceRecordings);
}

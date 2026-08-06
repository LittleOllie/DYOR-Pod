type SyndicationTweet = {
  created_at?: string;
  text?: string;
  parent?: {
    text?: string;
  };
  card?: {
    name?: string;
    binding_values?: Record<
      string,
      {
        string_value?: string;
      }
    >;
  };
};

export type XRecordingLookup = {
  airedAt?: string;
  duration?: string;
  title?: string;
  spaceId?: string;
};

export function extractTweetIdFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./, "");
    if (host !== "x.com" && host !== "twitter.com") {
      return null;
    }

    const statusMatch = parsed.pathname.match(/\/status\/(\d+)/);
    if (statusMatch?.[1]) {
      return statusMatch[1];
    }

    return null;
  } catch {
    return null;
  }
}

export function extractSpaceIdFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    const spaceMatch = parsed.pathname.match(/\/spaces\/([a-zA-Z0-9]+)/);
    return spaceMatch?.[1] ?? null;
  } catch {
    return null;
  }
}

export function syndicationToken(tweetId: string): string {
  return ((Number(tweetId) / 1e15) * Math.PI).toString(6).replace(/(0+|\.)/g, "");
}

function decodeBasicHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function isoTimestampToDate(iso: string): string {
  return iso.slice(0, 10);
}

export function secondsToDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function parseM3u8Duration(playlist: string): number | null {
  const matches = [...playlist.matchAll(/#EXTINF:([\d.]+)/g)];
  if (matches.length === 0) {
    return null;
  }

  const total = matches.reduce((sum, match) => sum + Number.parseFloat(match[1]), 0);
  return Number.isFinite(total) && total > 0 ? total : null;
}

async function fetchSyndicationTweet(tweetId: string): Promise<SyndicationTweet | null> {
  const token = syndicationToken(tweetId);
  const response = await fetch(
    `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&token=${token}&lang=en`,
    {
      headers: {
        "User-Agent": "DYOR-Website/1.0",
      },
      next: { revalidate: 0 },
    },
  );

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as SyndicationTweet | Record<string, never>;
  if (!payload || Object.keys(payload).length === 0 || !("created_at" in payload)) {
    return null;
  }

  return payload;
}

function getSpaceTweetId(tweet: SyndicationTweet): string | null {
  return tweet.card?.binding_values?.tweet_id?.string_value ?? null;
}

function getSpaceId(tweet: SyndicationTweet): string | null {
  return tweet.card?.binding_values?.id?.string_value ?? null;
}

function suggestTitleFromTweet(tweet: SyndicationTweet): string | undefined {
  const source = tweet.parent?.text ?? tweet.text;
  if (!source) {
    return undefined;
  }

  const firstLine = decodeBasicHtmlEntities(source)
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);

  if (!firstLine || firstLine.startsWith("http")) {
    return undefined;
  }

  return firstLine.slice(0, 200);
}

async function tryDurationFromPlaylist(playlistUrl: string): Promise<string | undefined> {
  try {
    const response = await fetch(playlistUrl, {
      headers: { "User-Agent": "DYOR-Website/1.0" },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return undefined;
    }

    const playlist = await response.text();
    const seconds = parseM3u8Duration(playlist);
    return seconds ? secondsToDuration(seconds) : undefined;
  } catch {
    return undefined;
  }
}

async function tryDurationFromSpacePage(spaceId: string): Promise<string | undefined> {
  try {
    const response = await fetch(`https://x.com/i/spaces/${spaceId}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return undefined;
    }

    const html = await response.text();
    const playlistMatch = html.match(/https:\/\/[^"'\\]+\.m3u8[^"'\\]*/);
    if (!playlistMatch?.[0]) {
      return undefined;
    }

    return tryDurationFromPlaylist(playlistMatch[0].replace(/\\u0026/g, "&"));
  } catch {
    return undefined;
  }
}

export async function lookupXRecordingMetadata(xUrl: string): Promise<XRecordingLookup> {
  const normalizedUrl = xUrl.trim();
  if (!normalizedUrl) {
    return {};
  }

  const statusTweetId = extractTweetIdFromUrl(normalizedUrl);
  const directSpaceId = extractSpaceIdFromUrl(normalizedUrl);

  if (!statusTweetId && !directSpaceId) {
    throw new Error("Paste an X status link or Space link.");
  }

  const statusTweet = statusTweetId ? await fetchSyndicationTweet(statusTweetId) : null;
  const spaceTweetId = statusTweet ? getSpaceTweetId(statusTweet) : statusTweetId;
  const spaceId = statusTweet ? getSpaceId(statusTweet) : directSpaceId;

  const spaceTweet =
    spaceTweetId && spaceTweetId !== statusTweetId
      ? await fetchSyndicationTweet(spaceTweetId)
      : statusTweet;

  const airedAt = spaceTweet?.created_at
    ? isoTimestampToDate(spaceTweet.created_at)
    : statusTweet?.created_at
      ? isoTimestampToDate(statusTweet.created_at)
      : undefined;

  const title = statusTweet ? suggestTitleFromTweet(statusTweet) : undefined;

  let duration: string | undefined;
  if (spaceId) {
    duration = await tryDurationFromSpacePage(spaceId);
  }

  return {
    airedAt,
    duration,
    title,
    spaceId: spaceId ?? undefined,
  };
}

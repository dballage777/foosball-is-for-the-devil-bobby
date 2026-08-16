// Verified official sources and their top-level channels. Only URLs that have
// been explicitly provided/verified appear here. Used as the honest fallback
// when the database is not configured. NEVER add an invented URL.

export interface VerifiedResource {
  title: string;
  sourceName: string;
  type: string;
  url: string;
  description: string;
}

export const VERIFIED_SOURCES: VerifiedResource[] = [
  {
    title: "Cold-Case Christianity — Website",
    sourceName: "Cold-Case Christianity",
    type: "external_resource",
    url: "https://coldcasechristianity.com/",
    description:
      "J. Warner Wallace examines the claims of Christianity using cold-case investigative methodology.",
  },
  {
    title: "Cold-Case Christianity — Podcast (Spotify)",
    sourceName: "Cold-Case Christianity",
    type: "spotify_show",
    url: "https://open.spotify.com/show/7aSbO4B9TAnP4unGDhpKhL",
    description: "The Cold-Case Christianity podcast on Spotify.",
  },
  {
    title: "Cold-Case Christianity — YouTube",
    sourceName: "Cold-Case Christianity",
    type: "youtube_channel",
    url: "https://m.youtube.com/@ColdCaseChristianity",
    description: "Official Cold-Case Christianity YouTube channel.",
  },
  {
    title: "Cross Examined — Website",
    sourceName: "Cross Examined",
    type: "external_resource",
    url: "https://crossexamined.org/",
    description:
      "Frank Turek's ministry equipping Christians to give reasons for their faith.",
  },
  {
    title: "Cross Examined — Podcast (Spotify)",
    sourceName: "Cross Examined",
    type: "spotify_show",
    url: "https://open.spotify.com/show/33MgzSFOheNQ8BnxMGbDOv",
    description: "The Cross Examined podcast on Spotify.",
  },
  {
    title: "Cross Examined — YouTube",
    sourceName: "Cross Examined",
    type: "youtube_channel",
    url: "https://m.youtube.com/@CrossExamined",
    description: "Official Cross Examined YouTube channel.",
  },
  {
    title: "John Lennox — Official Website",
    sourceName: "John Lennox",
    type: "external_resource",
    url: "https://johnlennox.org/",
    description:
      "Books, articles, talks, and resources from Oxford's John Lennox.",
  },
];

export function resourceActionLabel(type: string): string {
  if (type.startsWith("youtube") || type === "video" || type === "debate")
    return "Watch";
  if (type.startsWith("spotify") || type.startsWith("podcast")) return "Listen";
  if (type === "book") return "Find the book";
  return "Open resource";
}

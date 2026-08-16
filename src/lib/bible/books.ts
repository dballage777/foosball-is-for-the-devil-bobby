// Canonical Bible book metadata (Protestant 66-book canon).
// Book names, ordering, testament, and chapter counts are factual reference
// data (not copyrighted scripture text). Chapter counts follow the standard
// Protestant versification.

export type Testament = "OT" | "NT";

export interface BibleBook {
  /** Stable slug used in URLs, e.g. "genesis", "1-corinthians". */
  slug: string;
  /** Human-readable name, e.g. "1 Corinthians". */
  name: string;
  /** Common USFM-style id used by many Bible APIs, e.g. "GEN", "1CO". */
  osis: string;
  testament: Testament;
  /** Canonical order (1-based) across the whole Bible. */
  order: number;
  chapters: number;
}

export const BIBLE_BOOKS: BibleBook[] = [
  // ---- Old Testament ----
  { slug: "genesis", name: "Genesis", osis: "GEN", testament: "OT", order: 1, chapters: 50 },
  { slug: "exodus", name: "Exodus", osis: "EXO", testament: "OT", order: 2, chapters: 40 },
  { slug: "leviticus", name: "Leviticus", osis: "LEV", testament: "OT", order: 3, chapters: 27 },
  { slug: "numbers", name: "Numbers", osis: "NUM", testament: "OT", order: 4, chapters: 36 },
  { slug: "deuteronomy", name: "Deuteronomy", osis: "DEU", testament: "OT", order: 5, chapters: 34 },
  { slug: "joshua", name: "Joshua", osis: "JOS", testament: "OT", order: 6, chapters: 24 },
  { slug: "judges", name: "Judges", osis: "JDG", testament: "OT", order: 7, chapters: 21 },
  { slug: "ruth", name: "Ruth", osis: "RUT", testament: "OT", order: 8, chapters: 4 },
  { slug: "1-samuel", name: "1 Samuel", osis: "1SA", testament: "OT", order: 9, chapters: 31 },
  { slug: "2-samuel", name: "2 Samuel", osis: "2SA", testament: "OT", order: 10, chapters: 24 },
  { slug: "1-kings", name: "1 Kings", osis: "1KI", testament: "OT", order: 11, chapters: 22 },
  { slug: "2-kings", name: "2 Kings", osis: "2KI", testament: "OT", order: 12, chapters: 25 },
  { slug: "1-chronicles", name: "1 Chronicles", osis: "1CH", testament: "OT", order: 13, chapters: 29 },
  { slug: "2-chronicles", name: "2 Chronicles", osis: "2CH", testament: "OT", order: 14, chapters: 36 },
  { slug: "ezra", name: "Ezra", osis: "EZR", testament: "OT", order: 15, chapters: 10 },
  { slug: "nehemiah", name: "Nehemiah", osis: "NEH", testament: "OT", order: 16, chapters: 13 },
  { slug: "esther", name: "Esther", osis: "EST", testament: "OT", order: 17, chapters: 10 },
  { slug: "job", name: "Job", osis: "JOB", testament: "OT", order: 18, chapters: 42 },
  { slug: "psalms", name: "Psalms", osis: "PSA", testament: "OT", order: 19, chapters: 150 },
  { slug: "proverbs", name: "Proverbs", osis: "PRO", testament: "OT", order: 20, chapters: 31 },
  { slug: "ecclesiastes", name: "Ecclesiastes", osis: "ECC", testament: "OT", order: 21, chapters: 12 },
  { slug: "song-of-songs", name: "Song of Songs", osis: "SNG", testament: "OT", order: 22, chapters: 8 },
  { slug: "isaiah", name: "Isaiah", osis: "ISA", testament: "OT", order: 23, chapters: 66 },
  { slug: "jeremiah", name: "Jeremiah", osis: "JER", testament: "OT", order: 24, chapters: 52 },
  { slug: "lamentations", name: "Lamentations", osis: "LAM", testament: "OT", order: 25, chapters: 5 },
  { slug: "ezekiel", name: "Ezekiel", osis: "EZK", testament: "OT", order: 26, chapters: 48 },
  { slug: "daniel", name: "Daniel", osis: "DAN", testament: "OT", order: 27, chapters: 12 },
  { slug: "hosea", name: "Hosea", osis: "HOS", testament: "OT", order: 28, chapters: 14 },
  { slug: "joel", name: "Joel", osis: "JOL", testament: "OT", order: 29, chapters: 3 },
  { slug: "amos", name: "Amos", osis: "AMO", testament: "OT", order: 30, chapters: 9 },
  { slug: "obadiah", name: "Obadiah", osis: "OBA", testament: "OT", order: 31, chapters: 1 },
  { slug: "jonah", name: "Jonah", osis: "JON", testament: "OT", order: 32, chapters: 4 },
  { slug: "micah", name: "Micah", osis: "MIC", testament: "OT", order: 33, chapters: 7 },
  { slug: "nahum", name: "Nahum", osis: "NAM", testament: "OT", order: 34, chapters: 3 },
  { slug: "habakkuk", name: "Habakkuk", osis: "HAB", testament: "OT", order: 35, chapters: 3 },
  { slug: "zephaniah", name: "Zephaniah", osis: "ZEP", testament: "OT", order: 36, chapters: 3 },
  { slug: "haggai", name: "Haggai", osis: "HAG", testament: "OT", order: 37, chapters: 2 },
  { slug: "zechariah", name: "Zechariah", osis: "ZEC", testament: "OT", order: 38, chapters: 14 },
  { slug: "malachi", name: "Malachi", osis: "MAL", testament: "OT", order: 39, chapters: 4 },
  // ---- New Testament ----
  { slug: "matthew", name: "Matthew", osis: "MAT", testament: "NT", order: 40, chapters: 28 },
  { slug: "mark", name: "Mark", osis: "MRK", testament: "NT", order: 41, chapters: 16 },
  { slug: "luke", name: "Luke", osis: "LUK", testament: "NT", order: 42, chapters: 24 },
  { slug: "john", name: "John", osis: "JHN", testament: "NT", order: 43, chapters: 21 },
  { slug: "acts", name: "Acts", osis: "ACT", testament: "NT", order: 44, chapters: 28 },
  { slug: "romans", name: "Romans", osis: "ROM", testament: "NT", order: 45, chapters: 16 },
  { slug: "1-corinthians", name: "1 Corinthians", osis: "1CO", testament: "NT", order: 46, chapters: 16 },
  { slug: "2-corinthians", name: "2 Corinthians", osis: "2CO", testament: "NT", order: 47, chapters: 13 },
  { slug: "galatians", name: "Galatians", osis: "GAL", testament: "NT", order: 48, chapters: 6 },
  { slug: "ephesians", name: "Ephesians", osis: "EPH", testament: "NT", order: 49, chapters: 6 },
  { slug: "philippians", name: "Philippians", osis: "PHP", testament: "NT", order: 50, chapters: 4 },
  { slug: "colossians", name: "Colossians", osis: "COL", testament: "NT", order: 51, chapters: 4 },
  { slug: "1-thessalonians", name: "1 Thessalonians", osis: "1TH", testament: "NT", order: 52, chapters: 5 },
  { slug: "2-thessalonians", name: "2 Thessalonians", osis: "2TH", testament: "NT", order: 53, chapters: 3 },
  { slug: "1-timothy", name: "1 Timothy", osis: "1TI", testament: "NT", order: 54, chapters: 6 },
  { slug: "2-timothy", name: "2 Timothy", osis: "2TI", testament: "NT", order: 55, chapters: 4 },
  { slug: "titus", name: "Titus", osis: "TIT", testament: "NT", order: 56, chapters: 3 },
  { slug: "philemon", name: "Philemon", osis: "PHM", testament: "NT", order: 57, chapters: 1 },
  { slug: "hebrews", name: "Hebrews", osis: "HEB", testament: "NT", order: 58, chapters: 13 },
  { slug: "james", name: "James", osis: "JAS", testament: "NT", order: 59, chapters: 5 },
  { slug: "1-peter", name: "1 Peter", osis: "1PE", testament: "NT", order: 60, chapters: 5 },
  { slug: "2-peter", name: "2 Peter", osis: "2PE", testament: "NT", order: 61, chapters: 3 },
  { slug: "1-john", name: "1 John", osis: "1JN", testament: "NT", order: 62, chapters: 5 },
  { slug: "2-john", name: "2 John", osis: "2JN", testament: "NT", order: 63, chapters: 1 },
  { slug: "3-john", name: "3 John", osis: "3JN", testament: "NT", order: 64, chapters: 1 },
  { slug: "jude", name: "Jude", osis: "JUD", testament: "NT", order: 65, chapters: 1 },
  { slug: "revelation", name: "Revelation", osis: "REV", testament: "NT", order: 66, chapters: 22 },
];

const BY_SLUG = new Map(BIBLE_BOOKS.map((b) => [b.slug, b]));
const BY_OSIS = new Map(BIBLE_BOOKS.map((b) => [b.osis, b]));

export function getBook(slug: string): BibleBook | undefined {
  return BY_SLUG.get(slug);
}

export function getBookByOsis(osis: string): BibleBook | undefined {
  return BY_OSIS.get(osis);
}

export function booksByTestament(testament: Testament): BibleBook[] {
  return BIBLE_BOOKS.filter((b) => b.testament === testament);
}

export function isValidReference(slug: string, chapter: number): boolean {
  const book = getBook(slug);
  if (!book) return false;
  return Number.isInteger(chapter) && chapter >= 1 && chapter <= book.chapters;
}

/** Previous/next chapter across book boundaries, or null at the canon edges. */
export function adjacentChapter(
  slug: string,
  chapter: number,
  direction: "prev" | "next",
): { slug: string; chapter: number } | null {
  const book = getBook(slug);
  if (!book) return null;
  if (direction === "next") {
    if (chapter < book.chapters) return { slug, chapter: chapter + 1 };
    const nextBook = BIBLE_BOOKS.find((b) => b.order === book.order + 1);
    return nextBook ? { slug: nextBook.slug, chapter: 1 } : null;
  }
  if (chapter > 1) return { slug, chapter: chapter - 1 };
  const prevBook = BIBLE_BOOKS.find((b) => b.order === book.order - 1);
  return prevBook ? { slug: prevBook.slug, chapter: prevBook.chapters } : null;
}

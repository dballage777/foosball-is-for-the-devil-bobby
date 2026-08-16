import "server-only";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

export interface HighlightRec {
  id: string;
  verse_start: number;
  verse_end: number;
  color: string;
  note: string | null;
}
export interface NoteRec {
  id: string;
  verse_start: number | null;
  verse_end: number | null;
  body: string;
  visibility: string;
}
export interface StudyRef {
  id: string;
  name: string;
}

export interface ChapterAnnotations {
  authenticated: boolean;
  highlights: HighlightRec[];
  notes: NoteRec[];
  bookmarkedVerses: number[];
  chapterBookmarked: boolean;
  studies: StudyRef[];
}

const EMPTY: ChapterAnnotations = {
  authenticated: false,
  highlights: [],
  notes: [],
  bookmarkedVerses: [],
  chapterBookmarked: false,
  studies: [],
};

/** Loads the signed-in user's highlights, notes, bookmarks for a chapter and
 *  the studies they belong to (for sharing). Empty/unauthenticated otherwise. */
export async function getChapterAnnotations(
  bookSlug: string,
  chapter: number,
): Promise<ChapterAnnotations> {
  if (!isSupabaseConfigured()) return EMPTY;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return EMPTY;

    const [hl, nt, bm, st] = await Promise.all([
      supabase
        .from("bible_highlights")
        .select("id, verse_start, verse_end, color, note")
        .eq("book_slug", bookSlug)
        .eq("chapter", chapter),
      supabase
        .from("bible_notes")
        .select("id, verse_start, verse_end, body, visibility")
        .eq("book_slug", bookSlug)
        .eq("chapter", chapter)
        .order("created_at", { ascending: true }),
      supabase
        .from("bookmarks")
        .select("verse")
        .eq("book_slug", bookSlug)
        .eq("chapter", chapter),
      supabase
        .from("bible_studies")
        .select("id, name")
        .order("updated_at", { ascending: false }),
    ]);

    const bookmarks = (bm.data ?? []) as { verse: number | null }[];
    return {
      authenticated: true,
      highlights: (hl.data as HighlightRec[]) ?? [],
      notes: (nt.data as NoteRec[]) ?? [],
      bookmarkedVerses: bookmarks
        .filter((b) => b.verse !== null)
        .map((b) => b.verse as number),
      chapterBookmarked: bookmarks.some((b) => b.verse === null),
      studies: (st.data as StudyRef[]) ?? [],
    };
  } catch {
    return EMPTY;
  }
}

import "server-only";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

export interface AudioResource {
  title: string;
  provider: string;
  page_url: string;
  embed_url: string | null;
  description: string | null;
}

export interface RelatedApologetics {
  topicTitle: string;
  categorySlug: string;
  topicSlug: string;
  note: string | null;
}

/** Chapter-specific audio mappings; empty when unconfigured/none. */
export async function getChapterAudio(
  bookSlug: string,
  chapter: number,
): Promise<AudioResource[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("audio_resources")
      .select("title, provider, page_url, embed_url, description")
      .eq("book_slug", bookSlug)
      .eq("chapter", chapter);
    return (data as AudioResource[]) ?? [];
  } catch {
    return [];
  }
}

/** Curated apologetics topics linked to this chapter; empty when unconfigured. */
export async function getRelatedApologetics(
  bookSlug: string,
  chapter: number,
): Promise<RelatedApologetics[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("bible_apologetics_links")
      .select(
        "note, apologetics_topics(slug, title, apologetics_categories(slug))",
      )
      .eq("book_slug", bookSlug)
      .eq("chapter", chapter);
    if (!data) return [];
    // Shape the nested join result defensively.
    return (data as unknown[]).flatMap((row) => {
      const r = row as {
        note: string | null;
        apologetics_topics?: {
          slug: string;
          title: string;
          apologetics_categories?: { slug: string };
        };
      };
      const t = r.apologetics_topics;
      if (!t || !t.apologetics_categories) return [];
      return [
        {
          topicTitle: t.title,
          topicSlug: t.slug,
          categorySlug: t.apologetics_categories.slug,
          note: r.note,
        },
      ];
    });
  } catch {
    return [];
  }
}

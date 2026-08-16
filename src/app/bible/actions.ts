"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isValidReference } from "@/lib/bible/books";

const COLORS = ["yellow", "green", "blue", "red", "purple", "orange"] as const;

const rangeSchema = z.object({
  book_slug: z.string().min(1),
  chapter: z.coerce.number().int().positive(),
  verse_start: z.coerce.number().int().positive(),
  verse_end: z.coerce.number().int().positive(),
});

type ActionResult = { ok: true } | { ok: false; error: string };

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function revalidateChapter(book: string, chapter: number) {
  revalidatePath(`/bible/${book}/${chapter}`);
}

// ---- Highlights ---------------------------------------------------------
export async function createHighlight(input: {
  book_slug: string;
  chapter: number;
  verse_start: number;
  verse_end: number;
  color: string;
}): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Please sign in." };

  const parsed = rangeSchema
    .extend({ color: z.enum(COLORS) })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid selection." };
  const v = parsed.data;
  if (v.verse_end < v.verse_start) return { ok: false, error: "Invalid range." };
  if (!isValidReference(v.book_slug, v.chapter))
    return { ok: false, error: "Invalid reference." };

  const { error } = await supabase.from("bible_highlights").insert({
    user_id: user.id,
    book_slug: v.book_slug,
    chapter: v.chapter,
    verse_start: v.verse_start,
    verse_end: v.verse_end,
    color: v.color,
  });
  if (error) return { ok: false, error: "Could not save highlight." };
  revalidateChapter(v.book_slug, v.chapter);
  return { ok: true };
}

export async function deleteHighlight(id: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Please sign in." };
  // RLS also enforces ownership; the explicit filter is defense in depth.
  const { error } = await supabase
    .from("bible_highlights")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: "Could not remove highlight." };
  revalidatePath("/bible", "layout");
  return { ok: true };
}

// ---- Notes --------------------------------------------------------------
const noteSchema = z.object({
  book_slug: z.string().min(1),
  chapter: z.coerce.number().int().positive(),
  verse_start: z.coerce.number().int().positive().nullable(),
  verse_end: z.coerce.number().int().positive().nullable(),
  body: z.string().trim().min(1).max(8000),
  visibility: z.enum(["private", "study", "public"]),
});

export async function createNote(input: {
  book_slug: string;
  chapter: number;
  verse_start: number | null;
  verse_end: number | null;
  body: string;
  visibility: string;
}): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Please sign in." };
  const parsed = noteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please enter a note." };
  const v = parsed.data;
  if (!isValidReference(v.book_slug, v.chapter))
    return { ok: false, error: "Invalid reference." };

  const { error } = await supabase.from("bible_notes").insert({
    user_id: user.id,
    book_slug: v.book_slug,
    chapter: v.chapter,
    verse_start: v.verse_start,
    verse_end: v.verse_end,
    body: v.body,
    visibility: v.visibility,
  });
  if (error) return { ok: false, error: "Could not save note." };
  revalidateChapter(v.book_slug, v.chapter);
  return { ok: true };
}

export async function updateNote(input: {
  id: string;
  body: string;
  visibility: string;
}): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Please sign in." };
  const body = z.string().trim().min(1).max(8000).safeParse(input.body);
  const vis = z.enum(["private", "study", "public"]).safeParse(input.visibility);
  if (!body.success || !vis.success)
    return { ok: false, error: "Invalid note." };
  const { error } = await supabase
    .from("bible_notes")
    .update({ body: body.data, visibility: vis.data })
    .eq("id", input.id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: "Could not update note." };
  revalidatePath("/bible", "layout");
  return { ok: true };
}

export async function deleteNote(id: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Please sign in." };
  const { error } = await supabase
    .from("bible_notes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: "Could not delete note." };
  revalidatePath("/bible", "layout");
  return { ok: true };
}

// ---- Bookmarks ----------------------------------------------------------
export async function toggleBookmark(input: {
  book_slug: string;
  chapter: number;
  verse: number | null;
}): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Please sign in." };
  if (!isValidReference(input.book_slug, input.chapter))
    return { ok: false, error: "Invalid reference." };

  // Insert; if it already exists (unique constraint), remove it (toggle).
  const { error } = await supabase.from("bookmarks").insert({
    user_id: user.id,
    book_slug: input.book_slug,
    chapter: input.chapter,
    verse: input.verse,
  });
  if (error) {
    // Likely a duplicate — delete to toggle off.
    let q = supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("book_slug", input.book_slug)
      .eq("chapter", input.chapter);
    q = input.verse === null ? q.is("verse", null) : q.eq("verse", input.verse);
    const { error: delErr } = await q;
    if (delErr) return { ok: false, error: "Could not update bookmark." };
  }
  revalidateChapter(input.book_slug, input.chapter);
  return { ok: true };
}

// ---- Share a highlight with a study ------------------------------------
export async function shareToStudy(input: {
  study_id: string;
  book_slug: string;
  chapter: number;
  verse_start: number;
  verse_end: number;
  color: string;
  note?: string;
}): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Please sign in." };
  const parsed = rangeSchema
    .extend({
      study_id: z.string().uuid(),
      color: z.enum(COLORS),
      note: z.string().trim().max(2000).optional(),
    })
    .safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid selection." };
  const v = parsed.data;

  // RLS ensures the user must be a member of the study to insert.
  const { error } = await supabase.from("shared_annotations").insert({
    study_id: v.study_id,
    user_id: user.id,
    book_slug: v.book_slug,
    chapter: v.chapter,
    verse_start: v.verse_start,
    verse_end: v.verse_end,
    color: v.color,
    note: v.note || null,
  });
  if (error)
    return { ok: false, error: "Could not share. Are you a member of the study?" };
  revalidatePath(`/studies/${v.study_id}`);
  return { ok: true };
}

// ---- Reading history ----------------------------------------------------
export async function recordReading(
  book_slug: string,
  chapter: number,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: true }; // anonymous reading is not tracked
  if (!isValidReference(book_slug, chapter)) return { ok: true };
  await supabase
    .from("reading_history")
    .upsert(
      { user_id: user.id, book_slug, chapter, last_read_at: new Date().toISOString() },
      { onConflict: "user_id,book_slug,chapter" },
    );
  return { ok: true };
}

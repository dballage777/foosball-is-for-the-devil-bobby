"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Verse } from "@/lib/bible/types";
import type { ChapterAnnotations } from "@/lib/data/annotations";
import {
  createHighlight,
  createNote,
  deleteHighlight,
  deleteNote,
  recordReading,
  shareToStudy,
  toggleBookmark,
  updateNote,
} from "@/app/bible/actions";

const COLORS = ["yellow", "green", "blue", "red", "purple", "orange"] as const;
type Color = (typeof COLORS)[number];

interface Props {
  bookSlug: string;
  bookName: string;
  chapter: number;
  versionLabel: string;
  copyright: string;
  verses: Verse[];
  annotations: ChapterAnnotations;
}

export function ReaderVerses({
  bookSlug,
  bookName,
  chapter,
  versionLabel,
  copyright,
  verses,
  annotations,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteBody, setNoteBody] = useState("");
  const [noteVis, setNoteVis] = useState<"private" | "study" | "public">("private");
  const [shareOpen, setShareOpen] = useState(false);
  const [shareStudy, setShareStudy] = useState("");
  const [shareColor, setShareColor] = useState<Color>("yellow");
  const [shareNote, setShareNote] = useState("");

  const { authenticated, highlights, notes, bookmarkedVerses, chapterBookmarked, studies } =
    annotations;

  // Record reading once (fire-and-forget) for signed-in users.
  useEffect(() => {
    if (authenticated) void recordReading(bookSlug, chapter);
  }, [authenticated, bookSlug, chapter]);

  // verse number -> color from the first covering highlight
  const verseColor = useMemo(() => {
    const map = new Map<number, Color>();
    for (const h of highlights) {
      for (let v = h.verse_start; v <= h.verse_end; v++) {
        if (!map.has(v)) map.set(v, h.color as Color);
      }
    }
    return map;
  }, [highlights]);

  const verseHasNote = useMemo(() => {
    const set = new Set<number>();
    for (const n of notes) if (n.verse_start) set.add(n.verse_start);
    return set;
  }, [notes]);

  const bookmarkedSet = useMemo(() => new Set(bookmarkedVerses), [bookmarkedVerses]);

  const range = useMemo(() => {
    if (selected.size === 0) return null;
    const nums = Array.from(selected).sort((a, b) => a - b);
    return { start: nums[0], end: nums[nums.length - 1] };
  }, [selected]);

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  }

  function toggleVerse(n: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
    setNoteOpen(false);
    setShareOpen(false);
    setNoteBody("");
    setShareNote("");
  }

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, okMsg: string) {
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        flash(okMsg);
        clearSelection();
        router.refresh();
      } else {
        flash(res.error ?? "Something went wrong.");
      }
    });
  }

  const refLabel = range
    ? `${bookName} ${chapter}:${range.start}${range.end > range.start ? `–${range.end}` : ""}`
    : "";

  return (
    <div>
      <ol className="scripture mt-6 space-y-1">
        {verses.map((v) => {
          const color = verseColor.get(v.number);
          const isSel = selected.has(v.number);
          return (
            <li key={v.number} id={`v${v.number}`}>
              <span
                role="button"
                tabIndex={0}
                aria-pressed={isSel}
                onClick={() => toggleVerse(v.number)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleVerse(v.number);
                  }
                }}
                className={`cursor-pointer rounded px-0.5 ${color ? `hl-${color}` : ""} ${
                  isSel ? "ring-2 ring-accent ring-offset-1" : ""
                }`}
              >
                <sup className="mr-1 align-super text-xs font-semibold text-accent">
                  {v.number}
                </sup>
                <span>{v.text}</span>
                {verseHasNote.has(v.number) && (
                  <span title="Has a note" aria-label="Has a note" className="ml-1 text-xs text-brand">
                    📝
                  </span>
                )}
                {bookmarkedSet.has(v.number) && (
                  <span title="Bookmarked" aria-label="Bookmarked" className="ml-1 text-xs">
                    🔖
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ol>

      <p className="mt-8 border-t border-line pt-3 text-xs text-muted">
        {versionLabel} · {copyright}
      </p>

      {/* Existing notes for this chapter */}
      {authenticated && notes.length > 0 && (
        <section className="mt-8">
          <h2 className="font-serif text-lg font-semibold text-brand">Your notes</h2>
          <ul className="mt-3 space-y-2">
            {notes.map((n) => (
              <NoteItem
                key={n.id}
                note={n}
                bookName={bookName}
                chapter={chapter}
                pending={pending}
                onSave={(body, vis) =>
                  run(() => updateNote({ id: n.id, body, visibility: vis }), "Note updated")
                }
                onDelete={() => run(() => deleteNote(n.id), "Note deleted")}
              />
            ))}
          </ul>
        </section>
      )}

      {/* Existing highlights list with remove */}
      {authenticated && highlights.length > 0 && (
        <section className="mt-6">
          <h2 className="font-serif text-lg font-semibold text-brand">
            Your highlights
          </h2>
          <ul className="mt-2 flex flex-wrap gap-2 text-sm">
            {highlights.map((h) => (
              <li key={h.id} className={`hl-${h.color} flex items-center gap-2 rounded px-2 py-1`}>
                <span>
                  {bookName} {chapter}:{h.verse_start}
                  {h.verse_end > h.verse_start ? `–${h.verse_end}` : ""}
                </span>
                <button
                  onClick={() => run(() => deleteHighlight(h.id), "Highlight removed")}
                  disabled={pending}
                  aria-label="Remove highlight"
                  className="rounded bg-white/50 px-1 text-xs hover:bg-white"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Floating action toolbar */}
      {range && (
        <div className="sticky bottom-3 z-30 mt-8">
          <div className="mx-auto max-w-2xl rounded-xl border border-line bg-surface p-3 shadow-lg">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-brand">{refLabel}</p>
              <button
                onClick={clearSelection}
                className="text-xs text-muted hover:text-brand"
              >
                Clear
              </button>
            </div>

            {!authenticated ? (
              <p className="mt-2 text-sm text-muted">
                <button
                  onClick={() => {
                    void navigator.clipboard?.writeText(refLabel);
                    flash("Reference copied");
                  }}
                  className="font-medium text-accent hover:underline"
                >
                  Copy reference
                </button>{" "}
                ·{" "}
                <Link href="/account" className="font-medium text-accent hover:underline">
                  Sign in
                </Link>{" "}
                to highlight, take notes, and share.
              </p>
            ) : (
              <>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      aria-label={`Highlight ${c}`}
                      disabled={pending}
                      onClick={() =>
                        run(
                          () =>
                            createHighlight({
                              book_slug: bookSlug,
                              chapter,
                              verse_start: range.start,
                              verse_end: range.end,
                              color: c,
                            }),
                          "Highlight saved",
                        )
                      }
                      className={`hl-${c} h-7 w-7 rounded-full border border-line`}
                    />
                  ))}
                  <div className="mx-1 h-6 w-px bg-line" />
                  <ToolButton onClick={() => setNoteOpen((o) => !o)}>📝 Note</ToolButton>
                  {studies.length > 0 && (
                    <ToolButton onClick={() => setShareOpen((o) => !o)}>
                      👥 Share
                    </ToolButton>
                  )}
                  <ToolButton
                    onClick={() => {
                      void navigator.clipboard?.writeText(refLabel);
                      flash("Reference copied");
                    }}
                  >
                    ⧉ Copy
                  </ToolButton>
                  <ToolButton
                    onClick={() =>
                      run(
                        () =>
                          toggleBookmark({
                            book_slug: bookSlug,
                            chapter,
                            verse: range.start,
                          }),
                        "Bookmark updated",
                      )
                    }
                  >
                    🔖 Bookmark
                  </ToolButton>
                </div>

                {noteOpen && (
                  <div className="mt-3 space-y-2">
                    <textarea
                      value={noteBody}
                      onChange={(e) => setNoteBody(e.target.value)}
                      rows={3}
                      placeholder={`Note on ${refLabel}…`}
                      className="w-full rounded-md border border-line bg-parchment px-3 py-2 text-sm"
                    />
                    <div className="flex items-center gap-2">
                      <select
                        value={noteVis}
                        onChange={(e) =>
                          setNoteVis(e.target.value as "private" | "study" | "public")
                        }
                        className="rounded-md border border-line bg-surface px-2 py-1.5 text-sm"
                      >
                        <option value="private">Private</option>
                        <option value="study">Study</option>
                        <option value="public">Public</option>
                      </select>
                      <button
                        disabled={pending || !noteBody.trim()}
                        onClick={() =>
                          run(
                            () =>
                              createNote({
                                book_slug: bookSlug,
                                chapter,
                                verse_start: range.start,
                                verse_end: range.end,
                                body: noteBody,
                                visibility: noteVis,
                              }),
                            "Note saved",
                          )
                        }
                        className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                      >
                        Save note
                      </button>
                    </div>
                  </div>
                )}

                {shareOpen && studies.length > 0 && (
                  <div className="mt-3 space-y-2 rounded-md border border-line p-3">
                    <p className="text-sm font-medium">Share {refLabel} with a study</p>
                    <select
                      value={shareStudy}
                      onChange={(e) => setShareStudy(e.target.value)}
                      className="w-full rounded-md border border-line bg-surface px-2 py-1.5 text-sm"
                    >
                      <option value="">— Select a study —</option>
                      {studies.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1.5">
                      {COLORS.map((c) => (
                        <button
                          key={c}
                          aria-label={`Color ${c}`}
                          onClick={() => setShareColor(c)}
                          className={`hl-${c} h-6 w-6 rounded-full border ${
                            shareColor === c ? "border-brand ring-2 ring-accent" : "border-line"
                          }`}
                        />
                      ))}
                    </div>
                    <input
                      value={shareNote}
                      onChange={(e) => setShareNote(e.target.value)}
                      placeholder="Optional note…"
                      className="w-full rounded-md border border-line bg-parchment px-3 py-1.5 text-sm"
                    />
                    <button
                      disabled={pending || !shareStudy}
                      onClick={() =>
                        run(
                          () =>
                            shareToStudy({
                              study_id: shareStudy,
                              book_slug: bookSlug,
                              chapter,
                              verse_start: range.start,
                              verse_end: range.end,
                              color: shareColor,
                              note: shareNote || undefined,
                            }),
                          "Shared with study",
                        )
                      }
                      className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                    >
                      Share
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full bg-brand px-4 py-2 text-sm text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function ToolButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-md border border-line px-2.5 py-1.5 text-sm font-medium hover:bg-brand-soft"
    >
      {children}
    </button>
  );
}

function NoteItem({
  note,
  bookName,
  chapter,
  pending,
  onSave,
  onDelete,
}: {
  note: { id: string; verse_start: number | null; verse_end: number | null; body: string; visibility: string };
  bookName: string;
  chapter: number;
  pending: boolean;
  onSave: (body: string, vis: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(note.body);
  const [vis, setVis] = useState(note.visibility);

  const ref = note.verse_start
    ? `${bookName} ${chapter}:${note.verse_start}${
        note.verse_end && note.verse_end > note.verse_start ? `–${note.verse_end}` : ""
      }`
    : `${bookName} ${chapter}`;

  return (
    <li className="rounded-lg border border-line bg-surface p-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-medium text-brand">{ref}</span>
        <span className="flex items-center gap-2">
          <span className="rounded bg-brand-soft px-2 py-0.5 text-xs text-brand">
            {note.visibility}
          </span>
          <button onClick={() => setEditing((e) => !e)} className="text-xs text-muted hover:text-brand">
            {editing ? "Cancel" : "Edit"}
          </button>
          <button onClick={onDelete} disabled={pending} className="text-xs text-red-600 hover:underline">
            Delete
          </button>
        </span>
      </div>
      {editing ? (
        <div className="mt-2 space-y-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-line bg-parchment px-3 py-2 text-sm"
          />
          <div className="flex items-center gap-2">
            <select
              value={vis}
              onChange={(e) => setVis(e.target.value)}
              className="rounded-md border border-line bg-surface px-2 py-1.5 text-sm"
            >
              <option value="private">Private</option>
              <option value="study">Study</option>
              <option value="public">Public</option>
            </select>
            <button
              disabled={pending || !body.trim()}
              onClick={() => {
                onSave(body, vis);
                setEditing(false);
              }}
              className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-1 whitespace-pre-wrap">{note.body}</p>
      )}
    </li>
  );
}

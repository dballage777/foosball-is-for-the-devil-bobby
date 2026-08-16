import { describe, it, expect } from "vitest";
import {
  BIBLE_BOOKS,
  adjacentChapter,
  booksByTestament,
  getBook,
  isValidReference,
} from "@/lib/bible/books";

describe("Bible canon metadata", () => {
  it("has 66 books in canonical order", () => {
    expect(BIBLE_BOOKS).toHaveLength(66);
    BIBLE_BOOKS.forEach((b, i) => expect(b.order).toBe(i + 1));
  });

  it("splits into 39 OT and 27 NT books", () => {
    expect(booksByTestament("OT")).toHaveLength(39);
    expect(booksByTestament("NT")).toHaveLength(27);
  });

  it("has unique slugs", () => {
    const slugs = new Set(BIBLE_BOOKS.map((b) => b.slug));
    expect(slugs.size).toBe(66);
  });
});

describe("isValidReference", () => {
  it("accepts in-range chapters", () => {
    expect(isValidReference("john", 21)).toBe(true);
    expect(isValidReference("psalms", 150)).toBe(true);
  });
  it("rejects out-of-range and unknown", () => {
    expect(isValidReference("john", 22)).toBe(false);
    expect(isValidReference("john", 0)).toBe(false);
    expect(isValidReference("not-a-book", 1)).toBe(false);
  });
});

describe("adjacentChapter", () => {
  it("moves within a book", () => {
    expect(adjacentChapter("john", 3, "next")).toEqual({ slug: "john", chapter: 4 });
    expect(adjacentChapter("john", 3, "prev")).toEqual({ slug: "john", chapter: 2 });
  });

  it("crosses book boundaries", () => {
    // John has 21 chapters; next book is Acts.
    expect(adjacentChapter("john", 21, "next")).toEqual({ slug: "acts", chapter: 1 });
    // Matthew 1 previous is Malachi 4 (last OT book).
    expect(adjacentChapter("matthew", 1, "prev")).toEqual({
      slug: "malachi",
      chapter: getBook("malachi")!.chapters,
    });
  });

  it("returns null at the canon edges", () => {
    expect(adjacentChapter("genesis", 1, "prev")).toBeNull();
    expect(adjacentChapter("revelation", 22, "next")).toBeNull();
  });
});

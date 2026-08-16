import { describe, it, expect } from "vitest";
import { selectBibleId, type CatalogBible } from "@/lib/bible/providers/api-bible";

const catalog: CatalogBible[] = [
  { id: "web-01", abbreviation: "WEB", name: "World English Bible" },
  { id: "bsb-01", abbreviation: "BSB", name: "Berean Standard Bible" },
  { id: "kjv-01", abbreviation: "KJV", name: "King James Version" },
];

describe("selectBibleId", () => {
  it("resolves an abbreviation case-insensitively", () => {
    expect(selectBibleId(catalog, { abbr: "bsb" })).toBe("bsb-01");
    expect(selectBibleId(catalog, { abbr: "WEB" })).toBe("web-01");
  });

  it("falls back to a name match for the Berean Standard Bible", () => {
    const noAbbr: CatalogBible[] = [
      { id: "x", name: "Berean Standard Bible" },
    ];
    expect(selectBibleId(noAbbr, { abbr: "BSB" })).toBe("x");
  });

  it("prefers an explicit id when present in the catalog", () => {
    expect(selectBibleId(catalog, { id: "kjv-01" })).toBe("kjv-01");
  });

  it("trusts an explicit id even if not in the catalog", () => {
    expect(selectBibleId(catalog, { id: "custom-niv-id" })).toBe("custom-niv-id");
  });

  it("returns null when nothing matches", () => {
    expect(selectBibleId(catalog, { abbr: "nope" })).toBeNull();
    expect(selectBibleId(catalog, {})).toBeNull();
  });
});

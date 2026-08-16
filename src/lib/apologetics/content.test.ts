import { describe, it, expect } from "vitest";
import {
  CASE_PATHWAY,
  CATEGORIES,
  WORLDVIEW_QUESTIONS,
  WORLDVIEW_TABLE,
  getCategory,
} from "@/lib/apologetics/content";

describe("apologetics taxonomy", () => {
  it("has the 16 evidence categories with unique slugs", () => {
    expect(CATEGORIES).toHaveLength(16);
    const slugs = new Set(CATEGORIES.map((c) => c.slug));
    expect(slugs.size).toBe(16);
  });

  it("has unique topic slugs within each category", () => {
    for (const c of CATEGORIES) {
      const slugs = new Set(c.topics.map((t) => t.slug));
      expect(slugs.size, `duplicate topic in ${c.slug}`).toBe(c.topics.length);
    }
  });

  it("provides explanatory body prose for every topic", () => {
    for (const c of CATEGORIES) {
      for (const t of c.topics) {
        expect(t.body && t.body.length > 0, `${c.slug}/${t.slug} missing body`).toBe(true);
      }
    }
  });
});

describe("Case for Christianity pathway", () => {
  it("references only real categories and topics", () => {
    for (const step of CASE_PATHWAY) {
      const cat = getCategory(step.categorySlug);
      expect(cat, `unknown category ${step.categorySlug}`).toBeTruthy();
      if (step.topicSlug) {
        const topic = cat!.topics.find((t) => t.slug === step.topicSlug);
        expect(topic, `unknown topic ${step.categorySlug}/${step.topicSlug}`).toBeTruthy();
      }
    }
  });
});

describe("worldview comparison table", () => {
  it("answers every question for every worldview", () => {
    for (const w of WORLDVIEW_TABLE) {
      for (const q of WORLDVIEW_QUESTIONS) {
        expect(w.answers[q]?.length ?? 0, `${w.name} missing ${q}`).toBeGreaterThan(0);
      }
    }
  });
});

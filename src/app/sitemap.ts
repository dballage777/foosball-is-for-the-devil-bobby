import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";
import { BIBLE_BOOKS } from "@/lib/bible/books";
import { CATEGORIES } from "@/lib/apologetics/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const staticPages = ["", "/bible", "/apologetics", "/resources", "/about"].map(
    (p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: 0.8 }),
  );

  const books = BIBLE_BOOKS.map((b) => ({
    url: `${base}/bible/${b.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const categories = CATEGORIES.map((c) => ({
    url: `${base}/apologetics/${c.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...books, ...categories];
}

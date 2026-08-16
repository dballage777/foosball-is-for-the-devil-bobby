import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private/personal areas must not be indexed.
      disallow: ["/account", "/my-study", "/studies"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}

import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://safesquare.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE}/`,        lastModified: now, changeFrequency: "weekly",  priority: 1 },
    { url: `${SITE}/about`,   lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/rooms`,   lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${SITE}/gallery`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE}/blog`,    lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${SITE}/faq`,     lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE}/contact`, lastModified: now, changeFrequency: "yearly",  priority: 0.5 },
    { url: `${SITE}/book`,    lastModified: now, changeFrequency: "yearly",  priority: 0.8 },
  ];
}

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://safesquare.app";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/dashboard"] }],
    sitemap: `${SITE}/sitemap.xml`,
  };
}

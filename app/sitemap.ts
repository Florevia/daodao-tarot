import { cards } from "@/lib/cards";
import { readingCases } from "@/lib/cases";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:4178").replace(/\/$/, "");
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/reading`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/cards`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/cases`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/history`, changeFrequency: "weekly", priority: 0.3 },
    ...cards.map((card) => ({
      url: `${base}/cards/${card.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...readingCases.map((item) => ({
      url: `${base}/cases/${item.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}

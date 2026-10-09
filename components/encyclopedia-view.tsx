"use client";

import { cards, type Suit } from "@/lib/cards";
import { useI18n } from "@/lib/i18n";
import { cn } from "cn";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Filter = "all" | "major" | Suit;

export function EncyclopediaView() {
  const { t, locale } = useI18n();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: t.filterAll },
    { id: "major", label: t.filterMajor },
    { id: "wands", label: t.suitWands },
    { id: "cups", label: t.suitCups },
    { id: "swords", label: t.suitSwords },
    { id: "pentacles", label: t.suitPentacles },
  ];

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return cards.filter((card) => {
      if (filter === "major" && card.arcana !== "major") return false;
      if (filter !== "all" && filter !== "major" && card.suit !== filter) return false;
      if (!needle) return true;
      const haystack = [
        card.name.zh,
        card.name.en,
        ...card.keywords.zh,
        ...card.keywords.en,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [filter, query]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <p className="font-display text-xs tracking-[0.35em] text-primary">78</p>
      <h1 className="mt-2 text-4xl text-primary">{t.encyclopediaTitle}</h1>
      <p className="mt-3 max-w-2xl leading-8 text-muted-foreground">{t.encyclopediaLead}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.searchPlaceholder}
          className="h-11 w-full rounded-xl border border-primary/30 bg-card/60 px-3 sm:max-w-sm"
          data-testid="card-search"
        />
        <p className="text-sm text-muted-foreground">
          {visible.length} {t.resultCount}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm",
              filter === item.id ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="mt-10 text-muted-foreground">{t.emptySearch}</p>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" data-testid="card-grid">
          {visible.map((card) => (
            <li key={card.id}>
              <Link href={`/cards/${card.id}`} className="group block">
                <div className="relative aspect-[2/3.4] overflow-hidden rounded-xl border border-primary/25 bg-[#140e12]">
                  <Image
                    src={card.image}
                    alt={card.name[locale]}
                    fill
                    sizes="180px"
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <p className="mt-2 text-sm">{card.name[locale]}</p>
                <p className="text-xs text-muted-foreground">{locale === "zh" ? card.name.en : card.name.zh}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

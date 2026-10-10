"use client";

import { TarotFace } from "@/components/tarot-card";
import { getCard } from "@/lib/cards";
import type { ReadingCase } from "@/lib/cases";
import { readingCases } from "@/lib/cases";
import { useI18n } from "@/lib/i18n";
import { contextLabel } from "@/lib/reading-context";
import { getSpread, spreads } from "@/lib/spreads";
import { cn } from "cn";
import Link from "next/link";
import { useMemo, useState } from "react";

export function CasesView() {
  const { t, locale } = useI18n();
  const [spreadId, setSpreadId] = useState("all");
  const visible = useMemo(
    () => (spreadId === "all" ? readingCases : readingCases.filter((item) => item.spreadId === spreadId)),
    [spreadId],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <p className="font-display text-xs tracking-[0.35em] text-primary">100</p>
      <h1 className="mt-2 text-4xl text-primary">{t.casesTitle}</h1>
      <p className="mt-3 max-w-2xl leading-8 text-muted-foreground">{t.casesLead}</p>
      <p className="mt-2 text-sm text-muted-foreground">{t.casesLangNote}</p>
      <div className="mt-6 flex flex-wrap gap-2" data-testid="case-filters">
        <FilterButton active={spreadId === "all"} onClick={() => setSpreadId("all")}>
          {t.casesAll}
        </FilterButton>
        {spreads.map((spread) => (
          <FilterButton key={spread.id} active={spreadId === spread.id} onClick={() => setSpreadId(spread.id)}>
            {spread.name[locale]}
          </FilterButton>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        {visible.length} {t.casesCount}
      </p>
      <ul className="mt-6 grid gap-3" data-testid="case-list">
        {visible.map((item) => {
          const spread = getSpread(item.spreadId);
          return (
            <li key={item.id}>
              <Link
                href={`/cases/${item.id}`}
                className="block rounded-2xl border border-primary/25 bg-card/60 px-4 py-4 transition-colors hover:border-primary/60"
              >
                <p className="text-xs tracking-[0.18em] text-primary">{spread?.name[locale]}</p>
                <h2 className="mt-1 text-xl text-foreground">{locale === "en" ? item.titleEn : item.title}</h2>
                {locale === "en" ? <p className="text-sm text-muted-foreground">{item.title}</p> : null}
                <p className="mt-2 leading-7 text-foreground/90">{item.question}</p>
                <p className="mt-2 text-xs text-muted-foreground">{contextLabel(item.spreadId, item.context, locale)}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-sm",
        active ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function CaseDetail({ item }: { item: ReadingCase }) {
  const { t, locale } = useI18n();
  const spread = getSpread(item.spreadId);
  const situation = contextLabel(item.spreadId, item.context, locale);

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:py-12" data-testid="case-detail">
      <Link href="/cases" className="text-sm text-primary hover:underline">
        {t.casesBack}
      </Link>
      <p className="mt-4 text-xs tracking-[0.2em] text-primary">{spread?.name[locale]}</p>
      <h1 className="mt-2 text-4xl text-primary">{locale === "en" ? item.titleEn : item.title}</h1>
      <p className="mt-2 font-display tracking-wide text-muted-foreground">{locale === "en" ? item.title : item.titleEn}</p>
      {situation ? <p className="mt-3 text-sm text-primary">{situation}</p> : null}
      <p className="mt-4 text-lg leading-8">{item.question}</p>
      <p className="mt-2 text-xs text-muted-foreground">{t.casesLangNote}</p>
      <ol className="mt-8 space-y-6">
        {item.cards.map((drawn) => {
          const card = getCard(drawn.cardId);
          const position = spread?.positions.find((entry) => entry.id === drawn.positionId);
          if (!card || !position) return null;
          return (
            <li key={drawn.positionId} className="grid grid-cols-[88px_minmax(0,1fr)] gap-4 sm:grid-cols-[112px_minmax(0,1fr)]">
              <div className="relative aspect-[2/3.4] overflow-hidden rounded-xl border border-primary/25">
                <TarotFace card={card} reversed={drawn.reversed} name={card.name[locale]} />
              </div>
              <div>
                <p className="text-xs tracking-[0.18em] text-primary">{position.name[locale]}</p>
                <h2 className="mt-1 text-2xl">
                  {card.name[locale]}
                  <span className="ml-2 text-sm text-muted-foreground">{drawn.reversed ? t.reversed : t.upright}</span>
                </h2>
                <p className="mt-2 leading-8 text-foreground/90">{drawn.body}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <section className="mt-10 rounded-3xl border border-primary/25 bg-card/50 p-5">
        <h2 className="text-lg text-primary">{t.connectionTitle}</h2>
        <p className="mt-3 leading-8">{item.connection}</p>
      </section>
      <section className="mt-4 rounded-3xl border border-primary/25 bg-card/50 p-5">
        <h2 className="text-lg text-primary">{t.conclusionTitle}</h2>
        <p className="mt-3 leading-8">{item.conclusion}</p>
      </section>
    </article>
  );
}

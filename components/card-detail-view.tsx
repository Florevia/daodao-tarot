"use client";

import type { Card } from "@/lib/cards";
import { useI18n } from "@/lib/i18n";
import Image from "next/image";
import Link from "next/link";

const elementLabel = {
  fire: "elementFire",
  water: "elementWater",
  air: "elementAir",
  earth: "elementEarth",
} as const;

const suitLabel = {
  wands: "suitWands",
  cups: "suitCups",
  swords: "suitSwords",
  pentacles: "suitPentacles",
} as const;

export function CardDetailView({
  card,
  prevId,
  nextId,
}: {
  card: Card;
  prevId: string | null;
  nextId: string | null;
}) {
  const { t, locale } = useI18n();
  const other = locale === "zh" ? "en" : "zh";

  return (
    <article className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[minmax(220px,320px)_minmax(0,1fr)] sm:py-12">
      <div>
        <div className="relative mx-auto aspect-[2/3.4] max-w-xs overflow-hidden rounded-2xl border border-primary/40 bg-[#140e12] shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
          <Image src={card.image} alt={card.name[locale]} fill sizes="320px" className="object-cover" priority />
        </div>
        <div className="mt-4 flex justify-between text-sm">
          {prevId ? (
            <Link href={`/cards/${prevId}`} className="text-primary">
              {t.prevCard}
            </Link>
          ) : (
            <span />
          )}
          {nextId ? (
            <Link href={`/cards/${nextId}`} className="text-primary">
              {t.nextCard}
            </Link>
          ) : null}
        </div>
      </div>
      <div>
        <p className="text-xs tracking-[0.28em] text-primary">
          {card.arcana === "major" ? t.arcanaMajor : t.arcanaMinor}
          {card.suit ? ` · ${t[suitLabel[card.suit]]}` : ""}
          {card.element ? ` · ${t[elementLabel[card.element]]}` : ""}
        </p>
        <h1 className="mt-2 text-4xl text-primary sm:text-5xl">{card.name[locale]}</h1>
        <p className="mt-2 font-display text-xl text-muted-foreground">{card.name[other]}</p>
        <h2 className="mt-8 text-sm tracking-[0.2em] text-primary">{t.keywords}</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {card.keywords[locale].map((keyword) => (
            <li key={keyword} className="rounded-full border border-primary/30 px-3 py-1 text-sm text-primary">
              {keyword}
            </li>
          ))}
        </ul>
        <h2 className="mt-8 text-sm tracking-[0.2em] text-primary">{t.aboutCard}</h2>
        <p className="mt-3 leading-8">{card.description[locale]}</p>
        <div className="mt-8 grid gap-4">
          <OrientationPanel
            title={t.uprightMeaning}
            general={card.topics.upright.general[locale]}
            love={card.topics.upright.love[locale]}
            career={card.topics.upright.career[locale]}
            resources={card.topics.upright.resources[locale]}
            advice={card.topics.upright.advice[locale]}
            labels={{ love: t.topicLove, career: t.topicCareer, resources: t.topicResources, advice: t.topicAdvice }}
            emphasized
          />
          <OrientationPanel
            title={t.reversedMeaning}
            general={card.topics.reversed.general[locale]}
            love={card.topics.reversed.love[locale]}
            career={card.topics.reversed.career[locale]}
            resources={card.topics.reversed.resources[locale]}
            advice={card.topics.reversed.advice[locale]}
            labels={{ love: t.topicLove, career: t.topicCareer, resources: t.topicResources, advice: t.topicAdvice }}
          />
        </div>
        <Link href="/reading?spread=single" className="mt-8 inline-block text-primary">
          {t.startReading}
        </Link>
      </div>
    </article>
  );
}

function OrientationPanel({
  title,
  general,
  love,
  career,
  resources,
  advice,
  labels,
  emphasized = false,
}: {
  title: string;
  general: string;
  love: string;
  career: string;
  resources: string;
  advice: string;
  labels: { love: string; career: string; resources: string; advice: string };
  emphasized?: boolean;
}) {
  const sections = [
    [labels.love, love],
    [labels.career, career],
    [labels.resources, resources],
    [labels.advice, advice],
  ] as const;
  return (
    <section className={emphasized ? "rounded-3xl border border-primary/25 bg-card/60 p-5" : "rounded-3xl border border-border bg-card/40 p-5"}>
      <h2 className="text-lg text-primary">{title}</h2>
      <p className="mt-3 leading-8">{general}</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {sections.map(([heading, body]) => (
          <div key={heading}>
            <h3 className="text-sm tracking-[0.16em] text-primary">{heading}</h3>
            <p className="mt-2 text-sm leading-7">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

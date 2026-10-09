"use client";

import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { spreads } from "@/lib/spreads";
import { cn } from "cn";
import Link from "next/link";

export function HomeView() {
  const { t, locale } = useI18n();
  const examples = [t.example1, t.example2, t.example3, t.example4];
  const steps = [
    [t.step1Title, t.step1Body],
    [t.step2Title, t.step2Body],
    [t.step3Title, t.step3Body],
  ];

  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:py-20 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]" data-testid="home-hero">
        <div>
          <p className="font-display text-xs tracking-[0.42em] text-primary">{t.heroKicker}</p>
          <h1 className="mt-4 text-5xl leading-tight text-primary sm:text-6xl">{t.brand}</h1>
          <p className="font-display mt-2 text-lg tracking-[0.28em] text-muted-foreground">{t.brandEn.toUpperCase()}</p>
          <p className="mt-6 max-w-xl text-lg leading-8 text-foreground/90">{t.heroLead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/reading" className={cn(buttonVariants({ className: "h-11 px-6" }))} data-testid="start-reading">
              {t.startReading}
            </Link>
            <Link href="/cards" className={cn(buttonVariants({ variant: "outline", className: "h-11 px-6" }))}>
              {t.browseCards}
            </Link>
          </div>
        </div>
        <div className="hero-seal" aria-hidden>
          <div className="hero-seal-ring">
            <span className="font-display text-4xl text-primary">78</span>
            <span className="mt-2 text-xs tracking-[0.35em] text-primary/80">RWS</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <h2 className="text-2xl text-primary">{t.howTitle}</h2>
        <ol className="mt-5 grid gap-4 md:grid-cols-3">
          {steps.map(([title, body], index) => (
            <li key={title} className="rounded-3xl border border-primary/20 bg-card/50 p-5">
              <span className="font-display text-3xl text-primary/70">0{index + 1}</span>
              <h3 className="mt-3 text-lg">{title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto mt-14 max-w-6xl px-4">
        <h2 className="text-2xl text-primary">{t.spreadsTitle}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {spreads.map((spread) => (
            <Link
              key={spread.id}
              href={`/reading?spread=${spread.id}`}
              className="group rounded-3xl border border-border bg-card/40 p-5 transition hover:border-primary/60"
            >
              <p className="text-xs tracking-[0.25em] text-primary">
                {spread.positions.length} {t.cardCount}
              </p>
              <h3 className="mt-2 text-xl group-hover:text-primary">{spread.name[locale]}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{spread.description[locale]}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-6xl px-4 pb-4">
        <h2 className="text-2xl text-primary">{t.examplesTitle}</h2>
        <div className="mt-5 grid gap-3">
          {examples.map((example) => (
            <Link
              key={example}
              href={`/reading?spread=three&q=${encodeURIComponent(example)}`}
              className="rounded-2xl border border-primary/15 bg-background/30 px-4 py-3 text-left leading-7 hover:border-primary/50"
            >
              {example}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

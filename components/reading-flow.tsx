"use client";

import { useAuth } from "@/components/auth-provider";
import { FlipCard, TarotFace } from "@/components/tarot-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getCard, type Locale } from "@/lib/cards";
import { deleteGuestReading, loadGuestReadings, upsertGuestReading } from "@/lib/guest-history";
import { errorText, useI18n } from "@/lib/i18n";
import type { ReadingRecord } from "@/lib/reading-record";
import { getSpread, isSpreadId, spreads, type Spread } from "@/lib/spreads";
import { createReading, type DrawnCard } from "@/lib/shuffle";
import { buildSummary, positionMeaning, readingLines } from "@/lib/summary";
import { cn } from "cn";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Phase = "ask" | "shuffle" | "draw" | "read";

type Placement = DrawnCard & { revealed: boolean };

const phases: Phase[] = ["ask", "shuffle", "draw", "read"];

export function ReadingFlow() {
  const params = useSearchParams();
  const { locale, t } = useI18n();
  const { user } = useAuth();
  const initialSpread = params.get("spread");
  const [spreadId, setSpreadId] = useState(isSpreadId(initialSpread) ? initialSpread : "three");
  const [question, setQuestion] = useState(params.get("q") ?? "");
  const [phase, setPhase] = useState<Phase>("ask");
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [aiText, setAiText] = useState<string | null>(null);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [aiState, setAiState] = useState<"idle" | "loading" | "error">("idle");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const spread = getSpread(spreadId) ?? spreads[1]!;

  useEffect(() => {
    void fetch("/api/interpret", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { available?: boolean }) => setAiAvailable(Boolean(data.available)))
      .catch(() => setAiAvailable(false));
  }, []);

  useEffect(() => {
    if (phase !== "shuffle") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setPhase("draw"), reduce ? 350 : 2300);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const drawn = useMemo(
    () => placements.map(({ positionId, cardId, reversed }) => ({ positionId, cardId, reversed })),
    [placements],
  );

  function beginShuffle() {
    const next = createReading(spread).map((item) => ({ ...item, revealed: false }));
    setPlacements(next);
    setSavedId(null);
    setAiText(null);
    setAiState("idle");
    setSaveState("idle");
    setPhase("shuffle");
  }

  function reveal(positionId: string) {
    const next = placements.map((item) =>
      item.positionId === positionId ? { ...item, revealed: true } : item,
    );
    setPlacements(next);
    if (next.length > 0 && next.every((item) => item.revealed)) setPhase("read");
  }

  function revealAll() {
    setPlacements((current) => current.map((item) => ({ ...item, revealed: true })));
    setPhase("read");
  }

  async function save() {
    setSaveState("saving");
    const summary = buildSummary({ question, spreadId: spread.id, drawn, locale });
    const payload = {
      question,
      spreadId: spread.id,
      locale,
      cards: drawn,
      aiInterpretation: aiText,
    };
    try {
      if (user) {
        const response = await fetch("/api/readings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await response.json()) as { reading?: ReadingRecord; error?: string };
        if (!response.ok || !data.reading) {
          setSaveState("error");
          toast.error(errorText(data.error ?? "", t));
          return;
        }
        setSavedId(data.reading.id);
        setSaveState("saved");
        toast.success(t.savedAccount);
        return;
      }
      const reading: ReadingRecord = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        question: question.trim(),
        spreadId: spread.id,
        locale,
        cards: drawn,
        summary,
        aiInterpretation: aiText,
      };
      upsertGuestReading(reading);
      setSavedId(reading.id);
      setSaveState("saved");
      toast.success(t.savedGuest);
    } catch {
      setSaveState("error");
      toast.error(t.saveError);
    }
  }

  async function interpret() {
    setAiState("loading");
    try {
      const response = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, spreadId: spread.id, locale, cards: drawn }),
      });
      const data = (await response.json()) as { interpretation?: string; error?: string };
      if (!response.ok || !data.interpretation) {
        setAiState("error");
        toast.error(errorText(data.error ?? "", t));
        return;
      }
      setAiText(data.interpretation);
      setAiState("idle");
      if (savedId && user) {
        await fetch(`/api/readings/${savedId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ aiInterpretation: data.interpretation }),
        });
      } else if (savedId) {
        const existing = loadGuestReadings().find((item) => item.id === savedId);
        if (existing) upsertGuestReading({ ...existing, aiInterpretation: data.interpretation });
      }
    } catch {
      setAiState("error");
      toast.error(t.aiError);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <p className="font-display text-xs tracking-[0.35em] text-primary">{t.readingEyebrow}</p>
      <h1 className="mt-2 text-3xl text-primary sm:text-4xl">{t.navRead}</h1>
      <ol className="mt-6 flex flex-wrap gap-2">
        {phases.map((item, index) => {
          const label = { ask: t.phaseAsk, shuffle: t.phaseShuffle, draw: t.phaseDraw, read: t.phaseRead }[item];
          return (
            <li
              key={item}
              className={cn(
                "rounded-full border px-3 py-1 text-xs tracking-wide",
                phase === item ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground",
              )}
            >
              {index + 1} {label}
            </li>
          );
        })}
      </ol>

      {phase === "ask" ? (
        <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <label htmlFor="question" className="text-sm text-primary">
              {t.questionLabel}
            </label>
            <Textarea
              id="question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder={t.questionPlaceholder}
              maxLength={500}
              className="mt-2 min-h-32 border-primary/30 bg-card/70 text-base"
              data-testid="question-input"
            />
            <h2 className="mt-8 text-lg text-primary">{t.chooseSpread}</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {spreads.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  data-testid={`spread-${item.id}`}
                  aria-pressed={item.id === spreadId}
                  onClick={() => setSpreadId(item.id)}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition",
                    item.id === spreadId
                      ? "border-primary bg-primary/10 shadow-[0_0_0_1px_rgba(212,176,106,0.35)]"
                      : "border-border bg-card/50 hover:border-primary/50",
                  )}
                >
                  <span className="block text-base text-foreground">{item.name[locale]}</span>
                  <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                    {item.description[locale]}
                  </span>
                  <span className="mt-3 inline-block text-xs tracking-wide text-primary">
                    {item.positions.length} {t.cardCount}
                  </span>
                </button>
              ))}
            </div>
            <Button className="mt-6 h-11 px-6" onClick={beginShuffle} data-testid="shuffle-button">
              {t.shuffle}
            </Button>
          </div>
          <aside className="rounded-3xl border border-primary/20 bg-card/50 p-5">
            <p className="text-sm leading-7 text-muted-foreground">{t.shuffleNote}</p>
            <p className="mt-4 text-xs text-primary/80">{t.disclaimerShort}</p>
          </aside>
        </section>
      ) : null}

      {phase === "shuffle" ? (
        <section className="mt-16 flex flex-col items-center" data-testid="shuffle-stage">
          <div className="shuffle-stack" aria-hidden>
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="shuffle-card" style={{ animationDelay: `${index * 80}ms` }} />
            ))}
          </div>
          <p className="mt-8 text-primary">{t.shuffling}</p>
          <Button variant="outline" className="mt-4" onClick={() => setPhase("draw")}>
            {t.skipShuffle}
          </Button>
        </section>
      ) : null}

      {phase === "draw" || phase === "read" ? (
        <section className="mt-8">
          {question ? <p className="max-w-3xl text-lg leading-8">「{question}」</p> : null}
          <p className="mt-2 text-sm text-muted-foreground">
            {spread.name[locale]} · {spread.positions.length} {t.cardCount}
          </p>
          {phase === "draw" ? <p className="mt-4 text-sm text-primary">{t.flipHint}</p> : null}
          <SpreadTable
            spread={spread}
            placements={placements}
            locale={locale}
            upright={t.upright}
            reversed={t.reversed}
            onActivate={(positionId, revealed) => {
              if (!revealed) {
                reveal(positionId);
                return;
              }
              if (phase === "read") {
                document.getElementById(`pos-${positionId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
          />
          {phase === "draw" ? (
            <Button className="mt-6 h-11 px-6" onClick={revealAll} data-testid="reveal-all">
              {t.revealAll}
            </Button>
          ) : (
            <ReadingPanels
              spread={spread}
              drawn={drawn}
              locale={locale}
              question={question}
              aiText={aiText}
              aiAvailable={aiAvailable}
              aiState={aiState}
              saveState={saveState}
              onInterpret={() => void interpret()}
              onSave={() => void save()}
              onReset={() => setPhase("ask")}
            />
          )}
        </section>
      ) : null}
    </div>
  );
}

export function SpreadTable({
  spread,
  placements,
  locale,
  upright,
  reversed,
  onActivate,
}: {
  spread: Spread;
  placements: Placement[];
  locale: Locale;
  upright: string;
  reversed: string;
  onActivate?: (positionId: string, revealed: boolean) => void;
}) {
  return (
    <div className="spread mt-6" data-layout={spread.layout} data-testid="spread-table">
      {spread.positions.map((position) => {
        const placement = placements.find((item) => item.positionId === position.id);
        const card = placement ? getCard(placement.cardId) : undefined;
        const revealed = Boolean(placement?.revealed && card);
        return (
          <div key={position.id} className={`slot slot-${position.id}`}>
            <FlipCard
              revealed={revealed}
              label={position.name[locale]}
              name={revealed && card ? card.name[locale] : undefined}
              orientation={placement?.reversed ? reversed : upright}
              onClick={() => onActivate?.(position.id, revealed)}
            >
              {card ? <TarotFace card={card} reversed={Boolean(placement?.reversed)} name={card.name[locale]} /> : null}
            </FlipCard>
          </div>
        );
      })}
    </div>
  );
}

export function ReadingPanels({
  spread,
  drawn,
  locale,
  question,
  aiText,
  aiAvailable,
  aiState,
  saveState,
  onInterpret,
  onSave,
  onReset,
  savedMode = false,
}: {
  spread: Spread;
  drawn: DrawnCard[];
  locale: Locale;
  question: string;
  aiText: string | null;
  aiAvailable: boolean;
  aiState: "idle" | "loading" | "error";
  saveState?: "idle" | "saving" | "saved" | "error";
  onInterpret?: () => void;
  onSave?: () => void;
  onReset?: () => void;
  savedMode?: boolean;
}) {
  const { t } = useI18n();
  const lines = readingLines(spread, drawn);
  const summary = buildSummary({ question, spreadId: spread.id, drawn, locale });

  return (
    <div className="mt-10 grid gap-6">
      <article className="rounded-3xl border border-primary/30 bg-card/70 p-5 sm:p-7" data-testid="reading-summary">
        <h2 className="font-display text-2xl text-primary">{t.summaryTitle}</h2>
        <div className="mt-4 space-y-4 text-base leading-8 whitespace-pre-wrap">{summary}</div>
        <p className="mt-4 text-xs text-muted-foreground">{t.disclaimerShort}</p>
      </article>

      {aiAvailable ? (
        <article className="rounded-3xl border border-border bg-card/40 p-5 sm:p-7">
          <h2 className="text-lg text-primary">{t.aiTitle}</h2>
          {aiText ? <div className="mt-4 leading-8 whitespace-pre-wrap">{aiText}</div> : null}
          <Button className="mt-4 h-11" onClick={onInterpret} disabled={aiState === "loading" || !onInterpret}>
            {aiState === "loading" ? t.aiLoading : t.aiButton}
          </Button>
          {aiState === "error" ? <p className="mt-3 text-sm text-destructive">{t.aiError}</p> : null}
        </article>
      ) : null}

      <section>
        <h2 className="text-lg text-primary">{t.positionsTitle}</h2>
        <div className="mt-4 grid gap-4">
          {lines.map((line) => (
            <article key={line.position.id} id={`pos-${line.position.id}`} className="rounded-2xl border border-border bg-background/40 p-4 sm:p-5">
              <p className="text-xs tracking-[0.2em] text-primary">{line.position.name[locale]}</p>
              <h3 className="mt-1 text-xl">
                {line.card.name[locale]}
                <span className="ml-2 text-sm text-muted-foreground">
                  {line.reversed ? t.reversed : t.upright}
                </span>
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{line.position.description[locale]}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {line.card.keywords[locale].map((keyword) => (
                  <span key={keyword} className="rounded-full border border-primary/30 px-2 py-0.5 text-xs text-primary">
                    {keyword}
                  </span>
                ))}
              </div>
              <p className="mt-3 leading-7">{positionMeaning(line, locale)}</p>
            </article>
          ))}
        </div>
      </section>

      {savedMode ? null : (
        <div className="flex flex-wrap gap-3">
          <Button className="h-11 px-6" onClick={onSave} disabled={saveState === "saving" || saveState === "saved"} data-testid="save-reading">
            {saveState === "saving" ? t.saving : saveState === "saved" ? t.saved : t.save}
          </Button>
          <Button variant="outline" className="h-11" onClick={onReset}>
            {t.newReading}
          </Button>
          {saveState === "saved" ? (
            <Button nativeButton={false} variant="ghost" className="h-11" render={<Link href="/history" />}>
              {t.navHistory}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function SavedReading({ reading }: { reading: ReadingRecord }) {
  const { locale, t } = useI18n();
  const { user } = useAuth();
  const spread = getSpread(reading.spreadId);
  const [aiText, setAiText] = useState(reading.aiInterpretation);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [aiState, setAiState] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    void fetch("/api/interpret", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { available?: boolean }) => setAiAvailable(Boolean(data.available)))
      .catch(() => setAiAvailable(false));
  }, []);

  if (!spread) return <p className="px-4 py-16 text-muted-foreground">{t.historyMissing}</p>;

  const placements: Placement[] = reading.cards.map((card) => ({ ...card, revealed: true }));

  async function interpret() {
    setAiState("loading");
    try {
      const response = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: reading.question,
          spreadId: reading.spreadId,
          locale,
          cards: reading.cards,
        }),
      });
      const data = (await response.json()) as { interpretation?: string; error?: string };
      if (!response.ok || !data.interpretation) {
        setAiState("error");
        toast.error(errorText(data.error ?? "", t));
        return;
      }
      setAiText(data.interpretation);
      setAiState("idle");
      if (user) {
        await fetch(`/api/readings/${reading.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ aiInterpretation: data.interpretation }),
        });
      } else {
        upsertGuestReading({ ...reading, aiInterpretation: data.interpretation });
      }
    } catch {
      setAiState("error");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/history" className="text-sm text-primary">
        {t.backToHistory}
      </Link>
      <h1 className="mt-3 text-3xl text-primary">{spread.name[locale]}</h1>
      {reading.question ? <p className="mt-3 text-lg leading-8">「{reading.question}」</p> : <p className="mt-3 text-muted-foreground">{t.noQuestion}</p>}
      <SpreadTable
        spread={spread}
        placements={placements}
        locale={locale}
        upright={t.upright}
        reversed={t.reversed}
        onActivate={(positionId) => {
          document.getElementById(`pos-${positionId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />
      <ReadingPanels
        spread={spread}
        drawn={reading.cards}
        locale={locale}
        question={reading.question}
        aiText={aiText}
        aiAvailable={aiAvailable}
        aiState={aiState}
        onInterpret={() => void interpret()}
        savedMode
      />
      <DeleteReading id={reading.id} ownedByAccount={Boolean(user)} />
    </div>
  );
}

function DeleteReading({ id, ownedByAccount }: { id: string; ownedByAccount: boolean }) {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function remove() {
    if (!window.confirm(`${t.confirmDelete}\n${t.deleteBody}`)) return;
    setPending(true);
    if (ownedByAccount) {
      const response = await fetch(`/api/readings/${id}`, { method: "DELETE" });
      if (!response.ok) {
        setPending(false);
        toast.error(t.genericError);
        return;
      }
    } else {
      deleteGuestReading(id);
    }
    router.push("/history");
    router.refresh();
  }

  return (
    <Button variant="destructive" className="mt-8" onClick={() => void remove()} disabled={pending}>
      {t.delete}
    </Button>
  );
}

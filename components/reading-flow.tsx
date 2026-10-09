"use client";

import { useAuth } from "@/components/auth-provider";
import { CardBack, FlipCard, TarotFace } from "@/components/tarot-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getCard, type Locale } from "@/lib/cards";
import { deleteGuestReading, loadGuestReadings, upsertGuestReading } from "@/lib/guest-history";
import { errorText, useI18n } from "@/lib/i18n";
import type { ReadingRecord } from "@/lib/reading-record";
import { getSpread, isSpreadId, spreads, type Spread } from "@/lib/spreads";
import { prepareDeck, type DrawnCard, type ShuffledCard } from "@/lib/shuffle";
import { buildReading, buildSummary } from "@/lib/summary";
import { cn } from "cn";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Phase = "ask" | "shuffle" | "pick" | "reveal";

type Placement = DrawnCard & { revealed: boolean };

const phases: Phase[] = ["ask", "shuffle", "pick", "reveal"];

function pickSentence(locale: Locale, index: number, total: number, position: string): string {
  if (locale === "zh") {
    return `请抽取第 ${index} 张牌（共 ${total} 张）——代表：${position}`;
  }
  return `Draw card ${index} of ${total} — it stands for: ${position}`;
}

export function ReadingFlow() {
  const params = useSearchParams();
  const { locale, t } = useI18n();
  const { user } = useAuth();
  const initialSpread = params.get("spread");
  const [spreadId, setSpreadId] = useState(isSpreadId(initialSpread) ? initialSpread : "three");
  const [question, setQuestion] = useState(params.get("q") ?? "");
  const [phase, setPhase] = useState<Phase>("ask");
  const [deck, setDeck] = useState<ShuffledCard[]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [aiText, setAiText] = useState<string | null>(null);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [aiState, setAiState] = useState<"idle" | "loading" | "error">("idle");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const spread = getSpread(spreadId) ?? spreads[1]!;
  const nextPosition = spread.positions[placements.length];
  const allPlaced = placements.length === spread.positions.length;
  const allRevealed = allPlaced && placements.every((item) => item.revealed);

  useEffect(() => {
    void fetch("/api/interpret", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { available?: boolean }) => setAiAvailable(Boolean(data.available)))
      .catch(() => setAiAvailable(false));
  }, []);

  const drawn = useMemo(
    () => placements.map(({ positionId, cardId, reversed }) => ({ positionId, cardId, reversed })),
    [placements],
  );

  function resetReading() {
    setDeck([]);
    setPlacements([]);
    setSavedId(null);
    setAiText(null);
    setAiState("idle");
    setSaveState("idle");
  }

  function beginShuffle() {
    resetReading();
    setPhase("shuffle");
  }

  function stopShuffle() {
    setDeck(prepareDeck());
    setPlacements([]);
    setPhase("pick");
  }

  function pickCard(cardId: string) {
    if (phase !== "pick") return;
    const card = deck.find((item) => item.cardId === cardId);
    const position = spread.positions[placements.length];
    if (!card || !position) return;
    const next = [
      ...placements,
      { positionId: position.id, cardId: card.cardId, reversed: card.reversed, revealed: false },
    ];
    setPlacements(next);
    setDeck((current) => current.filter((item) => item.cardId !== cardId));
    if (next.length === spread.positions.length) setPhase("reveal");
  }

  function reveal(positionId: string) {
    setPlacements((current) =>
      current.map((item) => (item.positionId === positionId ? { ...item, revealed: true } : item)),
    );
  }

  function revealAll() {
    setPlacements((current) => current.map((item) => ({ ...item, revealed: true })));
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

  const phaseLabel = {
    ask: t.phaseAsk,
    shuffle: t.phaseShuffle,
    pick: t.phasePick,
    reveal: t.phaseReveal,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <p className="font-display text-xs tracking-[0.35em] text-primary">{t.readingEyebrow}</p>
      <h1 className="mt-2 text-3xl text-primary sm:text-4xl">{t.navRead}</h1>
      <ol className="mt-6 flex gap-1 overflow-x-auto pb-1" data-testid="step-indicator" aria-label={t.stepsLabel}>
        {phases.map((item, index) => (
          <li key={item} className="flex items-center gap-1">
            {index > 0 ? <span aria-hidden className="px-0.5 text-primary/80">→</span> : null}
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-xs tracking-wide whitespace-nowrap",
                phase === item ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground",
              )}
              aria-current={phase === item ? "step" : undefined}
            >
              {index + 1} {phaseLabel[item]}
            </span>
          </li>
        ))}
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
                      ? "border-primary bg-primary/15 shadow-[0_0_0_1px_oklch(0.9_0.11_88/45%)]"
                      : "border-border bg-card/55 hover:border-primary/50",
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
          <aside className="rounded-3xl border border-primary/30 bg-card/60 p-5">
            <p className="text-sm leading-7 text-foreground/85">{t.shuffleNote}</p>
            <p className="mt-4 text-xs text-primary">{t.disclaimerShort}</p>
          </aside>
        </section>
      ) : null}

      {phase === "shuffle" ? (
        <section className="mt-10 flex flex-col items-center" data-testid="shuffle-stage">
          <p className="focus-note" data-testid="focus-note">{t.focusNote}</p>
          {question.trim() ? null : <p className="mt-4 max-w-xl text-center leading-7 text-muted-foreground">{t.focusNoteBlank}</p>}
          <p className="mt-4 max-w-xl text-center text-sm leading-7 text-muted-foreground">{t.focusReady}</p>
          <div className="shuffle-stack mt-8" aria-hidden>
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="shuffle-card" style={{ animationDelay: `${index * 80}ms` }} />
            ))}
          </div>
          <p className="mt-8 text-primary">{t.shuffling}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Button className="h-11 px-6" onClick={stopShuffle} data-testid="stop-shuffle">
              {t.stopShuffle}
            </Button>
            <Button variant="outline" className="h-11" onClick={() => setPhase("ask")}>
              {t.backToQuestion}
            </Button>
          </div>
        </section>
      ) : null}

      {phase === "pick" || phase === "reveal" ? (
        <section className="mt-8">
          {question ? <p className="max-w-3xl text-lg leading-8">「{question}」</p> : null}
          <p className="mt-2 text-sm text-muted-foreground">
            {spread.name[locale]} · {spread.positions.length} {t.cardCount}
          </p>
          {phase === "pick" && nextPosition ? (
            <div className="sticky top-16 z-20 mt-4 rounded-2xl border border-primary/35 bg-background/90 p-4 backdrop-blur-md">
              <p className="text-lg leading-8 text-primary" data-testid="pick-prompt" aria-live="polite">
                {pickSentence(locale, placements.length + 1, spread.positions.length, nextPosition.name[locale])}
              </p>
              <ol className="mt-3 flex flex-wrap gap-2" data-testid="pick-progress">
                {spread.positions.map((position, index) => {
                  const state = index < placements.length ? "done" : index === placements.length ? "current" : "upcoming";
                  return (
                    <li
                      key={position.id}
                      aria-current={state === "current" ? "step" : undefined}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-xs",
                        state === "current" && "border-primary bg-primary/20 text-primary",
                        state === "done" && "border-primary/40 text-foreground",
                        state === "upcoming" && "border-border text-muted-foreground",
                      )}
                    >
                      {index + 1} {position.name[locale]}
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : null}
          {phase === "reveal" && !allRevealed ? <p className="mt-4 text-sm text-primary">{t.flipHint}</p> : null}
          <SpreadTable
            spread={spread}
            placements={placements}
            locale={locale}
            upright={t.upright}
            reversed={t.reversed}
            emptyLabel={t.pickWaiting}
            faceDownLabel={t.pickedFaceDown}
            onActivate={
              phase === "reveal"
                ? (positionId, revealed) => {
                    if (!revealed) {
                      reveal(positionId);
                      return;
                    }
                    if (allRevealed) {
                      document.getElementById(`pos-${positionId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }
                : undefined
            }
          />
          {phase === "pick" ? (
            <>
              <h2 className="mt-8 text-lg text-primary">{t.deckLabel}</h2>
              <div className="deck-grid mt-4" data-testid="deck-grid" aria-label={t.deckLabel}>
                {deck.map((card) => (
                  <button
                    key={card.cardId}
                    type="button"
                    className="deck-pick"
                    data-testid="deck-card"
                    aria-label={t.pickThis}
                    onClick={() => pickCard(card.cardId)}
                  >
                    <CardBack />
                  </button>
                ))}
              </div>
              <Button variant="outline" className="mt-6 h-11" onClick={beginShuffle}>
                {t.reshuffle}
              </Button>
            </>
          ) : null}
          {phase === "reveal" && !allRevealed ? (
            <Button className="mt-6 h-11 px-6" onClick={revealAll} data-testid="reveal-all">
              {t.revealAll}
            </Button>
          ) : null}
          {phase === "reveal" && allRevealed ? (
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
              onReset={() => {
                resetReading();
                setPhase("ask");
              }}
            />
          ) : null}
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
  emptyLabel,
  faceDownLabel,
}: {
  spread: Spread;
  placements: Placement[];
  locale: Locale;
  upright: string;
  reversed: string;
  onActivate?: (positionId: string, revealed: boolean) => void;
  emptyLabel?: string;
  faceDownLabel?: string;
}) {
  return (
    <div className="spread mt-6" data-layout={spread.layout} data-testid="spread-table" aria-label={spread.name[locale]}>
      {spread.positions.map((position) => {
        const placement = placements.find((item) => item.positionId === position.id);
        const card = placement ? getCard(placement.cardId) : undefined;
        const revealed = Boolean(placement?.revealed && card);
        if (!placement || !card) {
          return (
            <div key={position.id} className={`slot slot-${position.id}`}>
              <div className="slot-empty">
                <span className="slot-kicker">{position.name[locale]}</span>
                <span className="slot-caption">{emptyLabel}</span>
              </div>
            </div>
          );
        }
        const label = revealed
          ? `${position.name[locale]} ${card.name[locale]}`
          : `${position.name[locale]} ${faceDownLabel ?? ""}`.trim();
        return (
          <div key={position.id} className={`slot slot-${position.id}`}>
            <FlipCard
              revealed={revealed}
              label={label}
              name={revealed ? card.name[locale] : undefined}
              orientation={placement.reversed ? reversed : upright}
              onClick={() => onActivate?.(position.id, revealed)}
            >
              <TarotFace card={card} reversed={placement.reversed} name={card.name[locale]} />
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
  const reading = buildReading({ question, spreadId: spread.id, drawn, locale });

  return (
    <div className="mt-10 grid gap-6">
      <article className="rounded-3xl border border-primary/35 bg-card/70 p-5 sm:p-7" data-testid="reading-summary">
        <h2 className="font-display text-2xl text-primary">{t.summaryTitle}</h2>
        <div className="mt-4 space-y-6">
          {reading.synthesis.map((block) => (
            <section key={block.id}>
              <h3 className="text-lg text-primary">{block.heading}</h3>
              <p className="mt-2 leading-8">{block.body}</p>
            </section>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">{t.disclaimerShort}</p>
      </article>

      {aiAvailable ? (
        <article className="rounded-3xl border border-border bg-card/50 p-5 sm:p-7">
          <h2 className="text-lg text-primary">{t.aiTitle}</h2>
          {aiText ? <div className="mt-4 leading-8 whitespace-pre-wrap">{aiText}</div> : null}
          <Button className="mt-4 h-11" onClick={onInterpret} disabled={aiState === "loading" || !onInterpret}>
            {aiState === "loading" ? t.aiLoading : t.aiButton}
          </Button>
          {aiState === "error" ? <p className="mt-3 text-sm text-destructive">{t.aiError}</p> : null}
        </article>
      ) : null}

      <section data-testid="reading-detail">
        <h2 className="text-lg text-primary">{t.positionsTitle}</h2>
        <div className="mt-4 grid gap-4">
          {reading.chapters.map((chapter) => (
            <article key={chapter.positionId} id={`pos-${chapter.positionId}`} className="rounded-2xl border border-border bg-card/45 p-4 sm:p-5">
              <p className="text-xs tracking-[0.2em] text-primary">{chapter.positionName}</p>
              <h3 className="mt-1 text-xl">
                {chapter.cardName}
                <span className="ml-2 text-sm text-muted-foreground">{chapter.orientation}</span>
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {chapter.keywords.map((keyword) => (
                  <span key={keyword} className="rounded-full border border-primary/40 px-2 py-0.5 text-xs text-primary">
                    {keyword}
                  </span>
                ))}
              </div>
              <div className="mt-4 space-y-4">
                {chapter.blocks.map((block) => (
                  <section key={block.id}>
                    <h4 className="text-sm tracking-[0.14em] text-primary">{block.heading}</h4>
                    <p className="mt-1 leading-8">{block.body}</p>
                  </section>
                ))}
              </div>
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

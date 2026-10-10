"use client";

import { useAuth } from "@/components/auth-provider";
import { ContextForm } from "@/components/context-form";
import { CardBack, FlipCard, TarotFace } from "@/components/tarot-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getCard, type Locale } from "@/lib/cards";
import { deleteGuestReading, loadGuestReadings, upsertGuestReading } from "@/lib/guest-history";
import { errorText, useI18n } from "@/lib/i18n";
import type { ReadingRecord } from "@/lib/reading-record";
import { getSpread, isSpreadId, spreads, type Spread } from "@/lib/spreads";
import { prepareDeck, type DrawnCard, type ShuffledCard } from "@/lib/shuffle";
import { readStoredAnswer, type AiReading } from "@/lib/ai-reading";
import { contextComplete, contextLabel, type ReadingContext } from "@/lib/reading-context";
import { buildReading, buildSummary } from "@/lib/summary";
import { cn } from "cn";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const [aiReading, setAiReading] = useState<AiReading | null>(null);
  const [answerState, setAnswerState] = useState<"loading" | "ai" | "fallback">("loading");
  const [failReason, setFailReason] = useState("");
  const [attempt, setAttempt] = useState(0);
  const savedIdRef = useRef<string | null>(null);
  const userRef = useRef(user);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [activePosition, setActivePosition] = useState<string | null>(null);
  const [context, setContext] = useState<ReadingContext>({});
  const [landedSlot, setLandedSlot] = useState<number | null>(null);

  const spread = getSpread(spreadId) ?? spreads[1]!;
  const nextPosition = spread.positions[placements.length];
  const allPlaced = placements.length === spread.positions.length;
  const allRevealed = allPlaced && placements.every((item) => item.revealed);

  useEffect(() => {
    const targetId = phase === "pick" ? "pick-stage" : phase === "reveal" ? "reveal-stage" : null;
    if (!targetId) {
      window.scrollTo(0, 0);
      return;
    }
    const frame = requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const drawn = useMemo(
    () => placements.map(({ positionId, cardId, reversed }) => ({ positionId, cardId, reversed })),
    [placements],
  );

  function resetReading() {
    setDeck([]);
    setPlacements([]);
    savedIdRef.current = null;
    setAiReading(null);
    setAnswerState("loading");
    setFailReason("");
    setAttempt(0);
    setSaveState("idle");
    setActivePosition(null);
  }

  function focusPosition(positionId: string, revealed: boolean) {
    if (!revealed) {
      reveal(positionId);
      return;
    }
    if (!placements.every((item) => item.revealed)) return;
    setActivePosition(positionId);
    document.getElementById(`pos-${positionId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function beginShuffle() {
    if (!contextComplete(spreadId, context)) return;
    resetReading();
    setLandedSlot(null);
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
    setLandedSlot(next.length - 1);
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
    const summary = buildSummary({ question, spreadId: spread.id, drawn, locale, context });
    const payload = {
      question,
      spreadId: spread.id,
      locale,
      cards: drawn,
      context,
      aiInterpretation: aiReading ? JSON.stringify(aiReading) : null,
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
        savedIdRef.current = data.reading.id;
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
        context,
        aiInterpretation: aiReading ? JSON.stringify(aiReading) : null,
      };
      upsertGuestReading(reading);
      savedIdRef.current = reading.id;
      setSaveState("saved");
      toast.success(t.savedGuest);
    } catch {
      setSaveState("error");
      toast.error(t.saveError);
    }
  }

  const drawKey = placements.map((item) => `${item.positionId}:${item.cardId}:${item.reversed}:${item.revealed}`).join("|");

  useEffect(() => {
    if (phase !== "reveal" || !allRevealed || answerState !== "loading") return;
    const controller = new AbortController();
    const payload = { question, spreadId: spread.id, locale, cards: drawn, context };
    void (async () => {
      try {
        const response = await fetch("/api/interpret", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        const data = (await response.json()) as { reading?: AiReading; error?: string };
        if (controller.signal.aborted) return;
        if (!response.ok || !data.reading) {
          setFailReason(data.error ?? "");
          setAnswerState("fallback");
          return;
        }
        setAiReading(data.reading);
        setAnswerState("ai");
        const stored = JSON.stringify(data.reading);
        const id = savedIdRef.current;
        if (id && userRef.current) {
          await fetch(`/api/readings/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ aiInterpretation: stored }),
          });
        } else if (id) {
          const existing = loadGuestReadings().find((item) => item.id === id);
          if (existing) upsertGuestReading({ ...existing, aiInterpretation: stored });
        }
      } catch {
        if (controller.signal.aborted) return;
        setAnswerState("fallback");
      }
    })();
    return () => controller.abort();
  }, [phase, allRevealed, answerState, drawKey, attempt, locale, question, spread.id, context, drawn]);

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
        <section className="ritual-step mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
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
                  onClick={() => {
                    setSpreadId(item.id);
                    setContext({});
                  }}
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
            <ContextForm spreadId={spreadId} context={context} onChange={setContext} />
            <Button
              className="mt-6 h-11 px-6"
              onClick={beginShuffle}
              disabled={!contextComplete(spreadId, context)}
              data-testid="shuffle-button"
            >
              {t.shuffle}
            </Button>
            {contextComplete(spreadId, context) ? null : (
              <p className="mt-2 text-sm text-muted-foreground">{t.contextNeeded}</p>
            )}
          </div>
          <aside className="rounded-3xl border border-primary/30 bg-card/60 p-5">
            <p className="text-sm leading-7 text-foreground/85">{t.shuffleNote}</p>
            <p className="mt-4 text-xs text-primary">{t.disclaimerShort}</p>
          </aside>
        </section>
      ) : null}

      {phase === "shuffle" ? (
        <section className="ritual-step mt-10 flex flex-col items-center" data-testid="shuffle-stage">
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

      {phase === "pick" ? (
        <section id="pick-stage" className="ritual-step pick-stage mt-4" data-testid="pick-stage">
          {question ? <p className="line-clamp-1 text-sm leading-6 text-foreground/90">「{question}」</p> : null}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="min-w-0 flex-1 text-base leading-7 text-primary sm:text-lg" data-testid="pick-prompt" aria-live="polite">
              {nextPosition
                ? pickSentence(locale, placements.length + 1, spread.positions.length, nextPosition.name[locale])
                : t.deckLabel}
            </p>
            <Button variant="outline" className="h-10 shrink-0" onClick={beginShuffle}>
              {t.reshuffle}
            </Button>
          </div>
          <ol className="pick-strip" data-testid="pick-progress" aria-label={t.stepsLabel}>
            {spread.positions.map((position, index) => {
              const placed = index < placements.length;
              const state = placed ? "done" : index === placements.length ? "current" : "upcoming";
              return (
                <li
                  key={position.id}
                  data-state={state}
                  data-landed={landedSlot === index ? "true" : undefined}
                  aria-current={state === "current" ? "step" : undefined}
                >
                  <span className="pick-mini" aria-hidden>
                    {placed ? <CardBack /> : <span className="pick-mini-index">{index + 1}</span>}
                  </span>
                  <span className="pick-slot-label">
                    {index + 1}/{spread.positions.length}
                  </span>
                  <span className="pick-slot-name">{position.name[locale]}</span>
                </li>
              );
            })}
          </ol>
          <div className="deck-grid mt-3" data-testid="deck-grid" aria-label={t.deckLabel}>
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
        </section>
      ) : null}

      {phase === "reveal" ? (
        <section id="reveal-stage" className="ritual-step reveal-stage mt-4" data-testid="reveal-stage">
          {question ? <p className="line-clamp-2 max-w-3xl text-base leading-7">「{question}」</p> : null}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="text-sm text-muted-foreground">
              {spread.name[locale]} · {spread.positions.length} {t.cardCount}
            </p>
            {!allRevealed ? (
              <>
                <p className="text-sm text-primary">{t.flipHint}</p>
                <Button className="h-11 px-6" onClick={revealAll} data-testid="reveal-all">
                  {t.revealAll}
                </Button>
              </>
            ) : null}
          </div>
          <div className={cn("reading-layout", allRevealed && "is-split")}>
            <div className="reading-board">
              <SpreadTable
                spread={spread}
                placements={placements}
                locale={locale}
                upright={t.upright}
                reversed={t.reversed}
                emptyLabel={t.pickWaiting}
                faceDownLabel={t.pickedFaceDown}
                className="spread mt-3"
                onActivate={focusPosition}
              />
            </div>
            {allRevealed ? (
              <div className="reading-interpret" data-testid="reading-interpret">
                <ReadingPanels
                  spread={spread}
                  drawn={drawn}
                  locale={locale}
                  question={question}
                  context={context}
                  view={
                    answerState === "ai" && aiReading
                      ? { kind: "ai", reading: aiReading }
                      : answerState === "fallback"
                        ? { kind: "fallback", reason: failReason }
                        : { kind: "loading" }
                  }
                  saveState={saveState}
                  activePosition={activePosition}
                  onRetry={() => {
                    setAiReading(null);
                    setFailReason("");
                    setAnswerState("loading");
                    setAttempt((value) => value + 1);
                  }}
                  onSave={() => void save()}
                  onReset={() => {
                    resetReading();
                    setPhase("ask");
                  }}
                />
              </div>
            ) : null}
          </div>
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
  compact = false,
  className,
}: {
  spread: Spread;
  placements: Placement[];
  locale: Locale;
  upright: string;
  reversed: string;
  onActivate?: (positionId: string, revealed: boolean) => void;
  emptyLabel?: string;
  faceDownLabel?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={className ?? "spread mt-6"}
      data-layout={spread.layout}
      data-picking={compact ? "true" : undefined}
      data-testid="spread-table"
      aria-label={spread.name[locale]}
    >
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
              kicker={position.name[locale]}
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

type AnswerView =
  | { kind: "loading" }
  | { kind: "ai"; reading: AiReading }
  | { kind: "fallback"; reason?: string }
  | { kind: "saved-prose"; text: string }
  | { kind: "saved-kb" };

export function ReadingPanels({
  spread,
  drawn,
  locale,
  question,
  context = null,
  view,
  saveState,
  onRetry,
  onSave,
  onReset,
  savedMode = false,
  activePosition = null,
}: {
  spread: Spread;
  drawn: DrawnCard[];
  locale: Locale;
  question: string;
  context?: ReadingContext | null;
  view: AnswerView;
  saveState?: "idle" | "saving" | "saved" | "error";
  onRetry?: () => void;
  onSave?: () => void;
  onReset?: () => void;
  savedMode?: boolean;
  activePosition?: string | null;
}) {
  const { t } = useI18n();
  const situation = contextLabel(spread.id, context, locale);
  const library = view.kind === "fallback" || view.kind === "saved-kb"
    ? buildReading({ question, spreadId: spread.id, drawn, locale, context })
    : null;

  return (
    <div className={cn("grid gap-6", savedMode ? "mt-0" : "mt-6 lg:mt-0")}>
      {view.kind === "loading" ? (
        <div className="reading-wait" data-testid="reading-wait" aria-live="polite">
          <p className="font-display text-2xl text-primary">{t.readingWait}</p>
          <div className="reading-wait-dots" aria-hidden>
            <span />
            <span />
            <span />
          </div>
        </div>
      ) : null}

      {view.kind === "ai" ? (
        <AiAnswer
          spread={spread}
          drawn={drawn}
          locale={locale}
          reading={view.reading}
          situation={situation}
          activePosition={activePosition}
          connectionTitle={t.connectionTitle}
          conclusionTitle={t.conclusionTitle}
        />
      ) : null}

      {view.kind === "saved-prose" ? (
        <article className="rounded-3xl border border-primary/35 bg-card/70 p-5 sm:p-7" data-testid="reading-answer">
          {situation ? <p className="text-sm text-primary" data-testid="reading-context">{situation}</p> : null}
          <p className="mt-4 leading-8 whitespace-pre-wrap">{view.text}</p>
        </article>
      ) : null}

      {library ? (
        <div data-testid={view.kind === "fallback" ? "reading-fallback" : "reading-saved"}>
          {view.kind === "fallback" ? (
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <p className="text-sm text-muted-foreground" data-testid="fallback-note">
                {view.reason === "RATE_LIMIT" ? t.aiRate : t.fallbackNote}
              </p>
              {onRetry ? (
                <Button variant="outline" className="h-9" onClick={onRetry} data-testid="retry-reading">
                  {t.retryReading}
                </Button>
              ) : null}
            </div>
          ) : null}
          <article className="rounded-3xl border border-primary/35 bg-card/70 p-5 sm:p-7" data-testid="reading-summary">
            <h2 className="font-display text-2xl text-primary">{t.summaryTitle}</h2>
            {situation ? (
              <p className="mt-3 text-sm text-primary" data-testid="reading-context">{situation}</p>
            ) : null}
            <div className="mt-4 space-y-6">
              {library.synthesis.map((block) => (
                <section key={block.id}>
                  <h3 className="text-lg text-primary">{block.heading}</h3>
                  <p className="mt-2 leading-8">{block.body}</p>
                </section>
              ))}
            </div>
          </article>
          <section className="mt-6" data-testid="reading-detail">
            <h2 className="text-lg text-primary">{t.positionsTitle}</h2>
            <div className="mt-4 grid gap-4">
              {library.chapters.map((chapter) => (
                <article
                  key={chapter.positionId}
                  id={`pos-${chapter.positionId}`}
                  data-testid="reading-chapter"
                  className={cn(
                    "reading-chapter rounded-2xl border border-border bg-card/45 p-4 sm:p-5",
                    activePosition === chapter.positionId && "is-current",
                  )}
                >
                  <p className="text-xs tracking-[0.2em] text-primary">{chapter.positionName}</p>
                  <h3 className="mt-1 text-xl">
                    {chapter.cardName}
                    <span className="ml-2 text-sm text-muted-foreground">{chapter.orientation}</span>
                  </h3>
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
        </div>
      ) : null}

      {savedMode ? null : (
        <div className="flex flex-wrap gap-3">
          <Button
            className="h-11 px-6"
            onClick={onSave}
            disabled={view.kind === "loading" || saveState === "saving" || saveState === "saved"}
            data-testid="save-reading"
          >
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

function AiAnswer({
  spread,
  drawn,
  locale,
  reading,
  situation,
  activePosition,
  connectionTitle,
  conclusionTitle,
}: {
  spread: Spread;
  drawn: DrawnCard[];
  locale: Locale;
  reading: AiReading;
  situation: string;
  activePosition: string | null;
  connectionTitle: string;
  conclusionTitle: string;
}) {
  return (
    <div className="grid gap-4" data-testid="reading-answer">
      {situation ? <p className="text-sm text-primary" data-testid="reading-context">{situation}</p> : null}
      {reading.cards.map((section) => {
        const position = spread.positions.find((item) => item.id === section.positionId);
        const placement = drawn.find((item) => item.positionId === section.positionId);
        const card = placement ? getCard(placement.cardId) : undefined;
        const orient = placement?.reversed ? (locale === "zh" ? "逆位" : "reversed") : locale === "zh" ? "正位" : "upright";
        return (
          <article
            key={section.positionId}
            id={`pos-${section.positionId}`}
            data-testid="reading-chapter"
            className={cn(
              "reading-chapter rounded-2xl border border-border bg-card/45 p-4 sm:p-5",
              activePosition === section.positionId && "is-current",
            )}
          >
            <p className="text-xs tracking-[0.2em] text-primary">{position?.name[locale] ?? section.positionId}</p>
            <h3 className="mt-1 text-xl">
              {card?.name[locale] ?? section.positionId}
              <span className="ml-2 text-sm text-muted-foreground">{orient}</span>
            </h3>
            <p className="mt-3 leading-8">{section.body}</p>
          </article>
        );
      })}
      <section className="rounded-2xl border border-primary/30 bg-card/60 p-4 sm:p-5" data-testid="reading-connection">
        <h3 className="text-lg text-primary">{connectionTitle}</h3>
        <p className="mt-2 leading-8">{reading.connection}</p>
      </section>
      <section className="rounded-2xl border border-primary/30 bg-card/60 p-4 sm:p-5" data-testid="reading-conclusion">
        <h3 className="text-lg text-primary">{conclusionTitle}</h3>
        <p className="mt-2 leading-8">{reading.conclusion}</p>
      </section>
    </div>
  );
}

export function SavedReading({ reading }: { reading: ReadingRecord }) {
  const { locale, t } = useI18n();
  const { user } = useAuth();
  const spread = getSpread(reading.spreadId);
  const [activePosition, setActivePosition] = useState<string | null>(null);

  if (!spread) return <p className="px-4 py-16 text-muted-foreground">{t.historyMissing}</p>;

  const placements: Placement[] = reading.cards.map((card) => ({ ...card, revealed: true }));
  const stored = readStoredAnswer(
    reading.aiInterpretation,
    spread.positions.map((position) => ({ id: position.id, names: [position.name.zh, position.name.en] })),
  );
  const view: AnswerView =
    stored.kind === "structured"
      ? { kind: "ai", reading: stored.reading }
      : stored.kind === "prose"
        ? { kind: "saved-prose", text: stored.text }
        : { kind: "saved-kb" };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/history" className="text-sm text-primary">
        {t.backToHistory}
      </Link>
      <h1 className="mt-3 text-3xl text-primary">{spread.name[locale]}</h1>
      {reading.question ? <p className="mt-3 text-lg leading-8">「{reading.question}」</p> : <p className="mt-3 text-muted-foreground">{t.noQuestion}</p>}
      <div className="reading-layout is-split">
        <div className="reading-board">
          <SpreadTable
            spread={spread}
            placements={placements}
            locale={locale}
            upright={t.upright}
            reversed={t.reversed}
            className="spread mt-3"
            onActivate={(positionId) => {
              setActivePosition(positionId);
              document.getElementById(`pos-${positionId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
        </div>
        <div className="reading-interpret">
          <ReadingPanels
            spread={spread}
            drawn={reading.cards}
            locale={locale}
            question={reading.question}
            context={reading.context}
            view={view}
            activePosition={activePosition}
            savedMode
          />
        </div>
      </div>
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

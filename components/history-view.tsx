"use client";

import { useAuth } from "@/components/auth-provider";
import { SavedReading } from "@/components/reading-flow";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCard } from "@/lib/cards";
import { deleteGuestReading, loadGuestReadings, saveGuestReadings } from "@/lib/guest-history";
import { useI18n } from "@/lib/i18n";
import type { ReadingRecord } from "@/lib/reading-record";
import { getSpread } from "@/lib/spreads";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function HistoryView() {
  const { t, locale } = useI18n();
  const { user, ready } = useAuth();
  const [readings, setReadings] = useState<ReadingRecord[]>([]);
  const [guestLeft, setGuestLeft] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [target, setTarget] = useState<ReadingRecord | null>(null);
  const [importing, setImporting] = useState(false);

  async function load() {
    if (!ready) return;
    setStatus("loading");
    if (!user) {
      setReadings(loadGuestReadings());
      setGuestLeft(0);
      setStatus("ready");
      return;
    }
    setGuestLeft(loadGuestReadings().length);
    try {
      const response = await fetch("/api/readings", { cache: "no-store" });
      if (!response.ok) {
        setStatus("error");
        return;
      }
      const data = (await response.json()) as { readings: ReadingRecord[] };
      setReadings(data.readings);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
    // load reads the latest user from this render; the timer keeps the update off the effect body.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user?.id]);

  async function confirmDelete() {
    if (!target) return;
    if (user) {
      const response = await fetch(`/api/readings/${target.id}`, { method: "DELETE" });
      if (!response.ok) {
        toast.error(t.genericError);
        return;
      }
      setReadings((current) => current.filter((item) => item.id !== target.id));
    } else {
      setReadings(deleteGuestReading(target.id));
    }
    setTarget(null);
  }

  async function importGuest() {
    setImporting(true);
    const local = loadGuestReadings();
    const failed: ReadingRecord[] = [];
    for (const reading of local) {
      const response = await fetch("/api/readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: reading.question,
          spreadId: reading.spreadId,
          locale: reading.locale,
          cards: reading.cards,
          aiInterpretation: reading.aiInterpretation,
        }),
      });
      if (!response.ok) failed.push(reading);
    }
    saveGuestReadings(failed);
    setGuestLeft(failed.length);
    setImporting(false);
    if (failed.length === 0) toast.success(t.imported);
    else toast.error(t.importError);
    await load();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12" data-testid="history-page">
      <h1 className="text-4xl text-primary">{t.historyTitle}</h1>
      <p className="mt-3 leading-7 text-muted-foreground">{t.historyLead}</p>
      <p className="mt-4 text-sm text-primary">{user ? t.historyAccount : t.historyGuest}</p>
      {!user ? (
        <Link href="/login?next=/history" className="mt-2 inline-block text-sm underline">
          {t.guestCta}
        </Link>
      ) : null}
      {user && guestLeft > 0 ? (
        <div className="mt-4 rounded-2xl border border-primary/30 bg-card/50 p-4">
          <p className="text-sm">{t.importHint}</p>
          <Button className="mt-3" onClick={() => void importGuest()} disabled={importing}>
            {importing ? t.importing : t.importLocal}
          </Button>
        </div>
      ) : null}

      {status === "loading" ? <p className="mt-10 text-muted-foreground">{t.loading}</p> : null}
      {status === "error" ? (
        <div className="mt-10">
          <p className="text-destructive">{t.historyError}</p>
          <Button className="mt-3" variant="outline" onClick={() => void load()}>
            {t.retry}
          </Button>
        </div>
      ) : null}
      {status === "ready" && readings.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-primary/30 p-8 text-center">
          <p className="text-muted-foreground">{t.historyEmpty}</p>
          <Link href="/reading" className="mt-4 inline-block text-primary">
            {t.startReading}
          </Link>
        </div>
      ) : null}
      {status === "ready" ? (
        <ul className="mt-8 grid gap-3" data-testid="history-list">
          {readings.map((reading) => {
            const spread = getSpread(reading.spreadId);
            const names = reading.cards
              .map((item) => getCard(item.cardId)?.name[locale])
              .filter(Boolean)
              .join(" · ");
            return (
              <li key={reading.id} className="rounded-2xl border border-border bg-card/40 p-4">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/history/${reading.id}`} className="min-w-0 flex-1">
                    <p className="text-xs tracking-[0.18em] text-primary">{spread?.name[locale] ?? reading.spreadId}</p>
                    <p className="mt-1 truncate text-base">{reading.question || t.noQuestion}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(reading.createdAt))}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{names}</p>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => setTarget(reading)} data-testid={`delete-${reading.id}`}>
                    {t.delete}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      <Dialog open={Boolean(target)} onOpenChange={(open) => { if (!open) setTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.confirmDelete}</DialogTitle>
            <DialogDescription>{t.deleteBody}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="bg-transparent">
            <Button variant="outline" onClick={() => setTarget(null)}>
              {t.cancel}
            </Button>
            <Button variant="destructive" onClick={() => void confirmDelete()} data-testid="confirm-delete">
              {t.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function HistoryDetailLoader({ id }: { id: string }) {
  const { t } = useI18n();
  const { user, ready } = useAuth();
  const [reading, setReading] = useState<ReadingRecord | null | undefined>(undefined);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    async function load() {
      if (user) {
        const response = await fetch(`/api/readings/${id}`, { cache: "no-store" });
        if (response.ok) {
          const data = (await response.json()) as { reading: ReadingRecord };
          if (!cancelled) setReading(data.reading);
          return;
        }
      }
      const local = loadGuestReadings().find((item) => item.id === id) ?? null;
      if (!cancelled) setReading(local);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [id, ready, user]);

  if (!ready || reading === undefined) {
    return <p className="px-4 py-16 text-center text-muted-foreground">{t.loading}</p>;
  }
  if (!reading) {
    return (
      <div className="px-4 py-16 text-center">
        <p>{t.historyMissing}</p>
        <Link href="/history" className="mt-4 inline-block text-primary">
          {t.backToHistory}
        </Link>
      </div>
    );
  }
  return <SavedReadingBridge reading={reading} />;
}

function SavedReadingBridge({ reading }: { reading: ReadingRecord }) {
  return <SavedReading reading={reading} />;
}

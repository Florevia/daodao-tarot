import { readAdmin } from "@/lib/admin-guard";
import { getCard } from "@/lib/cards";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "一条解读",
  robots: { index: false, follow: false },
};

export const instant = false;

export default async function AdminLogPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const admin = await readAdmin();
  if (!admin) notFound();
  const { id } = await params;
  const log = await prisma.interpretLog.findUnique({ where: { id } });
  if (!log) notFound();
  const cards = parseCards(log.cardsJson);
  const reading = log.readingJson;
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/admin" className="text-sm text-primary underline">
        返回数据
      </Link>
      <h1 className="mt-3 text-3xl text-primary">一条解读</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {log.createdAt.toISOString()} · {log.outcome}
        {log.errorReason ? ` · ${log.errorReason}` : ""} · {log.provider || "无提供方"} · {log.modelUsed || "无模型"}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        试过 {log.modelsTried} · {log.latencyMs} ms · token {log.totalTokens} · 花费 ${log.costUsd.toFixed(4)}
        {log.freeTier ? `（免费，按付费价 $${log.wouldCostUsd.toFixed(4)}）` : ""}
      </p>
      <h2 className="mt-6 text-lg text-primary">问题</h2>
      <p className="mt-2 leading-8">{log.question}</p>
      <h2 className="mt-6 text-lg text-primary">牌</h2>
      <ul className="mt-2 space-y-1 leading-7">
        {cards.map((card) => (
          <li key={`${card.positionId}-${card.cardId}`}>
            {card.positionId} · {card.name} · {card.reversed ? "逆位" : "正位"}
          </li>
        ))}
      </ul>
      <h2 className="mt-6 text-lg text-primary">解读</h2>
      <pre className="mt-2 overflow-x-auto rounded-2xl border border-border bg-card/60 p-4 text-sm leading-7 whitespace-pre-wrap">
        {reading || "没有模型解读。"}
      </pre>
    </div>
  );
}

function parseCards(raw: string): { positionId: string; cardId: string; name: string; reversed: boolean }[] {
  try {
    const parsed = JSON.parse(raw) as { positionId?: string; cardId?: string; reversed?: boolean }[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((card) => ({
      positionId: card.positionId ?? "",
      cardId: card.cardId ?? "",
      name: (card.cardId && getCard(card.cardId)?.name.zh) || card.cardId || "未知",
      reversed: Boolean(card.reversed),
    }));
  } catch {
    return [];
  }
}

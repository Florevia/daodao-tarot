import { CardDetailView } from "@/components/card-detail-view";
import { cards, getCard } from "@/lib/cards";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export function generateStaticParams() {
  return cards.map((card) => ({ id: card.id }));
}

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await props.params;
  const card = getCard(id);
  if (!card) return { title: "牌义" };
  return {
    title: `${card.name.zh} ${card.name.en}`,
    description: `${card.description.zh} ${card.upright.zh}`,
  };
}

export default function Page(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-center text-muted-foreground">正在展开…</p>}>
      <CardBody params={props.params} />
    </Suspense>
  );
}

async function CardBody({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = getCard(id);
  if (!card) notFound();
  const index = cards.findIndex((item) => item.id === card.id);
  return (
    <CardDetailView
      card={card}
      prevId={cards[index - 1]?.id ?? null}
      nextId={cards[index + 1]?.id ?? null}
    />
  );
}

import { CaseDetail } from "@/components/cases-view";
import { getCase, readingCases } from "@/lib/cases";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return readingCases.map((item) => ({ id: item.id }));
}

export const dynamicParams = false;

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await props.params;
  const item = getCase(id);
  if (!item) return { title: "占卜案例" };
  return {
    title: item.title,
    description: item.question,
  };
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const item = getCase(id);
  if (!item) notFound();
  return <CaseDetail item={item} />;
}

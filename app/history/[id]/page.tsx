import { HistoryDetailLoader } from "@/components/history-view";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "一条占卜",
};

export default function Page(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-center text-muted-foreground">正在展开…</p>}>
      <HistoryParam params={props.params} />
    </Suspense>
  );
}

async function HistoryParam({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <HistoryDetailLoader id={id} />;
}

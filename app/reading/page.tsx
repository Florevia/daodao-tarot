import { ReadingFlow } from "@/components/reading-flow";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "占卜",
  description: "在叨叨占卜师选择牌阵、洗牌、揭牌，并读到每一张牌在位置里的意思。",
};

export default function Page() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-center text-muted-foreground">正在展开…</p>}>
      <ReadingFlow />
    </Suspense>
  );
}

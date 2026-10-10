import { CasesView } from "@/components/cases-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "占卜案例",
  description: "一百个塔罗解读案例，按牌阵浏览。用来对照解牌的具体程度，不代替你自己抽到的牌。",
};

export default function Page() {
  return <CasesView />;
}

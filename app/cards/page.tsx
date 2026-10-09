import { EncyclopediaView } from "@/components/encyclopedia-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "牌义全书",
  description: "浏览叨叨占卜师收录的全部 78 张伟特塔罗，含正位、逆位与关键词。",
};

export default function Page() {
  return <EncyclopediaView />;
}

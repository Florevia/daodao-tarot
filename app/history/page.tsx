import { HistoryView } from "@/components/history-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "占卜记录",
  description: "查看、重读或删除叨叨占卜师里保存的塔罗记录。",
};

export default function Page() {
  return <HistoryView />;
}

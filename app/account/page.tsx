import { AccountView } from "@/components/account-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "账号",
};

export default function Page() {
  return <AccountView />;
}

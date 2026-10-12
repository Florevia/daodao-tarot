import { AdminDashboard } from "@/components/admin-dashboard";
import { loadAdminLogs, loadAdminOverview, loadAdminUsers, loadDailyBuckets, readLogFilters, resolveAdminRange, shanghaiDayKey } from "@/lib/admin-data";
import { readAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "数据",
  robots: { index: false, follow: false },
};

/** Block so a non-admin receives HTTP 404 instead of a public shell. */
export const instant = false;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
  const admin = await readAdmin();
  if (!admin) notFound();
  const raw = await searchParams;
  const one = (key: string) => {
    const value = raw[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const range = resolveAdminRange({ range: one("range"), from: one("from"), to: one("to") });
  const filters = readLogFilters({
    outcome: one("outcome"),
    spread: one("spread"),
    model: one("model"),
    user: one("user"),
    q: one("q"),
    page: one("page"),
  });
  const [overview, daily, users, logs, topups] = await Promise.all([
    loadAdminOverview(range),
    loadDailyBuckets(range),
    loadAdminUsers(range),
    loadAdminLogs(range, filters),
    prisma.budgetTopUp.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);
  return (
    <AdminDashboard
      range={range}
      fromInput={one("from") || shanghaiDayKey(range.from)}
      toInput={one("to") || shanghaiDayKey(new Date(range.to.getTime() - 60_000))}
      filters={filters}
      overview={overview}
      daily={daily}
      users={users}
      logs={logs}
      topups={topups}
    />
  );
}

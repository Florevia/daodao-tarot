import { prisma } from "./prisma";

const SHANGHAI = "Asia/Shanghai";

export type RangeKey = "today" | "7d" | "30d" | "custom";

export type AdminRange = {
  key: RangeKey;
  from: Date;
  to: Date;
};

function zonedParts(timeZone: string, now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const pick = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? "0");
  return { year: pick("year"), month: pick("month"), day: pick("day"), hour: pick("hour"), minute: pick("minute"), second: pick("second") };
}

/** Start of the calendar day in a zone, as a UTC Date. Shanghai has no daylight-saving shift. */
export function startOfZonedDay(timeZone: string, now = new Date()): Date {
  const parts = zonedParts(timeZone, now);
  const elapsed = ((parts.hour * 60 + parts.minute) * 60 + parts.second) * 1000;
  return new Date(now.getTime() - elapsed);
}

export function addZonedDays(timeZone: string, dayStart: Date, days: number): Date {
  const probe = new Date(dayStart.getTime() + days * 24 * 60 * 60 * 1000);
  return startOfZonedDay(timeZone, new Date(probe.getTime() + 12 * 60 * 60 * 1000));
}

export function resolveAdminRange(input: { range?: string; from?: string; to?: string }, now = new Date()): AdminRange {
  const key: RangeKey = input.range === "7d" || input.range === "30d" || input.range === "custom" ? input.range : "today";
  const today = startOfZonedDay(SHANGHAI, now);
  const tomorrow = addZonedDays(SHANGHAI, today, 1);
  if (key === "7d") return { key, from: addZonedDays(SHANGHAI, today, -6), to: tomorrow };
  if (key === "30d") return { key, from: addZonedDays(SHANGHAI, today, -29), to: tomorrow };
  if (key === "custom") {
    const from = parseDay(input.from) ?? today;
    const toDay = parseDay(input.to) ?? from;
    const end = toDay.getTime() < from.getTime() ? from : toDay;
    return { key, from, to: new Date(end.getTime() + 24 * 60 * 60 * 1000) };
  }
  return { key, from: today, to: tomorrow };
}

function parseDay(value: string | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day, -8, 0, 0));
}

export function shanghaiDayKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: SHANGHAI, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export type DailyBucket = { day: string; outcome: string; count: number; tokens: number; cost: number };

export async function loadDailyBuckets(range: AdminRange): Promise<DailyBucket[]> {
  const rows = await prisma.$queryRaw<
    { day: string; outcome: string; count: number; tokens: number | null; cost: number | null }[]
  >`
    SELECT to_char("createdAt" AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD') AS day,
           "outcome" AS outcome,
           COUNT(*)::int AS count,
           COALESCE(SUM("totalTokens"), 0)::int AS tokens,
           COALESCE(SUM("costUsd"), 0) AS cost
    FROM "InterpretLog"
    WHERE "createdAt" >= ${range.from} AND "createdAt" < ${range.to}
    GROUP BY 1, 2
    ORDER BY 1
  `;
  return rows.map((row) => ({
    day: row.day,
    outcome: row.outcome,
    count: Number(row.count),
    tokens: Number(row.tokens ?? 0),
    cost: Number(row.cost ?? 0),
  }));
}

export const PAGE_SIZE = 20;

export type LogFilters = {
  outcome: string;
  spread: string;
  model: string;
  user: string;
  q: string;
  page: number;
};

export function readLogFilters(input: Record<string, string | undefined>): LogFilters {
  const page = Number(input.page);
  return {
    outcome: input.outcome ?? "",
    spread: input.spread ?? "",
    model: input.model ?? "",
    user: input.user ?? "",
    q: input.q ?? "",
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
  };
}

function logWhere(range: AdminRange, filters: LogFilters) {
  return {
    createdAt: { gte: range.from, lt: range.to },
    ...(filters.outcome ? { outcome: filters.outcome } : {}),
    ...(filters.spread ? { spreadId: filters.spread } : {}),
    ...(filters.model ? { modelUsed: filters.model } : {}),
    ...(filters.user
      ? {
          OR: [
            { userEmail: { contains: filters.user, mode: "insensitive" as const } },
            { guestKey: { contains: filters.user, mode: "insensitive" as const } },
            { userId: filters.user },
          ],
        }
      : {}),
    ...(filters.q ? { question: { contains: filters.q, mode: "insensitive" as const } } : {}),
  };
}

export async function loadAdminOverview(range: AdminRange) {
  const where = { createdAt: { gte: range.from, lt: range.to } };
  const [totals, success, signups, people, spreads, models, topups, spentAll] = await Promise.all([
    prisma.interpretLog.aggregate({
      where,
      _count: true,
      _avg: { latencyMs: true },
      _sum: { totalTokens: true, costUsd: true },
    }),
    prisma.interpretLog.count({ where: { ...where, outcome: "success" } }),
    prisma.user.count({ where }),
    prisma.interpretLog.groupBy({ by: ["userId", "guestKey"], where }),
    prisma.interpretLog.groupBy({ by: ["spreadId"], where, _count: true }),
    prisma.interpretLog.groupBy({ by: ["modelUsed"], where, _count: true }),
    prisma.budgetTopUp.aggregate({ _sum: { amountUsd: true } }),
    prisma.interpretLog.aggregate({ _sum: { costUsd: true } }),
  ]);
  const readings = totals._count;
  const topics = await topicCounts(range);
  const topped = topups._sum.amountUsd ?? 0;
  const spent = spentAll._sum.costUsd ?? 0;
  return {
    readings,
    uniqueUsers: people.length,
    signups,
    successRate: readings ? success / readings : 0,
    avgLatencyMs: Math.round(totals._avg.latencyMs ?? 0),
    tokens: totals._sum.totalTokens ?? 0,
    costUsd: totals._sum.costUsd ?? 0,
    topupsUsd: topped,
    spentUsd: spent,
    remainingUsd: topped - spent,
    spreads: spreads
      .map((row) => ({ id: row.spreadId, count: row._count }))
      .sort((a, b) => b.count - a.count),
    models: models
      .map((row) => ({ id: row.modelUsed || "（无）", count: row._count }))
      .sort((a, b) => b.count - a.count),
    topics,
  };
}

async function topicCounts(range: AdminRange): Promise<{ id: string; count: number }[]> {
  const rows = await prisma.interpretLog.findMany({
    where: { createdAt: { gte: range.from, lt: range.to } },
    select: { contextJson: true, spreadId: true },
  });
  const counts = new Map<string, number>();
  for (const row of rows) {
    let topic = row.spreadId;
    try {
      const context = JSON.parse(row.contextJson) as { area?: string; theme?: string };
      topic = context.area || context.theme || row.spreadId;
    } catch {
      topic = row.spreadId;
    }
    counts.set(topic, (counts.get(topic) ?? 0) + 1);
  }
  return [...counts.entries()].map(([id, count]) => ({ id, count })).sort((a, b) => b.count - a.count);
}

export async function loadAdminUsers(range: AdminRange) {
  const where = { createdAt: { gte: range.from, lt: range.to } };
  const grouped = await prisma.interpretLog.groupBy({
    by: ["userId", "userEmail", "guestKey"],
    where,
    _count: true,
    _sum: { totalTokens: true, costUsd: true },
    _max: { createdAt: true },
  });
  const ids = grouped.map((row) => row.userId).filter((id): id is string => Boolean(id));
  const users = ids.length
    ? await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, createdAt: true, email: true } })
    : [];
  const byId = new Map(users.map((user) => [user.id, user]));
  return grouped
    .map((row) => {
      const account = row.userId ? byId.get(row.userId) : undefined;
      return {
        label: account?.email || row.userEmail || (row.guestKey ? `访客 ${row.guestKey.slice(0, 8)}` : "访客"),
        signedUp: account?.createdAt.toISOString() ?? null,
        lastActive: row._max.createdAt?.toISOString() ?? null,
        readings: row._count,
        tokens: row._sum.totalTokens ?? 0,
        costUsd: row._sum.costUsd ?? 0,
      };
    })
    .sort((a, b) => b.readings - a.readings);
}

export async function loadAdminLogs(range: AdminRange, filters: LogFilters) {
  const where = logWhere(range, filters);
  const [total, rows] = await Promise.all([
    prisma.interpretLog.count({ where }),
    prisma.interpretLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        createdAt: true,
        userEmail: true,
        guestKey: true,
        question: true,
        spreadId: true,
        modelUsed: true,
        outcome: true,
        latencyMs: true,
        totalTokens: true,
        costUsd: true,
      },
    }),
  ]);
  return { total, rows };
}

export async function loadAdminLogRows(range: AdminRange, filters: LogFilters) {
  return prisma.interpretLog.findMany({
    where: logWhere(range, filters),
    orderBy: { createdAt: "desc" },
    take: 5000,
  });
}

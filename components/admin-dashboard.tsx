import type { AdminRange, DailyBucket, LogFilters } from "@/lib/admin-data";
import { PAGE_SIZE } from "@/lib/admin-data";
import Link from "next/link";
import type { ReactNode } from "react";

const OUTCOME_COLOR: Record<string, string> = {
  success: "#c6a15a",
  fallback: "#8d7b62",
  quota: "#c46b4a",
  timeout: "#a15c5c",
  error: "#8d4a4a",
  crisis: "#6a7ea8",
  "rate-limited": "#7a6a4a",
};

export type AdminDashboardProps = {
  range: AdminRange;
  fromInput: string;
  toInput: string;
  filters: LogFilters;
  overview: {
    readings: number;
    uniqueUsers: number;
    signups: number;
    successRate: number;
    avgLatencyMs: number;
    tokens: number;
    costUsd: number;
    topupsUsd: number;
    spentUsd: number;
    remainingUsd: number;
    spreads: { id: string; count: number }[];
    models: { id: string; count: number }[];
    topics: { id: string; count: number }[];
  };
  daily: DailyBucket[];
  users: {
    label: string;
    signedUp: string | null;
    lastActive: string | null;
    readings: number;
    tokens: number;
    costUsd: number;
  }[];
  logs: {
    total: number;
    rows: {
      id: string;
      createdAt: Date;
      userEmail: string | null;
      guestKey: string | null;
      question: string;
      spreadId: string;
      modelUsed: string | null;
      outcome: string;
      latencyMs: number;
      totalTokens: number;
      costUsd: number;
    }[];
  };
  topups: { id: string; createdAt: Date; amountUsd: number; note: string }[];
};

function money(value: number): string {
  const digits = Math.abs(value) >= 1 ? 2 : 4;
  return `$${value.toFixed(digits)}`;
}

function when(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function queryHref(current: Record<string, string>, patch: Record<string, string | null>): string {
  const next = { ...current };
  for (const [key, value] of Object.entries(patch)) {
    if (!value) delete next[key];
    else next[key] = value;
  }
  const text = new URLSearchParams(next).toString();
  return text ? `/admin?${text}` : "/admin";
}

export function AdminDashboard({ range, fromInput, toInput, filters, overview, daily, users, logs, topups }: AdminDashboardProps) {
  const current: Record<string, string> = {
    range: range.key,
    ...(range.key === "custom" ? { from: fromInput, to: toInput } : {}),
    ...(filters.outcome ? { outcome: filters.outcome } : {}),
    ...(filters.spread ? { spread: filters.spread } : {}),
    ...(filters.model ? { model: filters.model } : {}),
    ...(filters.user ? { user: filters.user } : {}),
    ...(filters.q ? { q: filters.q } : {}),
  };
  const pages = Math.max(1, Math.ceil(logs.total / PAGE_SIZE));
  const cards = [
    ["解读次数", String(overview.readings)],
    ["独立用户", String(overview.uniqueUsers)],
    ["新注册", String(overview.signups)],
    ["成功率", `${Math.round(overview.successRate * 100)}%`],
    ["平均耗时", `${overview.avgLatencyMs} ms`],
    ["Token", overview.tokens.toLocaleString("zh-CN")],
    ["区间花费", money(overview.costUsd)],
    ["余额", money(overview.remainingUsd)],
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <p className="font-display text-xs tracking-[0.35em] text-primary">仅管理员</p>
      <h1 className="mt-2 text-3xl text-primary sm:text-4xl">数据</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
        问题文本只在这里可见。花费是按模型价目估算的，免费额度记为 0，括号里是按付费价会花的钱。
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ["today", "今天"],
            ["7d", "7 天"],
            ["30d", "30 天"],
          ] as const
        ).map(([key, label]) => (
          <Link
            key={key}
            href={queryHref(current, { range: key, from: null, to: null, page: null })}
            className={
              range.key === key
                ? "rounded-full border border-primary bg-primary/20 px-3 py-1 text-sm text-primary"
                : "rounded-full border border-border px-3 py-1 text-sm text-muted-foreground"
            }
          >
            {label}
          </Link>
        ))}
      </div>
      <form className="mt-3 flex flex-wrap items-end gap-2" method="get">
        <input type="hidden" name="range" value="custom" />
        <label className="text-sm text-muted-foreground">
          从
          <input className="mt-1 block rounded-xl border border-border bg-card px-3 py-2 text-foreground" type="date" name="from" defaultValue={fromInput} />
        </label>
        <label className="text-sm text-muted-foreground">
          到
          <input className="mt-1 block rounded-xl border border-border bg-card px-3 py-2 text-foreground" type="date" name="to" defaultValue={toInput} />
        </label>
        <button className="rounded-full border border-primary px-4 py-2 text-sm text-primary" type="submit">
          查看
        </button>
      </form>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <article key={label} className="rounded-2xl border border-primary/30 bg-card/70 p-4">
            <p className="text-xs tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-2 font-display text-2xl text-primary">{value}</p>
          </article>
        ))}
      </div>

      <section className="mt-6 rounded-3xl border border-primary/30 bg-card/60 p-4 sm:p-6">
        <h2 className="text-lg text-primary">充值金额</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          站点没有支付，Gemini 账单也不能用这把密钥读到。在这里记下充值，余额 = 累计充值 − 估算花费。
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-muted-foreground">累计充值</dt>
            <dd className="text-xl text-primary">{money(overview.topupsUsd)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">已花费（估算）</dt>
            <dd className="text-xl text-primary">{money(overview.spentUsd)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">剩余</dt>
            <dd className="text-xl text-primary">{money(overview.remainingUsd)}</dd>
          </div>
        </dl>
        <form className="mt-4 grid gap-2 sm:grid-cols-[9rem_8rem_1fr_auto]" method="post" action="/admin/topups">
          <input className="rounded-xl border border-border bg-background px-3 py-2" type="date" name="date" required />
          <input className="rounded-xl border border-border bg-background px-3 py-2" type="number" name="amount" min="0.01" step="0.01" placeholder="美元" required />
          <input className="rounded-xl border border-border bg-background px-3 py-2" type="text" name="note" maxLength={500} placeholder="备注，例如 Gemini 充值" />
          <button className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground" type="submit">
            记下
          </button>
        </form>
        {topups.length ? (
          <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
            {topups.map((item) => (
              <li key={item.id}>
                {when(item.createdAt.toISOString())} · {money(item.amountUsd)} · {item.note || "无备注"}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="每日解读（按结果）">
          <OutcomeChart rows={daily} />
        </ChartCard>
        <ChartCard title="每日 Token 与花费">
          <TokenChart rows={daily} />
        </ChartCard>
        <ChartCard title="牌阵">
          <Bars rows={overview.spreads} />
        </ChartCard>
        <ChartCard title="主题">
          <Bars rows={overview.topics} />
        </ChartCard>
        <ChartCard title="模型占比">
          <Bars rows={overview.models} />
        </ChartCard>
      </div>

      <section className="mt-6">
        <h2 className="text-lg text-primary">用户</h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-normal">邮箱或访客</th>
                <th className="px-3 py-2 font-normal">注册</th>
                <th className="px-3 py-2 font-normal">最近</th>
                <th className="px-3 py-2 font-normal">解读</th>
                <th className="px-3 py-2 font-normal">Token</th>
                <th className="px-3 py-2 font-normal">花费</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.label} className="border-t border-border">
                  <td className="px-3 py-2">{user.label}</td>
                  <td className="px-3 py-2">{when(user.signedUp)}</td>
                  <td className="px-3 py-2">{when(user.lastActive)}</td>
                  <td className="px-3 py-2">{user.readings}</td>
                  <td className="px-3 py-2">{user.tokens.toLocaleString("zh-CN")}</td>
                  <td className="px-3 py-2">{money(user.costUsd)}</td>
                </tr>
              ))}
              {users.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-muted-foreground" colSpan={6}>
                    这段时间还没有解读。
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-lg text-primary">请求记录</h2>
          <a className="text-sm text-primary underline" href={exportHref(current)}>
            导出 CSV
          </a>
        </div>
        <form className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-6" method="get">
          <input type="hidden" name="range" value={range.key} />
          {range.key === "custom" ? (
            <>
              <input type="hidden" name="from" value={fromInput} />
              <input type="hidden" name="to" value={toInput} />
            </>
          ) : null}
          <input className="rounded-xl border border-border bg-card px-3 py-2" name="q" defaultValue={filters.q} placeholder="搜索问题" />
          <input className="rounded-xl border border-border bg-card px-3 py-2" name="user" defaultValue={filters.user} placeholder="用户或访客" />
          <input className="rounded-xl border border-border bg-card px-3 py-2" name="spread" defaultValue={filters.spread} placeholder="牌阵" />
          <input className="rounded-xl border border-border bg-card px-3 py-2" name="model" defaultValue={filters.model} placeholder="模型" />
          <input className="rounded-xl border border-border bg-card px-3 py-2" name="outcome" defaultValue={filters.outcome} placeholder="结果" />
          <button className="rounded-full border border-primary px-4 py-2 text-sm text-primary" type="submit">
            筛选
          </button>
        </form>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-normal">时间</th>
                <th className="px-3 py-2 font-normal">谁</th>
                <th className="px-3 py-2 font-normal">问题</th>
                <th className="px-3 py-2 font-normal">牌阵</th>
                <th className="px-3 py-2 font-normal">模型</th>
                <th className="px-3 py-2 font-normal">结果</th>
              </tr>
            </thead>
            <tbody>
              {logs.rows.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <Link className="text-primary underline" href={`/admin/logs/${row.id}`}>
                      {when(row.createdAt.toISOString())}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{row.userEmail || (row.guestKey ? `访客 ${row.guestKey.slice(0, 8)}` : "访客")}</td>
                  <td className="max-w-xs truncate px-3 py-2">{row.question}</td>
                  <td className="px-3 py-2">{row.spreadId}</td>
                  <td className="px-3 py-2">{row.modelUsed || "—"}</td>
                  <td className="px-3 py-2">{row.outcome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex gap-3 text-sm">
          {filters.page > 1 ? (
            <Link className="text-primary underline" href={queryHref(current, { page: String(filters.page - 1) })}>
              上一页
            </Link>
          ) : null}
          <span className="text-muted-foreground">
            {filters.page} / {pages}
          </span>
          {filters.page < pages ? (
            <Link className="text-primary underline" href={queryHref(current, { page: String(filters.page + 1) })}>
              下一页
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function exportHref(current: Record<string, string>): string {
  const text = new URLSearchParams(current).toString();
  return text ? `/admin/export?${text}` : "/admin/export";
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-card/50 p-4">
      <h2 className="text-base text-primary">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Bars({ rows }: { rows: { id: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((row) => row.count));
  if (!rows.length) return <p className="text-sm text-muted-foreground">没有数据。</p>;
  return (
    <svg viewBox={`0 0 360 ${rows.length * 28}`} role="img" className="w-full text-primary">
      {rows.slice(0, 8).map((row, index) => (
        <g key={row.id} transform={`translate(0 ${index * 28})`}>
          <text x="0" y="16" fill="currentColor" fontSize="12">
            {row.id}
          </text>
          <rect x="120" y="6" height="12" rx="3" width={Math.max(2, (row.count / max) * 180)} fill="currentColor" opacity="0.85" />
          <text x="310" y="16" fill="currentColor" fontSize="12">
            {row.count}
          </text>
        </g>
      ))}
    </svg>
  );
}

function OutcomeChart({ rows }: { rows: DailyBucket[] }) {
  const days = [...new Set(rows.map((row) => row.day))];
  if (!days.length) return <p className="text-sm text-muted-foreground">没有数据。</p>;
  const totals = days.map((day) => rows.filter((row) => row.day === day).reduce((sum, row) => sum + row.count, 0));
  const max = Math.max(1, ...totals);
  const width = 360;
  const height = 140;
  const gap = width / days.length;
  return (
    <svg viewBox={`0 0 ${width} ${height + 24}`} role="img" className="w-full">
      {days.map((day, index) => {
        let y = height;
        const slice = rows.filter((row) => row.day === day);
        return (
          <g key={day}>
            {slice.map((row) => {
              const bar = (row.count / max) * (height - 8);
              y -= bar;
              return <rect key={row.outcome} x={index * gap + 6} y={y} width={Math.max(8, gap - 12)} height={bar} fill={OUTCOME_COLOR[row.outcome] ?? "#c6a15a"} />;
            })}
            <text x={index * gap + 4} y={height + 16} fontSize="10" fill="currentColor" className="text-muted-foreground">
              {day.slice(5)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function TokenChart({ rows }: { rows: DailyBucket[] }) {
  const days = [...new Set(rows.map((row) => row.day))];
  if (!days.length) return <p className="text-sm text-muted-foreground">没有数据。</p>;
  const points = days.map((day) => {
    const slice = rows.filter((row) => row.day === day);
    return {
      day,
      tokens: slice.reduce((sum, row) => sum + row.tokens, 0),
      cost: slice.reduce((sum, row) => sum + row.cost, 0),
    };
  });
  const max = Math.max(1, ...points.map((point) => point.tokens));
  return (
    <svg viewBox="0 0 360 120" role="img" className="w-full text-primary">
      {points.map((point, index) => {
        const bar = (point.tokens / max) * 90;
        const x = (360 / points.length) * index + 8;
        return (
          <g key={point.day}>
            <rect x={x} y={100 - bar} width="16" height={bar} fill="currentColor" opacity="0.85" />
            <text x={x} y="114" fontSize="10" fill="currentColor">
              {point.day.slice(8)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

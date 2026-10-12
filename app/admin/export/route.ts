import { loadAdminLogRows, readLogFilters, resolveAdminRange } from "@/lib/admin-data";
import { readAdmin } from "@/lib/admin-guard";

function cell(value: string | number | boolean | null | undefined): string {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const admin = await readAdmin();
  if (!admin) return new Response(null, { status: 404 });
  const url = new URL(request.url);
  const range = resolveAdminRange({
    range: url.searchParams.get("range") ?? undefined,
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
  });
  const filters = readLogFilters({
    outcome: url.searchParams.get("outcome") ?? undefined,
    spread: url.searchParams.get("spread") ?? undefined,
    model: url.searchParams.get("model") ?? undefined,
    user: url.searchParams.get("user") ?? undefined,
    q: url.searchParams.get("q") ?? undefined,
    page: "1",
  });
  const rows = await loadAdminLogRows(range, filters);
  const header = [
    "createdAt",
    "userEmail",
    "guestKey",
    "question",
    "spreadId",
    "outcome",
    "errorReason",
    "provider",
    "modelUsed",
    "modelsTried",
    "inputTokens",
    "outputTokens",
    "totalTokens",
    "latencyMs",
    "costUsd",
    "wouldCostUsd",
    "freeTier",
  ];
  const lines = [
    header.join(","),
    ...rows.map((row) =>
      [
        row.createdAt.toISOString(),
        row.userEmail,
        row.guestKey,
        row.question,
        row.spreadId,
        row.outcome,
        row.errorReason,
        row.provider,
        row.modelUsed,
        row.modelsTried,
        row.inputTokens,
        row.outputTokens,
        row.totalTokens,
        row.latencyMs,
        row.costUsd,
        row.wouldCostUsd,
        row.freeTier,
      ]
        .map(cell)
        .join(","),
    ),
  ];
  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=daodao-interpret.csv",
    },
  });
}

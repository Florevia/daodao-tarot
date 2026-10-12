import { readAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const admin = await readAdmin();
  if (!admin) return new Response(null, { status: 404 });
  const form = await request.formData();
  const amount = Number(form.get("amount"));
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000) {
    return Response.redirect(new URL("/admin", request.url), 303);
  }
  const note = String(form.get("note") ?? "").trim().slice(0, 500);
  const date = String(form.get("date") ?? "");
  const createdAt = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T12:00:00+08:00`) : new Date();
  await prisma.budgetTopUp.create({
    data: { amountUsd: amount, note, adminEmail: admin.email, createdAt },
  });
  return Response.redirect(new URL("/admin", request.url), 303);
}

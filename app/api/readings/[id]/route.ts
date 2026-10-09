import { readSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeReading } from "@/lib/serialize-reading";
import { z } from "zod";

const patchSchema = z.object({
  aiInterpretation: z.string().max(8000).nullable(),
});

async function ownedReading(id: string, userId: string) {
  return prisma.reading.findFirst({ where: { id, userId } });
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await readSession();
  if (!user) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await context.params;
  const reading = await ownedReading(id, user.id);
  if (!reading) return Response.json({ error: "NOT_FOUND" }, { status: 404 });
  return Response.json({ reading: serializeReading(reading) });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await readSession();
  if (!user) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await context.params;
  const existing = await ownedReading(id, user.id);
  if (!existing) return Response.json({ error: "NOT_FOUND" }, { status: 404 });
  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "INVALID_INPUT" }, { status: 400 });
  const reading = await prisma.reading.update({
    where: { id },
    data: { aiInterpretation: parsed.data.aiInterpretation?.trim() || null },
  });
  return Response.json({ reading: serializeReading(reading) });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await readSession();
  if (!user) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await context.params;
  const existing = await ownedReading(id, user.id);
  if (!existing) return Response.json({ error: "NOT_FOUND" }, { status: 404 });
  await prisma.reading.delete({ where: { id } });
  return Response.json({ ok: true });
}

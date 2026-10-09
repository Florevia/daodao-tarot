import { readSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateDrawnCards } from "@/lib/reading-record";
import { serializeReading } from "@/lib/serialize-reading";
import { buildSummary } from "@/lib/summary";
import { z } from "zod";

const cardSchema = z.object({
  positionId: z.string().min(1).max(40),
  cardId: z.string().min(1).max(40),
  reversed: z.boolean(),
});

const schema = z.object({
  question: z.string().max(500).optional(),
  spreadId: z.string().min(1).max(40),
  locale: z.enum(["zh", "en"]),
  cards: z.array(cardSchema).min(1).max(10),
  aiInterpretation: z.string().max(8000).nullable().optional(),
});

export async function GET() {
  const user = await readSession();
  if (!user) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const readings = await prisma.reading.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return Response.json({ readings: readings.map(serializeReading) });
}

export async function POST(request: Request) {
  const user = await readSession();
  if (!user) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success || !validateDrawnCards(parsed.data.spreadId, parsed.data.cards)) {
    return Response.json({ error: "INVALID_INPUT" }, { status: 400 });
  }
  const question = parsed.data.question?.trim() ?? "";
  const summary = buildSummary({
    question,
    spreadId: parsed.data.spreadId,
    drawn: parsed.data.cards,
    locale: parsed.data.locale,
  });
  const reading = await prisma.reading.create({
    data: {
      userId: user.id,
      question,
      spreadId: parsed.data.spreadId,
      locale: parsed.data.locale,
      cardsJson: JSON.stringify(parsed.data.cards),
      summary,
      aiInterpretation: parsed.data.aiInterpretation?.trim() || null,
    },
  });
  return Response.json({ reading: serializeReading(reading) });
}

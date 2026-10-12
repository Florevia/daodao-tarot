import { prisma } from "./prisma";
import { nextPacificMidnight } from "./pacific";

export function exhaustedModels(rows: { model: string; exhaustedUntil: Date }[], now = new Date()): string[] {
  const at = now.getTime();
  return rows.filter((row) => row.exhaustedUntil.getTime() > at).map((row) => row.model);
}

export async function loadExhaustedModels(now = new Date()): Promise<string[]> {
  const rows = await prisma.modelQuota.findMany({
    where: { exhaustedUntil: { gt: now } },
    select: { model: true, exhaustedUntil: true },
  });
  return exhaustedModels(rows, now);
}

/** A daily-quota 429 keeps the model out of the chain until the next Pacific midnight. */
export async function markModelExhausted(model: string, now = new Date()): Promise<void> {
  const exhaustedUntil = nextPacificMidnight(now);
  await prisma.modelQuota.upsert({
    where: { model },
    create: { model, exhaustedUntil },
    update: { exhaustedUntil },
  });
}

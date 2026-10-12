import { hashPassword, setSessionCookie, signSession } from "@/lib/auth";
import { clientIp, consumeAuthAttempt, prismaCounterStore } from "@/lib/limits";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().min(3).max(160),
  password: z.string().min(8).max(72),
});

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success || !isEmail(parsed.data.email)) {
    return Response.json({ error: "INVALID_INPUT" }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase();
  const allowed = await consumeAuthAttempt(prismaCounterStore(), "register", clientIp(request), email).catch(() => false);
  if (!allowed) return Response.json({ error: "RATE_LIMIT" }, { status: 429 });
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return Response.json({ error: "EMAIL_TAKEN" }, { status: 409 });
  }
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(parsed.data.password),
    },
    select: { id: true, email: true, name: true },
  });
  await setSessionCookie(await signSession(user.id));
  return Response.json({ user });
}

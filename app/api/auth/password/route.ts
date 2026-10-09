import { hashPassword, readSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  currentPassword: z.string().min(1).max(72),
  nextPassword: z.string().min(8).max(72),
});

export async function POST(request: Request) {
  const user = await readSession();
  if (!user) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "INVALID_INPUT" }, { status: 400 });
  const record = await prisma.user.findUnique({ where: { id: user.id } });
  if (!record) return Response.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const matches = await verifyPassword(parsed.data.currentPassword, record.passwordHash);
  if (!matches) return Response.json({ error: "BAD_CREDENTIALS" }, { status: 401 });
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.nextPassword) },
  });
  return Response.json({ ok: true });
}

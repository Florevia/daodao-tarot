import { setSessionCookie, signSession, verifyAgainstDummy, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().min(3).max(160),
  password: z.string().min(1).max(72),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "INVALID_INPUT" }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    await verifyAgainstDummy(parsed.data.password);
    return Response.json({ error: "BAD_CREDENTIALS" }, { status: 401 });
  }
  const matches = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!matches) {
    return Response.json({ error: "BAD_CREDENTIALS" }, { status: 401 });
  }
  await setSessionCookie(await signSession(user.id));
  return Response.json({
    user: { id: user.id, email: user.email, name: user.name },
  });
}

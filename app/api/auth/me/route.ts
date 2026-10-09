import { readSession } from "@/lib/auth";
import { connection } from "next/server";

export async function GET() {
  await connection();
  const user = await readSession();
  return Response.json({ user });
}

import { readSession, type PublicUser } from "./auth";
import { isAdminEmail } from "./admin";

export async function readAdmin(): Promise<PublicUser | null> {
  const user = await readSession();
  if (!user || !isAdminEmail(user.email)) return null;
  return user;
}

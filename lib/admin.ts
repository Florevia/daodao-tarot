export function adminEmailSet(raw = process.env.ADMIN_EMAILS): Set<string> {
  return new Set(
    (raw ?? "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminEmail(email: string | null | undefined, raw = process.env.ADMIN_EMAILS): boolean {
  if (!email) return false;
  return adminEmailSet(raw).has(email.trim().toLowerCase());
}

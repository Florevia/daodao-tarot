import { createHash } from "node:crypto";
import { prisma } from "./prisma";
import { pacificDayKey } from "./pacific";

export const DEFAULT_AI_DAILY_LIMIT = 10;
export const DEFAULT_AI_SITE_CAP = 90;
export const DEFAULT_AUTH_ATTEMPTS = 10;
export const AUTH_WINDOW_MS = 15 * 60 * 1000;
export const DEFAULT_READING_WRITES = 30;
export const READING_WRITE_WINDOW_MS = 60 * 60 * 1000;
export const READING_KEEP = 500;

export type CounterStore = {
  increment(bucket: string, windowKey: string): Promise<number>;
};

export function memoryCounterStore(): CounterStore {
  const counts = new Map<string, number>();
  return {
    async increment(bucket, windowKey) {
      const key = `${bucket}\0${windowKey}`;
      const next = (counts.get(key) ?? 0) + 1;
      counts.set(key, next);
      return next;
    },
  };
}

export function prismaCounterStore(): CounterStore {
  return {
    async increment(bucket, windowKey) {
      const rows = await prisma.$queryRaw<{ count: number }[]>`
        INSERT INTO "RateBucket" ("id", "bucket", "windowKey", "count", "updatedAt")
        VALUES (${crypto.randomUUID()}, ${bucket}, ${windowKey}, 1, NOW())
        ON CONFLICT ("bucket", "windowKey")
        DO UPDATE SET "count" = "RateBucket"."count" + 1, "updatedAt" = NOW()
        RETURNING "count"
      `;
      return Number(rows[0]?.count ?? 1);
    },
  };
}

export function positiveInt(raw: string | undefined, fallback: number): number {
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 1) return fallback;
  return Math.floor(value);
}

export async function underLimit(store: CounterStore, bucket: string, windowKey: string, limit: number): Promise<boolean> {
  const count = await store.increment(bucket, windowKey);
  return count <= limit;
}

export function authWindowKey(now = Date.now()): string {
  return String(Math.floor(now / AUTH_WINDOW_MS));
}

export function hourWindowKey(now = Date.now()): string {
  return String(Math.floor(now / READING_WRITE_WINDOW_MS));
}

/** Per IP+device for the Pacific day, then the site-wide cap. Either one blocks the model. */
export async function consumeAiQuota(
  store: CounterStore,
  identity: string,
  now = new Date(),
  limits = {
    personal: positiveInt(process.env.AI_DAILY_LIMIT, DEFAULT_AI_DAILY_LIMIT),
    site: positiveInt(process.env.AI_SITE_DAILY_CAP, DEFAULT_AI_SITE_CAP),
  },
): Promise<"ok" | "user" | "site"> {
  const day = pacificDayKey(now);
  const personal = await underLimit(store, `ai:who:${identity}`, day, limits.personal);
  if (!personal) return "user";
  const site = await underLimit(store, "ai:site", day, limits.site);
  if (!site) return "site";
  return "ok";
}

export async function consumeAuthAttempt(
  store: CounterStore,
  kind: "login" | "register",
  ip: string,
  email: string,
  now = Date.now(),
  limit = positiveInt(process.env.AUTH_ATTEMPT_LIMIT, DEFAULT_AUTH_ATTEMPTS),
): Promise<boolean> {
  const windowKey = authWindowKey(now);
  const ipOk = await underLimit(store, `${kind}:ip:${ip}`, windowKey, limit);
  const emailOk = await underLimit(store, `${kind}:email:${email}`, windowKey, limit);
  return ipOk && emailOk;
}

export async function consumeReadingWrite(
  store: CounterStore,
  userId: string,
  now = Date.now(),
  limit = positiveInt(process.env.READING_WRITE_LIMIT, DEFAULT_READING_WRITES),
): Promise<boolean> {
  return underLimit(store, `reading:user:${userId}`, hourWindowKey(now), limit);
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip")?.trim() || "local";
  return ip.slice(0, 80);
}

export function deviceIdFrom(request: Request): string {
  const clean = (request.headers.get("x-daodao-device") ?? "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
  return clean || "none";
}

/** Stable guest key. The raw IP and device id are not stored. */
export function guestKey(ip: string, device: string): string {
  const salt = process.env.AUTH_SECRET || "dev-only-secret-daodao-tarot";
  return createHash("sha256").update(`${salt}|${ip}|${device}`).digest("hex").slice(0, 32);
}

export async function trimReadings(userId: string, keep = positiveInt(process.env.READING_KEEP, READING_KEEP)): Promise<void> {
  await prisma.$executeRaw`
    DELETE FROM "Reading"
    WHERE id IN (
      SELECT id FROM "Reading"
      WHERE "userId" = ${userId}
      ORDER BY "createdAt" DESC
      OFFSET ${keep}
    )
  `;
}

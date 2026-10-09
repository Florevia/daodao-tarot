import nextEnv from "@next/env";
import { spawnSync } from "node:child_process";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const placeholderUrl = "postgresql://placeholder:placeholder@127.0.0.1:5432/placeholder";

function run(command, args, env) {
  const result = spawnSync(command, args, { stdio: "inherit", env });
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function firstSet(names) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return "";
}

const databaseUrl = firstSet(["DATABASE_URL"]);
// Migrations need a direct connection. Hosted Postgres integrations often set
// DATABASE_URL to a pooler and expose the direct string under another name.
const migrateUrl = firstSet([
  "DIRECT_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "DATABASE_URL",
]);

const generateEnv = {
  ...process.env,
  DATABASE_URL: databaseUrl || placeholderUrl,
};

run("prisma", ["generate"], generateEnv);

if (migrateUrl) {
  console.log("Applying Prisma migrations (prisma migrate deploy)");
  run("prisma", ["migrate", "deploy"], { ...process.env, DATABASE_URL: migrateUrl });
} else {
  console.log("DATABASE_URL is not set; skipping prisma migrate deploy");
}

run("next", ["build"], databaseUrl ? process.env : generateEnv);

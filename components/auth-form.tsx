"use client";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { errorText, useI18n } from "@/lib/i18n";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { t } = useI18n();
  const { setUser } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const next = params.get("next") || "/history";

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const response = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = (await response.json()) as { user?: { id: string; email: string; name: string | null }; error?: string };
    setPending(false);
    if (!response.ok || !data.user) {
      setError(errorText(data.error ?? "", t));
      return;
    }
    setUser(data.user);
    router.push(next.startsWith("/") ? next : "/history");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-4xl text-primary">{mode === "login" ? t.loginTitle : t.registerTitle}</h1>
      <p className="mt-3 leading-7 text-muted-foreground">{mode === "login" ? t.loginLead : t.registerLead}</p>
      <form onSubmit={(event) => void submit(event)} className="mt-8 grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">{t.email}</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-11" data-testid="email" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">{t.password}</Label>
          <Input id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={mode === "register" ? 8 : 1} value={password} onChange={(event) => setPassword(event.target.value)} className="h-11" data-testid="password" />
          {mode === "register" ? <p className="text-xs text-muted-foreground">{t.passwordHint}</p> : null}
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" className="h-11" disabled={pending} data-testid="auth-submit">
          {mode === "login" ? t.submitLogin : t.submitRegister}
        </Button>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        {mode === "login" ? t.noAccount : t.hasAccount}{" "}
        <Link href={mode === "login" ? "/register" : "/login"} className="text-primary">
          {mode === "login" ? t.register : t.login}
        </Link>
      </p>
    </div>
  );
}

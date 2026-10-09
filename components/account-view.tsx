"use client";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { errorText, useI18n } from "@/lib/i18n";
import Link from "next/link";
import { useState, type FormEvent } from "react";

export function AccountView() {
  const { t } = useI18n();
  const { user, ready } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  if (!ready) return <p className="px-4 py-16 text-center text-muted-foreground">{t.loading}</p>;
  if (!user) {
    return (
      <div className="px-4 py-16 text-center">
        <p>{t.unauthorized}</p>
        <Link href="/login?next=/account" className="mt-4 inline-block text-primary">
          {t.login}
        </Link>
      </div>
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");
    const response = await fetch("/api/auth/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, nextPassword }),
    });
    const data = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(errorText(data.error ?? "", t));
      return;
    }
    setCurrentPassword("");
    setNextPassword("");
    setMessage(t.passwordChanged);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-4xl text-primary">{t.accountTitle}</h1>
      <p className="mt-3 leading-7 text-muted-foreground">{t.accountLead}</p>
      <p className="mt-6 rounded-2xl border border-primary/20 bg-card/50 px-4 py-3 text-sm">{user.email}</p>
      <form onSubmit={(event) => void submit(event)} className="mt-8 grid gap-4">
        <h2 className="text-lg">{t.changePassword}</h2>
        <div className="grid gap-2">
          <Label htmlFor="current">{t.currentPassword}</Label>
          <Input id="current" type="password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="h-11" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="next">{t.nextPassword}</Label>
          <Input id="next" type="password" required minLength={8} value={nextPassword} onChange={(event) => setNextPassword(event.target.value)} className="h-11" />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {message ? <p className="text-sm text-primary">{message}</p> : null}
        <Button type="submit" className="h-11" disabled={pending}>
          {t.changePassword}
        </Button>
      </form>
    </div>
  );
}

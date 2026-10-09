"use client";

import { useI18n } from "@/lib/i18n";
import Link from "next/link";

export function NotFoundView() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="font-display text-sm tracking-[0.35em] text-primary">404</p>
      <h1 className="mt-3 text-4xl text-primary">{t.notFound}</h1>
      <p className="mt-4 leading-7 text-muted-foreground">{t.notFoundBody}</p>
      <Link href="/" className="mt-6 inline-block text-primary">
        {t.backHome}
      </Link>
    </div>
  );
}

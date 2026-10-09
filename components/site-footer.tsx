"use client";

import { useI18n } from "@/lib/i18n";
import Link from "next/link";

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="mt-16 border-t border-primary/20">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-primary">
            {t.brand}
            <span className="ml-2 font-display tracking-[0.2em]">{t.brandEn}</span>
          </p>
          <p className="mt-2 max-w-xl leading-6">{t.footerDisclaimer}</p>
        </div>
        <div className="space-y-1 sm:text-right">
          <p>{t.footerArt}</p>
          <Link href="/cards" className="text-primary hover:underline">
            {t.browseCards}
          </Link>
        </div>
      </div>
    </footer>
  );
}

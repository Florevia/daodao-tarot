"use client";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/lib/i18n";
import { cn } from "cn";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/reading", key: "navRead" },
  { href: "/cards", key: "navCards" },
  { href: "/history", key: "navHistory" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, locale, setLocale } = useI18n();
  const { user, setUser } = useAuth();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-primary/20 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Link href="/" className="mr-auto min-w-36">
          <span className="block text-xl leading-none text-primary">{t.brand}</span>
          <span className="font-display text-[11px] tracking-[0.32em] text-muted-foreground">
            {t.brandEn.toUpperCase()}
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm transition-colors",
                  active ? "bg-primary/15 text-primary" : "text-foreground/80 hover:text-primary",
                )}
              >
                {t[link.key]}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-8 px-3"
            aria-label={t.langLabel}
            onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
            data-testid="lang-toggle"
          >
            {locale === "zh" ? "EN" : "中文"}
          </Button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="outline" className="h-8 max-w-40 truncate px-3" />}
              >
                {user.email}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push("/account")}>{t.navAccount}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => void logout()}>{t.logout}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button render={<Link href="/login" />} className="h-8 px-3" variant="secondary">
              {t.login}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

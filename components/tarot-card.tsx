"use client";

import type { Card } from "@/lib/cards";
import { cn } from "cn";
import Image from "next/image";
import { useState, type ReactNode } from "react";

export function CardBack() {
  return (
    <div className="card-back">
      <div className="card-back-frame">
        <svg viewBox="0 0 64 64" className="size-10 text-primary" aria-hidden>
          <path
            d="M40 12c-8 2-16 10-16 20s8 18 16 20c-10-2-18-10-18-20S30 14 40 12z"
            fill="currentColor"
          />
          <circle cx="46" cy="14" r="2.2" fill="currentColor" />
          <path d="M18 32h10M32 18v10" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        <span className="font-display text-sm tracking-[0.35em] text-primary">叨叨</span>
      </div>
    </div>
  );
}

export function TarotFace({
  card,
  reversed,
  name,
}: {
  card: Card;
  reversed: boolean;
  name: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative h-full w-full bg-[#140e12]">
      {failed ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 px-3 text-center">
          <span className="font-display text-2xl text-primary">{card.number}</span>
          <span className="text-sm text-primary">{name}</span>
        </div>
      ) : (
        <Image
          src={card.image}
          alt={name}
          fill
          sizes="(max-width: 768px) 42vw, 160px"
          className={cn("object-cover", reversed && "rotate-180")}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

export function FlipCard({
  revealed,
  label,
  kicker,
  name,
  orientation,
  onClick,
  children,
}: {
  revealed: boolean;
  label: string;
  kicker?: string;
  name?: string;
  orientation?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button type="button" className="slot-button" onClick={onClick} aria-label={label}>
      <div className="flip-scene">
        <div className={cn("flip-inner", revealed && "is-flipped")}>
          <div className="flip-face">
            <CardBack />
          </div>
          <div className="flip-face flip-front">{children}</div>
        </div>
      </div>
      <span className="slot-kicker">{kicker ?? label}</span>
      <span className={cn("slot-caption", !name && "invisible")}>
        {name ? `${name} · ${orientation}` : "·"}
      </span>
    </button>
  );
}

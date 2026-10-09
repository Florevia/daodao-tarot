import type { Card, CardText, Rank, Suit } from "./types";

const RANKS: { rank: Rank; zh: string; en: string }[] = [
  { rank: "ace", zh: "王牌", en: "Ace" },
  { rank: "2", zh: "二", en: "Two" },
  { rank: "3", zh: "三", en: "Three" },
  { rank: "4", zh: "四", en: "Four" },
  { rank: "5", zh: "五", en: "Five" },
  { rank: "6", zh: "六", en: "Six" },
  { rank: "7", zh: "七", en: "Seven" },
  { rank: "8", zh: "八", en: "Eight" },
  { rank: "9", zh: "九", en: "Nine" },
  { rank: "10", zh: "十", en: "Ten" },
  { rank: "page", zh: "侍从", en: "Page" },
  { rank: "knight", zh: "骑士", en: "Knight" },
  { rank: "queen", zh: "王后", en: "Queen" },
  { rank: "king", zh: "国王", en: "King" },
];

const SUITS = {
  wands: { zh: "权杖", en: "Wands", element: "fire" },
  cups: { zh: "圣杯", en: "Cups", element: "water" },
  swords: { zh: "宝剑", en: "Swords", element: "air" },
  pentacles: { zh: "星币", en: "Pentacles", element: "earth" },
} as const;

export function minor(suit: Suit, number: number, text: CardText): Card {
  const rank = RANKS[number - 1];
  if (!rank) {
    throw new Error(`Minor rank out of range: ${suit} ${number}`);
  }
  const meta = SUITS[suit];
  const id = `${suit}-${String(number).padStart(2, "0")}`;
  return {
    id,
    arcana: "minor",
    suit,
    number,
    rank: rank.rank,
    element: meta.element,
    image: `/cards/${id}.jpg`,
    name: {
      zh: `${meta.zh}${rank.zh}`,
      en: `${rank.en} of ${meta.en}`,
    },
    ...text,
  };
}

export function major(number: number, name: Card["name"], text: CardText): Card {
  const id = `major-${String(number).padStart(2, "0")}`;
  return {
    id,
    arcana: "major",
    suit: null,
    number,
    rank: null,
    element: null,
    image: `/cards/${id}.jpg`,
    name,
    ...text,
  };
}

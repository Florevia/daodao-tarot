export type Locale = "zh" | "en";

export type Localized = {
  zh: string;
  en: string;
};

export type Suit = "wands" | "cups" | "swords" | "pentacles";

export type ElementName = "fire" | "water" | "air" | "earth";

export type Rank =
  | "ace"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "page"
  | "knight"
  | "queen"
  | "king";

export type Card = {
  id: string;
  arcana: "major" | "minor";
  suit: Suit | null;
  number: number;
  rank: Rank | null;
  element: ElementName | null;
  image: string;
  name: Localized;
  keywords: { zh: string[]; en: string[] };
  description: Localized;
  upright: Localized;
  reversed: Localized;
};

export type CardText = Pick<Card, "keywords" | "description" | "upright" | "reversed">;

export type TopicKey = "general" | "love" | "career" | "resources" | "advice";

export type TopicSet = Record<TopicKey, Localized>;

import { cups } from "./cups";
import { majorArcana } from "./major";
import { pentacles } from "./pentacles";
import { swords } from "./swords";
import { attachTopics, type RichCard } from "./topics";
import type { Suit } from "./types";
import { wands } from "./wands";

export type { CardText, ElementName, Locale, Localized, Rank, Suit, TopicKey, TopicSet } from "./types";
export type { RichCard };
export type Card = RichCard;

export const cards: Card[] = [
  ...majorArcana,
  ...wands,
  ...cups,
  ...swords,
  ...pentacles,
].map(attachTopics);

const byId = new Map(cards.map((card) => [card.id, card]));

export function getCard(id: string): Card | undefined {
  return byId.get(id);
}

export function requireCard(id: string): Card {
  const card = byId.get(id);
  if (!card) {
    throw new Error(`Unknown card: ${id}`);
  }
  return card;
}

export const suitOrder: Suit[] = ["wands", "cups", "swords", "pentacles"];

export function cardsInSuit(suit: Suit): Card[] {
  return cards.filter((card) => card.suit === suit);
}

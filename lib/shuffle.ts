import { cards } from "./cards";
import { getSpread, type Spread } from "./spreads";

export type DrawnCard = {
  positionId: string;
  cardId: string;
  reversed: boolean;
};

export type ShuffledCard = {
  cardId: string;
  reversed: boolean;
};

export const REVERSAL_RATE = 0.3;

export function shuffleDeck<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    const current = next[index] as T;
    next[index] = next[swap] as T;
    next[swap] = current;
  }
  return next;
}

export function prepareDeck(random: () => number = Math.random): ShuffledCard[] {
  return shuffleDeck(cards, random).map((card) => ({
    cardId: card.id,
    reversed: random() < REVERSAL_RATE,
  }));
}

export function createReading(spread: Spread, random: () => number = Math.random): DrawnCard[] {
  const deck = prepareDeck(random);
  return spread.positions.map((position, index) => {
    const card = deck[index] as ShuffledCard;
    return {
      positionId: position.id,
      cardId: card.cardId,
      reversed: card.reversed,
    };
  });
}

export function placePickedCards(spread: Spread, deck: readonly ShuffledCard[], pickedIds: readonly string[]): DrawnCard[] {
  if (pickedIds.length !== spread.positions.length) {
    throw new Error(`Expected ${spread.positions.length} picks for ${spread.id}`);
  }
  const byId = new Map(deck.map((card) => [card.cardId, card]));
  const seen = new Set<string>();
  return spread.positions.map((position, index) => {
    const cardId = pickedIds[index] as string;
    const card = byId.get(cardId);
    if (!card || seen.has(cardId)) {
      throw new Error(`Invalid pick ${cardId} for ${spread.id}`);
    }
    seen.add(cardId);
    return {
      positionId: position.id,
      cardId: card.cardId,
      reversed: card.reversed,
    };
  });
}

export function createReadingById(spreadId: string, random: () => number = Math.random): DrawnCard[] {
  const spread = getSpread(spreadId);
  if (!spread) {
    throw new Error(`Unknown spread: ${spreadId}`);
  }
  return createReading(spread, random);
}

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let next = state;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

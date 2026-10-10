import { majorTopics } from "./major-topics";
import { minorTopics } from "./minor-topics";
import type { Card, Localized, TopicKey, TopicSet } from "./types";

export type RichCard = Card & {
  topics: {
    upright: TopicSet;
    reversed: TopicSet;
  };
};

function domainCopy(card: Card, orient: "upright" | "reversed", key: Exclude<TopicKey, "general">): Localized {
  if (card.arcana === "major") {
    const hand = majorTopics[card.id];
    if (!hand) {
      throw new Error(`Missing major topics for ${card.id}`);
    }
    return hand[orient][key];
  }
  const hand = minorTopics[card.id];
  if (!hand) {
    throw new Error(`Missing minor topics for ${card.id}`);
  }
  return hand[orient][key];
}

function topicSet(card: Card, orient: "upright" | "reversed"): TopicSet {
  return {
    general: card[orient],
    love: domainCopy(card, orient, "love"),
    career: domainCopy(card, orient, "career"),
    resources: domainCopy(card, orient, "resources"),
    advice: domainCopy(card, orient, "advice"),
  };
}

export function attachTopics(card: Card): RichCard {
  return {
    ...card,
    topics: {
      upright: topicSet(card, "upright"),
      reversed: topicSet(card, "reversed"),
    },
  };
}

import { majorTopics } from "./major-topics";
import { rankVoice, suitVoice } from "./minor-voice";
import type { Card, Localized, TopicKey, TopicSet } from "./types";

const topicName: Record<Exclude<TopicKey, "general">, Localized> = {
  love: { zh: "感情", en: "love" },
  career: { zh: "事业", en: "work" },
  resources: { zh: "身心、金钱与成长", en: "the body, money, and growth" },
  advice: { zh: "可以怎么做", en: "what to do" },
};

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
  if (!card.rank || !card.suit) {
    throw new Error(`Minor card is missing rank or suit: ${card.id}`);
  }
  const rankLine = rankVoice[card.rank][orient][key];
  const suitLine = suitVoice[card.suit][orient][key];
  const words = card.keywords;
  return {
    zh: `${card.name.zh}谈到${topicName[key].zh}时，围绕${words.zh.join("、")}。${rankLine.zh}${suitLine.zh}`,
    en: `When ${card.name.en} speaks of ${topicName[key].en}, it circles ${words.en.join(", ")}. ${rankLine.en} ${suitLine.en}`,
  };
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

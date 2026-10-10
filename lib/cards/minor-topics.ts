import { cupsTopics } from "./minor-topics-cups";
import { pentaclesTopics } from "./minor-topics-pentacles";
import { swordsTopics } from "./minor-topics-swords";
import { wandsTopics } from "./minor-topics-wands";
import type { DomainCopy } from "./major-topics";

export const minorTopics: Record<string, { upright: DomainCopy; reversed: DomainCopy }> = {
  ...wandsTopics,
  ...cupsTopics,
  ...swordsTopics,
  ...pentaclesTopics,
};

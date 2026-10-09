import type { Localized } from "./cards/types";

export type SpreadPosition = {
  id: string;
  name: Localized;
  description: Localized;
};

export type SpreadLayout = "single" | "three" | "love" | "career" | "celtic";

export type Spread = {
  id: string;
  layout: SpreadLayout;
  name: Localized;
  description: Localized;
  positions: SpreadPosition[];
};

export const spreads: Spread[] = [
  {
    id: "single",
    layout: "single",
    name: { zh: "每日一牌", en: "Daily card" },
    description: {
      zh: "一张牌，看今天最值得留意的主题。",
      en: "One card for the theme most worth noticing today.",
    },
    positions: [
      {
        id: "guidance",
        name: { zh: "今日指引", en: "Today's guidance" },
        description: {
          zh: "这张牌概括此刻最想被你看见的事情。",
          en: "This card names what most wants to be seen right now.",
        },
      },
    ],
  },
  {
    id: "three",
    layout: "three",
    name: { zh: "三牌阵", en: "Three cards" },
    description: {
      zh: "过去、现在、未来，一条简单的时间线。",
      en: "Past, present, and future on a simple line.",
    },
    positions: [
      {
        id: "past",
        name: { zh: "过去", en: "Past" },
        description: {
          zh: "已经成形、仍在影响当下的力量。",
          en: "What has already taken shape and still touches the present.",
        },
      },
      {
        id: "present",
        name: { zh: "现在", en: "Present" },
        description: {
          zh: "你正站着的位置。",
          en: "The place where you are standing.",
        },
      },
      {
        id: "future",
        name: { zh: "未来", en: "Future" },
        description: {
          zh: "若沿着当前的轨迹，正在显影的方向。",
          en: "The direction developing if the current path continues.",
        },
      },
    ],
  },
  {
    id: "love",
    layout: "love",
    name: { zh: "关系牌阵", en: "Relationship" },
    description: {
      zh: "看你、对方、连接、张力、建议与走向。",
      en: "You, them, the bond, the tension, advice, and where it leans.",
    },
    positions: [
      {
        id: "you",
        name: { zh: "你的状态", en: "You" },
        description: {
          zh: "你带进这段关系里的心情与需要。",
          en: "The mood and need you bring into the bond.",
        },
      },
      {
        id: "them",
        name: { zh: "对方的状态", en: "The other" },
        description: {
          zh: "对方此刻可能在经历的情感位置。",
          en: "The emotional place the other person may be in.",
        },
      },
      {
        id: "bond",
        name: { zh: "彼此的连接", en: "The bond" },
        description: {
          zh: "你们之间实际存在的那根线。",
          en: "The thread that actually exists between you.",
        },
      },
      {
        id: "tension",
        name: { zh: "张力与挑战", en: "Tension" },
        description: {
          zh: "让关系发紧的地方。",
          en: "Where the relationship pulls tight.",
        },
      },
      {
        id: "advice",
        name: { zh: "牌的建议", en: "Advice" },
        description: {
          zh: "眼下更有用的态度或动作。",
          en: "The attitude or move that would help now.",
        },
      },
      {
        id: "outlook",
        name: { zh: "关系走向", en: "Outlook" },
        description: {
          zh: "若维持当前的方式，关系会朝哪里长。",
          en: "Where the bond grows if the current way continues.",
        },
      },
    ],
  },
  {
    id: "career",
    layout: "career",
    name: { zh: "事业牌阵", en: "Career" },
    description: {
      zh: "从处境、隐藏因素、力量、障碍到下一步。",
      en: "Situation, hidden factor, strength, obstacle, and the next step.",
    },
    positions: [
      {
        id: "now",
        name: { zh: "当前处境", en: "The situation" },
        description: {
          zh: "工作或事业此刻的表面天气。",
          en: "The visible weather of the work right now.",
        },
      },
      {
        id: "hidden",
        name: { zh: "隐藏因素", en: "Hidden factor" },
        description: {
          zh: "还没被说清、却在影响局面的东西。",
          en: "What is shaping the situation without being named.",
        },
      },
      {
        id: "strength",
        name: { zh: "可用的力量", en: "Strength" },
        description: {
          zh: "你已经拥有、可以拿来用的资源。",
          en: "A resource you already have and can use.",
        },
      },
      {
        id: "block",
        name: { zh: "障碍", en: "Obstacle" },
        description: {
          zh: "让进展变慢的具体阻力。",
          en: "The concrete drag on progress.",
        },
      },
      {
        id: "counsel",
        name: { zh: "建议与走向", en: "Counsel" },
        description: {
          zh: "接下来更值得采取的方向。",
          en: "The direction most worth taking next.",
        },
      },
    ],
  },
  {
    id: "celtic",
    layout: "celtic",
    name: { zh: "凯尔特十字", en: "Celtic Cross" },
    description: {
      zh: "十张牌，从现状、挑战到环境与结果。",
      en: "Ten cards, from the situation and the challenge through the setting and the outcome.",
    },
    positions: [
      {
        id: "present",
        name: { zh: "现状", en: "Present" },
        description: {
          zh: "问题的中心，你现在所处的位置。",
          en: "The center of the question and where you stand.",
        },
      },
      {
        id: "challenge",
        name: { zh: "交叉", en: "Challenge" },
        description: {
          zh: "横在现状上的力量，它在推动或阻碍。",
          en: "The force lying across the present, pushing or blocking.",
        },
      },
      {
        id: "foundation",
        name: { zh: "根基", en: "Foundation" },
        description: {
          zh: "更深处的原因，事情站立的地面。",
          en: "The deeper cause, the ground the matter stands on.",
        },
      },
      {
        id: "past",
        name: { zh: "近期过去", en: "Recent past" },
        description: {
          zh: "刚刚离开、仍牵着你的一段。",
          en: "What just left and is still holding your sleeve.",
        },
      },
      {
        id: "crown",
        name: { zh: "可能", en: "Crown" },
        description: {
          zh: "意识里的目标，或事情最好的可能。",
          en: "The aim in mind, or the best possibility in view.",
        },
      },
      {
        id: "future",
        name: { zh: "近期未来", en: "Near future" },
        description: {
          zh: "若不转向，很快会到来的发展。",
          en: "What arrives soon if you do not turn.",
        },
      },
      {
        id: "self",
        name: { zh: "你的态度", en: "Your stance" },
        description: {
          zh: "你自己如何面对这件事。",
          en: "How you yourself are meeting this.",
        },
      },
      {
        id: "environment",
        name: { zh: "环境", en: "Environment" },
        description: {
          zh: "周围的人、场所和气氛。",
          en: "The people, place, and atmosphere around you.",
        },
      },
      {
        id: "hopes",
        name: { zh: "希望与恐惧", en: "Hopes and fears" },
        description: {
          zh: "你又盼又怕的那一件，常常是同一件事。",
          en: "What you hope for and fear, often the same thing.",
        },
      },
      {
        id: "outcome",
        name: { zh: "结果", en: "Outcome" },
        description: {
          zh: "若各张牌的力量继续作用，事情会落在哪里。",
          en: "Where the matter lands if these forces keep working.",
        },
      },
    ],
  },
];

const byId = new Map(spreads.map((spread) => [spread.id, spread]));

export function getSpread(id: string): Spread | undefined {
  return byId.get(id);
}

export function isSpreadId(id: string | null | undefined): id is string {
  return Boolean(id && byId.has(id));
}

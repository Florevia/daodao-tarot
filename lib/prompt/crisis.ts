import type { Locale } from "../cards/index";
import type { AiReading } from "../ai-reading";

/**
 * Support text for a crisis question. No card is named or interpreted.
 * The route returns this instead of calling Gemini.
 */
export function buildCrisisReading(positions: { id: string }[], locale: Locale): AiReading {
  if (locale === "en") {
    return {
      overview:
        "You are in real pain, and that pain is real. I am only a card reader, so I am not reading these cards. Please talk to someone you trust right now. In China, the national psychological assistance line is 12356. If you are in immediate danger, call 110 or 120, or your local emergency number.",
      cards: positions.map((position) => ({
        positionId: position.id,
        body: "This card stays unread. What matters now is that another person knows you are hurting.",
      })),
      connection:
        "Please say this out loud to someone you trust, and let them stay with you. The national psychological assistance line is 12356. If you are in immediate danger, call 110 or 120.",
      conclusion: "Right now, call 12356, or send one message to someone you trust: I am not okay and I need you with me.",
    };
  }
  return {
    overview:
      "你现在很痛，这是真的。我只是一个解牌的人，帮不了这场危机，所以这次不看牌。请现在就联系一个你信任的人。全国心理援助热线是 12356。如果有立即的危险，打 110 或 120。",
    cards: positions.map((position) => ({
      positionId: position.id,
      body: "这张先放下。现在要做的不是解牌，是让一个信任的人知道你有多痛。",
    })),
    connection:
      "请把这句话告诉一个你信任的人，让他陪着你。全国心理援助热线是 12356。如果有立即的危险，打 110 或 120。",
    conclusion: "现在就拨打 12356，或给一个信任的人发一条：我现在很不好，需要你陪着。",
  };
}

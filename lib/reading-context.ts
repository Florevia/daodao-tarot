import type { Locale, TopicKey } from "./cards/types";

export type ContextKey = "status" | "focus" | "area" | "mood" | "theme";

export type ReadingContext = Partial<Record<ContextKey, string>>;

export type ContextOption = {
  id: string;
  zh: string;
  en: string;
};

export type ContextGroup = {
  key: ContextKey;
  required: boolean;
  label: { zh: string; en: string };
  options: ContextOption[];
};

const loveGroups: ContextGroup[] = [
  {
    key: "status",
    required: true,
    label: { zh: "关系状态", en: "Where things stand" },
    options: [
      { id: "single", zh: "单身", en: "Single" },
      { id: "talking", zh: "暧昧中", en: "Talking" },
      { id: "dating", zh: "恋爱中", en: "Dating" },
      { id: "partnered", zh: "已婚或同居", en: "Married or living together" },
      { id: "split", zh: "刚分手或复合边缘", en: "Just split, or near a reunion" },
      { id: "private", zh: "不方便说", en: "Rather not say" },
    ],
  },
  {
    key: "focus",
    required: true,
    label: { zh: "这次最想看", en: "What to look at" },
    options: [
      { id: "feelings", zh: "对方心意", en: "Their feelings" },
      { id: "direction", zh: "关系走向", en: "Where it is going" },
      { id: "continue", zh: "要不要继续", en: "Whether to continue" },
      { id: "reunion", zh: "复合可能", en: "Chance of reunion" },
      { id: "other", zh: "其他", en: "Something else" },
    ],
  },
];

const careerGroups: ContextGroup[] = [
  {
    key: "status",
    required: true,
    label: { zh: "工作状态", en: "Work situation" },
    options: [
      { id: "steady", zh: "在职稳定", en: "Employed and steady" },
      { id: "switching", zh: "在职但想换", en: "Employed, wanting a change" },
      { id: "seeking", zh: "求职中", en: "Job hunting" },
      { id: "freelance", zh: "创业或自由职业", en: "Building a business or freelance" },
      { id: "student", zh: "学生", en: "Student" },
      { id: "other", zh: "其他", en: "Something else" },
    ],
  },
  {
    key: "focus",
    required: true,
    label: { zh: "这次最想看", en: "What to look at" },
    options: [
      { id: "promotion", zh: "升职加薪", en: "Promotion or pay" },
      { id: "timing", zh: "跳槽时机", en: "When to move" },
      { id: "people", zh: "同事领导", en: "Colleagues or a manager" },
      { id: "direction", zh: "方向选择", en: "Which direction" },
      { id: "other", zh: "其他", en: "Something else" },
    ],
  },
];

const generalGroups: ContextGroup[] = [
  {
    key: "area",
    required: true,
    label: { zh: "这件事主要在", en: "This is mostly about" },
    options: [
      { id: "love", zh: "感情", en: "Love" },
      { id: "career", zh: "事业学业", en: "Work or study" },
      { id: "money", zh: "金钱", en: "Money" },
      { id: "health", zh: "健康身心", en: "Health and mind" },
      { id: "people", zh: "人际关系", en: "People around you" },
      { id: "general", zh: "综合", en: "The whole picture" },
    ],
  },
  {
    key: "mood",
    required: true,
    label: { zh: "此刻心情", en: "Mood right now" },
    options: [
      { id: "anxious", zh: "焦虑", en: "Anxious" },
      { id: "lost", zh: "迷茫", en: "Unsure" },
      { id: "hopeful", zh: "期待", en: "Hopeful" },
      { id: "calm", zh: "平静", en: "Calm" },
      { id: "other", zh: "其他", en: "Something else" },
    ],
  },
];

const dailyGroups: ContextGroup[] = [
  {
    key: "theme",
    required: false,
    label: { zh: "今天想看哪一面", en: "What today is for" },
    options: [
      { id: "fortune", zh: "今日运势", en: "The day's weather" },
      { id: "love", zh: "感情", en: "Love" },
      { id: "work", zh: "工作", en: "Work" },
      { id: "health", zh: "健康", en: "Health" },
      { id: "inspiration", zh: "灵感", en: "Inspiration" },
    ],
  },
];

export function contextGroups(spreadId: string): ContextGroup[] {
  if (spreadId === "love") return loveGroups;
  if (spreadId === "career") return careerGroups;
  if (spreadId === "single") return dailyGroups;
  return generalGroups;
}

export function contextComplete(spreadId: string, context: ReadingContext | null | undefined): boolean {
  const value = context ?? {};
  return contextGroups(spreadId).every((group) => !group.required || Boolean(value[group.key]));
}

export function sanitizeContext(spreadId: string, raw: unknown): ReadingContext {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const next: ReadingContext = {};
  for (const group of contextGroups(spreadId)) {
    const value = source[group.key];
    if (typeof value === "string" && group.options.some((option) => option.id === value)) {
      next[group.key] = value;
    }
  }
  return next;
}

export function contextLabel(spreadId: string, context: ReadingContext | null | undefined, locale: Locale): string {
  if (!context) return "";
  const parts = contextGroups(spreadId).flatMap((group) => {
    const option = group.options.find((item) => item.id === context[group.key]);
    return option ? [option[locale]] : [];
  });
  return parts.join(" · ");
}

function optionText(groups: ContextGroup[], key: ContextKey, id: string | undefined, locale: Locale): string {
  const option = groups.find((group) => group.key === key)?.options.find((item) => item.id === id);
  return option ? option[locale] : "";
}

export function contextTopic(spreadId: string, context?: ReadingContext | null): Exclude<TopicKey, "advice"> {
  const area = context?.area;
  const theme = context?.theme;
  if (spreadId === "love" || area === "love" || theme === "love") return "love";
  if (spreadId === "career" || area === "career" || theme === "work") return "career";
  if (area === "money") return "resources";
  if (area === "health" || area === "people" || theme === "health" || theme === "inspiration" || theme === "fortune") {
    return "general";
  }
  if (spreadId === "love") return "love";
  if (spreadId === "career") return "career";
  return "resources";
}

export function contextPositionLead(spreadId: string, context: ReadingContext | null | undefined, locale: Locale): string {
  if (!context || Object.keys(context).length === 0) return "";
  if (locale === "zh") return zhLead(spreadId, context);
  return enLead(spreadId, context);
}

export function contextClosing(spreadId: string, context: ReadingContext | null | undefined, locale: Locale): string {
  if (!context || Object.keys(context).length === 0) return "";
  if (locale === "zh") return zhClosing(spreadId, context);
  return enClosing(spreadId, context);
}

function zhLead(spreadId: string, context: ReadingContext): string {
  if (spreadId === "love") {
    const status = context.status;
    if (status === "partnered") return "按已婚或同居来读，不把这张牌说成要不要开始一段新的恋爱。";
    if (status === "single") return "按单身来读，看的是要不要靠近一段新的关系，而不是已有婚姻里的日常。";
    if (status === "talking") return "按暧昧未定来读，先看心意和分寸，不把它当成已经说定的伴侣关系。";
    if (status === "dating") return "按正在恋爱来读，谈的是这段已经开始的关系，不是从零开始约会。";
    if (status === "split") return "按刚分手或复合边缘来读，谈的是分开后的拉力，不是去认识一个陌生人。";
    if (status === "private") return "关系状态没有说明，所以只按牌面谈关系，不假设单身或已婚。";
  }
  if (spreadId === "career") {
    const status = context.status;
    if (status === "steady") return "按在职且相对稳定来读，先看这份工作里的位置，不一上来就当成必须离职。";
    if (status === "switching") return "按在职但想换来读，重点是时机和代价，不是假装你已经没有工作。";
    if (status === "seeking") return "按求职中来读，看的是机会、节奏和准备，不是一份已经坐稳的岗位。";
    if (status === "freelance") return "按创业或自由职业来读，谈的是自己的事和客户，不是公司里的职级。";
    if (status === "student") return "按学生来读，升职加薪在这里是学业上的进展和被看见，不是公司职级。";
    if (status === "other") return "工作状态选了其他，所以不套用某一种固定岗位。";
  }
  if (spreadId === "single") {
    const theme = optionText(dailyGroups, "theme", context.theme, "zh");
    return theme ? `今天你想看的是${theme}。` : "";
  }
  const area = optionText(generalGroups, "area", context.area, "zh");
  const mood = optionText(generalGroups, "mood", context.mood, "zh");
  if (!area && !mood) return "";
  return `这件事主要在${area || "综合"}，此刻的心情是${mood || "未说明"}。`;
}

function enLead(spreadId: string, context: ReadingContext): string {
  if (spreadId === "love") {
    const status = context.status;
    if (status === "partnered") return "Read this as a marriage or a shared home, not as a question of whether to start dating.";
    if (status === "single") return "Read this as someone single, looking at a new closeness, not at the daily life of a marriage.";
    if (status === "talking") return "Read this as an unnamed attraction. Look at feeling and pace, not at a settled partnership.";
    if (status === "dating") return "Read this as a relationship that has already begun, not as a first date from nothing.";
    if (status === "split") return "Read this as a recent split or the edge of reunion, not as meeting a stranger.";
    if (status === "private") return "The relationship was left unnamed, so do not assume single or married.";
  }
  if (spreadId === "career") {
    const status = context.status;
    if (status === "steady") return "Read this as steady employment. Look at the place you already have before treating leaving as required.";
    if (status === "switching") return "Read this as employed and wanting a change. The question is timing and cost, not an empty desk.";
    if (status === "seeking") return "Read this as a job search: openings, pace, and preparation, not a post you already hold.";
    if (status === "freelance") return "Read this as a business or freelance practice, not a corporate rank.";
    if (status === "student") return "Read this as a student. Promotion here means progress and being seen in your studies, not a job title.";
    if (status === "other") return "The work situation was marked as something else, so do not force one kind of job onto it.";
  }
  if (spreadId === "single") {
    const theme = optionText(dailyGroups, "theme", context.theme, "en");
    return theme ? `Today you asked to look at ${theme.toLowerCase()}.` : "";
  }
  const area = optionText(generalGroups, "area", context.area, "en");
  const mood = optionText(generalGroups, "mood", context.mood, "en");
  if (!area && !mood) return "";
  return `This is mostly about ${area || "the whole picture"}, and the mood is ${mood || "unnamed"}.`;
}

function zhClosing(spreadId: string, context: ReadingContext): string {
  const focus = optionText(spreadId === "career" ? careerGroups : loveGroups, "focus", context.focus, "zh");
  if (spreadId === "love") {
    const status = optionText(loveGroups, "status", context.status, "zh");
    const guard =
      context.status === "partnered"
        ? "不要把它读成「要不要开始约会」。你们已经在一起，要看的是这段关系怎么过、什么在磨损、以及你标出的焦点。"
        : context.status === "single"
          ? "不要把它读成已婚同居的家务。你还没有进入那样的日常。"
          : context.status === "split"
            ? "复合在这里是要不要回到这个人，不是去开始另一段全新的追求。"
            : "";
    const look = focus ? `你最想看的是${focus}。` : "";
    return `你给出的情况是${status}。${look}${guard}`;
  }
  if (spreadId === "career") {
    const status = optionText(careerGroups, "status", context.status, "zh");
    const guard =
      context.status === "student"
        ? "不要把建议写成公司里的升职流程。"
        : context.status === "seeking"
          ? "不要把建议写成你已经坐在那份工作里。"
          : context.status === "steady"
            ? "不要一上来就劝你必须辞职。"
            : context.status === "freelance"
              ? "不要把建议写成向上司请假或等公司调岗。"
              : "";
    const look = focus ? `你最想看的是${focus}。` : "";
    return `你给出的工作状态是${status}。${look}${guard}`;
  }
  if (spreadId === "single") {
    const theme = optionText(dailyGroups, "theme", context.theme, "zh");
    return theme ? `今日的焦点收在${theme}，不必把一张牌展开成整个人生。` : "";
  }
  const area = optionText(generalGroups, "area", context.area, "zh");
  const mood = optionText(generalGroups, "mood", context.mood, "zh");
  return `读的时候把牌收在「${area}」里，并记得你现在的心情是${mood}。语气跟着这个心情走，不要用另一件人生大事替换它。`;
}

function enClosing(spreadId: string, context: ReadingContext): string {
  const focus = optionText(spreadId === "career" ? careerGroups : loveGroups, "focus", context.focus, "en");
  if (spreadId === "love") {
    const status = optionText(loveGroups, "status", context.status, "en");
    const guard =
      context.status === "partnered"
        ? " Do not frame this as whether to start dating. The relationship already exists."
        : context.status === "single"
          ? " Do not frame this as the housework of a marriage."
          : context.status === "split"
            ? " Reunion here means returning to this person, not starting a chase with someone new."
            : "";
    const look = focus ? ` What you most want to see is ${focus.toLowerCase()}.` : "";
    return `You described the relationship as ${status}.${look}${guard}`;
  }
  if (spreadId === "career") {
    const status = optionText(careerGroups, "status", context.status, "en");
    const guard =
      context.status === "student"
        ? " Do not write the advice as a corporate promotion process."
        : context.status === "seeking"
          ? " Do not write the advice as if you already sit in the job."
          : context.status === "steady"
            ? " Do not open by insisting you must resign."
            : context.status === "freelance"
              ? " Do not write the advice as asking a manager for leave or a transfer."
              : "";
    const look = focus ? ` What you most want to see is ${focus.toLowerCase()}.` : "";
    return `You described the work as ${status}.${look}${guard}`;
  }
  if (spreadId === "single") {
    const theme = optionText(dailyGroups, "theme", context.theme, "en");
    return theme ? `Keep today on ${theme.toLowerCase()}, rather than opening one card into a whole life.` : "";
  }
  const area = optionText(generalGroups, "area", context.area, "en");
  const mood = optionText(generalGroups, "mood", context.mood, "en");
  return `Keep the cards inside ${area}, and remember the mood is ${mood}. Do not swap in some other life event.`;
}

/**
 * Builds data/cases.json: 100 worked readings grounded in the card knowledge base.
 * Run with: npx tsx scripts/author-cases.ts
 */
import { writeFileSync } from "node:fs";
import { cards, type Card } from "../lib/cards/index";
import { contextGroups, contextTopic, type ReadingContext } from "../lib/reading-context";
import { getSpread } from "../lib/spreads";

type Tone = "open" | "hard";

type Plan = {
  id: string;
  title: string;
  titleEn: string;
  question: string;
  spreadId: "love" | "career" | "three" | "celtic" | "single";
  context: ReadingContext;
  tone: Tone;
};

type CaseCard = {
  positionId: string;
  cardId: string;
  reversed: boolean;
  body: string;
};

type ReadingCase = {
  id: string;
  title: string;
  titleEn: string;
  question: string;
  spreadId: Plan["spreadId"];
  context: ReadingContext;
  cards: CaseCard[];
  connection: string;
  conclusion: string;
};

const OPENERS: Record<string, Record<string, string>> = {
  love: {
    you: "你带进这段关系的，是{orient}的{name}，关键词落在{kw}。",
    them: "对方此刻更接近{orient}的{name}，围绕{kw}。这是一种可能的位置，不是替对方签字。",
    bond: "你们之间实际的那根线，被{orient}的{name}说出来，核心是{kw}。",
    tension: "让关系发紧的地方，落在{orient}的{name}，紧在{kw}。",
    advice: "眼下更有用的做法，跟着{orient}的{name}，从{kw}下手。",
    outlook: "若维持现在的方式，走向更像{orient}的{name}，会沿着{kw}长。",
  },
  career: {
    now: "工作此刻的表面天气，是{orient}的{name}，先看见{kw}。",
    hidden: "还没被说清、却在影响局面的，是{orient}的{name}，藏着{kw}。",
    strength: "你已经拿得出来的力量，是{orient}的{name}，用得上的是{kw}。",
    block: "让进展变慢的阻力，落在{orient}的{name}，拖住你的是{kw}。",
    counsel: "接下来更值得走的方向，跟着{orient}的{name}，从{kw}开始。",
  },
  three: {
    past: "过去已经成形、仍牵着现在的，是{orient}的{name}，留下的是{kw}。",
    present: "你正站着的位置，是{orient}的{name}，眼前最响的是{kw}。",
    future: "若沿着当前的轨迹，正在显影的是{orient}的{name}，方向靠近{kw}。",
  },
  celtic: {
    present: "问题的中心是{orient}的{name}，你现在站在{kw}里。",
    challenge: "横在现状上的力量是{orient}的{name}，它在{kw}上推或挡。",
    foundation: "更深处的根基是{orient}的{name}，地面是{kw}。",
    past: "刚刚离开、仍牵着袖子的，是{orient}的{name}，还留着{kw}。",
    crown: "意识里的目标，或最好的可能，像{orient}的{name}，指向{kw}。",
    future: "若不转向，很快会来的发展更像{orient}的{name}，带着{kw}。",
    self: "你自己面对这件事的态度，是{orient}的{name}，包括{kw}这一面。",
    environment: "周围的人、场所和气氛，呈{orient}的{name}，环境里有{kw}。",
    hopes: "你又盼又怕的那一件，落在{orient}的{name}，常常就是{kw}。",
    outcome: "若这些力量继续作用，落点更像{orient}的{name}，停在{kw}。它仍会随你的下一步改变。",
  },
  single: {
    guidance: "今天最想被看见的，是{orient}的{name}，主题收在{kw}。",
  },
};

function toneAt(index: number): Tone {
  return index % 2 === 0 ? "open" : "hard";
}

function lovePlans(): Plan[] {
  const rows: Array<[string, string, string, string, string]> = [
    ["single", "feelings", "对方心里有没有位置", "Is there room for me", "我喜欢的人平时对我很温和，心里到底有没有我的位置？"],
    ["single", "direction", "靠近会不会只是我的热", "Is this only my warmth", "我们刚认识不久，我很想靠近。这段会往下走，还是只是我一个人的热度？"],
    ["single", "continue", "善意还要不要继续给", "Keep offering warmth", "我已经主动了好几次，对方回应很淡。我还要不要继续释放善意？"],
    ["single", "other", "一个人时怎么安顿想被爱", "Wanting love while single", "我目前没有对象，最近却很想被爱。我该先靠近谁，还是先把自己安顿好？"],
    ["talking", "feelings", "天天聊天是不是喜欢", "Does daily chat mean love", "我们几乎天天聊天，却从不谈我们是什么。对方到底是不是喜欢我？"],
    ["talking", "direction", "暧昧会落地还是会淡", "Will the talking settle", "这段暧昧再拖两个月，会变成一段关系，还是会慢慢淡掉？"],
    ["talking", "continue", "还要不要继续等答案", "Keep waiting for an answer", "暧昧让我晚上睡不着。我该继续等一个答案，还是先退回朋友的距离？"],
    ["talking", "reunion", "旧人又开始暧昧", "An ex is talking again", "我们以前在一起过，分开后又天天联系。这算复合的前奏，还是只是习惯？"],
    ["dating", "feelings", "恋爱三个月心还在不在", "Are they still here", "我们在一起三个月了，对方最近回复变慢。心还在我这里吗？"],
    ["dating", "direction", "恋爱是更近还是各过各", "Closer or drifting", "这段恋爱接下来是会更靠近，还是开始各过各的？"],
    ["dating", "continue", "经常吵架还要不要继续", "Stay through the fights", "我们几乎每周都吵一次。这段恋爱还值得我继续投入吗？"],
    ["dating", "reunion", "冷战两周要不要拉回来", "End a two-week silence", "冷战了两周，谁也不肯先说话。我该主动把这段恋爱拉回来吗？"],
    ["partnered", "feelings", "多年之后心里还有没有我", "Still in their heart", "我们结婚这些年，日子过得很满。对方心里还有没有我这个人？"],
    ["partnered", "direction", "同居的沉默会往哪走", "Where the silence goes", "我们住在一起，话却越来越少。这段关系若继续这样，会往哪里走？"],
    ["partnered", "continue", "很累了还要不要经营", "Keep tending the home", "家里已经很累了，我有时想逃。我还要不要继续经营这段婚姻？"],
    ["partnered", "reunion", "分居之后还能不能回家", "After a trial separation", "我们分居试了一阵，周末才见面。还有没有可能把日子过回一起？"],
    ["split", "feelings", "分手后对方还剩什么心意", "What remains after the split", "我们刚分开不到一个月。对方现在对我，还剩下什么样的心意？"],
    ["split", "direction", "分开后的拉力会往哪", "Where the pull goes", "分手后我们还是会联系。这股拉力会把我们带回原处，还是只是不甘心？"],
    ["split", "continue", "还要不要维持联系", "Keep the contact", "人已经分开了，聊天却没有停。我还要不要维持这种联系？"],
    ["split", "reunion", "现在复合是不是时候", "Is reunion timely", "我们站在复合的边缘。现在回去，是修复，还是把没说完的伤再走一遍？"],
    ["split", "other", "分开后我该先安顿哪一块", "What to settle first", "分手之后我既想挽回，又想把自己捡回来。我眼下最该安顿的是哪一块？"],
    ["private", "feelings", "不能说明的心意", "Feelings left unnamed", "这段关系我不方便说明白。我只想知道，对方现在的心意更靠近我，还是在退？"],
    ["private", "direction", "不能公开时会怎么发展", "What develops in private", "事情不能公开说，我也不想猜细节。它若照现在这样，会怎么发展？"],
    ["private", "continue", "这段不能说的要不要继续", "Whether to continue quietly", "我不知道该不该把这段不能摊开的关系继续下去。继续，对我是滋养还是消耗？"],
    ["private", "other", "我在这段里到底要什么", "What I actually want", "别人怎么看我不想管。我只想看清，自己在这段关系里到底想要什么。"],
  ];
  return rows.map(([status, focus, title, titleEn, question], index) => ({
    id: `love-${String(index + 1).padStart(2, "0")}`,
    title,
    titleEn,
    question,
    spreadId: "love",
    context: { status, focus },
    tone: toneAt(index),
  }));
}

function careerPlans(): Plan[] {
  const rows: Array<[string, string, string, string, string]> = [
    ["steady", "promotion", "稳定岗位上的升职", "A raise in a steady job", "我在现在的团队里已经做了几年，表现也不差。这次谈升职加薪，时机对不对？"],
    ["steady", "timing", "稳定时要不要看外面", "Look outside while steady", "工作还算稳定，可我开始半夜看招聘。现在是该看看外面，还是先把眼前做好？"],
    ["steady", "people", "和上司的别扭", "Friction with a manager", "我和直属上司最近互相看不顺眼，活还得一起干。我该怎么处，才不把位置耗掉？"],
    ["steady", "direction", "留下还是转一条线", "Stay or change tracks", "这份工作能做下去，但我不确定它是不是我还想走的方向。我该留下深耕，还是转一条线？"],
    ["switching", "promotion", "想走还谈不谈涨薪", "Ask for pay while leaving", "我已经在看下家，公司这边却有一个涨薪的口风。我还要不要把这次谈成？"],
    ["switching", "timing", "什么时候提离职", "When to resign", "我想换工作，简历也改了。什么时候提离职，才不至于两头落空？"],
    ["switching", "people", "走之前怎么和同事说", "Telling colleagues", "我想走，可团队里有几个我在意的人。离开之前，我该怎么跟他们把话说完？"],
    ["switching", "direction", "下一家选哪条路", "Which next role", "外面有两个方向都在招我，一个更熟，一个更想试。我该选哪一条？"],
    ["seeking", "promotion", "求职时怎么谈待遇", "Talking about pay while searching", "我还在找工作，有一家愿意聊。谈待遇的时候，我该怎么要，才不把自己谈丢？"],
    ["seeking", "timing", "空窗还要不要再等", "How long to keep looking", "投了很多简历，面试却不多。我该继续等更合适的，还是先接一个能上手的？"],
    ["seeking", "people", "面试之后的沉默", "Silence after an interview", "终面之后一直没有信。我想知道，对方那边卡的是我这个人，还是别的安排？"],
    ["seeking", "direction", "求职要不要转方向", "Change fields while searching", "老本行不好找，旁边有一个我能学的新方向。求职这段时间，我该转，还是守？"],
    ["freelance", "promotion", "自己的事怎么涨价", "Raising my own rate", "我自己接活，有老客户想续。我该不该在这一次把价格说高一点？"],
    ["freelance", "timing", "要不要接这个大单", "Take the big project", "有一个比平时大的项目找来，时间会挤满下个月。我该现在接，还是留出空隙？"],
    ["freelance", "people", "难搞的客户怎么办", "A difficult client", "有个客户改需求改得很勤，钱却总拖。我该继续配合，还是把边界说清楚？"],
    ["freelance", "direction", "自由职业往哪收", "Focus the practice", "我什么都接，忙完却不像在建自己的事。接下来该把方向收到哪里？"],
    ["student", "promotion", "学业上怎样被看见", "Being seen in school", "我想在学业上被看见，比如一次展示或导师的认可。眼下最该准备的是哪一步？这不是公司里的职级。"],
    ["student", "timing", "现在换方向还来不来得及", "Switching a field of study", "我读到一半，发现兴趣在另一边。现在转，来不来得及，值不值得？"],
    ["student", "people", "和导师或同学的距离", "A teacher or classmates", "我和导师话很少，组里也融不进去。我该主动靠近，还是先把自己的功课做好？"],
    ["student", "direction", "毕业前选哪条路", "A path before graduating", "毕业前有继续读和先去实践两条路。我该选哪一条，才不是在逃避？"],
    ["other", "promotion", "不在标准岗位上的进展", "Progress outside a job title", "我的谋生方式不好归到某一类。我想让它往前走一步，被看见，也被多付一点。该从哪做起？"],
    ["other", "timing", "不确定身份时的时机", "Timing without a title", "我现在的谋生方式说不清，却感觉该变了。这个变化，是现在动，还是再看一季？"],
    ["other", "people", "一起做事的人", "The people I work with", "没有固定同事，但有几个人和我一起做事。眼下的不顺，是人的问题，还是事的问题？"],
    ["other", "direction", "没有岗位名的方向", "A direction with no title", "我不在一份标准工作里。接下来的方向，我该怎么选，才听得见自己的声音？"],
    ["other", "other", "说不清的工作烦恼", "Work that will not fit a label", "我说不清自己在烦什么，只知道一想到谋生就紧。我想先把这股紧看清一点。"],
  ];
  return rows.map(([status, focus, title, titleEn, question], index) => ({
    id: `career-${String(index + 1).padStart(2, "0")}`,
    title,
    titleEn,
    question,
    spreadId: "career",
    context: { status, focus },
    tone: toneAt(index),
  }));
}

function threePlans(): Plan[] {
  const rows: Array<[string, string, string, string, string]> = [
    ["love", "anxious", "感情里的心慌", "Anxious about love", "这段感情让我心慌，我总怕自己会失去。过去、现在和接下来，我该怎么看？"],
    ["love", "lost", "感情里迷路", "Lost in love", "感情上我不知道自己要什么，靠近和退后都别扭。这条线是怎么走到现在的？"],
    ["love", "hopeful", "对一段感情有期待", "Hopeful about love", "我对一段感情有期待，也怕期待落空。若照现在的心情走，会显出什么？"],
    ["love", "calm", "平静地看一段关系", "A calm look at love", "我想平静地看一段关系，不急着下结论。它从哪来，现在站在哪，会往哪去？"],
    ["career", "anxious", "事业学业上的紧", "Anxious about work or study", "一想到事业或学业我就胸口紧。这股紧从以前哪来，现在卡在哪，接下来会怎样？"],
    ["career", "lost", "工作或学业上迷路", "Lost in work or study", "我在工作和学业之间看不清自己要什么。过去的选择怎样解释现在的茫，未来又在邀请什么？"],
    ["career", "hopeful", "对下一步有期待", "Hopeful about the next step", "我对接下来的学习或工作有一点期待。这条线若继续，会显出什么样子？"],
    ["career", "other", "说不清的事业学业", "Work or study, unnamed", "事业和学业的事我说不标准。只想看过去留下了什么，现在站在哪，若不变会去哪。"],
    ["money", "anxious", "钱紧的时候", "Anxious about money", "最近钱让我睡不着。不是要一个发财的答案，我想看这股紧从哪来，现在怎么办。"],
    ["money", "calm", "平静地看一笔安排", "A calm look at money", "我想平静地看一笔已经在考虑的安排。它的来路、眼前和若继续的方向，分别是什么？"],
    ["money", "other", "金钱上说不清的烦", "Money, hard to name", "金钱上的烦我说不清，只知道一算账就想躲开。过去、现在、若继续，各在说什么？"],
    ["health", "lost", "身心上的茫", "Unsure in body and mind", "身体和心情都有点沉，我又说不出具体要问什么。这条线想提醒我看见哪一件？"],
    ["health", "hopeful", "想把身心养回来", "Hoping to feel steadier", "我想把作息和心情慢慢养回来。过去是怎么耗掉的，现在缺什么，接下来哪一步最小？"],
    ["health", "calm", "平静地听身体", "Listening to the body", "我没有要一个诊断。只想平静地听一听，身体和心情从哪走到今天，若继续这样会怎样。"],
    ["people", "lost", "人际关系里迷路", "Lost among people", "和周围的人相处让我迷路，不知道该靠近还是留白。这段关系网是怎么变成现在这样的？"],
    ["people", "hopeful", "想把一段人际修好", "Hoping to mend a tie", "我想把和某个人的相处修好一点。过去的结、现在的距离，以及若我先伸手，会怎样？"],
    ["people", "other", "周围的人", "The people around me", "不是恋爱，也不是同事考核。就是周围的人让我累。过去、现在和若不变的方向，各是什么？"],
    ["general", "anxious", "整个人都紧", "An anxious whole picture", "我说不出是哪一件事，只是整个人都紧。过去哪一段还压着，现在站在哪，若不变会去哪？"],
    ["general", "calm", "想看清整个局面", "A calm whole picture", "我想把最近的生活当成一个整体看清，不急着归罪。它从哪来，现在如何，会往哪去？"],
    ["general", "other", "综合的、说不清的问题", "A question with no label", "问题还没长成一句完整的话。请用过去、现在、未来帮我把最响的那一件显出来。"],
  ];
  return rows.map(([area, mood, title, titleEn, question], index) => ({
    id: `three-${String(index + 1).padStart(2, "0")}`,
    title,
    titleEn,
    question,
    spreadId: "three",
    context: { area, mood },
    tone: toneAt(index),
  }));
}

function celticPlans(): Plan[] {
  const rows: Array<[string, string, string, string, string]> = [
    ["love", "anxious", "感情的十字", "A cross for love", "这段感情把我压在中间，我既怕失去，又怕继续耗。请把现状、挑战和可能的落点一起看清。"],
    ["love", "hopeful", "想把关系看完整", "Love, seen whole", "我对这段关系还有希望，也想看清根基和周围的人。若什么都不改，结果会落在哪里？"],
    ["career", "lost", "事业学业的十字", "A cross for work or study", "事业或学业上我站不稳，说不清是能力、环境还是自己的态度。请从根基看到可能的结果。"],
    ["career", "anxious", "下一步让我睡不着", "The next step will not let me sleep", "下一步的选择让我晚上反复想。我想看清交叉的力量、我自己的态度，以及若继续会落到哪。"],
    ["money", "calm", "一笔安排的十字", "A cross for a money decision", "我在考虑一笔安排，想平静地看它的根基和阻碍。不要给我一个保证，只要把局面摊开。"],
    ["money", "anxious", "钱的压力从哪来", "Where the money pressure sits", "钱的压力已经影响睡眠和脾气。我想看清它站在什么上面，周围谁在加重，若不变会怎样。"],
    ["health", "lost", "身心的十字", "A cross for body and mind", "身心都沉，我又不知道该先动哪一块。请把现状、深层原因和我能做的一小步分开。"],
    ["health", "calm", "把生活节奏摊开", "Laying out the pace of life", "我想看自己的作息和心情是怎么叠成现在这样的。不求诊断，只看力量怎样作用。"],
    ["people", "hopeful", "一段人际的十字", "A cross for a relationship", "我想修好和周围某个人的相处。请看清交叉的力量、环境，以及我自己的态度能改哪一寸。"],
    ["people", "other", "周围人的压力", "Pressure from other people", "周围的人让我喘不过气，又不全是他们的错。我想看见哪些是环境，哪些是我自己。"],
    ["general", "anxious", "整个人生的十字", "A cross for the whole picture", "好几件事叠在一起，我分不清哪一件才是中心。请用十字把现状和真正的挑战分开。"],
    ["general", "lost", "不知道问题在哪", "When the question itself is unclear", "我甚至不知道自己在问什么，只觉得生活发紧。请从根基走到结果，帮我看见中心。"],
    ["love", "calm", "不吵的时候关系在哪", "The bond when it is quiet", "我们最近不吵了，也不热。我想看这段安静底下的根基、希望和若继续的落点。"],
    ["career", "hopeful", "一个想被做成的事", "Something I want to finish", "我心里有一件想做成的事，也怕环境不答应。请看我的态度、周围的气氛，以及可能的结果。"],
    ["general", "hopeful", "想给生活一个方向", "A direction for ordinary life", "没有单一的危机，我只是想给普通的生活一个方向。请看中心、交叉和若继续会落在哪里。"],
  ];
  return rows.map(([area, mood, title, titleEn, question], index) => ({
    id: `celtic-${String(index + 1).padStart(2, "0")}`,
    title,
    titleEn,
    question,
    spreadId: "celtic",
    context: { area, mood },
    tone: toneAt(index),
  }));
}

function singlePlans(): Plan[] {
  const themes = ["fortune", "love", "work", "health", "inspiration"] as const;
  const copy: Record<(typeof themes)[number], Array<[string, string, string]>> = {
    fortune: [
      ["今天的天气", "Today's weather", "今天没有具体的问题，我想知道这一天最该留意的天气是什么。"],
      ["出门前的一张牌", "One card before leaving", "出门之前抽一张。今天哪一件小事最值得我放在心上？"],
      ["收工时回头看", "Looking back at the day", "一天快结束了。今天已经发生的事里，哪一个主题还想被我看见？"],
    ],
    love: [
      ["今天的感情", "Love for today", "今天只看感情这一面。我该对谁温柔一点，或对自己诚实一点？"],
      ["一句想说的话", "A sentence I might say", "今天心里有一句关于感情的话。它该说出来，还是先自己放一放？"],
      ["关系里的今天", "Today inside a bond", "不展开整段关系，只问今天：我和在意的人之间，最该留意什么？"],
    ],
    work: [
      ["今天的工作", "Work for today", "今天的工作或功课堆在桌上。哪一件先做，才不算逃避？"],
      ["开会或交作业前", "Before a meeting or a deadline", "今天有一件要交出去的事。我该带上什么样的态度？"],
      ["忙完之后的十分钟", "Ten minutes after the rush", "今天会很忙。忙完之后的十分钟，我想留给什么？"],
    ],
    health: [
      ["今天怎么对待身体", "How to treat the body today", "今天不想听大道理。身体和心情，我最小能照顾的是哪一件？"],
      ["睡前的一张牌", "A card before sleep", "睡前问一句：今天的紧，有没有一件我今晚就能放下的？"],
      ["累的时候", "On a tired day", "今天已经有点累。我该再推一下，还是诚实地停一停？"],
    ],
    inspiration: [
      ["今天的灵感", "Inspiration for today", "今天想要一点灵感，不是整个人生规划。哪一个小念头值得跟一下？"],
      ["写不出来的时候", "When the page stays blank", "我坐在空白前面。今天的灵感要我开始，还是要我先停笔看一看？"],
      ["一个想试的念头", "An idea I might try", "脑子里有一个很小的念头。今天要不要给它十分钟？"],
    ],
  };
  const plans: Plan[] = [];
  let index = 0;
  for (const theme of themes) {
    for (const [title, titleEn, question] of copy[theme]) {
      plans.push({
        id: `daily-${String(index + 1).padStart(2, "0")}`,
        title,
        titleEn,
        question,
        spreadId: "single",
        context: { theme },
        tone: toneAt(index),
      });
      index += 1;
    }
  }
  return plans;
}

function plans(): Plan[] {
  return [...lovePlans(), ...careerPlans(), ...threePlans(), ...celticPlans(), ...singlePlans()];
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const swap = copy[i];
    copy[i] = copy[j];
    copy[j] = swap;
  }
  return copy;
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[。！？])/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function optionLabel(spreadId: string, key: "status" | "focus" | "area" | "mood" | "theme", id: string | undefined): string {
  if (!id) return "";
  const group = contextGroups(spreadId).find((item) => item.key === key);
  return group?.options.find((item) => item.id === id)?.zh ?? "";
}

function situationSentence(plan: Plan): string {
  if (plan.spreadId === "love") {
    const lines: Record<string, string> = {
      single: "按单身来读，看的是要不要靠近，而不是婚姻里的日常。",
      talking: "按暧昧未定来读，先看心意和分寸，不把它当成已经说定的伴侣。",
      dating: "按正在恋爱来读，谈的是这段已经开始的关系。",
      partnered: "按已婚或同居来读，不把这张牌说成要不要开始一段新的恋爱。",
      split: "按刚分手或复合边缘来读，谈的是分开之后的拉力，不是去认识陌生人。",
      private: "关系状态没有说明，所以只按牌面谈关系，不假设单身或已婚。",
    };
    return lines[plan.context.status ?? ""] ?? "";
  }
  if (plan.spreadId === "career") {
    const lines: Record<string, string> = {
      steady: "按在职且相对稳定来读，先看这份工作里的位置，不一上来就当成必须离职。",
      switching: "按在职但想换来读，重点是时机和代价，不是假装你已经没有工作。",
      seeking: "按求职中来读，看的是机会和准备，不是一份已经坐稳的岗位。",
      freelance: "按创业或自由职业来读，谈的是自己的事和客户，不是公司里的职级。",
      student: "按学生来读，这里的进展是学业上被看见，不是公司里的升职流程。",
      other: "工作状态选了其他，所以不套用某一种固定岗位。",
    };
    return lines[plan.context.status ?? ""] ?? "";
  }
  if (plan.spreadId === "single") {
    const theme = optionLabel("single", "theme", plan.context.theme);
    return theme ? `今天你想看的是${theme}，一张牌就收在这一面。` : "";
  }
  const area = optionLabel(plan.spreadId, "area", plan.context.area);
  const mood = optionLabel(plan.spreadId, "mood", plan.context.mood);
  return `这件事主要在${area}，此刻的心情是${mood}。`;
}

function topicKey(plan: Plan): "general" | "love" | "career" | "resources" {
  return contextTopic(plan.spreadId, plan.context);
}

function meaningSentences(card: Card, reversed: boolean, key: "general" | "love" | "career" | "resources"): string[] {
  const text = card.topics[reversed ? "reversed" : "upright"][key].zh;
  const parts = splitSentences(text);
  if (card.arcana === "minor" && parts.length >= 3) return parts.slice(1);
  return parts;
}

function fillOpener(template: string, card: Card, reversed: boolean): string {
  return template
    .replaceAll("{orient}", reversed ? "逆位" : "正位")
    .replaceAll("{name}", card.name.zh)
    .replaceAll("{kw}", card.keywords.zh[0] ?? "这一面");
}

function scrub(text: string): string {
  return text.replaceAll("仅供娱乐", "").replaceAll("娱乐与自我反思", "").replaceAll("for entertainment", "");
}

function bodyFor(plan: Plan, positionId: string, card: Card, reversed: boolean, index: number): string {
  const template = OPENERS[plan.spreadId]?.[positionId];
  if (!template) throw new Error(`Missing opener ${plan.spreadId}.${positionId}`);
  const parts = [fillOpener(template, card, reversed)];
  if (index === 0) {
    const situation = situationSentence(plan);
    if (situation) parts.push(situation);
  }
  const meanings = meaningSentences(card, reversed, topicKey(plan));
  if (meanings.length === 0) throw new Error(`No meaning for ${card.id}`);
  const room = 4 - parts.length;
  parts.push(...meanings.slice(0, Math.max(1, Math.min(2, room))));
  const body = scrub(parts.slice(0, 4).join(""));
  const count = splitSentences(body).length;
  if (count < 2 || count > 4) throw new Error(`${plan.id} ${positionId} has ${count} sentences: ${body}`);
  return body;
}

function tag(card: Card, reversed: boolean): string {
  return `${reversed ? "逆位" : "正位"}${card.name.zh}`;
}

function connectionFor(plan: Plan, drawn: { card: Card; reversed: boolean; positionId: string }[]): string {
  const byId = new Map(drawn.map((item) => [item.positionId, item]));
  const name = (positionId: string) => {
    const item = byId.get(positionId);
    if (!item) throw new Error(`Missing ${positionId}`);
    return tag(item.card, item.reversed);
  };
  const focus = optionLabel(plan.spreadId, "focus", plan.context.focus);
  let text = "";
  if (plan.spreadId === "love") {
    text = `六张牌要放在一起看。你这边是${name("you")}，对方是${name("them")}，所以这不是一个人的独白。连接落在${name("bond")}，发紧的地方是${name("tension")}。若把${name("advice")}当成下一步，${name("outlook")}才有机会被改写；若什么都不做，走向就沿着后一张长。你问的焦点是${focus || "这段关系本身"}。先分清哪些是你的需要，哪些是对方的位置。`;
  } else if (plan.spreadId === "career") {
    text = `五张牌是一条工作上的线。表面是${name("now")}，底下没说清的是${name("hidden")}。你拿得出来的是${name("strength")}，拖住你的是${name("block")}。因此下一步更接近${name("counsel")}，而不是先否定整个处境。你最想看的是${focus || "这件事本身"}。用力量去碰障碍，再决定要不要改方向。`;
  } else if (plan.spreadId === "three") {
    text = `三张牌是一条时间线。过去的${name("past")}还在解释你现在的反应，现在的${name("present")}是你正站着的地方，未来的${name("future")}只是沿着当前轨迹会显影的方向，不是已经签字的结局。先看过去如何喂养了现在，再问未来是在邀请你继续，还是在提醒你转弯。`;
  } else if (plan.spreadId === "celtic") {
    text = `十字的中心是${name("present")}，横过来的是${name("challenge")}，脚下的根基是${name("foundation")}。近期过去的${name("past")}还牵着袖子，意识里的可能是${name("crown")}，若不转向，近期会走向${name("future")}。你自己的态度是${name("self")}，周围是${name("environment")}，又盼又怕的是${name("hopes")}，力量继续作用时的落点是${name("outcome")}。先读中心与交叉，再看结果是不是只是希望或恐惧被放大。`;
  } else {
    text = `今天只有${name("guidance")}这一张。它不是整个人生的判决，只标出这一天最想被看见的主题。把注意力收在牌面说的那一件上，做完一个小动作即可。`;
  }
  return scrub(text);
}

function actionPosition(spreadId: Plan["spreadId"]): string {
  if (spreadId === "love") return "advice";
  if (spreadId === "career") return "counsel";
  if (spreadId === "three") return "future";
  if (spreadId === "celtic") return "outcome";
  return "guidance";
}

function adviceStep(card: Card, reversed: boolean): string {
  const parts = splitSentences(card.topics[reversed ? "reversed" : "upright"].advice.zh);
  const picked = card.arcana === "minor" ? (parts[1] ?? parts[0]) : parts[0];
  if (!picked) throw new Error(`No advice for ${card.id}`);
  return picked.endsWith("。") ? picked : `${picked}。`;
}

function conclusionFor(plan: Plan, drawn: { card: Card; reversed: boolean; positionId: string }[]): string {
  const action = drawn.find((item) => item.positionId === actionPosition(plan.spreadId));
  if (!action) throw new Error(`No action card for ${plan.id}`);
  const step = adviceStep(action.card, action.reversed);
  return scrub(`回到你问的这件事。你可以先做的一件事是：${step}做完这一件，再看要不要谈更大的决定。`);
}

function buildCases(): ReadingCase[] {
  const random = mulberry32(20261010);
  const allIds = cards.map((card) => card.id);
  const byId = new Map(cards.map((card) => [card.id, card]));
  let bag = shuffle(allIds, random);
  const drafted: { plan: Plan; drawn: { positionId: string; card: Card; reversed: boolean }[] }[] = [];

  function pull(used: Set<string>): string {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      if (bag.length === 0) bag = shuffle(allIds, random);
      const rest: string[] = [];
      let found = "";
      for (const id of bag) {
        if (!found && !used.has(id)) found = id;
        else rest.push(id);
      }
      bag = rest;
      if (found) return found;
      bag = shuffle(allIds, random);
    }
    throw new Error("Could not deal a unique card");
  }

  for (const plan of plans()) {
    const spread = getSpread(plan.spreadId);
    if (!spread) throw new Error(plan.spreadId);
    const used = new Set<string>();
    const drawn = spread.positions.map((position) => {
      const cardId = pull(used);
      used.add(cardId);
      const card = byId.get(cardId);
      if (!card) throw new Error(cardId);
      const bias = plan.tone === "hard" ? 0.55 : 0.18;
      return { positionId: position.id, card, reversed: random() < bias };
    });
    drafted.push({ plan, drawn });
  }

  function counts() {
    const seen = new Map<string, number>();
    let reversed = 0;
    let total = 0;
    for (const item of drafted) {
      for (const card of item.drawn) {
        total += 1;
        if (card.reversed) reversed += 1;
        seen.set(card.card.id, (seen.get(card.card.id) ?? 0) + 1);
      }
    }
    return { seen, reversed, total };
  }

  function repairCoverage() {
    for (const id of allIds) {
      const { seen } = counts();
      if ((seen.get(id) ?? 0) > 0) continue;
      const host = drafted.find((item) => item.drawn.every((card) => card.card.id !== id));
      if (!host) throw new Error(`No host for ${id}`);
      const donor = host.drawn.find((card) => (counts().seen.get(card.card.id) ?? 0) > 1);
      const slot = donor ?? host.drawn[host.drawn.length - 1];
      const card = byId.get(id);
      if (!card) throw new Error(id);
      slot.card = card;
    }
  }
  repairCoverage();

  function flip(prefer: Tone, toReversed: boolean) {
    const pool = drafted.filter((item) => item.plan.tone === prefer);
    for (const item of pool.length ? pool : drafted) {
      const slot = item.drawn.find((card) => card.reversed !== toReversed);
      if (slot) {
        slot.reversed = toReversed;
        return true;
      }
    }
    return false;
  }

  for (let guard = 0; guard < 80; guard += 1) {
    const { reversed, total } = counts();
    const ratio = reversed / total;
    if (ratio < 0.33) {
      if (!flip("hard", true)) break;
    } else if (ratio > 0.37) {
      if (!flip("open", false)) break;
    } else break;
  }

  return drafted.map(({ plan, drawn }) => ({
    id: plan.id,
    title: plan.title,
    titleEn: plan.titleEn,
    question: plan.question,
    spreadId: plan.spreadId,
    context: plan.context,
    cards: drawn.map((item, index) => ({
      positionId: item.positionId,
      cardId: item.card.id,
      reversed: item.reversed,
      body: bodyFor(plan, item.positionId, item.card, item.reversed, index),
    })),
    connection: connectionFor(plan, drawn),
    conclusion: conclusionFor(plan, drawn),
  }));
}

const library = buildCases();
writeFileSync(new URL("../data/cases.json", import.meta.url), `${JSON.stringify(library, null, 2)}\n`);
const reversed = library.reduce((sum, item) => sum + item.cards.filter((card) => card.reversed).length, 0);
const total = library.reduce((sum, item) => sum + item.cards.length, 0);
console.log(`wrote ${library.length} cases, reversed ${reversed}/${total} (${(reversed / total).toFixed(3)})`);

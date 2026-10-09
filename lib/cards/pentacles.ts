import { minor } from "./factory";
import type { Card } from "./types";

export const pentacles: Card[] = [
  minor("pentacles", 1, {
    keywords: { zh: ["机会", "物质种子", "身体", "实际的开始"], en: ["opportunity", "a material seed", "the body", "a practical start"] },
    description: {
      zh: "云中的手托出一枚金币，下面是花园，机会已经具体到可以触摸。",
      en: "A hand from a cloud holds out a coin above a garden. The opportunity is solid enough to touch.",
    },
    upright: {
      zh: "一个实际的新开始：工作、钱、健康或一门手艺的种子。把它种进日程里，而不是只欣赏那枚闪光的硬币。",
      en: "A practical beginning: work, money, health, or the seed of a craft. Plant it in the calendar instead of only admiring the shine.",
    },
    reversed: {
      zh: "机会抓不稳，或是你太看重短期得失。也可以是身体在提醒你慢下来。先检查地基：时间、钱和体力是否真的接得住。",
      en: "The opportunity will not stay in the hand, or short-term gain is all you can see. The body may also be asking you to slow down. Check the foundation: time, money, and stamina.",
    },
  }),
  minor("pentacles", 2, {
    keywords: { zh: ["平衡", "灵活", "现金流", "取舍"], en: ["balance", "flexibility", "cash flow", "juggling"] },
    description: {
      zh: "他用无限的绳子玩着两枚金币，船在身后的浪里起伏。",
      en: "He juggles two coins on an endless ribbon while ships rise and fall on the swell behind him.",
    },
    upright: {
      zh: "你在同时应付几件实际的事。灵活是优点，只要你知道哪一枚硬币不能掉。适合调整预算、兼职、在变动里保持节奏。",
      en: "You are handling several practical things at once. Flexibility helps if you know which coin must not drop. This favors a budget change, mixed work, and keeping rhythm while things move.",
    },
    reversed: {
      zh: "手忙脚乱，或是一个球其实早就该放下。财务或日程的失衡需要减法，不是更华丽的杂耍。选一个优先。",
      en: "It is too much juggling, or one ball should have been put down already. An imbalance of money or schedule needs subtraction, not a fancier trick. Choose a priority.",
    },
  }),
  minor("pentacles", 3, {
    keywords: { zh: ["技艺", "合作", "打磨", "认可"], en: ["craft", "collaboration", "refinement", "recognition"] },
    description: {
      zh: "工匠在教堂里雕刻，另两人拿着图纸讨论，作品是一起完成的。",
      en: "A mason carves in a church while two others consult the plans. The work is finished together.",
    },
    upright: {
      zh: "把手艺做扎实，并让合适的人参与。适合团队合作、学习、接受反馈。质量来自反复打磨，也来自你肯把作品拿给人看。",
      en: "Make the craft solid and let the right people in. Teamwork, study, and feedback belong here. Quality comes from revision and from being willing to show the work.",
    },
    reversed: {
      zh: "合作不畅，或是你不肯听意见，也可以是技能还没练够就想交工。回到图纸。做得好，比做得像已经完成更重要。",
      en: "The collaboration is off, you will not hear feedback, or the skill is not ready for delivery. Go back to the plan. Doing it well matters more than making it look finished.",
    },
  }),
  minor("pentacles", 4, {
    keywords: { zh: ["守住", "安全", "控制", "占有"], en: ["holding on", "security", "control", "possession"] },
    description: {
      zh: "他把金币抱在胸前、顶在头上、踩在脚下，城在身后，人却坐得很紧。",
      en: "He clutches a coin to his chest, balances one on his crown, and stands on two more. The town is behind him and his posture is tight.",
    },
    upright: {
      zh: "保住你已经有的：钱、时间、边界。稳定本身没有错。只是问一句，你是在保管，还是在害怕一松手就会失去自己。",
      en: "Keep what you have: money, time, a boundary. Stability is not the problem. Ask whether you are safeguarding it or afraid that letting go would cost you yourself.",
    },
    reversed: {
      zh: "抓得太死，或是终于愿意松手。吝啬、控制欲，或对匮乏的恐惧，都会让金币变成牢房。分享一小部分，看看天会不会塌。",
      en: "The grip is too tight, or you are finally willing to loosen it. Stinginess, control, or fear of scarcity turns the coin into a cell. Share a small part and see whether the sky falls.",
    },
  }),
  minor("pentacles", 5, {
    keywords: { zh: ["匮乏", "被排除", "艰难", "求助"], en: ["scarcity", "exclusion", "hardship", "asking for help"] },
    description: {
      zh: "雪夜里两个人走过亮着灯的彩窗，他们没有进去。",
      en: "Two figures pass a lit stained-glass window in the snow. They do not go in.",
    },
    upright: {
      zh: "一段物质或精神上的艰难。你可能觉得被排除在温暖之外。这张牌不责备你，它请你看见附近其实有门：援助、制度、一个你还没敲的人。",
      en: "A material or spiritual hard patch. You may feel shut out of the warmth. The card does not blame you. It asks you to see that a door is nearby: aid, an institution, a person you have not knocked for.",
    },
    reversed: {
      zh: "最冷的一段在过去，或是你开始接受帮助。恢复会慢。从一件具体的事着手：一顿饭、一份申请、一次诚实的开口。",
      en: "The coldest part is easing, or you are beginning to accept help. Recovery is slow. Start with one concrete thing: a meal, an application, an honest ask.",
    },
  }),
  minor("pentacles", 6, {
    keywords: { zh: ["给予", "接受", "公平", "资源流动"], en: ["giving", "receiving", "fairness", "resources moving"] },
    description: {
      zh: "商人把金币分给跪着的人，天平在他手里，流动并不完全平等。",
      en: "A merchant gives coins to people who kneel. The scales are in his hand, and the flow is not fully equal.",
    },
    upright: {
      zh: "资源在流动。你可能是给予的一方，也可能终于可以接受。慷慨很好，注意权力不要藏在施舍里。公平的帮助会让人站起来，而不是一直跪着。",
      en: "Resources are moving. You may be the one giving, or you can finally receive. Generosity is good. Watch for power hiding inside charity. Fair help lets a person stand up rather than remain kneeling.",
    },
    reversed: {
      zh: "施与受都别扭：条件太多的帮助、不愿接受、或金钱带来控制。把天平重新看清楚。债务如果是情感上的，就把它说出来。",
      en: "Giving and receiving are awkward: help with too many strings, a refusal to take it, or money used as control. Look at the scales again. If the debt is emotional, say so.",
    },
  }),
  minor("pentacles", 7, {
    keywords: { zh: ["等待收获", "评估", "耐心", "怀疑"], en: ["waiting on the harvest", "assessment", "patience", "doubt"] },
    description: {
      zh: "他拄着锄头看着长成的枝叶，脸上是还不确定值不值得的表情。",
      en: "He leans on his hoe and studies the growth, not yet sure the work was worth it.",
    },
    upright: {
      zh: "成果还在路上。停下来评估，而不是把苗拔起来看。适合复盘投入、耐心等待回报，以及决定下一步要不要继续浇水。",
      en: "The result is still on the way. Assess it. Do not pull the plant up to check. Review what you invested, wait for the return, and decide whether to keep watering.",
    },
    reversed: {
      zh: "不耐烦，或是你发现努力投错了地方。及时止损也是收获。如果只是焦虑，就再给它一个季节里的一小段时间，并定一个检查日期。",
      en: "Impatience, or the effort went to the wrong field. Stopping in time is also a harvest. If it is only anxiety, give it one short span inside the season and set a date to look again.",
    },
  }),
  minor("pentacles", 8, {
    keywords: { zh: ["勤奋", "学徒", "专注", "手艺"], en: ["diligence", "apprenticeship", "focus", "craft"] },
    description: {
      zh: "工匠坐在凳上逐枚雕琢金币，城在窗外，他的世界暂时只有手头的活。",
      en: "An artisan sits on a bench shaping coins one by one. The town is outside the window. For now the world is the work in his hands.",
    },
    upright: {
      zh: "把技能练进去。重复、专注、一枚一枚来。适合学习、打磨作品、认真上班。才华在这张牌里不是灵感，是你坐下之后的那些小时。",
      en: "Practice the skill into the body. Repetition, focus, one coin at a time. Study, refine the work, do the job seriously. Talent here is not a flash. It is the hours after you sit down.",
    },
    reversed: {
      zh: "倦怠、完美主义，或是只埋头不做方向。手可以很忙，心却不知道这枚金币要送给谁。休息，或者问一句更大的问题，再回到凳子上。",
      en: "Burnout, perfectionism, or labor without a direction. The hands can be busy while you forget who the coin is for. Rest, or ask the larger question, then return to the bench.",
    },
  }),
  minor("pentacles", 9, {
    keywords: { zh: ["自足", "收获", "独立", "享受"], en: ["self-sufficiency", "harvest", "independence", "enjoyment"] },
    description: {
      zh: "她站在葡萄藤和金币之间，猎鹰停在手上，花园是她自己的。",
      en: "She stands among grapevines and coins, a falcon on her hand. The garden is her own.",
    },
    upright: {
      zh: "你有能力把自己的生活安排得妥当，并且享受它。独立、品味和已经到手的安全都在这里。适合犒劳自己，也适合相信你能独自把日子过好。",
      en: "You can arrange a life that works and enjoy it. Independence, taste, and a security you already earned are here. Reward yourself, and trust that you can keep your own days well.",
    },
    reversed: {
      zh: "自足变成了孤立，或是你还不让自己住进已经建成的花园。也可能财务或生活还差一截。分享丰盛，或承认你仍需要帮手，都不会取消你的能力。",
      en: "Self-sufficiency has become isolation, or you will not let yourself live in the garden you built. Finances or daily life may also still be short. Sharing the abundance, or admitting you need a hand, does not cancel your competence.",
    },
  }),
  minor("pentacles", 10, {
    keywords: { zh: ["传承", "家族", "长期稳定", "根基"], en: ["legacy", "family", "long-term stability", "roots"] },
    description: {
      zh: "老人、一对成年人和孩子在拱门下，金币从家徽排到庭院，财富是跨代的。",
      en: "An elder, a couple, and a child stand under an arch. Coins run from the family crest into the court. The wealth crosses generations.",
    },
    upright: {
      zh: "看长期：家庭、公司、一笔能传下去的稳定。适合置业、传承、把个人成就放进更大的结构里。你在建设一个别人也能住的地方。",
      en: "Think in the long term: family, a company, a stability that can be passed on. This favors a home, a legacy, and setting personal success inside a larger structure. You are building a place other people can live in too.",
    },
    reversed: {
      zh: "家庭或金钱的结构出了裂缝：遗产纠纷、传统压力、只顾面子的稳定。问一问这个家徽保护的是人，还是只保护看起来不错的样子。",
      en: "The family or money structure has a crack: inheritance conflict, the pressure of tradition, stability kept for appearances. Ask whether the crest protects people or only a respectable picture.",
    },
  }),
  minor("pentacles", 11, {
    keywords: { zh: ["学习", "务实的消息", "学生", "机会"], en: ["study", "practical news", "a student", "an opening"] },
    description: {
      zh: "少年把金币举到眼前，仔细看，脚下是刚发芽的田。",
      en: "A youth holds a coin up to study it. The field at his feet is just beginning to sprout.",
    },
    upright: {
      zh: "一个踏实的学习机会，或是关于钱、工作和身体的消息。保持学生心态。适合报名、实习、把好奇用在具体技能上。",
      en: "A grounded chance to learn, or news about money, work, or the body. Keep a student's mind. Enroll, apprentice, and aim curiosity at a concrete skill.",
    },
    reversed: {
      zh: "三心二意，或是消息不实。学习如果只停留在收藏资料，就还没开始。选一门，做到能拿给别人看的程度。",
      en: "Attention is scattered, or the news is unreliable. Study that only collects materials has not started. Pick one skill and take it far enough to show someone.",
    },
  }),
  minor("pentacles", 12, {
    keywords: { zh: ["稳步", "责任", "例行", "可靠"], en: ["steady pace", "duty", "routine", "reliability"] },
    description: {
      zh: "骑士骑着沉重的黑马，金币稳稳托着，一步一步，并不炫耀。",
      en: "The knight rides a heavy black horse and holds the coin steady. One step, then another, without display.",
    },
    upright: {
      zh: "慢而可靠。适合例行工作、坚持计划、做一个别人敢托付的人。进步看起来不大，但它会到。别因为不刺激就放弃这条路。",
      en: "Slow and reliable. Routine work, sticking to a plan, and being someone others can trust belong here. The progress looks small, and it arrives. Do not abandon the road because it is not thrilling.",
    },
    reversed: {
      zh: "停滞、无聊，或是固执地按旧路线走。可靠如果变成不肯转弯，就检查马是不是该换一条道。休息和调整路线都算负责任。",
      en: "Stuck, bored, or loyal to a route that no longer works. If reliability has become a refusal to turn, see whether the horse needs another road. Rest and a change of route can both be responsible.",
    },
  }),
  minor("pentacles", 13, {
    keywords: { zh: ["务实的照料", "富足", "家园", "身体"], en: ["practical care", "prosperity", "home", "the body"] },
    description: {
      zh: "她坐在花园里，金币放在膝上，兔子和花都在，富足是照料出来的。",
      en: "She sits in a garden with a coin in her lap. Rabbits and flowers are there. The abundance was tended into being.",
    },
    upright: {
      zh: "用实际的方式照顾生活：家、身体、钱和亲近的人。你有能力把日子过得富足而具体。适合理财、安顿，以及慢慢养一个长期项目。",
      en: "Care for life in practical ways: home, body, money, and the people close to you. You can make the days prosperous and specific. This favors finances, settling in, and nurturing a long project.",
    },
    reversed: {
      zh: "照顾过度到忽略自己，或是只顾物质舒适。家如果变成了控制，富足就会变味。把花园分一点给自己的休息。",
      en: "Care has crowded you out, or comfort is the only value left. If the home becomes control, abundance changes taste. Give a piece of the garden back to your own rest.",
    },
  }),
  minor("pentacles", 14, {
    keywords: { zh: ["精通", "供应", "稳重", "事业有成"], en: ["mastery", "providing", "steadiness", "worldly success"] },
    description: {
      zh: "国王坐在葡萄与牛头之间，金币放在膝上，他看着一座经营良好的世界。",
      en: "The king sits among vines and bull carvings, a coin on his knee, looking over a world that is well run.",
    },
    upright: {
      zh: "你能把资源用好，也能为别人提供稳定。适合事业上的担当、投资判断、做一个可靠的供给者。成功在这里是方法，不只是结果。",
      en: "You can use resources well and offer other people stability. Take responsibility at work, judge an investment, be a reliable provider. Success here is a method, not only a result.",
    },
    reversed: {
      zh: "固执、物质至上，或是权威没有被好好使用。也可以是你不相信自己能承担这个位子。把国王的稳，和守财、控制分开。",
      en: "Stubbornness, money as the only measure, or authority poorly used. You may also not trust yourself to hold the seat. Separate the king's steadiness from hoarding and control.",
    },
  }),
];

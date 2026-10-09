import type { Localized } from "./types";

function L(zh: string, en: string): Localized {
  return { zh, en };
}

export type DomainCopy = {
  love: Localized;
  career: Localized;
  resources: Localized;
  advice: Localized;
};

function domains(
  love: Localized,
  career: Localized,
  resources: Localized,
  advice: Localized,
): DomainCopy {
  return { love, career, resources, advice };
}

export const majorTopics: Record<string, { upright: DomainCopy; reversed: DomainCopy }> = {
  "major-00": {
    upright: domains(
      L(
        "感情里的愚者是一次愿意先靠近的心。它支持新的见面、把一句真诚说出口，或在旧关系里拿出没被算计过的新鲜。轻快要带着尊重：迈一步，而不是把对方的边界也一起跳过。",
        "In love the Fool is a willingness to step closer first. It favors a new meeting, an honest sentence, or freshness inside a familiar bond. Keep the leap respectful: take one step without jumping the other person's boundary.",
      ),
      L(
        "事业上这是开题的牌。新项目、转行的第一周，或把一个念头从笔记本里拿出来试，都比继续准备更接近它。你不需要完整计划才开始，需要的是一次别人看得见的尝试。",
        "At work this is a card of opening. A new project, the first week of a change, or taking an idea out of the notebook matters more than further preparation. You do not need a full plan. You need one attempt someone else can see.",
      ),
      L(
        "金钱与身心上，愚者为未知留一点余量。可以试一个新习惯或一笔小的探索，别把生活费押在还没看清的路上。身体需要新鲜空气，也需要你今晚仍然睡觉。",
        "With money and the body, the Fool keeps a margin for the unknown. Try a new habit or a small experiment, and do not stake living expenses on a road you have not seen. The body wants fresh air and a night of actual sleep.",
      ),
      L(
        "选一个最小的出发：一封信、一次散步、一个报名。带着好奇走，路过悬崖时记得看脚下。",
        "Choose the smallest departure: a letter, a walk, an application. Travel with curiosity, and look at your feet when the cliff appears.",
      ),
    ),
    reversed: domains(
      L(
        "逆位的愚者在感情里常常是逃避，或是把冲动当成勇气。如果你是为了躲开一次诚实的谈话才说“随便”，先停下来。天真如果没有看路，对方会感觉被轻慢。",
        "Reversed, the Fool in love is often escape, or impulse dressed up as courage. If “whatever” is how you dodge an honest talk, stop. Innocence that does not look where it steps feels like carelessness to the other person.",
      ),
      L(
        "工作上的逆位愚者是准备永远停在出发前，或是不看后果就跳。先问这是信任，还是在躲开该负的责任。补上一个最小的承诺：日期、对象、完成的样子。",
        "At work the reversed Fool is a start that never leaves the doorway, or a jump with no regard for the landing. Ask whether this is trust or a responsibility you are dodging. Add one small promise: a date, a person, a picture of done.",
      ),
      L(
        "钱和身体会替鲁莽买单。冲动消费、熬夜式的“再冲一下”，都是这张牌的影子。先保住吃饭、睡觉和一笔不能动的钱，再谈冒险。",
        "Money and the body pay for recklessness. Impulse spending and one more sleepless push are this card's shadow. Protect meals, sleep, and a sum you will not touch, then talk about risk.",
      ),
      L(
        "出发前写下一句：我在信任生活，还是在躲开什么。看清之后，再决定走不走。",
        "Before you go, write one sentence: am I trusting life, or avoiding something? Decide only after you can see which it is.",
      ),
    ),
  },
  "major-01": {
    upright: domains(
      L(
        "魔术师在感情里强调你已经有能力把心意做成一个可见的动作。一句清楚的邀请、一次认真的倾听、一个说到做到的约定，都比继续暗示更有用。魅力来自专注，不是来自表演。",
        "In love the Magician says you already have what it takes to make a feeling visible. A clear invitation, real listening, or a promise you keep beats another hint. Charm here comes from focus, not from a performance.",
      ),
      L(
        "事业上，资源已经在桌上：技能、渠道、话语和一件可以开始的工具。把注意力收成一个目标，这个星期就交付一个看得见的结果。这不是继续收集灵感的时候。",
        "At work the tools are already on the table: skill, a channel, words, and something you can start with. Pull attention onto one aim and deliver a visible result this week. This is not the hour for collecting more ideas.",
      ),
      L(
        "身心与金钱上，魔术师要求你把意志用在一件具体的照料上。安排睡眠、处理一笔拖延的账、把一个健康动作放进每天的同一时间。手能碰到的，才会改变。",
        "For body and money, the Magician spends will on one concrete care. Schedule sleep, clear one delayed bill, put a health practice at the same time each day. What your hands can touch is what changes.",
      ),
      L(
        "选出一件事，写下一句你要做的话，然后在今天做完它。做完比想得更完整更重要。",
        "Pick one thing, write the sentence of what you will do, and finish it today. Finished matters more than perfectly imagined.",
      ),
    ),
    reversed: domains(
      L(
        "逆位的魔术师在关系里可能是话术盖过了真心，或是才能散在很多人身上、没有给眼前这个人。少一个舞台，把注意力放回正在和你说话的人。",
        "Reversed, the Magician in a relationship can be style louder than sincerity, or talent scattered across many people and missing the one in front of you. Leave one stage. Return your attention to the person who is speaking.",
      ),
      L(
        "工作上容易显得很忙，却没有一件事被做完。检查你是在用技巧回避一个难的任务，还是工具其实还没对准。收掉一个分心的项目。",
        "Work can look busy while nothing is finished. Check whether skill is being used to avoid a hard task, or the tools are simply not aimed. Drop one distracting project.",
      ),
      L(
        "金钱和精力会被“看起来很厉害”的方案吸走。先停止一个没有回报的消耗，再谈新的投资或新的养生计划。",
        "Money and energy get swallowed by plans that only look impressive. Stop one drain that is not paying you back before you discuss a new investment or a new health regimen.",
      ),
      L(
        "今天只证明一件小事是真的：把它做完，让别人看得见。其余的舞台先关灯。",
        "Today prove one small thing is real: finish it so someone else can see it. Turn the other stages off.",
      ),
    ),
  },
  "major-02": {
    upright: domains(
      L(
        "女祭司在感情里要的是安静的诚实，不是立刻的答案。有些感受还没到能说清的时候。给自己和对方一点不追问的时间，同时别把沉默当成冷淡。你知道的，比你肯承认的更多。",
        "In love the High Priestess wants quiet honesty, not an instant answer. Some feelings are not ready to be named. Give yourself and the other person time without interrogation, and do not let silence be mistaken for coldness. You know more than you are willing to admit.",
      ),
      L(
        "事业上，信息还没齐，硬做决定会后悔。适合研究、等待一个还没公开的消息、相信你已经感觉到但不便说的判断。把直觉写成笔记，而不是当成已经证实的事实。",
        "At work the facts are not all in, and a forced decision will be regretted. Research, wait for news that is not public yet, and trust a judgment you can feel but should not announce. Write the intuition down. Do not treat it as a proven fact.",
      ),
      L(
        "身心上，女祭司把你带回睡眠、梦和身体的细微信号。少刷信息，多听哪里紧、哪里静。金钱上先不要因为焦虑而行动，等你能说出“我真正担心的是什么”。",
        "For the body, the High Priestess returns you to sleep, dreams, and small signals. Read less news and notice where you are tight or quiet. With money, do not act from anxiety until you can say what you are actually afraid of.",
      ),
      L(
        "留出一段没有人打扰的时间。把冒出来的第一句直觉写下来，先不发给任何人。",
        "Keep a stretch of time with no interruptions. Write the first intuitive sentence that appears, and do not send it to anyone yet.",
      ),
    ),
    reversed: domains(
      L(
        "逆位时，你可能把不安当成了直觉，或是把该说的话咽了回去。关系里的沉默如果让对方猜，就不再是智慧。选一句真实的话，轻轻说出来。",
        "Reversed, unease may be posing as intuition, or a necessary sentence is being swallowed. Silence that makes the other person guess is no longer wisdom. Choose one true sentence and say it gently.",
      ),
      L(
        "工作上容易陷入秘密、猜测和小道消息。把“我感觉”和“我查过”分开。如果该问的人还没问，直觉只是一个假设。",
        "Work slips into secrecy, guessing, and rumor. Separate “I feel” from “I checked.” If you have not asked the person who knows, the intuition is still a hypothesis.",
      ),
      L(
        "忽视身体的小声提醒，或是用神秘感逃避一笔该看的账。今天做一件很具体的事：睡觉、喝水，或打开那个你不想打开的数字。",
        "The body's quiet warnings get ignored, or mystery is used to avoid a number you should look at. Do one concrete thing today: sleep, drink water, or open the figure you have been hiding from.",
      ),
      L(
        "分清这是智慧的等待，还是害怕说真话。如果是后者，把那句话缩短到一句，然后说。",
        "Tell wise waiting apart from fear of the truth. If it is fear, shorten the truth to one sentence and say it.",
      ),
    ),
  },
  "major-03": {
    upright: domains(
      L(
        "女皇在感情里是滋养与被滋养。关系需要感官上的在场：一起吃饭、温柔的接触、对彼此创造的欣赏。丰盛不是控制对方成长的速度，而是让爱有土壤。",
        "In love the Empress is feeding and being fed. The bond wants sensual presence: a shared meal, gentle contact, delight in what the other is making. Abundance is not controlling how fast someone grows. It is giving love soil.",
      ),
      L(
        "事业上，女皇照顾正在成形的作品。给项目时间、资源和好看的完成度，比催熟更重要。也适合与创作、照料、身体或土地有关的工作慢慢变丰盛。",
        "At work the Empress tends what is still forming. Time, resources, and a cared-for finish matter more than forcing ripeness. Work tied to making, care, the body, or the land can grow abundant if you let it.",
      ),
      L(
        "这是身体、金钱和居住环境会被善待的牌。好好吃饭、整理一个让你舒服的角落、让收入服务于生活而不是反过来。接收，也是一种能力。",
        "This card is kind to the body, money, and the place you live. Eat well, clear one corner that comforts you, and let income serve a life rather than the other way around. Receiving is a skill.",
      ),
      L(
        "今天做一件滋养的事，并且允许别人也为你做一件。不要把照顾变成只出不进。",
        "Do one nourishing thing today, and let someone do one for you. Do not turn care into a door that only opens outward.",
      ),
    ),
    reversed: domains(
      L(
        "逆位的女皇可能是照顾变成了耗尽，或是用付出换取对方不许离开。看看谁一直在喂、谁一直在饿，包括你自己。依赖如果没有边界，丰盛会发苦。",
        "Reversed, the Empress can be care that has become depletion, or giving used to keep someone from leaving. Look at who keeps feeding and who stays hungry, including you. Dependence without a boundary turns abundance bitter.",
      ),
      L(
        "工作上要么过度包揽，要么创作枯萎、提不起手。先砍掉一件你其实怨恨的照料，把时间还给真正想长的那件作品。",
        "Work is either over-ownership or a creation you cannot bear to touch. Cut one care you actually resent, and give the time back to the work that still wants to grow.",
      ),
      L(
        "身体在抗议：过度享乐或过度节省都会让女皇逆位。金钱上检查是不是在用购物安抚空洞。先喂饱真正的需要。",
        "The body is protesting. Too much indulgence or too much thrift both reverse the Empress. With money, check whether shopping is soothing an emptiness. Feed the real need first.",
      ),
      L(
        "问自己：我在滋养，还是在耗尽。今天只补你自己缺的那一口。",
        "Ask: am I nourishing, or am I used up? Today replace only the piece you yourself are missing.",
      ),
    ),
  },
  "major-04": {
    upright: domains(
      L(
        "皇帝在感情里要的是稳定和清楚的边界，不是冷漠。谁负责什么、哪些话不能被践踏、关系靠什么结构撑住，都值得说出来。保护可以很坚定，同时仍然温柔。",
        "In love the Emperor wants stability and a clear boundary, not coldness. Who is responsible for what, which words are not to be stepped on, and what structure holds the bond are worth saying aloud. Protection can be firm and still be kind.",
      ),
      L(
        "事业上，这张牌建立秩序：规则、期限、决定由谁拍板。适合承担领导、把混乱收成流程、为想保护的工作立一堵有用的墙。站到该站的位置上。",
        "At work this card builds order: rules, a deadline, and a name on the decision. It favors leadership, turning chaos into a process, and a useful wall around work you mean to protect. Take the seat that is yours.",
      ),
      L(
        "金钱与身体需要骨架。做预算、固定就医或锻炼的时间、把家里一件失控的事管起来。秩序是为了让生活可预期，不是为了惩罚自己。",
        "Money and the body need a frame. Make a budget, fix a time for care or movement, and take charge of one thing at home that has slipped. Order is there so life can be expected, not so you can punish yourself.",
      ),
      L(
        "写下三条边界或三条规则，并在这周执行其中一条。让结构替你守住重要的东西。",
        "Write three boundaries or three rules, and keep one of them this week. Let structure guard what matters.",
      ),
    ),
    reversed: domains(
      L(
        "逆位的皇帝在关系里容易变成控制，或是完全拒绝任何结构、让对方没有安全感。强硬如果是为了不感受脆弱，就松开一寸。问真正要守的是什么。",
        "Reversed, the Emperor in love becomes control, or a refusal of any structure that leaves the other person unsafe. If force exists so you do not have to feel vulnerable, loosen it. Ask what actually needs protecting.",
      ),
      L(
        "工作上要么僵硬到没人敢说话，要么权威真空、事情没人负责。检查规则是在服务目标，还是在服务你的不安。把一个多余的控制拿掉，把一个缺失的责任补上。",
        "Work is either so rigid that nobody speaks, or so empty of authority that nobody owns the task. Check whether the rules serve the goal or your unease. Remove one extra control and fill one missing responsibility.",
      ),
      L(
        "金钱和身体会被过度掌控或彻底撒手。要么苛刻到无法生活，要么账单和健康一起失序。选一个中间的制度，小到你这周做得到。",
        "Money and the body get either over-controlled or abandoned. Life becomes too harsh to live, or bills and health fall apart together. Choose a middle system small enough to keep this week.",
      ),
      L(
        "松开一个只为了让你感觉强大的规则，同时补上一个真正保护人的边界。",
        "Release one rule that exists only to make you feel powerful, and add one boundary that actually protects someone.",
      ),
    ),
  },
  "major-05": {
    upright: domains(
      L(
        "教皇在感情里谈的是承诺的形式：传统、见面家长、一种你们都认得的仪式。它不一定要老派，但需要一套两个人都同意的价值。去问：我们要按谁的规矩爱。",
        "In love the Hierophant speaks about the form of a promise: tradition, meeting a family, a ritual you both recognize. It does not have to be old-fashioned. It does need a value you both accept. Ask whose rules this love is following.",
      ),
      L(
        "事业上，导师、机构、证书和既有方法是资源。适合求教、走正规流程、在一个传统里把技艺学扎实。有时候遵守规矩比标新立异更快到达。",
        "At work a mentor, an institution, a credential, or a proven method is the resource. Seek teaching, follow the formal path, and learn a craft inside a tradition. Sometimes keeping the rule gets you there faster than novelty.",
      ),
      L(
        "身心与金钱上，常规本身就是药：固定的作息、可信的专业意见、不追逐每个新潮流。把健康和财务交给一套你理解并愿意遵守的做法。",
        "For body and money, routine itself is the medicine: fixed hours, a trusted professional opinion, and not chasing every new fashion. Give health and finances a practice you understand and are willing to keep.",
      ),
      L(
        "找一个你尊重的人或一套清楚的规矩，请它指导这一步。你不必发明所有答案。",
        "Find a person you respect or a clear set of rules, and let it guide this step. You do not have to invent every answer.",
      ),
    ),
    reversed: domains(
      L(
        "逆位的教皇质疑一套不再适合你们的传统。盲从家庭脚本、或反过来为了反叛而反叛，都会让关系变假。留下有意义的仪式，改掉只是习惯的束缚。",
        "Reversed, the Hierophant questions a tradition that no longer fits. Blindly following a family script, or rebelling only to rebel, both make the bond false. Keep the ritual that still means something. Change the bind that is only habit.",
      ),
      L(
        "工作上可能是机构僵化，或是你拒绝任何导师因而重复别人早已走过的错。问这个规矩保护的是品质，还是只是权力。可以创新，但别为了显得自由而扔掉基本功。",
        "Work may be a rigid institution, or a refusal of every teacher that makes you repeat mistakes others already made. Ask whether the rule protects quality or only power. Innovate, but do not throw away fundamentals just to look free.",
      ),
      L(
        "健康和金钱上，别把偏方或“人人都这样”当成理由。逆位提醒你核对建议的来源。也别因为讨厌常规就放弃对身体有用的纪律。",
        "With health and money, do not treat a folk fix or “everyone does this” as a reason. The reversal asks you to check where the advice comes from. Do not abandon a discipline that helps the body just because you dislike routine.",
      ),
      L(
        "写下一条你继承来的规矩。决定它这一季是留下、改写，还是放下。",
        "Write down one rule you inherited. Decide whether this season it stays, gets rewritten, or is set down.",
      ),
    ),
  },
  "major-06": {
    upright: domains(
      L(
        "恋人牌是选择，不只是吸引。感情里它要求你诚实地选这个人、这种关系，或选择先对齐自己的价值观。心动是开始，命名你要的生活才是这张牌的工作。",
        "The Lovers is a choice, not only attraction. In love it asks you to choose this person, this kind of bond, or to align with your own values first. Desire starts the story. Naming the life you want is the card's work.",
      ),
      L(
        "事业上，你站在分岔口。合作、跳槽、作品方向，都需要一个公开的选择。选与你的价值观一致的那条，而不是看起来最热闹的那条。对齐之后，行动会变轻。",
        "At work you stand at a fork. A partnership, a move, a direction for the work all need a public choice. Take the road that matches your values, not the one that looks busiest. After the alignment, action gets lighter.",
      ),
      L(
        "身心与金钱上，恋人牌要你选择一种你真正想过的方式，而不是两头讨好。花费、饮食、关系里的时间，都是价值的投票。把票投给你说过想成为的那个人。",
        "For body and money, the Lovers asks you to choose a way you actually want to live, not to please both sides. Spending, food, and time in relationships are votes for a value. Cast the vote for the person you said you wanted to become.",
      ),
      L(
        "把选择说出来。告诉相关的人你选哪一边，以及你因此不再做的那一件事。",
        "Say the choice aloud. Tell the people involved which side you are taking, and the one thing you will stop doing because of it.",
      ),
    ),
    reversed: domains(
      L(
        "逆位的恋人是价值观错位、三角牵扯，或是迟迟不选择。关系里的暧昧如果让人痛苦，就不是浪漫，是未完成的决定。看清你在逃避哪一个“不”。",
        "Reversed, the Lovers is a mismatch of values, a triangle, or a choice endlessly delayed. Ambiguity that hurts is not romance. It is an unfinished decision. See which “no” you are avoiding.",
      ),
      L(
        "工作上容易因为怕选错而两边都抓，结果两边都浅。或是合作的价值观其实并不一致。先停止一个你已经知道不对的选项。",
        "Work grabs both sides for fear of choosing wrong, and both stay shallow. Or a partnership does not share values after all. Stop the option you already know is wrong.",
      ),
      L(
        "金钱和身体会反映内心的分裂：一边节省一边挥霍，一边养生一边熬夜。逆位要求你结束这种对打。选一个标准，执行七天。",
        "Money and the body mirror an inner split: saving and splurging, wellness and sleepless nights. The reversal asks you to end the fight. Pick one standard and keep it for seven days.",
      ),
      L(
        "写出你一直不肯说的那个选择。哪怕先只对自己说完，分裂也会小一圈。",
        "Write the choice you have refused to say. Even saying it only to yourself makes the split a little smaller.",
      ),
    ),
  },
  "major-07": {
    upright: domains(
      L(
        "战车在感情里是把两股相反的拉力驾驭成同一个方向。你们可以很不同，只要目的地是一起定的。它也支持主动推进：约见、摊牌、把关系从停滞里开出去。",
        "In love the Chariot harnesses two opposing pulls into one direction. You can be very different if the destination was chosen together. It also favors a forward move: the meeting, the honest talk, driving the bond out of a stall.",
      ),
      L(
        "事业上，战车要你定目标并自己握住缰绳。竞争、出差、推进一个卡住的项目，都适合。意志要集中，情绪和野心都得为同一个终点服务。",
        "At work the Chariot asks you to set the destination and hold the reins. Competition, travel, and a stuck project that needs a push all fit. Will has to focus. Feeling and ambition both serve the same finish.",
      ),
      L(
        "身体需要有方向的运动，金钱需要一个不被每天情绪改写的目标。定一个短期终点，按天前进。胜利来自持续的驾驭，不是来自一次爆发。",
        "The body wants movement with a direction, and money wants a goal that daily moods do not rewrite. Set a short finish line and advance by the day. The win comes from steady driving, not from one explosion.",
      ),
      L(
        "写下终点，以及今天能往前的一个动作。出发，并且不要在半路改目的地。",
        "Write the destination and one move that advances it today. Leave, and do not change the destination halfway.",
      ),
    ),
    reversed: domains(
      L(
        "逆位的战车是关系里各拉各的，或是一方强行决定方向。如果推进变成了压迫，停下车。没有共同的终点，速度只会使你们更远。",
        "Reversed, the Chariot is two people pulling apart, or one person forcing the direction. If momentum has become pressure, stop the cart. Without a shared destination, speed only makes you farther apart.",
      ),
      L(
        "工作上可能是失去方向的忙，或是野心碾过了合作。检查你在赶的是目标，还是一种不肯停的焦虑。把缰绳收回来，取消一个没有终点的冲刺。",
        "Work is busy without a direction, or ambition rolling over collaboration. Check whether you are chasing a goal or an anxiety that refuses to stop. Take the reins back and cancel one sprint that has no finish.",
      ),
      L(
        "身体会被硬撑伤到，金钱会被冲动的加速花掉。逆位说：停一天，重新对齐。恢复本身就是前进。",
        "The body gets hurt by forcing, and money gets spent by an impulsive acceleration. The reversal says stop for a day and realign. Recovery is itself forward motion.",
      ),
      L(
        "如果两股力量正在互相抵消，先别加速。坐下，把真正的终点重新说一次。",
        "If two forces are cancelling each other, do not speed up. Sit down and say the real destination once more.",
      ),
    ),
  },
  "major-08": {
    upright: domains(
      L(
        "力量在感情里不是压过对方，而是温柔地安顿自己的反应。耐心、诚实的温柔、在冲突里仍然不羞辱人，会比赢一场争吵更接近这张牌。你比怒气更大。",
        "In love Strength does not overpower the other person. It settles your own reaction with gentleness. Patience and kindness that does not humiliate in a conflict come closer to this card than winning the argument. You are larger than the anger.",
      ),
      L(
        "事业上，力量是持久的勇气：难谈话、慢功夫、用软的方式带领强硬的局面。适合需要耐心的谈判和创作。你不需要变得更凶，需要变得更稳。",
        "At work Strength is courage that lasts: the hard conversation, the slow craft, leading a sharp situation with a soft hand. It favors negotiation and making that need patience. You do not need to be harsher. You need to be steadier.",
      ),
      L(
        "身心上，这是驯服焦虑和欲望而不是消灭它们的牌。规律的身体练习、对冲动消费说一句温柔的不，都是力量。健康来自日复一日的善意。",
        "For the body, this card tames anxiety and appetite instead of destroying them. A regular physical practice, a gentle no to impulse spending, both are Strength. Health comes from kindness repeated daily.",
      ),
      L(
        "下一次你想吼或想逃的时候，先把手放在心口，用更慢的声音把需要说完。",
        "The next time you want to shout or run, put a hand on your chest and finish the need in a slower voice.",
      ),
    ),
    reversed: domains(
      L(
        "逆位的力量可能是自我怀疑，或是温柔用尽后变成刻薄。关系里如果你一直在忍，那不是力量，是压抑。找出一件你不该再吞下去的事。",
        "Reversed, Strength can be self-doubt, or gentleness that has run out and turned sharp. If you have only been enduring, that is not strength. It is suppression. Name one thing you should stop swallowing.",
      ),
      L(
        "工作上容易对自己太狠，或是在关键时刻泄气。检查是不是用忙来证明自己够强。真正的力量包括休息，也包括求助。",
        "Work turns cruel toward the self, or courage fails at the key moment. Check whether busyness is how you prove you are strong enough. Real strength includes rest, and it includes asking for help.",
      ),
      L(
        "身体和钱包在警告你：硬撑的代价已经出现。逆位要求减量。把一个让你羞耻的习惯放到光里，用陪伴而不是责骂去改。",
        "The body and the wallet are warning that the cost of forcing has arrived. The reversal asks you to do less. Bring one shaming habit into the light and change it with company, not with scolding.",
      ),
      L(
        "今天对自己说一句你会对好朋友说的话。然后照那句话，做一个更软的决定。",
        "Today say to yourself what you would say to a good friend. Then make one softer decision that matches it.",
      ),
    ),
  },
  "major-09": {
    upright: domains(
      L(
        "隐者在感情里需要独处来听清自己的心，不是要抛弃亲密。给关系一段不表演的安静，或自己走一段路再回来谈。有时候距离是为了把灯提得更稳。",
        "In love the Hermit needs solitude to hear the heart clearly. It is not a rejection of intimacy. Give the bond a quiet that is not a performance, or walk alone and then come back to talk. Sometimes distance is how the lamp is held steady.",
      ),
      L(
        "事业上，隐者适合深入研究、独立完成、向一个有经验的人请教，而不是挤在喧闹的共识里。你的答案在慢一点的思考中。把灯照向一个具体的问题。",
        "At work the Hermit favors deep research, solitary completion, and counsel from someone experienced, not the noise of consensus. Your answer lives in slower thought. Aim the lamp at one specific question.",
      ),
      L(
        "身心上，减少社交和信息是治疗。金钱上先不要跟风，自己把账看清楚。独处如果带着手电，就不是孤僻，是修养。",
        "For the body, less social noise and less information is the treatment. With money, do not follow the crowd until you have looked at your own numbers. Solitude with a lamp is not withdrawal. It is practice.",
      ),
      L(
        "留一个晚上不解释、不聚会。只带一个问题走路或写字，直到答案变短。",
        "Keep one evening without explaining and without a gathering. Walk or write with a single question until the answer gets shorter.",
      ),
    ),
    reversed: domains(
      L(
        "逆位的隐者可能是孤立，或是用“我需要空间”无限期躲开亲密。也可能是你拒绝独处，只好一直问别人。关系需要灯，也需要你回到桌边。",
        "Reversed, the Hermit can be isolation, or “I need space” used to postpone intimacy without end. It can also be a refusal to be alone, so you keep asking everyone else. The bond needs the lamp, and it needs you back at the table.",
      ),
      L(
        "工作上容易闭门造成脱节，或是因为害怕独自思考而不停开会。检查你的撤退有没有归期。把一个结论带回团队，或给自己一个真正无人的小时。",
        "Work isolates until you are out of touch, or fear of thinking alone fills the day with meetings. Check whether the retreat has a return date. Bring one conclusion back to the group, or give yourself a truly empty hour.",
      ),
      L(
        "身心会因为过度封闭或过度寻求建议而更乱。金钱上别在孤独的恐慌里做大决定。找一个可信的人说十分钟，然后自己留下。",
        "The body and mind get noisier from too much closing off or too much advice. Do not make a large money decision inside lonely panic. Talk to one trusted person for ten minutes, then stay with yourself.",
      ),
      L(
        "如果灯只照着自己、照不到路，就走回有人的地方。如果灯从未亮过，就先关上一个喧闹的窗口。",
        "If the lamp lights only you and not the road, walk back toward people. If the lamp has never been lit, close one noisy window first.",
      ),
    ),
  },
  "major-10": {
    upright: domains(
      L(
        "命运之轮在感情里提醒：季节会转。热的时候不要以为永远，冷的时候也不要以为到此为止。它支持顺势做一次调整，而不是跟整个周期对抗。有些相遇就是时机到了。",
        "In love the Wheel says the season turns. Do not treat heat as forever, or cold as the end. It favors an adjustment with the turn, not a war against the whole cycle. Some meetings happen because the timing arrived.",
      ),
      L(
        "事业上，机会和变动一起来。升迁、转向、意外的门口都可能打开。抓住轮子向上的那一段，同时知道你不能命令整个轮子。准备好，比假装能控制更有用。",
        "At work opportunity and change arrive together. A rise, a turn, an unexpected door may open. Take the part of the wheel that is lifting you, and know you cannot command the whole wheel. Readiness helps more than pretending to control it.",
      ),
      L(
        "金钱和身体都有周期。运气好时存下来，低落时不要把波动当成个人失败。健康上顺应节奏：该动的时候动，该停的时候停。",
        "Money and the body both have cycles. When luck is up, set something aside. When it dips, do not call the swing a personal failure. For health, follow the rhythm: move when it is time to move, stop when it is time to stop.",
      ),
      L(
        "承认有一件事正在转向。顺着它做一件准备，而不是把轮子按停。",
        "Admit that something is turning. Make one preparation that goes with it, instead of trying to hold the wheel still.",
      ),
    ),
    reversed: domains(
      L(
        "逆位的命运之轮是抗拒变化，或是觉得倒霉都是冲着自己来的。关系里反复打转，常常是因为该转的弯没有转。看看你正抓着哪一段旧季节不放。",
        "Reversed, the Wheel resists change, or treats bad luck as a personal attack. A relationship that circles usually missed a turn it was supposed to take. Look at which old season you are still gripping.",
      ),
      L(
        "工作上可能是错失时机，或是把一时的下行当成永久的判决。逆位不是叫你瘫倒。它叫你停止跟不可避免的变化摔跤，改做一件能在新季节里用的事。",
        "Work misses the moment, or treats a temporary dip as a permanent verdict. The reversal does not ask you to collapse. It asks you to stop wrestling the inevitable and do one thing that will be useful in the next season.",
      ),
      L(
        "财务和健康上，别在下行时做恐慌性的大动作，也别在上行时挥霍到没有缓冲。逆位暴露的是你跟周期的关系，而不只是这个月的数字。",
        "With money and health, do not make a panicked leap on the way down, and do not spend the upswing until nothing is left. The reversal shows your relationship to cycles, not only this month's number.",
      ),
      L(
        "松开一个你明知已经结束的做法。给下一转留出手，不要按住轮子。",
        "Let go of a method you already know has ended. Free a hand for the next turn.",
      ),
    ),
  },
  "major-11": {
    upright: domains(
      L(
        "正义在感情里要求公平与真话。账要算清：谁付出、谁被听见、什么协议还算数。它支持诚实的谈话和平等的决定，不支持用爱当作不讲道理的理由。",
        "In love Justice asks for fairness and the truth. The account has to be clear: who gives, who is heard, which agreement still counts. It favors an honest talk and an equal decision. It does not favor love as an excuse to be unreasonable.",
      ),
      L(
        "事业上，正义是合同、责任和后果。适合处理法律或制度事务、做出不偏私的决定、为自己的工作结果负责。把标准说在前面，然后照着做。",
        "At work Justice is the contract, the duty, and the consequence. It favors legal or institutional matters, a decision without favoritism, and owning the result of your work. Say the standard first, then follow it.",
      ),
      L(
        "金钱上把账面对清楚，该付的付，该要的要。身心上，公正也包括对你自己：不要用惩罚代替责任。一个清楚的事实，胜过一周的自责。",
        "With money, face the numbers. Pay what you owe and ask for what is yours. For the body, fairness includes you: do not replace responsibility with punishment. One clear fact is worth more than a week of guilt.",
      ),
      L(
        "写出事实，不分饰两角。然后做一个你愿意被同样标准衡量的决定。",
        "Write the facts without playing both sides. Then make a decision you would accept if the same standard were used on you.",
      ),
    ),
    reversed: domains(
      L(
        "逆位的正义是关系里的不公平、否认，或是用“讲道理”惩罚人。也可能是你拒绝看自己的那一部分。先停止歪曲事实。道歉或要求改正，都比继续争谁更正义有用。",
        "Reversed, Justice is unfairness, denial, or “being reasonable” used to punish. It may also be a refusal to see your own part. Stop bending the facts. An apology or a request for repair is more useful than another contest of who is righter.",
      ),
      L(
        "工作上可能遇到不公，或是你自己在回避后果。能申诉就申诉，该承担就承担。逆位不鼓励自怜式的含糊。把一件被推迟的责任完成。",
        "Work may be unjust, or you may be dodging a consequence. Appeal where you can, and carry what is yours. The reversal does not reward vague self-pity. Finish one responsibility you have postponed.",
      ),
      L(
        "金钱和身体上，别自欺。漏掉的账单、被忽略的症状，都是未审的案子。今天处理其中一件，让后果回到正确的人身上。",
        "With money and the body, do not fool yourself. A missed bill or an ignored symptom is an unheard case. Handle one of them today so the consequence returns to the right person.",
      ),
      L(
        "问：我在哪里没有说真话。补上那一句，公平才会开始。",
        "Ask where you have not told the truth. Supply that sentence. Fairness starts there.",
      ),
    ),
  },
  "major-12": {
    upright: domains(
      L(
        "倒吊人在感情里是自愿的暂停。有些关系需要你先不争赢，换一个角度看对方。牺牲如果是你选择的、有期限的，就会带来新的理解。它不是叫你无限期受苦。",
        "In love the Hanged Man is a pause you choose. Some bonds need you to stop trying to win and see the other person from another angle. A sacrifice that you chose, and that has an end, brings a new understanding. It does not ask you to suffer without a limit.",
      ),
      L(
        "事业上，进度会慢，而这慢是有意义的。等待批复、换一种方法、暂时不强推，可能比硬冲更接近结果。用这段悬挂整理你真正要的是什么。",
        "At work progress slows, and the slowness means something. Waiting on approval, changing a method, or not forcing the push can come closer to the result than charging. Use the suspension to sort out what you actually want.",
      ),
      L(
        "身心需要悬挂式的休息：少做一点，让神经系统换气。金钱上不适合急于投资。先看，再动。你放下的那一点控制，会换来更清楚的判断。",
        "The body needs a hanging kind of rest: do less and let the nerves breathe. Money is not ready for a rushed investment. Look first, then move. The bit of control you set down buys a clearer judgment.",
      ),
      L(
        "主动停下一件你一直在用力的事，给它一个结束日期。在那之前，只观察，不争辩。",
        "Willingly pause one thing you have been forcing, and give the pause an end date. Until then, observe and do not argue.",
      ),
    ),
    reversed: domains(
      L(
        "逆位的倒吊人是停滞不前，或是牺牲已经没有意义还在继续。关系里如果你只是被吊着、没有新的看见，就该下来。拖延决定本身也是一种决定。",
        "Reversed, the Hanged Man is a stall, or a sacrifice that no longer teaches and still continues. If you are only hanging in the relationship and seeing nothing new, come down. Delaying the decision is itself a decision.",
      ),
      L(
        "工作上，等待变成了逃避。该交的不交，该停的项目还占着资源。逆位叫你结束悬挂：要么换角度后行动，要么承认这件事先放到地上。",
        "At work waiting has become avoidance. What should be delivered is not, and a project that should stop still holds resources. The reversal says end the suspension: act from the new angle, or set the matter on the ground.",
      ),
      L(
        "身体会因长期紧绷的“再撑一下”而抗议。金钱上，拖延处理会让小问题变成代价。下来，处理一件具体的事。",
        "The body protests a long “just a little longer.” With money, delay turns a small problem into a cost. Come down and handle one concrete thing.",
      ),
      L(
        "如果你已经看够了，就从树上下来。做一个小决定，让生活重新着地。",
        "If you have seen enough, come down from the tree. Make one small decision so life can touch the ground again.",
      ),
    ),
  },
  "major-13": {
    upright: domains(
      L(
        "死神在感情里结束的是一种旧的形式，不一定是人。有些相处方式、称谓或幻想该被放下，关系才可能换成新的活法。哀悼是这张牌允许的，抓住尸体不放则不是。",
        "In love Death ends an old form, not necessarily a person. Some ways of being together, some titles, some fantasies have to be set down before the bond can live differently. Grief is allowed. Holding the corpse is not.",
      ),
      L(
        "事业上，这是转型、项目结束、身份更换。抗拒结束只会把腐朽拖久。干净地收尾，给下一件事物腾出位置。它是严肃的开始，不是惩罚。",
        "At work this is a transition, a project ending, a change of identity. Resisting the end only drags the decay out. Close cleanly and make room for the next thing. It is a serious beginning, not a punishment.",
      ),
      L(
        "身心与金钱上，放下一个已经不服务你的习惯、订阅或身份。健康常常从停止一件有害的事开始。让结束变得具体：日期、动作、你不再做的那一项。",
        "For body and money, release a habit, a subscription, or an identity that no longer serves you. Health often starts by stopping one harmful thing. Make the ending concrete: a date, an action, the item you will not do again.",
      ),
      L(
        "选出一件该结束的事，今天给它一个清楚的收尾。然后留一点时间难过，不必立刻振作。",
        "Choose one thing that should end and give it a clear close today. Then leave a little time to be sad. You do not have to brighten immediately.",
      ),
    ),
    reversed: domains(
      L(
        "逆位的死神是该结束却拖着，或是害怕任何变化以至于关系停在名存实亡。也可以是你变得太决绝，还没哀悼就切断一切。看看到底是舍不得，还是不肯感受。",
        "Reversed, Death is an ending that gets dragged, or a fear of any change that leaves the bond alive only in name. It can also be a cut so absolute that you never grieve. See whether this is attachment, or a refusal to feel.",
      ),
      L(
        "工作上，旧角色还占着你的日历，新的又进不来。或者你为了“重生”而冲动辞职，没有收尾。逆位要求一个有次序的结束，而不是无限期的也许。",
        "At work the old role still owns the calendar and the new one cannot enter. Or you quit in the name of rebirth without closing anything. The reversal wants an orderly ending, not an endless maybe.",
      ),
      L(
        "身体和财务会承担拖延的代价：该看的医生不看，该停的支出不停。也可以是过度切割，连有用的支持一起扔。只结束那一件真正死了的。",
        "The body and the finances carry the cost of delay: the doctor unvisited, the expense unstopped. Or the cut is so wide that useful support goes with it. End only the thing that is actually dead.",
      ),
      L(
        "如果它已经结束，就停止把它当成还活着。如果它还活着，就不要用“重生”当借口逃走。",
        "If it has ended, stop treating it as alive. If it is still alive, do not use “rebirth” as the excuse to run.",
      ),
    ),
  },
  "major-14": {
    upright: domains(
      L(
        "节制在感情里是调和，不是将就。两种脾气、两种需求，可以慢慢兑成一种你们都喝得下的方式。它不喜欢极端表白后的极端冷淡。稳定的温度，比戏剧更可贵。",
        "In love Temperance is blending, not settling for less. Two temperaments and two needs can be mixed slowly into something you can both drink. It dislikes extreme confession followed by extreme cold. A steady temperature is worth more than drama.",
      ),
      L(
        "事业上，节制把不同的技能、节奏和人调在一起。适合合作、修改、找到可持续的步伐。不要一下子全押，也不要完全不动。中庸在这里是技艺。",
        "At work Temperance mixes different skills, tempos, and people. It favors collaboration, revision, and a pace you can sustain. Do not bet everything at once, and do not freeze. The middle here is a craft.",
      ),
      L(
        "这是身心和金钱的好牌：规律饮食、适度花费、工作与休息的配比。治疗来自一点点地调，不是来自极端的改造。找到你的配方。",
        "This is a good card for body and money: regular meals, moderate spending, a ratio of work and rest. Healing comes from adjusting by small amounts, not from an extreme remake. Find your recipe.",
      ),
      L(
        "把两个极端各让一寸。今天只调整一个比例，让它能维持一周。",
        "Give one inch from each extreme. Today adjust a single ratio so it can last a week.",
      ),
    ),
    reversed: domains(
      L(
        "逆位的节制是关系里的失衡：忽冷忽热、过度融合或完全不调。有人在过度迁就，有人在过量。先恢复各自的杯子，再谈混合。",
        "Reversed, Temperance is a bond out of balance: hot and cold, merging too far, or no blending at all. Someone is over-accommodating and someone is in excess. Restore each person's cup before you talk about mixing.",
      ),
      L(
        "工作上容易走极端：熬夜冲刺然后崩溃，或是改到失去原意。逆位叫你停止加料。回到一个简单、重复得了的做法。",
        "Work goes to extremes: a sleepless sprint and then a collapse, or revisions that lose the original point. The reversal says stop adding. Return to a simple practice you can repeat.",
      ),
      L(
        "身体和钱包不喜欢极端节食、极端消费或极端怠惰。失衡已经在发出信号。把今天的一件事从过量改回适量。",
        "The body and the wallet dislike extreme dieting, extreme spending, or extreme idleness. Imbalance is already signaling. Take one thing today from too much back to enough.",
      ),
      L(
        "找到那个过多的成分，舀出一勺。调和从减量开始，而不是从再加一味开始。",
        "Find the ingredient that is too much and lift out a spoonful. Blending starts by reducing.",
      ),
    ),
  },
  "major-15": {
    upright: domains(
      L(
        "恶魔在感情里指出束缚：欲望、嫉妒、舍不得、一种你明知不好还在重复的模式。它不一定要你立刻离开，它要你看见锁是松的。承认上瘾式的靠近，自由才开始。",
        "In love the Devil names the bind: desire, jealousy, the inability to leave, a pattern you repeat while knowing better. It does not always demand that you go today. It demands you see that the lock is loose. Admit the addictive closeness. Freedom starts there.",
      ),
      L(
        "事业上，恶魔可能是金手铐、过度野心，或一个让你丢脸又放不下的职位。问你留下是因为成长，还是因为害怕失去身份。看清利益和代价。",
        "At work the Devil can be golden handcuffs, excess ambition, or a role you are ashamed of and still cannot drop. Ask whether you stay to grow or to avoid losing an identity. See the benefit and the cost clearly.",
      ),
      L(
        "金钱、性、食物、屏幕，都可能是这张牌的链子。身心上先不要道德审判，先记录它何时出现。一个被看见的习惯，比一个被咒骂的习惯更容易松动。",
        "Money, sex, food, and screens can all be this card's chain. For the body, skip the moral trial and first note when the habit appears. A habit that is seen loosens faster than a habit that is cursed.",
      ),
      L(
        "说出那根链子的名字。今天少做一次你明明可以不做的事，证明锁不是焊死的。",
        "Say the chain's name. Today skip one repetition you are actually free to skip, and prove the lock is not welded shut.",
      ),
    ),
    reversed: domains(
      L(
        "逆位的恶魔是松绑的开始，也可能是才逃出来又回头看。感情里适合结束不健康的纠缠，同时警惕“我已经自由了”这句话说来太早。自由需要一个新的日常，不只是一次决裂。",
        "Reversed, the Devil is the start of loosening, or the glance back after you have just escaped. In love it favors ending an unhealthy tangle, and it warns that “I am free” can be said too early. Freedom needs a new ordinary day, not only a rupture.",
      ),
      L(
        "工作上，你可能正在离开一个束缚你的位置，或终于承认野心的代价。逆位支持解约、拒绝、把自我从职位上揭下来。走的时候把链子留下，别带到下一份工作。",
        "At work you may be leaving a role that bound you, or finally admitting what ambition costs. The reversal favors the resignation, the refusal, the self peeled off the job title. Leave the chain behind. Do not carry it into the next job.",
      ),
      L(
        "身心上，恢复正在发生，但别用另一种极端替换旧瘾。金钱上适合切断一笔让你羞耻的支出。给新的自由一个很小的替代动作。",
        "For the body, recovery is happening, but do not replace the old addiction with a new extreme. With money, cut one expense that shames you. Give the new freedom one small action to stand on.",
      ),
      L(
        "如果你已经松开，就不要为了熟悉再扣上。安排一件链子之外的事，让明天有地方去。",
        "If you have loosened it, do not fasten it again for familiarity. Schedule one thing outside the chain so tomorrow has somewhere to go.",
      ),
    ),
  },
  "major-16": {
    upright: domains(
      L(
        "高塔在感情里是突然的真话。隐瞒、不牢的假设、撑太久的结构会裂开。它很震，但裂开的是不能再住的部分。先保证人安全，再决定关系还剩下什么。",
        "In love the Tower is a sudden truth. A concealment, a weak assumption, a structure held too long splits open. It shakes, and what splits is the part that could not be lived in. Make sure people are safe, then see what of the bond remains.",
      ),
      L(
        "事业上，高塔是计划崩塌、公开的失败、一个你以为稳的位置被动摇。不要第一时间重建原样。先看哪些是真地基，哪些只是门面。危机把多余的东西拆掉。",
        "At work the Tower is a collapsed plan, a public failure, a position you thought was solid now shaking. Do not rebuild the original at once. See which part is real foundation and which was a facade. The crisis removes what was extra.",
      ),
      L(
        "身体可能用突然的疲惫或生病叫停，金钱上可能有意外支出。高塔不是叫你恐慌性抛售人生。它叫你停止假装没听见响声。先处理安全，再处理面子。",
        "The body may stop you with sudden exhaustion or illness, and money may bring an unexpected cost. The Tower does not ask you to panic-sell your life. It asks you to stop pretending you did not hear the crack. Safety first, appearance later.",
      ),
      L(
        "承认已经倒了的那一块。今天只做保护性的事：说真话、找支援、不要在尘土里立刻盖回同一座塔。",
        "Admit the piece that has already fallen. Today do only what protects: tell the truth, find support, and do not raise the same tower in the dust.",
      ),
    ),
    reversed: domains(
      L(
        "逆位的高塔是拖延的崩溃，或是你害怕震动而把裂缝粉刷掉。关系里小的真话现在说，比将来整栋倒下便宜。也可以是灾后的余震：还在怕，但最坏的已经过去。",
        "Reversed, the Tower is a delayed collapse, or cracks painted over because you fear the shake. A small truth in the relationship now is cheaper than the whole building later. It can also be aftershock: you are still afraid, and the worst has passed.",
      ),
      L(
        "工作上，预警已经被忽略。逆位请你主动拆掉一个不稳的部分，而不是等它公开倒塌。如果倒塌已经发生，就停止灾难化，开始清理。",
        "At work the warning has been ignored. The reversal asks you to dismantle one unstable part yourself instead of waiting for a public fall. If the fall already happened, stop catastrophizing and start clearing.",
      ),
      L(
        "身心和金钱上，别用否认度过余震。检查真正的损害：身体哪里受伤，账上哪里破洞。只修破的地方，不要把整个人生判为废墟。",
        "For body and money, do not ride the aftershock with denial. Check the real damage: where the body is hurt, where the account is open. Repair the break. Do not condemn the whole life as rubble.",
      ),
      L(
        "如果还没倒，就自己拆掉最危险的那一块。如果已经倒了，就从灰尘里捡起还完好的一件东西。",
        "If it has not fallen, take down the most dangerous piece yourself. If it has fallen, pick up one thing from the dust that is still whole.",
      ),
    ),
  },
  "major-17": {
    upright: domains(
      L(
        "星星在感情里是风暴后的温柔希望。它支持疗愈、坦白脆弱、重新相信靠近是安全的。不要急着承诺永远，先让一盏小灯亮着。真诚的愿望比完美的表现更动人。",
        "In love the Star is gentle hope after a storm. It favors healing, naming vulnerability, and trusting again that closeness can be safe. Do not rush a forever. Let a small lamp stay lit. A sincere wish moves more than a perfect performance.",
      ),
      L(
        "事业上，星星是长远的愿景重新变得可见。适合创作、疗愈性的工作、在失败后继续把作品做下去。它不保证立刻成功，它保证方向是干净的。",
        "At work the Star makes a long vision visible again. It favors making, healing work, and continuing a piece after failure. It does not promise immediate success. It promises the direction is clean.",
      ),
      L(
        "身心上，这是休息和补水的牌，字面意思也可以是多喝水、接触安静的自然。金钱上适合为希望存一笔小的、稳定的，而不是赌一把大的。",
        "For the body this is rest and water, sometimes literally: drink, and meet quiet nature. With money, save a small steady amount toward a hope instead of gambling on a large one.",
      ),
      L(
        "说出一个你还愿意相信的未来，并做一个与它相符的温柔动作。灯不需要很大。",
        "Name a future you are still willing to trust, and do one gentle action that matches it. The lamp does not have to be large.",
      ),
    ),
    reversed: domains(
      L(
        "逆位的星星是希望变暗，或是用幻想代替疗愈。感情里如果只剩“总会好的”而没有实际的照顾，信任会继续漏。把愿望收回来，先做一件能感到安慰的实事。",
        "Reversed, the Star dims, or fantasy replaces healing. In love, “it will be fine” without actual care keeps trust leaking. Bring the wish back down and do one practical thing that comforts.",
      ),
      L(
        "工作上容易失去信心，或是愿景大到无法开始。逆位叫你把星星从天上拿到桌上：一个小步骤，一个真实的技能，而不是另一张灵感板。",
        "Work loses faith, or the vision is too large to start. The reversal brings the star from the sky to the table: one small step, one real skill, not another inspiration board.",
      ),
      L(
        "身心上，失望会变成忽视自己。金钱上别因为灰心而放弃基本的照料，也别把全部希望押在一个奇迹收入上。先把杯子倒满。",
        "For the body, disappointment becomes self-neglect. With money, do not abandon basic care because you are discouraged, and do not stake every hope on a miracle income. Fill the cup first.",
      ),
      L(
        "如果信仰漏了，就补一个很小的证据：今天对希望做一件具体的事。",
        "If faith is leaking, add one small piece of evidence: do something concrete for that hope today.",
      ),
    ),
  },
  "major-18": {
    upright: domains(
      L(
        "月亮在感情里是雾：不安、投射、没说清的恐惧。你可能在对一个想象中的对方反应。先不要做永久决定。把梦和猜测写下来，等天亮再谈那件真正发生的事。",
        "In love the Moon is fog: unease, projection, fear that has not been named. You may be reacting to an imagined version of the other person. Do not make a permanent decision yet. Write the dream and the guess, and talk about what actually happened when it is light.",
      ),
      L(
        "事业上，信息不全，谣言和焦虑会装成事实。适合创意和直觉的萌芽，不适合签字和公开摊牌。再核对一次来源。月亮会过去，决定可以等。",
        "At work the information is incomplete, and rumor and anxiety dress up as fact. Creative and intuitive beginnings fit. Signing and public confrontations do not. Check the source once more. The Moon passes. The decision can wait.",
      ),
      L(
        "身心上，睡眠、焦虑和消化都会受月亮影响。别在半夜做财务决定。金钱上谨防看不清的承诺。先照亮路径：问清楚、写下来、白天再看。",
        "Sleep, anxiety, and digestion all feel the Moon. Do not make a money decision at midnight. Beware a promise you cannot see clearly. Light the path: ask, write it down, and look again by day.",
      ),
      L(
        "把恐惧写成两列：已知的事实，和我脑中的故事。只根据第一列采取下一步。",
        "Write the fear in two columns: facts I know, and the story in my head. Take the next step only from the first column.",
      ),
    ),
    reversed: domains(
      L(
        "逆位的月亮是雾开始散，或是秘密被揭开。感情里适合把误会说清，同时小心刚刚看见的真相还带着情绪的放大。慢慢确认，不要从恐慌跳进另一个故事。",
        "Reversed, the Moon's fog thins, or a secret comes out. In love it favors clearing a misunderstanding, while remembering that a newly seen truth still carries magnified feeling. Confirm slowly. Do not jump from panic into another story.",
      ),
      L(
        "工作上，混淆在减退。你终于看得出哪里是恐惧、哪里是任务。逆位支持提问、澄清职责、结束猜测。把隐藏的信息放到桌面上。",
        "At work the confusion is receding. You can finally tell fear from the task. The reversal favors questions, clarified duties, and an end to guessing. Put the hidden information on the table.",
      ),
      L(
        "身心上，焦虑如果被命名，就会小一些。金钱上适合把一笔模糊的账算清。逆位不是完全安全，它是你终于肯开灯。",
        "For the body, anxiety shrinks once it is named. With money, add up one vague account. The reversal is not total safety. It is you finally willing to turn on the light.",
      ),
      L(
        "说出一个你一直放在雾里的事实。让它在白天被看一次。",
        "Say one fact you have kept in the fog. Let it be seen once in daylight.",
      ),
    ),
  },
  "major-19": {
    upright: domains(
      L(
        "太阳在感情里是温暖、清楚和被看见的快乐。适合表白、和解后的轻松、和孩子或玩心有关的亲近。它不需要隐藏。把喜欢说得像阳光一样直接。",
        "In love the Sun is warmth, clarity, and the joy of being seen. It favors a confession, ease after repair, and closeness that includes children or play. It does not need hiding. Say the affection as directly as sunlight.",
      ),
      L(
        "事业上，太阳是可见的成功、认可和精力。适合发布、展示、带领、把作品拿到光里。简单和真诚会比复杂的包装更亮。享受这一段，不必道歉。",
        "At work the Sun is visible success, recognition, and vitality. Publish, show, lead, bring the work into the light. Simplicity and sincerity shine more than complicated packaging. Enjoy the stretch without apologizing.",
      ),
      L(
        "身心上，这是活力回来的牌。出门、见光、运动、和让你笑的人在一起。金钱上可以庆祝，但太阳也喜欢清楚：知道钱在哪，然后大方地用一点在生活上。",
        "For the body, vitality returns. Go out, meet the light, move, be with someone who makes you laugh. With money you may celebrate, and the Sun also likes clarity: know where the money is, then spend a little generously on living.",
      ),
      L(
        "把一件好事说出来，让它被看见。今天做一件单纯让你暖和的事。",
        "Say one good thing out loud so it can be seen. Today do one simple thing that makes you warm.",
      ),
    ),
    reversed: domains(
      L(
        "逆位的太阳可能是快乐被推迟，或是表面热闹、里面发虚。感情里如果只能正能量、不能有阴影，亲密会变浅。允许一点云。真实的温暖包括不完美。",
        "Reversed, the Sun can be joy delayed, or a bright surface with little inside. In love, if only positivity is allowed and no shadow, intimacy stays shallow. Permit a cloud. Real warmth includes imperfection.",
      ),
      L(
        "工作上，认可迟到，或是成功亮到让你看不清问题。检查是不是在用乐观跳过困难。把一个被阳光遮住的细节补上。",
        "At work recognition is late, or success is so bright you cannot see the problem. Check whether optimism is being used to skip a difficulty. Fill in one detail the sunlight has washed out.",
      ),
      L(
        "身心上可能是短暂的低能量，或是过度消耗后的空虚。金钱上别因为“看起来很好”而忽略一个漏洞。休息也是太阳的一部分，如果光太强，就进到阴凉里一会儿。",
        "The body may be briefly low, or empty after too much output. With money, do not ignore a leak because things look fine. Rest is part of the Sun. If the light is too strong, step into shade for a while.",
      ),
      L(
        "如果快乐是真的，就收下，不必配歉意。如果只是表演，就关掉一盏多余的灯。",
        "If the joy is real, receive it without an apology attached. If it is only a performance, turn off one extra lamp.",
      ),
    ),
  },
  "major-20": {
    upright: domains(
      L(
        "审判在感情里是召唤：一段关系被重新呼唤，或是你必须回答自己到底要不要醒来。原谅、复合、认真的决定，都需要你听见那个更诚实的声音，而不只是习惯。",
        "In love Judgement is a call. A bond is summoned again, or you must answer whether you will wake. Forgiveness, reunion, and a serious decision all need the more honest voice, not only habit.",
      ),
      L(
        "事业上，审判是评审、发布、职业的召唤。过去的作品要被看见和评价。适合申请、答辩、回应一个你拖延已久的使命。起来，去回答。",
        "At work Judgement is the review, the release, the vocational call. Past work is seen and evaluated. It favors the application, the defense, the answer to a mission you have postponed. Rise and answer.",
      ),
      L(
        "身心上，这是听见身体已经说了很久的话。金钱上适合清算旧账、做一个清醒的总结。审判不是苛责，是一个让你站起来的声音。",
        "For the body, hear what it has been saying for a long time. With money, settle an old account and make a clear summary. Judgement is not cruelty. It is a voice that asks you to stand up.",
      ),
      L(
        "回应一个你已经听见的召唤。写回那封信，做那个决定，或原谅一件你准备好放下的事。",
        "Answer a call you have already heard. Write back, make the decision, or forgive something you are ready to set down.",
      ),
    ),
    reversed: domains(
      L(
        "逆位的审判是拒绝听见召唤，或是苛刻的自我判决让你起不来。感情里反复后悔、不肯原谅自己或对方，都会把号角变成噪音。放下一个已经审完的旧案。",
        "Reversed, Judgement refuses the call, or a harsh self-verdict keeps you from rising. In love, repeating regret and refusing to forgive yourself or the other person turns the horn into noise. Close a case that has already been heard.",
      ),
      L(
        "工作上，你可能在躲避评价，或是一次批评就把整个使命否掉。逆位要求分清：这是有用的反馈，还是你对自己的宣判。回应事实，不要回应羞耻。",
        "At work you may be hiding from evaluation, or one criticism cancels the whole calling. The reversal asks you to separate useful feedback from a verdict on yourself. Answer the facts, not the shame.",
      ),
      L(
        "身心上，愧疚不是健康计划。金钱上，别因为过去的错误就拒绝再看账。起来不等于完美，它只是不再装睡。",
        "For the body, guilt is not a health plan. With money, do not refuse to look at the books because of an old mistake. Rising is not perfection. It is the end of pretending to sleep.",
      ),
      L(
        "如果号角已经响了，就别再按掉。给自己一个温柔但明确的回答。",
        "If the horn has already sounded, do not silence it again. Give yourself an answer that is kind and unmistakable.",
      ),
    ),
  },
  "major-21": {
    upright: domains(
      L(
        "世界在感情里是一个周期的完成。关系到达一个圆满的阶段：在一起、好好结束、或终于成为完整的自己后再去爱。它庆祝整合。你可以既亲近，又仍然是整个人。",
        "In love the World is a cycle completed. The bond reaches a fulfilled stage: being together, ending well, or becoming a whole person before loving again. It celebrates integration. You can be close and still be entire.",
      ),
      L(
        "事业上，世界是竣工、毕业、一个阶段被世界看见。适合收尾、旅行、把作品交给更大的舞台。享受完成，同时知道完成本身会打开下一圈。",
        "At work the World is completion, graduation, a phase the world can see. Close, travel, hand the work to a larger stage. Enjoy the finish, and know that finishing itself opens the next ring.",
      ),
      L(
        "身心与金钱上，这是整合的牌。习惯、收入和身份终于连成一个你认得的生活。适合总结、庆祝、做一次完整的体检或财务回顾。你到了一个可以跳舞的地方。",
        "For body and money, this is integration. Habits, income, and identity finally connect into a life you recognize. Summarize, celebrate, do a full health or money review. You have arrived somewhere you can dance.",
      ),
      L(
        "把这个周期正式完成：庆祝、致谢、归档。然后才看下一圈的第一张牌。",
        "Complete the cycle formally: celebrate, thank someone, file it. Only then look at the first card of the next ring.",
      ),
    ),
    reversed: domains(
      L(
        "逆位的世界是差一步的完成，或是结束后不肯走进新的圈子。感情里可能有未说的结局、旅行或承诺被推迟。找出那个还没扣上的环。完成比重新开始更接近这张牌。",
        "Reversed, the World is a completion one step short, or an ending that refuses the next circle. In love an unspoken ending, a trip, or a promise may be delayed. Find the ring that has not closed. Finishing is closer to this card than starting over.",
      ),
      L(
        "工作上，项目差一点交付，或是你害怕完成因为完成后不知道自己是谁。逆位叫你补上最后那一笔，并允许身份更新。不要为了留在熟悉里而把结局打开。",
        "At work the project is almost delivered, or you fear finishing because you will not know who you are afterward. The reversal says add the last stroke and let the identity update. Do not reopen the ending just to stay familiar.",
      ),
      L(
        "身心和金钱上，没收好的线头会漏掉能量。一笔没结的账、一个没做完的疗程，都让圆满变空。把最后一个环扣上。",
        "For body and money, loose ends leak energy. An unsettled bill or an unfinished course of care keeps fulfillment empty. Fasten the last ring.",
      ),
      L(
        "列出还差的那一步，并在这周做完。圆满不是更多，是闭合。",
        "List the step that is still missing and finish it this week. Fulfillment is not more. It is closure.",
      ),
    ),
  },
};

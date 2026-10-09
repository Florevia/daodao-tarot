import { major } from "./factory";
import type { Card } from "./types";

export const majorArcana: Card[] = [
  major(0, { zh: "愚者", en: "The Fool" }, {
    keywords: { zh: ["出发", "信任", "天真", "未知"], en: ["beginning", "trust", "innocence", "unknown"] },
    description: {
      zh: "旅人站在悬崖边，白玫瑰与小狗陪着他，脚下是还没踏出的一步。",
      en: "A traveler stands at a cliff with a white rose and a small dog, one step not yet taken.",
    },
    upright: {
      zh: "你被邀请轻装出发。看不清全程没关系，真诚和好奇就是此刻的通行证。适合开始、试错，也适合允许自己暂时不老练。",
      en: "You are invited to travel light. You do not need the whole map; sincerity and curiosity are enough for now. This favors beginnings, experiments, and permission to be unpolished.",
    },
    reversed: {
      zh: "轻快如果没有看路，就会变成鲁莽或逃避。出发前先问自己：我是在信任生活，还是在躲开该负的责任？",
      en: "Lightness without looking becomes recklessness or escape. Before you leap, ask whether you are trusting life or dodging a responsibility.",
    },
  }),
  major(1, { zh: "魔术师", en: "The Magician" }, {
    keywords: { zh: ["意志", "技能", "聚焦", "创造"], en: ["will", "skill", "focus", "creation"] },
    description: {
      zh: "桌上摆着四样法器，他一手指天、一手指地，像在说资源已经齐了。",
      en: "The four tools rest on the table while one hand points to sky and one to earth: the resources are already here.",
    },
    upright: {
      zh: "你手里的东西比你以为的多。把注意力收成一件事，技能、话语和行动就能对上。这是动手的牌，不是继续收集灵感的牌。",
      en: "You have more in hand than you think. Gather your attention onto one thing and skill, speech, and action line up. This is a card for doing, not for collecting more ideas.",
    },
    reversed: {
      zh: "才能散着，或者话术盖过了真东西。先丢掉一个让你分心的舞台，把一件事做到别人看得见。",
      en: "Talent is scattered, or the performance is louder than the substance. Leave one distracting stage and finish something others can actually see.",
    },
  }),
  major(2, { zh: "女祭司", en: "The High Priestess" }, {
    keywords: { zh: ["直觉", "沉默", "内在", "等待"], en: ["intuition", "silence", "inwardness", "waiting"] },
    description: {
      zh: "她坐在黑白柱之间，身后是石榴帷幕，膝上的卷轴还没有打开。",
      en: "She sits between black and white pillars, a pomegranate veil behind her and a scroll still closed.",
    },
    upright: {
      zh: "答案已经在，只是还不适合大声说出来。给直觉一点安静的时间，少问别人，多听身体和梦。有些事要等帷幕自己拉开。",
      en: "The answer is already here, but it is not ready to be said aloud. Give intuition quiet, ask fewer people, and listen to the body and to dreams. Some veils open on their own.",
    },
    reversed: {
      zh: "你可能把不安当成了直觉，或是把该说的话咽了回去。分清沉默是智慧，还是在躲一次诚实的谈话。",
      en: "Unease may be masquerading as intuition, or a necessary sentence is being swallowed. Tell the difference between wise silence and avoiding an honest talk.",
    },
  }),
  major(3, { zh: "女皇", en: "The Empress" }, {
    keywords: { zh: ["滋养", "丰盛", "感官", "创造"], en: ["nurture", "abundance", "senses", "creativity"] },
    description: {
      zh: "麦田与流水环绕着她，座椅上是金星，一切都在慢慢长出来。",
      en: "Wheat and flowing water surround her, and Venus marks the seat. Everything here grows slowly.",
    },
    upright: {
      zh: "让事情有土壤。照顾身体、关系和正在成形的作品，比催熟更重要。丰盛来自照料，也来自你允许自己接收。",
      en: "Give the matter soil. Tending the body, the relationship, and the work in progress matters more than forcing ripeness. Abundance comes from care, and from letting yourself receive.",
    },
    reversed: {
      zh: "照顾可能变成了耗尽，或是感官享受盖过了真正的需要。看一看谁在被喂养，谁一直在饿着，包括你自己。",
      en: "Care may have turned into depletion, or comfort may be covering a real need. Look at who is being fed and who is still hungry, including you.",
    },
  }),
  major(4, { zh: "皇帝", en: "The Emperor" }, {
    keywords: { zh: ["结构", "边界", "担当", "秩序"], en: ["structure", "boundaries", "responsibility", "order"] },
    description: {
      zh: "他坐在石座上，身后是荒山，手里的权杖更像界桩而不是装饰。",
      en: "He sits on a stone throne before bare mountains. The scepter is closer to a boundary post than an ornament.",
    },
    upright: {
      zh: "这件事需要骨架：规则、期限、谁负责。你可以用稳定保护想保护的东西，而不是用控制吓住它。站到该站的位置上。",
      en: "This needs a frame: rules, a deadline, and a name on the responsibility. Stability can protect what you care about without scaring it. Take the seat that is yours.",
    },
    reversed: {
      zh: "秩序僵了，或是你在用强硬躲开脆弱。如果规则只为了让你不必感受，就把它松开一寸，看看真正要守的是什么。",
      en: "The order has gone rigid, or force is being used to avoid vulnerability. If a rule exists so you do not have to feel anything, loosen it and see what actually needs protecting.",
    },
  }),
  major(5, { zh: "教皇", en: "The Hierophant" }, {
    keywords: { zh: ["传统", "师承", "信念", "群体"], en: ["tradition", "teaching", "belief", "institution"] },
    description: {
      zh: "他举起手，两把钥匙在脚边，学生在下面听一套已经存在很久的说法。",
      en: "His hand is raised, two keys rest at his feet, and students listen to a teaching that has already lasted a long time.",
    },
    upright: {
      zh: "向一门手艺、一位老师或一套你尊重的传统借力。仪式、承诺和共同语言能让散乱的经验站住。适合学习和正式化。",
      en: "Borrow strength from a craft, a teacher, or a tradition you respect. Ritual, commitment, and a shared language can make scattered experience stand. This favors study and making something official.",
    },
    reversed: {
      zh: "你在质疑一套不再适合的规矩，或是盲从让你失去自己的判断。可以离开教条，但别连同其中有用的智慧一起扔掉。",
      en: "You are questioning a rule that no longer fits, or obedience has replaced your own judgment. Leave the dogma, but do not throw out the wisdom that still works.",
    },
  }),
  major(6, { zh: "恋人", en: "The Lovers" }, {
    keywords: { zh: ["选择", "契合", "价值观", "关系"], en: ["choice", "alignment", "values", "relationship"] },
    description: {
      zh: "天使在上方，两人在下方，中间是必须用真心做的选择，而不只是吸引力。",
      en: "An angel above, two figures below, and between them a choice that has to be made with the heart, not only with attraction.",
    },
    upright: {
      zh: "关系或抉择要和你的价值观对齐。吸引力是线索，诚实才是答案。适合表明立场、选择同行的人，或承认你真正想要的生活。",
      en: "The relationship or the decision wants to line up with your values. Attraction is a clue; honesty is the answer. Name your position, choose your company, or admit the life you actually want.",
    },
    reversed: {
      zh: "价值观错位、犹豫，或把选择权交了出去。如果你在等别人替你决定爱什么，这张牌请你把决定拿回来。",
      en: "Values are misaligned, or the choice has been handed to someone else. If you are waiting for another person to decide what you love, take the decision back.",
    },
  }),
  major(7, { zh: "战车", en: "The Chariot" }, {
    keywords: { zh: ["方向", "意志", "前进", "自持"], en: ["direction", "will", "momentum", "composure"] },
    description: {
      zh: "驾车的人没有缰绳，黑白两只斯芬克斯靠他的决心朝同一个方向走。",
      en: "The charioteer holds no reins. Two sphinxes, one dark and one light, move one way by the force of his focus.",
    },
    upright: {
      zh: "把相反的拉力收成一个方向。你赢不了所有声音，但可以决定车子往哪开。适合推进、竞争，以及在情绪里保持手稳。",
      en: "Pull opposing forces into one direction. You will not silence every voice, but you can decide where the chariot goes. This favors momentum, competition, and a steady hand inside strong feeling.",
    },
    reversed: {
      zh: "力气很大，方向却散了。可能是急躁、失控，或是两套目标在抢方向盘。先停车，再选一条路。",
      en: "There is plenty of force and not enough direction. Impatience, loss of control, or two goals are fighting for the reins. Stop the chariot, then choose one road.",
    },
  }),
  major(8, { zh: "力量", en: "Strength" }, {
    keywords: { zh: ["勇气", "耐心", "温柔", "内在力量"], en: ["courage", "patience", "gentleness", "inner strength"] },
    description: {
      zh: "她没有杀狮子，只是轻轻合上它的嘴，头顶是无限的符号。",
      en: "She does not kill the lion. She closes its mouth gently, and the sign of infinity rests over her head.",
    },
    upright: {
      zh: "真正有用的力量是稳，不是猛。用耐心面对恐惧、欲望或一个难相处的人。你不必压过它，你可以和它待在一起还不失控。",
      en: "The useful kind of strength is steady, not loud. Meet fear, desire, or a difficult person with patience. You do not have to overpower it. You can stay with it and remain yourself.",
    },
    reversed: {
      zh: "要么是自我怀疑盖住了勇气，要么是你在硬撑。温柔如果只对自己无效，就先把那份耐心转回来。",
      en: "Self-doubt is covering courage, or you are forcing what needs softness. If your gentleness never applies to you, turn some of that patience around.",
    },
  }),
  major(9, { zh: "隐士", en: "The Hermit" }, {
    keywords: { zh: ["独处", "寻问", "指引", "沉淀"], en: ["solitude", "seeking", "guidance", "retreat"] },
    description: {
      zh: "老人举起一盏灯走在雪山上，灯不是为了照亮全世界，只照下一步。",
      en: "An old man lifts a lantern on a snowy mountain. The light is not for the whole world, only the next step.",
    },
    upright: {
      zh: "从喧闹里退半步。你需要的不是更多意见，而是一段足够安静的时间，让自己的问题变清楚。适合独处、研究和做内心的老师。",
      en: "Step back from the noise. You need fewer opinions and a stretch of quiet long enough for the real question to appear. This favors solitude, study, and becoming your own teacher.",
    },
    reversed: {
      zh: "独处变成了孤立，或是你用思考推迟生活。灯要照路，不是把你关在洞里。该走出来的时候，就带上你已经明白的那一点。",
      en: "Solitude has become isolation, or thinking is postponing life. The lantern is for walking, not for locking the cave. When it is time, come out carrying the small thing you have understood.",
    },
  }),
  major(10, { zh: "命运之轮", en: "Wheel of Fortune" }, {
    keywords: { zh: ["转机", "周期", "时机", "变化"], en: ["turning point", "cycles", "timing", "change"] },
    description: {
      zh: "轮子在转，象征起落的生物环绕着它，中心却有一个不动的轴。",
      en: "The wheel turns, creatures of rising and falling circle it, and the hub at the center does not move.",
    },
    upright: {
      zh: "有些事正在自己转动。你能做的是看清周期，在上升时别骄傲，在下落时别把自己当成结局。抓住这个时机，但别以为你必须控制整只轮子。",
      en: "Something is turning on its own. See the cycle: do not become proud on the way up, and do not treat a downturn as your ending. Use the moment without believing you must control the whole wheel.",
    },
    reversed: {
      zh: "你在抗拒一个已经开始的变化，或是重复旧模式还不自知。运气感觉卡住时，先找你亲手没松开的那一圈。",
      en: "You are resisting a change that has already started, or an old pattern is repeating unnoticed. When luck feels stuck, look for the loop you have not released.",
    },
  }),
  major(11, { zh: "正义", en: "Justice" }, {
    keywords: { zh: ["诚实", "责任", "平衡", "后果"], en: ["honesty", "accountability", "balance", "consequence"] },
    description: {
      zh: "天平与剑都握在手里，帷幕后面没有可以躲藏的故事版本。",
      en: "Scales and sword are both in hand. Behind the veil there is no second version of the story to hide in.",
    },
    upright: {
      zh: "把事实摆正。该承认的承认，该补的补，该做的决定用清楚的标准来做。这张牌护着公平，也要求你承担自己的那一份。",
      en: "Set the facts straight. Admit what needs admitting, repair what needs repair, and decide by a clear standard. This card protects fairness and asks you to carry your part.",
    },
    reversed: {
      zh: "可能有回避、借口，或不公平的衡量。也包括对自己过分苛刻。把剑放下一点，看天平两边到底各是什么。",
      en: "Avoidance, excuses, or an unfair measure may be in play, including a measure that is too harsh on you. Lower the sword a little and look at what is actually on each side.",
    },
  }),
  major(12, { zh: "倒吊人", en: "The Hanged Man" }, {
    keywords: { zh: ["暂停", "换角度看", "交付", "悬置"], en: ["pause", "new perspective", "surrender", "suspension"] },
    description: {
      zh: "他自愿倒吊在树上，脸上并不痛苦，世界因此反过来被看见。",
      en: "He hangs from the tree by choice. His face is not in agony, and the world is visible the other way up.",
    },
    upright: {
      zh: "先别急着解套。暂停本身就是方法：换一个角度，旧问题会露出别的边。适合等待、牺牲一点控制，以及让意义慢慢倒过来。",
      en: "Do not rush the knot. The pause is the method. From another angle the old problem shows a different edge. This favors waiting, giving up a little control, and letting the meaning turn over.",
    },
    reversed: {
      zh: "停滞太久，或是你把拖延叫成了修行。如果倒吊已经不再带来新视角，就下来，用脚走路。",
      en: "The stall has lasted too long, or delay is being called a spiritual practice. If hanging upside down no longer shows you anything new, come down and walk.",
    },
  }),
  major(13, { zh: "死神", en: "Death" }, {
    keywords: { zh: ["结束", "蜕变", "放下", "重生"], en: ["ending", "transformation", "release", "renewal"] },
    description: {
      zh: "白马上的骷髅举着旗帜，旧的形态倒下，太阳却已经在两座塔之间升起。",
      en: "A skeleton on a white horse carries a banner. An old form falls, and the sun is already rising between two towers.",
    },
    upright: {
      zh: "某一章确实结束了。抗拒会把结束拖成痛苦，承认则会给新的形态腾地方。这不是惩罚，是蜕皮。适合告别、清理和不再假装还一样。",
      en: "A chapter really is over. Resistance drags the ending out; admission makes room for another form. This is not a punishment. It is a shedding. Say goodbye, clear the ground, and stop pretending it is unchanged.",
    },
    reversed: {
      zh: "你抓着已经过去的东西，或是害怕改变所以让它在暗处腐烂。主动结束，比等它自己崩掉更干净。",
      en: "You are holding what has already gone, or fear of change is letting it rot in the dark. Ending it yourself is cleaner than waiting for the collapse.",
    },
  }),
  major(14, { zh: "节制", en: "Temperance" }, {
    keywords: { zh: ["调和", "分寸", "疗愈", "融合"], en: ["tempering", "measure", "healing", "blending"] },
    description: {
      zh: "天使把水在两只杯子之间倒来倒去，一脚在水里，一脚在地上。",
      en: "An angel pours water between two cups, one foot in the water and one on the ground.",
    },
    upright: {
      zh: "把两个极端兑在一起。疗愈、合作和长期计划都靠一点点混合，不靠一次灌满。找到你能持续的节奏。",
      en: "Blend the two extremes. Healing, collaboration, and long plans happen by mixing a little at a time, not by filling the cup in one pour. Find a pace you can keep.",
    },
    reversed: {
      zh: "要么过头，要么各走各的，合不拢。过量、不耐烦或拒绝妥协，都会让这杯水洒掉。回到中间那一小步。",
      en: "It is too much, or the parts refuse to meet. Excess, impatience, or a refusal to blend spills the water. Return to one small step toward the middle.",
    },
  }),
  major(15, { zh: "恶魔", en: "The Devil" }, {
    keywords: { zh: ["执着", "欲望", "束缚", "阴影"], en: ["attachment", "desire", "bondage", "shadow"] },
    description: {
      zh: "锁链套在两人颈上，看起来很沉，其实环是松的，他们并没有被锁死。",
      en: "Chains circle two figures' necks. They look heavy, but the loops are loose. Nothing is actually locked.",
    },
    upright: {
      zh: "看清你舍不得的东西：习惯、关系、欲望或一种自我形象。它未必是敌人，但你要知道自己为什么留下。承认诱惑，比假装清高更有力量。",
      en: "See what you will not put down: a habit, a relationship, a desire, or a self-image. It may not be the enemy, but you need to know why you stay. Naming the pull is stronger than pretending to be above it.",
    },
    reversed: {
      zh: "松动已经开始。你看见了锁链是自己套上的，或是羞耻终于不再替欲望说话。把一只手抽出来就够了，不必一次变成圣人。",
      en: "The loosening has started. You can see that the chain was put on by you, or shame has stopped speaking for desire. One hand free is enough. You do not have to become a saint at once.",
    },
  }),
  major(16, { zh: "高塔", en: "The Tower" }, {
    keywords: { zh: ["突变", "真相", "崩塌", "觉醒"], en: ["upheaval", "truth", "collapse", "awakening"] },
    description: {
      zh: "闪电打中塔顶，王冠掉下来，人从不再稳固的结构里坠落。",
      en: "Lightning strikes the crown of the tower. People fall from a structure that was never as solid as it looked.",
    },
    upright: {
      zh: "一个靠掩饰撑住的结构正在裂开。突然、不舒服，但它把真实露出来了。别急着按原样重建。先看清哪些砖本来就是假的。",
      en: "A structure held up by concealment is splitting. It is sudden and unpleasant, and it shows what is real. Do not rebuild the same shape yet. See which bricks were false.",
    },
    reversed: {
      zh: "你感觉到震动，却还在把门堵住。拖延崩塌只会让声音更响。可以主动拆掉一块，而不是等整座塔砸下来。",
      en: "You feel the tremor and are still bracing the door. Delaying the collapse only makes it louder. Remove one brick on purpose instead of waiting for the whole tower.",
    },
  }),
  major(17, { zh: "星星", en: "The Star" }, {
    keywords: { zh: ["希望", "疗愈", "坦诚", "方向"], en: ["hope", "healing", "candor", "guidance"] },
    description: {
      zh: "她把水倒回池塘与大地，夜空里一颗大星给后面的路留着光。",
      en: "She pours water back into the pool and the land. One great star keeps a light on the road behind her.",
    },
    upright: {
      zh: "风暴之后还有水可以喝。希望在这里不是空话，而是你愿意再温柔地对待自己和未来。适合疗愈、坦诚，以及为一个远处的方向保持信念。",
      en: "After the storm there is still water to drink. Hope here is not a slogan. It is your willingness to be gentle with yourself and with what comes next. This favors healing, honesty, and faith in a distant direction.",
    },
    reversed: {
      zh: "希望变淡，或是你把疗愈当成了必须立刻变好。信心可以很小。先做一件让你感到被接住的事，星星还在。",
      en: "Hope is thin, or healing is being rushed into an instant recovery. Faith can be small. Do one thing that helps you feel held. The star is still there.",
    },
  }),
  major(18, { zh: "月亮", en: "The Moon" }, {
    keywords: { zh: ["不安", "幻象", "潜意识", "迷雾"], en: ["unease", "illusion", "the unconscious", "fog"] },
    description: {
      zh: "月光照着小路，狗和狼都在叫，虾从水里爬出来，路并没有消失。",
      en: "Moonlight covers the path. A dog and a wolf cry, a crayfish climbs from the water, and the road is still there.",
    },
    upright: {
      zh: "事情看不清，情绪比事实更响。不要在雾里签下终身结论。可以做梦、可以怀疑，但把重大决定留到能看见脚下石头的时候。",
      en: "The picture is unclear and feeling is louder than fact. Do not sign a lifelong conclusion in the fog. Dream and doubt if you need to, and save the large decision for when you can see the stones.",
    },
    reversed: {
      zh: "迷雾在散，或是你终于愿意面对之前投影出去的恐惧。把想象和发生过的事分开写下来，路会短一截。",
      en: "The fog is lifting, or you are ready to face a fear you had projected outward. Write what you imagined on one side and what happened on the other. The road gets shorter.",
    },
  }),
  major(19, { zh: "太阳", en: "The Sun" }, {
    keywords: { zh: ["澄明", "活力", "喜悦", "成功"], en: ["clarity", "vitality", "joy", "success"] },
    description: {
      zh: "孩子骑在白马上，向日葵排在墙边，阳光把一切照得没有藏身处。",
      en: "A child rides a white horse, sunflowers line the wall, and the light leaves almost nowhere to hide.",
    },
    upright: {
      zh: "可以简单一点。能量、坦白和可见的进展都在这张牌里。适合展示成果、享受关系、把事情说清楚。喜悦本身就是一种判断：这条路是活的。",
      en: "It can be simple. Energy, candor, and visible progress are all here. Show the work, enjoy the bond, say the thing plainly. Joy is a kind of evidence: this road is alive.",
    },
    reversed: {
      zh: "阳光还在，只是被云或自我怀疑挡住了。也许成功来了你却不敢站进去，或是快乐被你推迟。把窗帘拉开一条缝。",
      en: "The sun is still up, only clouded by doubt. Success may have arrived while you hesitate to stand in it, or joy keeps being postponed. Open the curtain a little.",
    },
  }),
  major(20, { zh: "审判", en: "Judgement" }, {
    keywords: { zh: ["召唤", "觉醒", "清算", "回应"], en: ["calling", "awakening", "reckoning", "response"] },
    description: {
      zh: "号角响起，人们从棺中坐起，不是为了受罚，而是为了回应一个叫他们的声音。",
      en: "A trumpet sounds and figures rise from their coffins, not for punishment, but to answer a voice that is calling them.",
    },
    upright: {
      zh: "有一个你已经听见的召唤。它可能是职业、关系、道歉，或一个你不能再假装没听见的自己。回应它，这一章才能真正合上。",
      en: "There is a call you have already heard. It may be work, a relationship, an apology, or a self you can no longer pretend not to hear. Answer it, and the chapter can actually close.",
    },
    reversed: {
      zh: "你听见了，却还在用忙碌或自我审判挡住回应。宽恕和行动是同一件事的两面。不要等一个完美的清白时刻。",
      en: "You heard it, and busyness or self-judgment is still blocking the reply. Forgiveness and action are two sides of the same move. Do not wait for a perfectly innocent moment.",
    },
  }),
  major(21, { zh: "世界", en: "The World" }, {
    keywords: { zh: ["完成", "整合", "抵达", "新循环"], en: ["completion", "integration", "arrival", "a new cycle"] },
    description: {
      zh: "舞者在花环中央，四角的生物都在场，像一段旅程终于能被完整地跳出来。",
      en: "A dancer stands inside a wreath, and the four living creatures are present, as if a journey can finally be danced whole.",
    },
    upright: {
      zh: "一个循环完成了。你可以把学到的东西带在身上，而不是继续考试。庆祝、收尾、分享成果，然后才是下一圈。世界不是终点的墙，是一扇圆门。",
      en: "A cycle is complete. You can carry what you learned instead of sitting the exam again. Celebrate, close the work, share it, and only then begin the next round. The World is a round door, not a dead end.",
    },
    reversed: {
      zh: "差最后一步，或是完成后的空虚让你不愿承认已经到了。把未收的尾收掉。如果还觉得不完整，找出那一个具体的缺口，而不是否定整段路。",
      en: "One step remains, or the emptiness after arrival makes you refuse to admit you got here. Finish the loose end. If it still feels incomplete, name the specific gap instead of dismissing the whole road.",
    },
  }),
];

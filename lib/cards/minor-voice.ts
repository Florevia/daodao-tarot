import type { Localized, Rank, Suit } from "./types";
import type { DomainCopy } from "./major-topics";

function L(zh: string, en: string): Localized {
  return { zh, en };
}

function domains(
  love: Localized,
  career: Localized,
  resources: Localized,
  advice: Localized,
): DomainCopy {
  return { love, career, resources, advice };
}

export const rankVoice: Record<Rank, { upright: DomainCopy; reversed: DomainCopy }> = {
  ace: {
    upright: domains(
      L("这一级是种子：感情里出现新的可能，值得用一个具体的开始去接住，而不是只在心里鼓掌。", "This rank is a seed. In love a new possibility appears, and it deserves a concrete beginning rather than private applause."),
      L("事业上，王牌是开端的许可。给灵感一个今天能完成的第一步，火种才不会灭在笔记本里。", "At work an Ace is permission to begin. Give the spark a first step you can finish today so it does not die in the notebook."),
      L("身心与金钱上，它适合开始一个小习惯或一笔小的安排，而不是一次改写全部生活。", "For body and money it favors starting a small habit or a small arrangement, not rewriting an entire life at once."),
      L("今天就种下那一颗：一个动作，小到不可能失败。", "Plant it today: one action small enough that it cannot fail."),
    ),
    reversed: domains(
      L("逆位的王牌是种子被耽误，或是热情来了却没有落点。感情里先做一个很小的表示，别让开始烂在也许里。", "A reversed Ace is a seed delayed, or heat with nowhere to land. In love make one small gesture before the beginning rots in maybe."),
      L("工作上，点子很多、起步很少。先丢掉一个假的开始，把真的那一个落到日历上。", "At work there are many ideas and few starts. Drop one false beginning and put the real one on the calendar."),
      L("金钱和身体不适合在逆位王牌里豪赌。先补上被忽略的基本照料，再谈新的投入。", "Money and the body should not gamble on a reversed Ace. Restore the neglected basics before any new stake."),
      L("如果它还没开始，就选一个五分钟能做完的版本，现在做。", "If it has not started, choose a version that takes five minutes and do it now."),
    ),
  },
  "2": {
    upright: domains(
      L("二是配对与选择。感情里要把两个人、两种需要放到同一张桌上，而不是各自猜想。", "Two is pairing and choice. In love, put both people and both needs on the same table instead of guessing apart."),
      L("事业上，二要求你看清选项并做一个计划，而不是永远站在城墙上眺望。", "At work Two asks you to see the options and make a plan, rather than gaze from the wall forever."),
      L("身心与金钱上，平衡比加码重要。两头都抓一点，会比押一边更稳。", "For body and money, balance matters more than adding. Holding a little of both is steadier than betting everything on one side."),
      L("做出一个选择，并告诉相关的人你选了哪一边。", "Make one choice and tell the person involved which side you took."),
    ),
    reversed: domains(
      L("逆位的二是犹豫、错位或不敢选。感情里再看也不会出现完美答案，不选本身正在伤害靠近。", "A reversed Two is hesitation, mismatch, or fear of choosing. More looking will not produce a perfect answer in love. Not choosing is already hurting the closeness."),
      L("工作上，计划停在比较。设定一个决定的时间，到点就走。", "At work the plan stalls in comparison. Set a time to decide, and go when it arrives."),
      L("金钱和身体会因为摇摆而两边都不到位。先停一个互相打架的做法。", "Money and the body miss both targets when you sway. Stop one practice that fights the other."),
      L("今天结束一个开放的选项。留下的那个，认真对待。", "Close one open option today. Treat the one that remains seriously."),
    ),
  },
  "3": {
    upright: domains(
      L("三是第一次长出来的成果。感情里适合表达、庆祝、让第三种东西出现：共同的计划、作品或玩笑。", "Three is the first visible growth. In love, express, celebrate, and let a third thing appear: a shared plan, a making, a joke."),
      L("事业上，三支持合作与扩展。你已经出发，现在要看船，也要继续给它方向。", "At work Three supports collaboration and expansion. You have already left. Watch the ships and keep giving them a direction."),
      L("身心与金钱上，成长需要被看见和被滋养。分享一点进展，会让它更稳。", "For body and money, growth needs to be seen and fed. Sharing a little progress makes it steadier."),
      L("把已经长出来的那一部分展示给一个人，并约好下一步。", "Show what has already grown to one person, and agree on the next step."),
    ),
    reversed: domains(
      L("逆位的三是表达受阻，或是三角关系让成长变味。感情里先说清谁在场，再谈庆祝。", "A reversed Three blocks expression, or a triangle spoils the growth. In love, say clearly who is present before you talk about celebration."),
      L("工作上，合作可能散掉，扩展变成延迟。收回一个失焦的分支。", "At work collaboration frays and expansion becomes delay. Pull back one branch that has lost focus."),
      L("身体和财务上的成长如果只停在谈论，就不会结果。做一个能测量的小进展。", "Growth in body or money that stays in talk will not fruit. Make one small progress you can measure."),
      L("减少一个多余的人、计划或借口，让该长的那一件重新得到空气。", "Remove one extra person, plan, or excuse so the thing that should grow gets air again."),
    ),
  },
  "4": {
    upright: domains(
      L("四是稳定的容器。感情里需要可预期的安全：规律的联系、清楚的家、一种不用天天重新谈判的在一起。", "Four is a stable container. Love needs predictable safety: regular contact, a clear home, a togetherness that is not renegotiated every day."),
      L("事业上，四把基础打好。流程、休息和边界会比再冲一次更有产出。", "At work Four lays the base. Process, rest, and boundaries will produce more than another charge."),
      L("身心与金钱上，这是巩固的牌。固定储蓄、固定作息、把一个角落整理到可以居住。", "For body and money this is consolidation. A fixed saving, a fixed rhythm, one corner made livable."),
      L("守住一个已经好的结构，今天不要为了新鲜去拆它。", "Keep a structure that is already good. Do not dismantle it today for the sake of novelty."),
    ),
    reversed: domains(
      L("逆位的四是容器变僵，或是稳定从来没建立。感情里如果安全感只是控制，就把窗打开一寸。", "A reversed Four is a container gone rigid, or stability that was never built. In love, if safety is only control, open the window an inch."),
      L("工作上，要么流程卡死，要么基础不存在还在往上盖。先修地基或拆掉一条无用的规矩。", "At work the process is stuck, or there is no foundation and you are still building up. Repair the base or remove one useless rule."),
      L("身体会因为过稳而发闷，金钱会因为守成而错过必要的调整。检查这个结构还在保护谁。", "The body goes stale from too much stillness, and money misses a needed adjustment by clinging. Check whom this structure still protects."),
      L("松开一个已经不再服务你的习惯，同时保留真正让你安心的那一条。", "Loosen one habit that no longer serves you, and keep the one rule that still makes you safe."),
    ),
  },
  "5": {
    upright: domains(
      L("五是冲突与失去舒适。感情里的摩擦要把真正的需要说出来，而不是为了赢。争吵如果指向修补，就还有用。", "Five is conflict and lost comfort. Friction in love should name the real need, not chase a win. An argument is useful if it points toward repair."),
      L("事业上，五是竞争、意见不合或规则被挑战。看见阻力的具体形状，比抱怨局面更有帮助。", "At work Five is competition, disagreement, or a rule being challenged. Seeing the exact shape of the resistance helps more than complaining about the weather."),
      L("身心与金钱上，这是不适的牌。损失、焦虑或身体的抗议都在要求你调整策略，而不是硬撑旧的打法。", "For body and money this is discomfort. A loss, anxiety, or the body's protest asks you to change tactics rather than force the old game."),
      L("只处理一场冲突，把它说清楚，然后停手。不要同时开五条战线。", "Handle one conflict. Say it clearly, then stop. Do not open five fronts at once."),
    ),
    reversed: domains(
      L("逆位的五是冲突开始缓和，或是你终于肯退出一场没有意义的战。感情里适合和解，但要留下教训，而不是假装没发生。", "A reversed Five is conflict easing, or you finally willing to leave a pointless fight. Love can reconcile, and it should keep the lesson rather than pretend nothing happened."),
      L("工作上，内耗可以结束了。把精力从争斗挪回任务。如果还在打，问这场胜负值不值得。", "At work the internal battle can end. Move energy from the fight back to the task. If you are still fighting, ask whether the victory is worth it."),
      L("身体和财务在逆位五里开始恢复，前提是你停止反复撕开同一个伤口。给恢复一个不被打扰的窗口。", "Body and money begin to recover on a reversed Five if you stop reopening the same wound. Give recovery a window that is not disturbed."),
      L("放下一个你已经知道赢不了、也不该赢的争执。", "Set down a fight you already know you cannot win and should not win."),
    ),
  },
  "6": {
    upright: domains(
      L("六是移动与施受。感情里有人走向谁、谁在给予、记忆如何被温柔对待。允许帮助进来，也允许自己离开一段旧路。", "Six is movement and giving. In love, someone walks toward someone, someone gives, and memory is treated gently. Let help in, and let yourself leave an old road."),
      L("事业上，六是过渡：离开、抵达、得到认可或把经验传下去。顺着已经开始的旅程走，不要在门口再谈判一次。", "At work Six is passage: leaving, arriving, being recognized, or passing experience on. Continue the journey that has started. Do not renegotiate it in the doorway."),
      L("身心与金钱上，流动比囤积健康。该给的给予，该接受的接受，该走的路就走。", "For body and money, flow is healthier than hoarding. Give what should be given, receive what should be received, and take the road that is time to take."),
      L("完成一次给予或一次离开。让事情从手里经过，而不是握死。", "Complete one act of giving or one departure. Let the matter pass through your hands instead of locking it there."),
    ),
    reversed: domains(
      L("逆位的六是给予不均，或是走不出去。感情里看看谁一直在送、谁不肯收，旅途是不是只停在怀念。", "A reversed Six is unequal giving, or an inability to leave. In love, see who always offers and who will not receive, and whether the journey is only nostalgia."),
      L("工作上，过渡被拖延，认可迟迟不到，或是你拒绝离开一个已经完成的角色。", "At work the passage is delayed, recognition is late, or you refuse to leave a role that is already complete."),
      L("金钱和身体上，要么施得太空，要么收得太紧。调整方向，让流动重新公平。", "With money and the body you either give until empty or hold until nothing moves. Change the direction so the flow is fair again."),
      L("如果该走，就订一个日期。如果该收，就说一声谢谢并真的收下。", "If it is time to go, set a date. If it is time to receive, say thank you and actually take it."),
    ),
  },
  "7": {
    upright: domains(
      L("七是评估与守住。感情里不要立刻相信每一个选项或每一次诱惑。看清哪些是真的，哪些只是雾。", "Seven is assessment and holding the ground. In love, do not believe every option or every temptation at once. See which are real and which are fog."),
      L("事业上，七要求你守住立场或重新估算。策略、耐心和诚实的盘点，比再加一个想法更重要。", "At work Seven asks you to hold a position or recount. Strategy, patience, and an honest inventory matter more than one more idea."),
      L("身心与金钱上，先盘点再行动。冲动的投资、冲动的放弃，都会在七这里吃亏。", "For body and money, inventory before action. Impulsive investment and impulsive quitting both lose here."),
      L("列出真实的资源，划掉一个你其实并不想要的选项。", "List the real resources and cross out one option you do not actually want."),
    ),
    reversed: domains(
      L("逆位的七是自我欺骗被拆穿，或是守得太累。感情里把话说明，退出一场靠隐瞒维持的局面。", "A reversed Seven exposes self-deception, or defense that has become exhaustion. In love, say it plainly and leave a situation held up by concealment."),
      L("工作上，策略如果变成耍手段，就会反噬。改用直接的说明。如果评估已经做完，就停止再想，开始做。", "At work strategy that becomes trickery turns on you. Use a direct account. If the assessment is finished, stop thinking and start."),
      L("身体和财务上的逆位七是承认一个你不想看的数字或症状。看见它，比继续装不知道便宜。", "A reversed Seven in body or money admits a number or a symptom you do not want to see. Seeing it is cheaper than continuing not to know."),
      L("今天只面对一个被你美化过的事实，并据此改一个做法。", "Face one fact you have prettified, and change one practice because of it."),
    ),
  },
  "8": {
    upright: domains(
      L("八是速度与投入。感情里事情移动得很快：靠近、离开，或终于把卡着的话送出去。跟上节奏，但不要把速度当成深度。", "Eight is speed and commitment. Love moves quickly: toward, away, or finally sending the stuck sentence. Match the pace, and do not confuse speed with depth."),
      L("事业上，八是熟练、赶路和集中的行动。适合推进、学习得很快、把消息送出。手要稳，因为快。", "At work Eight is skill, travel, and concentrated action. Push, learn quickly, send the message. Keep the hand steady because it is fast."),
      L("身心与金钱上，动作可以加快，但要有终点。运动、还款、一次干脆的清理，都比无限加速健康。", "For body and money you may speed up, and you still need a finish. Movement, a repayment, a clean sweep are healthier than acceleration without end."),
      L("在今天把一件拖延的消息或动作完成。快，并且做完。", "Finish one delayed message or action today. Be quick, and be done."),
    ),
    reversed: domains(
      L("逆位的八是乱了的速度：感情里要么急得伤人，要么该动却卡住。先慢半拍，确认你们去的是同一个地方。", "A reversed Eight is speed gone wrong. Love either rushes enough to hurt, or sticks when it should move. Slow by half a beat and confirm you are going to the same place."),
      L("工作上，忙乱替代了进展。减少同时进行的事，把一件做完整。", "At work rush replaces progress. Reduce what is simultaneous and finish one thing whole."),
      L("身体会被赶路伤到，金钱会在匆忙里漏掉。逆位要求减速和核对。", "The body gets hurt by rushing, and money leaks when you hurry. The reversal asks for a slower speed and a check."),
      L("取消一个只是因为焦虑才加速的计划。留下那个有终点的。", "Cancel one plan that sped up only because of anxiety. Keep the one that has a finish."),
    ),
  },
  "9": {
    upright: domains(
      L("九接近圆满，也接近独自承受。感情里可以是愿望实现，也可以是你需要为自己守一夜。问这是满足，还是警惕。", "Nine nears fulfillment and also nears bearing something alone. In love it can be a wish arriving, or a night you must keep for yourself. Ask whether this is satisfaction or vigilance."),
      L("事业上，九是成果将近和仍需守住的最后一段。不要在结束前松手，也不要把全部重量当成永久的。", "At work Nine is a result nearly here and a last stretch you still have to hold. Do not let go before the end, and do not treat the whole weight as permanent."),
      L("身心与金钱上，保护你已经拥有的：休息、储蓄、一个不被侵扰的边界。满足需要被承认。", "For body and money, protect what you already have: rest, savings, a boundary that is not invaded. Satisfaction needs to be acknowledged."),
      L("承认一件已经足够好的事，并给它一个保护，而不是立刻加码。", "Admit one thing that is already good enough, and give it protection instead of immediately adding more."),
    ),
    reversed: domains(
      L("逆位的九是过度担心，或是不愿承认自己其实已经得到。感情里把墙放低一点，让亲近进来，或是停止假装一切安好。", "A reversed Nine worries too much, or refuses to admit it has already received. In love lower the wall enough for closeness, or stop pretending everything is fine."),
      L("工作上，完美主义或耗尽会让最后一段变苦。请求支援，把守夜分成轮班。", "At work perfectionism or depletion makes the last stretch bitter. Ask for support and split the night watch into shifts."),
      L("身体在警告你不能再独自硬撑。金钱上，检查是恐惧在守财，还是真的有风险。", "The body warns that you cannot keep forcing this alone. With money, check whether fear is guarding the hoard or the risk is real."),
      L("把一件你一个人扛的事分给别人一点。如果已经足够，就说足够。", "Give a piece of what you carry alone to someone else. If it is enough, say that it is enough."),
    ),
  },
  "10": {
    upright: domains(
      L("十是一个周期的尽头。感情里可能是圆满的家，也可能是重到该放下的负担。看清你背上的是爱，还是已经结束的责任。", "Ten is the end of a cycle. Love may be a fulfilled home, or a burden heavy enough to set down. See whether what you carry is love or a duty that has already ended."),
      L("事业上，十是完成、传承或过载。该收尾的收尾，该交出去的不要再一个人扛。", "At work Ten is completion, legacy, or overload. Close what should close. Do not keep carrying alone what should be handed on."),
      L("身心与金钱上，周期结束时要结算。庆祝成果，也放下让你变形的那一份重量。", "For body and money, the end of a cycle needs a reckoning. Celebrate the result and set down the weight that is bending you."),
      L("列出你背上的每一件。留下属于你的，把不属于这个周期的放下。", "List everything on your back. Keep what is yours and set down what does not belong to this cycle."),
    ),
    reversed: domains(
      L("逆位的十是释放，或是还不肯承认周期已尽。感情里把过重的故事放下，关系才有地方呼吸。", "A reversed Ten releases, or refuses to admit the cycle is over. In love, set down the story that is too heavy so the bond has room to breathe."),
      L("工作上，崩溃可以被避免，如果你现在就减负。不要把耗尽当成敬业。", "At work collapse can still be avoided if you lighten the load now. Do not call depletion dedication."),
      L("身体会替过载说话。金钱上，结束一笔已经完成使命的支出或责任。", "The body speaks for the overload. With money, end an expense or duty whose mission is already complete."),
      L("今天放下一件，只一件。看背上是不是立刻轻了。", "Set down one thing today, only one. Notice whether the back is immediately lighter."),
    ),
  },
  page: {
    upright: domains(
      L("侍从是学徒和消息。感情里保持好奇，送出那条你改了很多遍的信息，允许自己不老练。", "The Page is a student and a message. In love stay curious, send the note you have rewritten, and allow yourself to be unpolished."),
      L("事业上，侍从适合学习、试错和接收新消息。你不必已经是专家才开始问。", "At work the Page fits study, experiment, and incoming news. You do not have to be the expert before you ask."),
      L("身心与金钱上，用初学者的态度试一个小实践。消息可能是身体的一个新信号，值得认真听。", "For body and money, try a small practice with a beginner's mind. The message may be a new signal from the body, and it deserves to be heard."),
      L("发出那条消息，或开始那一课。笨拙是这张牌允许的。", "Send the message or begin the lesson. Awkwardness is allowed on this card."),
    ),
    reversed: domains(
      L("逆位的侍从是消息延误、孩子气，或是不肯学习。感情里别用幼稚逃避责任，也别把没收到回复解读成末日。", "A reversed Page is a delayed message, childishness, or a refusal to learn. In love do not use immaturity to dodge responsibility, and do not read a missing reply as doom."),
      L("工作上，三分钟热度或听不进反馈会卡住侍从。把作业做完，再谈灵感。", "At work a short flame or an inability to hear feedback stalls the Page. Finish the assignment before you discuss inspiration."),
      L("身体和金钱上，别忽略小的预警，也别因为一个传闻就改掉整个计划。核实消息。", "With body and money, do not ignore a small warning, and do not rebuild the whole plan around a rumor. Verify the message."),
      L("重写那条你不敢发的话，用更成熟的一句发出去。", "Rewrite the sentence you were afraid to send, and send a more adult version."),
    ),
  },
  knight: {
    upright: domains(
      L("骑士是追出去的人。感情里它支持行动：去见、去说、去追一段你已经想清楚的靠近。热度要带着方向。", "The Knight is the one who rides out. In love it favors action: go, say it, pursue a closeness you have already thought through. Heat needs a direction."),
      L("事业上，骑士推进任务、出差、把承诺做成运动。选定一个目标，不要沿途改道去追每一面旗。", "At work the Knight advances the task, travels, and turns a promise into motion. Choose one aim and do not change roads for every flag."),
      L("身心与金钱上，行动有益，冲动有害。给前进配一个补给计划：睡眠、预算、回来的日期。", "For body and money, action helps and impulse harms. Pair the advance with supplies: sleep, a budget, a date to return."),
      L("出发，并且只追一件事。到达之前不要再挑新的目标。", "Leave, and chase only one thing. Do not pick a new target before you arrive."),
    ),
    reversed: domains(
      L("逆位的骑士是鲁莽或停滞的追求。感情里如果只是上瘾式的追逐，停马。如果该行动却找借口，就上马。", "A reversed Knight is reckless pursuit or a chase that never starts. In love, if the pursuit is only addictive, stop the horse. If you should act and keep finding excuses, mount."),
      L("工作上，要么横冲直撞，要么承诺了却不动。检查马是在跑，还是只是在原地踢尘土。", "At work you either charge or promise and do not move. Check whether the horse is running or only kicking dust in place."),
      L("身体会被极端的冲刺伤到，金钱会被冲动花掉。逆位要求一个刹车，或一个真正的起步，二选一。", "The body is hurt by extreme sprints and money is spent by impulse. The reversal wants either a brake or a real start. Choose one."),
      L("如果方向是错的，现在下马。如果方向是对的，今天骑出第一里。", "If the direction is wrong, dismount now. If it is right, ride the first mile today."),
    ),
  },
  queen: {
    upright: domains(
      L("王后向内掌握这门元素。感情里她懂得照顾感受、提出成熟的需要，并且不靠控制来证明爱。", "The Queen holds the element inwardly. In love she knows how to tend feeling, name a mature need, and prove love without control."),
      L("事业上，王后是有判断力的影响者。适合辅导、定调、用经验而不是嗓门带领。", "At work the Queen influences through judgment. Guide, set the tone, and lead with experience rather than volume."),
      L("身心与金钱上，她把照料变成稳定的气候。规律、审美和自我尊重会反映在身体和账本上。", "For body and money she turns care into a stable climate. Rhythm, taste, and self-respect show up in the body and the books."),
      L("用你已经有的成熟，去安顿一件事，而不是再证明你配。", "Use the maturity you already have to settle one matter, instead of proving again that you deserve to."),
    ),
    reversed: domains(
      L("逆位的王后可能是情绪或标准向内溃烂：过度照顾、嫉妒、不肯接受自己的需要。感情里先把自己的杯子放正。", "A reversed Queen can be feeling or standards spoiling inward: over-care, jealousy, refusal of your own need. In love set your own cup straight first."),
      L("工作上，影响力变成操控，或是你怀疑自己没资格坐在这个位置。回到手艺，而不是回到权力游戏。", "At work influence becomes manipulation, or you doubt you deserve the seat. Return to the craft, not to the power game."),
      L("身体和财务会显示被忽略的自我照料。逆位请你停止讨好式的消耗，把一份资源留给自己。", "Body and money show neglected self-care. The reversal asks you to stop consumptive pleasing and keep one resource for yourself."),
      L("今天做一个只服务于你自己健康或尊严的决定，并且不解释太久。", "Today make one decision that serves only your health or dignity, and do not explain it for long."),
    ),
  },
  king: {
    upright: domains(
      L("国王把这门元素做成对外的担当。感情里他提供清楚、稳定和愿负责的领导，而不是情绪的缺席。", "The King makes the element into outward responsibility. In love he offers clarity, stability, and leadership that is willing to answer, not an absence of feeling."),
      L("事业上，国王做决定、定结构、为结果署名。适合承担权威，也适合向有权威的人要求一个清楚的答复。", "At work the King decides, sets structure, and signs the result. Take authority, or ask the person who has it for a clear answer."),
      L("身心与金钱上，国王建立长期秩序。预算、健康的纪律、一个你愿意公开遵守的标准。", "For body and money the King builds a long order. A budget, a health discipline, a standard you are willing to keep in public."),
      L("做一个你愿意负责的决定，并告诉别人你会对结果负责。", "Make a decision you are willing to own, and tell someone you will answer for the result."),
    ),
    reversed: domains(
      L("逆位的国王是控制、冷漠，或是该承担时缺席。感情里的权威如果不倾听，就只是压力。把王冠放低，先听。", "A reversed King is control, coldness, or absence when responsibility is due. Authority in love that does not listen is only pressure. Lower the crown and listen first."),
      L("工作上，要么专横，要么拒绝做那个必须做的决定。检查权力是在服务事情，还是在服务面子。", "At work you are either domineering or you refuse the decision that must be made. Check whether power serves the work or the image."),
      L("身体和金钱会被僵硬的控制或彻底的不负责伤到。建立一个更人道的规则，并自己先遵守。", "Body and money are hurt by rigid control or by no responsibility at all. Build a more humane rule and keep it yourself first."),
      L("如果该你决定，就决定。如果该你倾听，就在说话前先复述对方的一句。", "If the decision is yours, decide. If the listening is yours, repeat one sentence of theirs before you speak."),
    ),
  },
};

export const suitVoice: Record<Suit, { upright: DomainCopy; reversed: DomainCopy }> = {
  wands: {
    upright: domains(
      L("权杖把话题放回欲望和热情。先问你真正想靠近的火焰是什么，再决定关系的形式。", "Wands return the matter to desire and heat. Ask which fire you actually want to approach, then decide the form of the relationship."),
      L("权杖在事业里是意志、创造和行动。热度要落进一件具体的工作，不然只是发热。", "Wands at work are will, creation, and action. Heat has to land in a specific job or it is only a fever."),
      L("火元素关系到精力与胆量。身体需要燃烧也需要木头：睡眠和食物是燃料，不是奖励。金钱上适合为热情留预算，但不要烧光储备。", "Fire touches vitality and nerve. The body needs the burn and the wood: sleep and food are fuel, not a prize. With money, budget for the passion and do not burn the reserve."),
      L("把热情收成一个今天能做的动作。做完它，火就有地方待。", "Gather the enthusiasm into one action you can do today. When it is done, the fire has a place to stay."),
    ),
    reversed: domains(
      L("逆位的权杖是热情受挫、嫉妒或燃尽。感情里先补能量，再谈永远。不要在枯竭时做分手或承诺的大决定。", "Reversed Wands are frustrated heat, jealousy, or burnout. In love restore energy before you discuss forever. Do not make a large breakup or promise while you are empty."),
      L("工作上，逆位权杖是拖延的野心或没有方向的忙。砍掉一个消耗热情的义务。", "At work reversed Wands are delayed ambition or busyness without a direction. Cut one duty that spends your heat."),
      L("身体已经在过热或过冷。金钱上停止为了面子继续烧。先让精力回到可以持续的温度。", "The body is already too hot or too cold. With money, stop burning for the sake of image. Return your energy to a temperature you can sustain."),
      L("休息也是火的技术。今天少烧一点，留到真正重要的那件事上。", "Rest is a technique of fire. Burn a little less today and save it for the thing that actually matters."),
    ),
  },
  cups: {
    upright: domains(
      L("圣杯把感情带回感受、亲密和直觉。先承认心里真正的水位，再谈对错。", "Cups bring love back to feeling, intimacy, and intuition. Admit the true water level of the heart before you discuss who is right."),
      L("事业上，圣杯强调意义、合作的气氛和你是否还喜欢这件事。情绪是数据，不是干扰。", "At work Cups emphasize meaning, the climate of collaboration, and whether you still like the thing. Emotion is data, not interference."),
      L("水元素关系到情绪健康和关系里的滋养。金钱上，问这笔花费是在照顾感受，还是在淹没感受。身体需要柔软和足够的休息。", "Water touches emotional health and nourishment in relationships. With money, ask whether the expense tends a feeling or drowns it. The body needs softness and enough rest."),
      L("说出一种感受，只要一种，并用一个温柔的行动配上它。", "Name one feeling, only one, and match it with a gentle action."),
    ),
    reversed: domains(
      L("逆位的圣杯是情感堵塞、幻想或过度灌注。感情里把杯子放回自己手里，停止用对方填满每一个空。", "Reversed Cups are blocked feeling, fantasy, or pouring too much. In love put the cup back in your own hand and stop using the other person to fill every empty place."),
      L("工作上，情绪淹没了判断，或是你对工作完全无感。先处理心情，再做那个需要清醒的决定。", "At work feeling floods judgment, or you feel nothing about the work at all. Tend the mood before the decision that needs a clear head."),
      L("身心上，逆位圣杯常是压抑、成瘾式的安慰或孤独。金钱上避免用消费替换陪伴。找一个真实的人，或一段真实的安静。", "For the body, reversed Cups are often suppression, addictive comfort, or loneliness. With money, do not replace company with spending. Find a real person, or a real quiet."),
      L("倒掉一点不属于你的情绪。留下你自己的那一杯，慢慢喝。", "Pour out a little of the feeling that is not yours. Keep your own cup and drink it slowly."),
    ),
  },
  swords: {
    upright: domains(
      L("宝剑在感情里切的是真话。把话讲清楚，同时记住语言可以是手术刀，也可以是武器。精确，而不是残忍。", "Swords cut toward the truth in love. Say it clearly, and remember that language can be a scalpel or a weapon. Be precise, not cruel."),
      L("事业上，宝剑是分析、决定、写作和必要的冲突。把问题定义清楚，决策才会干净。", "At work Swords are analysis, decision, writing, and necessary conflict. Define the problem clearly and the decision gets clean."),
      L("风元素关系到思想和睡眠。金钱上把逻辑写下来，避免在焦虑里签字。身体需要让大脑停机的时间，否则剑会转向自己。", "Air touches thought and sleep. With money, write the logic down and do not sign inside anxiety. The body needs time when the mind is off, or the sword turns inward."),
      L("用一段短而真的话说明事实。说完就停，不要补刀。", "State the fact in a short true passage. Then stop. Do not add another cut."),
    ),
    reversed: domains(
      L("逆位的宝剑是伤人的话、混乱的念头，或是该说的真话被吞下去。感情里先停止脑内的审判，再决定要不要开口。", "Reversed Swords are hurting words, tangled thoughts, or a truth swallowed. In love stop the trial inside your head before you decide whether to speak."),
      L("工作上，信息过载或刻薄的沟通会让事情更钝。把问题写成三行。删掉人身的那一句。", "At work overload or harsh communication makes the matter duller. Write the problem in three lines. Delete the sentence that attacks the person."),
      L("身心上，焦虑是这把逆位的剑。金钱决定如果来自恐慌，就推迟到你睡过之后。先让呼吸变慢。", "For the body, anxiety is this reversed sword. If a money decision comes from panic, delay it until you have slept. Slow the breath first."),
      L("今天少说一句会留下伤疤的话，或多说一句你一直回避的实话。只选其中一个。", "Today either withhold one sentence that would leave a scar, or say one truth you have been avoiding. Choose only one."),
    ),
  },
  pentacles: {
    upright: domains(
      L("星币把感情放回日常：时间、身体、金钱和一起把生活过好的能力。承诺如果不能出现在日历和桌上，就还只是情绪。", "Pentacles set love back into ordinary days: time, the body, money, and the ability to live well together. A promise that cannot appear on the calendar and the table is still only a mood."),
      L("事业上，星币是技能、报酬和可见的作品。慢慢做扎实，比讲概念更接近这张牌。", "At work Pentacles are skill, pay, and a visible piece of work. Making it solid and slow comes closer to this card than discussing the concept."),
      L("土元素直接关系到身体、金钱和物质安全。这是适合预算、治疗、整理居住环境和积累手艺的时候。", "Earth speaks directly to the body, money, and material safety. This is the time for a budget, treatment, a livable room, and a craft practiced until it accumulates."),
      L("做一件手能碰到的事：付一笔、修一件、练一次、吃一顿认真的饭。", "Do one thing your hands can touch: pay one bill, repair one object, practice once, eat one real meal."),
    ),
    reversed: domains(
      L("逆位的星币是现实层面的失衡：感情里忽略身体和金钱，或是只谈条件不谈心。把两者放回同一句话里。", "Reversed Pentacles are an imbalance in the real: love that ignores body and money, or terms with no heart. Put both back into the same sentence."),
      L("工作上，技能生疏、报酬不公或完美主义让作品停住。回到一个可交付的小版本。", "At work rusty skill, unfair pay, or perfectionism stops the work. Return to a small version you can deliver."),
      L("身体和账本会同时发出信号。逆位星币要求你面对一个具体的物质问题，而不是用忙来盖住它。", "The body and the books signal together. Reversed Pentacles ask you to face one concrete material problem instead of covering it with busyness."),
      L("今天处理一个物质上的小事，让安全感受回到手里。", "Handle one small material matter today so the feeling of safety returns to your hands."),
    ),
  },
};

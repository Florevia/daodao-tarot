# 叨叨占卜师 · Daodao Tarot

叨叨占卜师是一个可以真正拿来用的塔罗占卜网站。界面默认简体中文，可以切换英文。牌组是完整的 78 张伟特塔罗（22 张大阿卡纳 + 56 张小阿卡纳），每张牌都有正位、逆位、关键词和一段画面说明。

你可以写下问题（也可以留空），选择牌阵，看洗牌，再按自己的顺序把牌翻开。每个位置会解释这张牌在这里是什么意思，最后有一段基于牌义的综合。访客的记录留在这台浏览器里；注册登录之后，记录保存在服务器上，换设备也能看见。不配置 AI 密钥时，整站仍然完整可用。

Daodao Tarot is a tarot app meant for real use. The interface defaults to Simplified Chinese and can switch to English. The deck is the full 78-card Rider–Waite set, with upright and reversed meanings, keywords, and a short description of the picture.

Write a question or leave it blank, choose a spread, watch the shuffle, then turn the cards in any order. Each position explains the card in that place, and a summary is built from those meanings. Guest history stays in the browser. Signed-in history is stored on the server. The app is complete without an AI key.

占卜结果仅供娱乐与自我反思，不能替代医疗、法律、财务或心理方面的专业建议。

Readings are for entertainment and reflection. They are not a substitute for professional medical, legal, financial, or psychological advice.

## 本地运行

需要 Node.js 20 或更新版本。

```bash
cp .env.example .env
npm install
npx prisma migrate deploy
npm run dev
```

浏览器打开 [http://127.0.0.1:4178](http://127.0.0.1:4178)。

其他命令：

```bash
npm test        # 牌组、牌阵、洗牌与综合解读
npm run lint
npm run typecheck
npm run build
npm start
```

`npm run dev` 会先执行 `prisma generate` 和 `prisma migrate deploy`，所以本机数据库会自动跟上迁移。

## Run locally

Node.js 20 or newer.

```bash
cp .env.example .env
npm install
npx prisma migrate deploy
npm run dev
```

Open [http://127.0.0.1:4178](http://127.0.0.1:4178).

`npm run dev` runs `prisma generate` and `prisma migrate deploy` before the dev server.

## 环境变量

| 变量 | 是否必须 | 说明 |
| --- | --- | --- |
| `DATABASE_URL` | 本地必须 | 默认 `file:./dev.db`，路径相对于 `prisma/`。 |
| `AUTH_SECRET` | 生产必须 | 用来签名登录 cookie。本地可以沿用 `.env.example` 里的开发值。 |
| `OPENAI_API_KEY` | 可选 | 有密钥时，占卜结果里会出现「再深入一层」。没有密钥时，仍使用内置牌义综合。 |
| `OPENAI_BASE_URL` | 可选 | 默认 `https://api.openai.com/v1`。兼容 OpenAI 接口的网关可以改这里。 |
| `OPENAI_MODEL` | 可选 | 默认 `gpt-4o-mini`。 |
| `NEXT_PUBLIC_SITE_URL` | 建议 | 站点公开地址，用于 sitemap 和 Open Graph。例如 `https://your-domain.com`。 |

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes locally | Defaults to `file:./dev.db`, relative to `prisma/`. |
| `AUTH_SECRET` | Yes in production | Signs the session cookie. The example value is fine for local development. |
| `OPENAI_API_KEY` | No | When set, a reading can request a personalized interpretation. Without it, the built-in summary is the whole reading. |
| `OPENAI_BASE_URL` | No | Defaults to `https://api.openai.com/v1`. Point this at an OpenAI-compatible gateway if you use one. |
| `OPENAI_MODEL` | No | Defaults to `gpt-4o-mini`. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Public origin used by the sitemap and Open Graph tags. |

## 部署

本机用 SQLite。Vercel 这类无服务器托管没有可写的本地磁盘，上线时请换成 Postgres（Neon、Supabase、Vercel Postgres 都可以）。

1. 把 `prisma/schema.prisma` 里的 `provider = "sqlite"` 改成 `provider = "postgresql"`。模型字段不用改。
2. 把 `DATABASE_URL` 设成 Postgres 连接串。如果走连接池，建议使用带 `?pgbouncer=true` 的池化地址，并把直连地址留给迁移。
3. 设置 `AUTH_SECRET`（长随机字符串）和 `NEXT_PUBLIC_SITE_URL`。
4. 构建命令保持 `npm run build`（其中包含 `prisma generate`）。发布前执行一次 `npx prisma migrate deploy`。在 Vercel 上可以把构建命令写成 `prisma generate && prisma migrate deploy && next build`。
5. 可选：设置 `OPENAI_API_KEY`。不设置也不影响占卜、牌义全书和记录。

## Deploy

SQLite is for local development. Serverless hosts such as Vercel do not give you a writable local disk, so production should use Postgres (Neon, Supabase, or Vercel Postgres).

1. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`. The models stay the same.
2. Set `DATABASE_URL` to the Postgres connection string. If you use a pooler, prefer the pooled URL with `?pgbouncer=true` for the app and a direct URL for migrations.
3. Set `AUTH_SECRET` to a long random string, and set `NEXT_PUBLIC_SITE_URL`.
4. Keep the build script as `npm run build` (it runs `prisma generate`). Run `npx prisma migrate deploy` once before or during release. On Vercel the build command can be `prisma generate && prisma migrate deploy && next build`.
5. `OPENAI_API_KEY` is optional. Readings, the card book, and history all work without it.

## 牌图来源

`public/cards/` 里的 78 张图来自 Wikimedia Commons 分类 [Rider-Waite tarot deck (Roses & Lilies)](https://commons.wikimedia.org/wiki/Category:Rider-Waite_tarot_deck_(Roses_%26_Lilies))。原画是 Pamela Colman Smith 在 1909 年为 Rider 公司绘制的伟特塔罗（文件名以 `RWS1909` 开头）。这些作品已进入公有领域。下载与压缩脚本是 `scripts/fetch-card-art.py`。牌义文字是为本应用撰写的简述，不是对韦特《塔罗图钥》的逐句翻译。

## Card art

The 78 images in `public/cards/` come from the Wikimedia Commons category [Rider-Waite tarot deck (Roses & Lilies)](https://commons.wikimedia.org/wiki/Category:Rider-Waite_tarot_deck_(Roses_%26_Lilies)). Pamela Colman Smith drew them in 1909 for the Rider company (filenames begin with `RWS1909`). They are in the public domain. `scripts/fetch-card-art.py` downloads and resizes them. The meanings in this app are original short readings, not a transcription of Waite's *Pictorial Key to the Tarot*.

## 功能说明

- 牌阵数据在 `lib/spreads.ts`。现有五种：每日一牌、三牌阵（过去 / 现在 / 未来）、关系、事业、凯尔特十字（10 张）。按同样的结构追加即可。
- 访客记录在 `localStorage`（键名 `daodao-tarot-readings-v1`）。登录后可以在记录页把本机记录导入账号。
- 账号是邮箱加密码，会话放在 httpOnly cookie 里。登录后可以在「账号」页修改密码。没有邮件服务，所以没有找回密码邮件。
- 语言偏好存在本机。页面初次渲染是中文，方便搜索引擎抓取。

## What is included

- Spreads live in `lib/spreads.ts`: daily card, three-card past/present/future, relationship, career, and the 10-card Celtic Cross. Add another object in that list to add a spread.
- Guest history is stored in `localStorage` under `daodao-tarot-readings-v1`. After login, the history page can import those readings into the account.
- Accounts use email and password. The session is an httpOnly cookie. A signed-in user can change the password on the account page. There is no password-reset email because the app does not send mail.
- The language preference stays on the device. The first render is Chinese so search engines see that text.

## 限制

- 生产环境不要继续用 SQLite 文件。
- AI 解读依赖你自己的 API 额度，并且每小时对同一 IP 大约限制 20 次。
- 牌义是简短的现代解读，不是某一本书的全文。
- 没有第三方登录，也没有密码重置邮件。

## Limitations

- Do not keep the SQLite file as the production database.
- AI interpretations spend your own API quota and are limited to about 20 requests per IP each hour.
- Meanings are short modern readings, not the full text of a printed book.
- There is no social login and no password-reset email.

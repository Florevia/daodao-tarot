# 叨叨占卜师 · Daodao Tarot

叨叨占卜师是一个可以真正拿来用的塔罗占卜网站。界面默认简体中文，可以切换英文。牌组是完整的 78 张伟特塔罗（22 张大阿卡纳 + 56 张小阿卡纳），每张牌都有正位、逆位、关键词和一段画面说明。

你可以写下问题（也可以留空），选择牌阵，看洗牌，再按自己的顺序把牌翻开。每个位置会解释这张牌在这里是什么意思，最后有一段基于牌义的综合。访客的记录留在这台浏览器里；注册登录之后，记录保存在服务器上，换设备也能看见。不配置 AI 密钥时，整站仍然完整可用。

Daodao Tarot is a tarot app meant for real use. The interface defaults to Simplified Chinese and can switch to English. The deck is the full 78-card Rider–Waite set, with upright and reversed meanings, keywords, and a short description of the picture.

Write a question or leave it blank, choose a spread, watch the shuffle, then turn the cards in any order. Each position explains the card in that place, and a summary is built from those meanings. Guest history stays in the browser. Signed-in history is stored on the server. The app is complete without an AI key.

占卜结果仅供娱乐与自我反思，不能替代医疗、法律、财务或心理方面的专业建议。

Readings are for entertainment and reflection. They are not a substitute for professional medical, legal, financial, or psychological advice.

## 本地运行

需要 Node.js 20 或更新版本，以及 Docker。本地数据库和线上一样是 PostgreSQL，由 `docker-compose.yml` 启动（用户 `daodao`，密码 `daodao`，库名 `daodao`，端口 `5432`）。

```bash
docker compose up -d --wait
cp .env.example .env
npm install
npm run dev
```

浏览器打开 [http://127.0.0.1:4178](http://127.0.0.1:4178)。

其他命令：

```bash
npm test        # 牌组、牌阵、洗牌与综合解读
npm run lint
npm run typecheck
npm run build   # 设置了 DATABASE_URL 时会先执行 prisma migrate deploy
npm start
npm run db:migrate
```

`npm run dev` 会先执行 `prisma generate` 和 `prisma migrate deploy`，所以本机数据库会自动跟上迁移。没有 Docker 时，自己准备一个 Postgres 16，把 `.env` 里的 `DATABASE_URL` 指过去，再执行同样的命令即可。

## Run locally

Node.js 20 or newer, and Docker. Local development uses PostgreSQL, the same engine as production. `docker-compose.yml` starts it (user `daodao`, password `daodao`, database `daodao`, port `5432`).

```bash
docker compose up -d --wait
cp .env.example .env
npm install
npm run dev
```

Open [http://127.0.0.1:4178](http://127.0.0.1:4178).

`npm run dev` runs `prisma generate` and `prisma migrate deploy` before the dev server. Without Docker, point `DATABASE_URL` in `.env` at any Postgres 16 instance and use the same commands.

## 环境变量

| 变量 | 是否必须 | 说明 |
| --- | --- | --- |
| `DATABASE_URL` | 必须 | Postgres 连接串。本地见 `.env.example`。生产环境用直连（不要用连接池地址），并带上服务商要求的 `sslmode`。 |
| `AUTH_SECRET` | 生产必须 | 用来签名登录 cookie。本地可以沿用 `.env.example` 里的开发值。 |
| `GOOGLE_GENERATIVE_AI_API_KEY` | 可选 | 有密钥时，占卜结果里会出现「再深入一层」，由 Gemini 按问题和处境来写。`GEMINI_API_KEY` 是同一密钥的别名。没有密钥时，仍使用内置牌义综合。 |
| `GEMINI_MODEL` | 可选 | 默认 `gemini-3.8-flash`。 |
| `NEXT_PUBLIC_SITE_URL` | 生产建议 | 站点公开地址，用于 sitemap 和 Open Graph。例如 `https://your-domain.vercel.app`。 |

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Postgres connection string. Local value is in `.env.example`. In production use the direct URL, not a pooler, and include the provider's `sslmode`. |
| `AUTH_SECRET` | Yes in production | Signs the session cookie. The example value is fine for local development. |
| `GOOGLE_GENERATIVE_AI_API_KEY` | No | When set, a reading can request a Gemini interpretation that follows the question and the context chips. `GEMINI_API_KEY` is an alias for the same key. Without either key, the built-in summary is the whole reading. |
| `GEMINI_MODEL` | No | Defaults to `gemini-3.8-flash`. |
| `NEXT_PUBLIC_SITE_URL` | Recommended in production | Public origin used by the sitemap and Open Graph tags, for example `https://your-domain.vercel.app`. |

## 部署到 Vercel

Prisma 已经使用 PostgreSQL。不要改构建命令：Vercel 的 Next.js 默认会执行 `npm run build`。这个脚本会 `prisma generate`，在 `DATABASE_URL` 有值时执行 `prisma migrate deploy`，然后 `next build`。没有 `DATABASE_URL` 时会跳过迁移，方便在没有数据库的环境里只做编译检查。Gemini 密钥不参与构建，不设置也能完整占卜。

在 Vercel 项目的 Settings → Environment Variables 里，为 Production（以及需要登录记录的 Preview）设置：

| 变量 | 值 |
| --- | --- |
| `DATABASE_URL` | Postgres **直连**字符串，不要用带 `-pooler` 的地址。Neon：在连接串面板关掉 Pooled connection，原样复制（含 `sslmode=require`）。Vercel Postgres：把集成提供的 `POSTGRES_URL_NON_POOLING` 填进 `DATABASE_URL`。如果集成已经写了一个池化的 `DATABASE_URL`，用直连字符串覆盖它。构建阶段要跑迁移，事务池化会让 `prisma migrate deploy` 失败。 |
| `AUTH_SECRET` | 长随机字符串，例如 `openssl rand -base64 32` 的输出。 |
| `NEXT_PUBLIC_SITE_URL` | 站点公开地址，无路径、无结尾斜杠，例如 `https://daodao-tarot.vercel.app`。 |
| `GOOGLE_GENERATIVE_AI_API_KEY` | 可选。不填则只有内置牌义综合。也可以用 `GEMINI_API_KEY`。 |

然后：

1. 把仓库导入 Vercel，Framework Preset 选 Next.js。Install Command 和 Build Command 保持默认（`npm install` 与 `npm run build`）。
2. 确认上面的环境变量已经写在将要部署的环境里。构建机器必须能连上数据库。
3. Deploy。首次构建会建好 `User` 和 `Reading` 表。
4. 打开线上地址，注册一个账号，抽一组牌并保存，再在记录页打开并删除，确认数据库可用。

如果 Neon 或 Vercel 另外提供了 `DATABASE_URL_UNPOOLED`、`POSTGRES_URL_NON_POOLING` 或 `DIRECT_URL`，构建脚本会优先用它们做迁移，运行时仍读 `DATABASE_URL`。只设置直连的 `DATABASE_URL` 就够用。

## Deploy to Vercel

Prisma is already on PostgreSQL. Leave the Vercel build command at the Next.js default, `npm run build`. That script runs `prisma generate`, then `prisma migrate deploy` when `DATABASE_URL` is set, then `next build`. If `DATABASE_URL` is absent, migrations are skipped. A Gemini key is not required to build or to use the app.

In the Vercel project, under Settings → Environment Variables, set these for Production (and for any Preview where signed-in history should work):

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | The **direct** Postgres URL, not the host that contains `-pooler`. On Neon, turn off Pooled connection and copy the string as shown, including `sslmode=require`. On Vercel Postgres, copy `POSTGRES_URL_NON_POOLING` into `DATABASE_URL`. If the integration already created a pooled `DATABASE_URL`, replace it with the direct string. Migrations run during the build, and a transaction pooler makes `prisma migrate deploy` fail. |
| `AUTH_SECRET` | A long random string, for example the output of `openssl rand -base64 32`. |
| `NEXT_PUBLIC_SITE_URL` | The public origin, with no path and no trailing slash, for example `https://daodao-tarot.vercel.app`. |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Optional. Omit it and readings still include the built-in summary. `GEMINI_API_KEY` is accepted as an alias. |

Then:

1. Import the repository into Vercel and choose the Next.js framework preset. Leave Install Command and Build Command at their defaults (`npm install` and `npm run build`).
2. Confirm the variables above exist on the environment you are deploying. The build must be able to reach the database.
3. Deploy. The first build creates the `User` and `Reading` tables.
4. On the live site, register, draw and save a reading, then open and delete it from history.

If Neon or Vercel also sets `DATABASE_URL_UNPOOLED`, `POSTGRES_URL_NON_POOLING`, or `DIRECT_URL`, the build script prefers those for migrations and still uses `DATABASE_URL` at runtime. A single direct `DATABASE_URL` is enough.

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

- 生产环境使用 Postgres 直连字符串作为 `DATABASE_URL`。无服务器函数各自建连接，流量很大时再考虑连接池。
- AI 解读走 Google Gemini，依赖你自己的 API 额度，并且每小时对同一 IP 大约限制 20 次。不配置密钥时，内置牌义仍然完整。
- 牌义是简短的现代解读，不是某一本书的全文。
- 没有第三方登录，也没有密码重置邮件。

## Limitations

- Production expects a direct Postgres URL in `DATABASE_URL`. Each serverless instance opens its own connections; add a pooler only after you actually hit connection limits.
- Optional AI interpretations use Google Gemini, spend your own API quota, and are limited to about 20 requests per IP each hour. Without a key, the built-in meanings are still the full reading.
- Meanings are short modern readings, not the full text of a printed book.
- There is no social login and no password-reset email.

# Hello World

粉色主题开场页 + 留言板。

## 公网地址（已上线）

https://helloworld.invented-hibiscus.workers.dev/

> 这是 Cloudflare **临时预览账号**部署。请在 **60 分钟内认领**，否则可能失效：  
> https://dash.cloudflare.com/claim-preview?claimToken=g3f-k5ho0Cy9CH_7qoFHtfyldPSiHDq8s4YQNDt_Vak

## 为什么选 Cloudflare Workers + D1

对这个小项目，它是最合适的免费方案：

- **真正长期免费额度**（个人小流量足够）
- **D1 = 托管 SQLite**，和本地 SQLite 概念一致，数据可持久
- **同一域名**同时提供静态页和 API，不用拆 GitHub Pages + 另一台服务器
- 冷启动比多数免费 Node 主机更友好

> GitHub Pages 仍可看静态皮，但**不能留言落库**。公网留言请用上面的 Worker 地址。

## 架构

```
浏览器
  │
  ▼
Cloudflare Worker  ──静态页──► public/
  │
  └── /api/greetings ──SQL──► D1 (SQLite)
```

## 本地开发

```bash
npm install
npm run db:migrate:local
npm run dev
```

打开终端提示的本地地址（一般是 http://127.0.0.1:8787）。

## 再次部署到公网

若已认领临时账号，或你自己登录了 Cloudflare：

```bash
npx wrangler login
npm run db:migrate
npx wrangler deploy
```

## 接口

- `GET /api/health`
- `GET /api/greetings`
- `POST /api/greetings`  body: `{ "name", "message" }`

## 可选：本机 Express + 文件版 SQLite

仅本地实验时仍可用：

```bash
npm install better-sqlite3 cors express
npm run start:node
```

公网请优先用上面的 Cloudflare 方案。

# Hello World

粉色主题开场页 + 留言板。

## 为什么选 Cloudflare Workers + D1

对这个小项目，它是最合适的免费方案：

- **真正长期免费额度**（个人小流量足够）
- **D1 = 托管 SQLite**，和本地 SQLite 概念一致，数据可持久
- **同一域名**同时提供静态页和 API，不用拆 GitHub Pages + 另一台服务器
- 冷启动比多数免费 Node 主机更友好

> GitHub Pages 仍可看静态皮，但**不能留言落库**。公网留言请用本 Worker 部署地址。

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

## 免费部署到公网（一次）

1. 注册 [Cloudflare](https://dash.cloudflare.com/)（免费账号即可）
2. 登录 CLI：
   ```bash
   npx wrangler login
   ```
3. 创建 D1 数据库：
   ```bash
   npx wrangler d1 create helloworld
   ```
4. 把输出的 `database_id` 填进 `wrangler.toml` 里对应字段
5. 执行远程迁移并部署：
   ```bash
   npm run db:migrate
   npm run deploy
   ```
6. 使用命令输出的 `*.workers.dev` 地址访问（可留言、可持久化）

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

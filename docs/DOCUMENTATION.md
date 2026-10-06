# Hello World 项目完整文档

本文档覆盖本仓库的目标、架构、数据库接法、本地开发、公网部署、接口说明、常见问题与目录结构。

---

## 1. 项目简介

这是一个粉色主题的 **Hello World 开场页**，并示范最常见的数据链路：

**浏览器页面 → 后端 API → 数据库**

当前推荐公网方案为：

**Cloudflare Workers（页面 + API）+ D1（托管 SQLite）**

| 能力 | 说明 |
|------|------|
| 静态开场页 | 品牌标题、文案、动效、粉色海平线视觉 |
| 留言板 | 提交昵称/留言，写入数据库并可回读 |
| 免费公网 | Workers + D1 免费额度适合小流量演示 |

静态预览（仅页面，**不能写库**）：

https://oumingyuan.github.io/helloworld/

带数据库的 Worker 地址（以实际部署为准）：

https://helloworld.invented-hibiscus.workers.dev/

---

## 2. 为什么这样接数据库

GitHub Pages **只能托管静态文件**，浏览器里不能、也不该直接连接传统数据库（没有服务端、密钥会暴露）。

因此采用：

```text
页面 (public/index.html)
    │  fetch /api/greetings
    ▼
API (Cloudflare Worker / 可选本机 Express)
    │  SQL
    ▼
数据库 (D1 或本机 SQLite 文件)
```

选型对比（本项目结论）：

| 方案 | 是否免费友好 | 数据是否易持久 | 适不适合本项目 |
|------|--------------|----------------|----------------|
| GitHub Pages 直连数据库 | — | — | 不可行 |
| Render 跑 Express + 本地 SQLite | 有免费档 | 免费盘常不持久 | 一般 |
| Cloudflare Workers + D1 | 是 | 是 | **最合适** |
| Vercel + Turso / Supabase | 是 | 是 | 也可，但组件更多 |

---

## 3. 架构说明

### 3.1 推荐架构（公网）

```text
用户浏览器
    │
    ▼
Cloudflare Worker (src/worker.js)
    ├── 静态资源  →  public/index.html
    └── /api/*    →  D1 数据库绑定 env.DB
```

- 页面与接口**同一域名**，避免跨域配置麻烦。
- D1 语义接近 SQLite，迁移成本低。
- Worker 内会执行 `CREATE TABLE IF NOT EXISTS`，降低“表不存在”导致的写库失败。

### 3.2 可选架构（仅本机）

```text
用户浏览器
    │
    ▼
Express (server/index.js)  同时托管静态页
    │
    ▼
better-sqlite3 → data/helloworld.sqlite
```

适合本地快速实验，**不适合**直接当长期公网方案（除非另外部署 Node 主机）。

---

## 4. 目录结构

```text
.
├── README.md                 # 快速入门
├── docs/
│   └── DOCUMENTATION.md      # 本完整文档
├── package.json              # 脚本与依赖
├── wrangler.toml             # Cloudflare Worker / D1 配置
├── migrations/
│   └── 0001_init.sql         # D1 初始表结构
├── src/
│   └── worker.js             # Worker：静态页 + API + D1
├── public/
│   └── index.html            # 前端页面（Worker 静态资源）
├── index.html                # 与 public 同步，便于 GitHub Pages 预览
├── server/
│   ├── index.js              # 可选：Express 入口
│   └── db.js                 # 可选：本机 SQLite 封装
└── data/                     # 本机 SQLite 数据目录（gitignore）
```

---

## 5. 数据库设计

表名：`greetings`

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | INTEGER PK AUTOINCREMENT | 主键 |
| `name` | TEXT NOT NULL | 昵称，最长约 40 字符（接口层截断） |
| `message` | TEXT NOT NULL | 留言，最长约 200 字符（接口层截断） |
| `created_at` | TEXT NOT NULL | 默认 `datetime('now')` |

初始化 SQL 见 `migrations/0001_init.sql`。

---

## 6. HTTP 接口

基址：

- 本地 Worker：`http://127.0.0.1:8787`
- 公网 Worker：`https://<你的>.workers.dev`
- 本机 Express：`http://127.0.0.1:3000`

### 6.1 健康检查

`GET /api/health`

成功示例：

```json
{ "ok": true, "database": "cloudflare-d1" }
```

### 6.2 读取留言

`GET /api/greetings`

成功示例：

```json
{
  "items": [
    {
      "id": 1,
      "name": "小明",
      "message": "Hello",
      "created_at": "2026-10-06 08:00:00"
    }
  ]
}
```

### 6.3 写入留言

`POST /api/greetings`  
`Content-Type: application/json`

请求体：

```json
{ "name": "小明", "message": "Hello" }
```

成功：`201`

```json
{
  "item": {
    "id": 1,
    "name": "小明",
    "message": "Hello",
    "created_at": "2026-10-06 08:00:00"
  }
}
```

失败示例：

- `400`：未填昵称或留言  
- `500`：数据库异常（响应中可能含 `detail`）

---

## 7. 本地开发

### 7.1 环境要求

- Node.js 18+
- npm

### 7.2 Cloudflare Worker + D1（推荐）

```bash
npm install
npm run db:migrate:local
npm run dev
```

浏览器打开终端提示地址（通常是 `http://127.0.0.1:8787`）。

常用脚本：

| 命令 | 作用 |
|------|------|
| `npm run dev` | 本地启动 Worker |
| `npm run db:migrate:local` | 本地 D1 执行迁移 |
| `npm run db:migrate` | 远程 D1 执行迁移 |
| `npm run deploy` | 部署到 Cloudflare |

### 7.3 可选：本机 Express + 文件 SQLite

```bash
npm install better-sqlite3 cors express
npm run start:node
```

打开 `http://localhost:3000`。

可用环境变量：

| 变量 | 含义 | 默认 |
|------|------|------|
| `PORT` | HTTP 端口 | `3000` |
| `DATABASE_PATH` | SQLite 文件路径 | `data/helloworld.sqlite` |

---

## 8. 公网部署（Cloudflare）

### 8.1 首次正式部署（自有账号）

1. 注册并登录 [Cloudflare](https://dash.cloudflare.com/)
2. 本地执行：

```bash
npx wrangler login
npx wrangler d1 create helloworld
```

3. 把输出的 `database_id` 写入 `wrangler.toml`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "helloworld"
database_id = "<你的-database-id>"
```

4. 迁移并部署：

```bash
npm run db:migrate
npm run deploy
```

5. 使用命令输出的 `*.workers.dev` 地址访问。

### 8.2 临时预览账号说明

可用 `wrangler deploy --temporary` 在无登录情况下做临时预览。

注意：

- 有认领时限（通常约 60 分钟）
- 未认领可能失效
- 适合演示，不适合当作长期生产环境

### 8.3 `wrangler.toml` 关键字段

| 字段 | 含义 |
|------|------|
| `name` | Worker 名称 |
| `main` | 入口脚本 |
| `[[d1_databases]]` | D1 绑定，前端代码里用 `env.DB` |
| `[assets]` | 静态目录 `public/` |

---

## 9. 国内网络与写库问题（重要）

### 9.1 现象

- **外网 / 代理**：留言可以成功写入  
- **国内直连 `*.workers.dev`**：常失败或超时  

### 9.2 原因（已核实）

1. **主因**：大陆对 `workers.dev` 整类域名屏蔽（DNS 污染 / 连接干扰），与业务代码无关  
2. **次因**：GitHub Pages 只有静态页，同源 `/api/greetings` 不存在（405/404）

本机 `npm start`（Express + SQLite）读写正常，说明数据库逻辑本身没问题。

### 9.3 怎么办（推荐顺序）

1. **Render 免费部署**（本仓库已提供 `render.yaml`）→ 使用 `*.onrender.com`，国内通常可直连写库  
2. 自有域名绑定到 Cloudflare Worker（不要用裸 workers.dev）  
3. 临时用外网验证功能  

Render 注意：免费实例会休眠；免费磁盘不持久，重部署可能丢 SQLite 数据。

---

## 10. 前端行为说明

页面：`public/index.html`

- 默认 `API_BASE = ""`，即请求**当前站点同源** `/api/...`
- 可通过提前设置覆盖：

```html
<script>window.HELLO_API_BASE = "https://your-api.example.com";</script>
```

- 读列表：`GET /api/greetings`
- 提交表单：`POST /api/greetings`
- 当网络连不上 API 时，页面会提示与国内 `workers.dev` 相关的错误说明

---

## 11. 换成 Postgres / MySQL

保持前端接口路径不变，只替换服务端驱动即可。

思路：

1. 仍由服务端持有连接串（环境变量），**不要**写进前端  
2. 将 D1 / `better-sqlite3` 换成 `pg`、`mysql2` 等  
3. 建同等 `greetings` 表  
4. `GET/POST /api/greetings` 逻辑保持兼容  

---

## 12. 常见问题 FAQ

### Q1：GitHub Pages 能留言吗？

不能。Pages 无 Node/Worker 运行时。请用 Worker 地址或自建 API。

### Q2：本地 `no such table: greetings`？

执行：

```bash
npm run db:migrate:local
```

Worker 版也会尝试自动建表，但迁移仍建议执行一次。

### Q3：外网能写、国内不能写？

见第 9 节。优先绑自定义域名或换国内可访问的托管。

### Q4：如何确认 API 活着？

```bash
curl https://<你的域名>/api/health
```

### Q5：数据存在哪？

- Cloudflare：D1（账号下的 `helloworld` 库）  
- 本机 Express：`data/helloworld.sqlite`（默认）

---

## 13. 安全与边界（演示项目）

本项目是教学/演示向，当前未做：

- 登录鉴权  
- 验证码 / 限流  
- 管理后台删帖  
- 复杂 XSS 以外的防护（前端展示已做基础转义）

若用于公网长期服务，请至少增加限流、审核与备份策略。

---

## 14. 相关链接

| 说明 | 链接 |
|------|------|
| 仓库 | https://github.com/oumingyuan/helloworld |
| GitHub Pages 静态预览 | https://oumingyuan.github.io/helloworld/ |
| Cloudflare Workers 文档 | https://developers.cloudflare.com/workers/ |
| Cloudflare D1 文档 | https://developers.cloudflare.com/d1/ |
| Wrangler CLI | https://developers.cloudflare.com/workers/wrangler/ |

---

## 15. 版本与维护

- 文档路径：`docs/DOCUMENTATION.md`
- 快速开始请先看根目录 `README.md`
- 部署配置以 `wrangler.toml` 与 Cloudflare 控制台为准

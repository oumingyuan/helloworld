# Hello World 项目完整文档

本文档覆盖项目目标、架构、数据库、本地开发、**Render 公网部署**、Cloudflare 备选、接口、国内网络问题与 FAQ。

---

## 1. 项目简介

粉色主题 **Hello World** 开场页，并示范：

**浏览器页面 → 后端 API → 数据库**

| 能力 | 说明 |
|------|------|
| 开场页 | 品牌标题、文案、动效、粉色海平线 |
| 留言板 | 昵称 + 留言写入 SQLite，可回读 |
| 国内公网 | **Render 免费档**（推荐） |
| 静态预览 | GitHub Pages（**不能写库**） |

静态预览：https://oumingyuan.github.io/helloworld/

---

## 2. 当前推荐方案

| 场景 | 方案 |
|------|------|
| **国内用户写库** | Render：`Express` + `better-sqlite3`，配置见根目录 `render.yaml` |
| 本地开发 | `npm start` → http://localhost:3000 |
| 仅看页面 | GitHub Pages |
| 备选公网 | Cloudflare Workers + D1（**必须绑自有域名**；勿用裸 `workers.dev`） |

### 为啥不再主推 workers.dev？

大陆对 `*.workers.dev` 存在屏蔽（DNS 污染 / 连接干扰）。表现为：外网能写库，国内不能。  
数据库逻辑本身正常；问题在网络可达性。详见第 9 节。

---

## 3. 架构说明

### 3.1 推荐架构（Render / 本机 Node）

```text
用户浏览器
    │
    ▼
Express (server/index.js)
    ├── 静态页  →  public/index.html
    └── /api/*  →  better-sqlite3 → data/helloworld.sqlite
```

同一域名同时提供页面和 API，前端默认请求同源 `/api/greetings`。

### 3.2 备选架构（Cloudflare）

```text
用户浏览器
    │
    ▼
Cloudflare Worker (src/worker.js)
    ├── 静态资源  →  public/
    └── /api/*    →  D1 (env.DB)
```

国内请使用 **Custom Domain**，不要使用 `*.workers.dev`。

---

## 4. 目录结构

```text
.
├── README.md                 # 快速入门
├── render.yaml               # Render Blueprint（仓库根目录）
├── docs/
│   └── DOCUMENTATION.md      # 本完整文档
├── package.json
├── public/                   # 前端唯一源
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── index.html / styles.css / app.js
│                           # 由 npm run sync:pages 同步（GitHub Pages）
├── scripts/
│   ├── sync-pages.mjs
│   └── check-sync.mjs
├── .github/workflows/ci.yml  # CI：同步校验 / 迁移 / dry-run
├── server/
│   ├── README.md
│   ├── index.js              # Express（Render / 本地默认）
│   └── db.js
├── src/
│   └── worker.js             # Cloudflare Worker（备选）
├── migrations/
│   └── 0001_init.sql
├── wrangler.toml
└── data/
```

工程约定：改前端只改 `public/`，再执行 `npm run sync:pages`（`dev` / `deploy` 会自动跑）。

### `render.yaml` 在哪？

- 路径：**仓库根目录** `/render.yaml`（与 `README.md` 同级）
- 网页：https://github.com/oumingyuan/helloworld/blob/main/render.yaml
- 作用：Render **Blueprint** 自动读取，创建 Free Web Service

当前内容概要：

| 字段 | 值 |
|------|-----|
| `name` | `helloworld` |
| `runtime` | `node` |
| `plan` | `free` |
| `region` | `singapore` |
| `buildCommand` | `npm install` |
| `startCommand` | `npm start` |
| `healthCheckPath` | `/api/health` |

---

## 5. 数据库设计

表名：`greetings`

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | INTEGER PK AUTOINCREMENT | 主键 |
| `name` | TEXT NOT NULL | 昵称（接口截断约 40 字） |
| `message` | TEXT NOT NULL | 留言（接口截断约 200 字） |
| `created_at` | TEXT NOT NULL | 默认 `datetime('now')` |

- Express / Render：启动时 `CREATE TABLE IF NOT EXISTS`  
- D1：见 `migrations/0001_init.sql`，Worker 内也会尝试自动建表  

---

## 6. HTTP 接口

基址示例：

- 本地 Express：`http://127.0.0.1:3000`
- Render：`https://<你的服务>.onrender.com`
- 本地 Worker：`http://127.0.0.1:8787`

### 6.1 健康检查

`GET /api/health`

```json
{ "ok": true, "database": "...", "host": "node" }
```

Render 上 `host` 可能为 `"render"`。

### 6.2 读取留言

`GET /api/greetings` → `{ "items": [ ... ] }`

### 6.3 写入留言

`POST /api/greetings`  
`Content-Type: application/json`

```json
{ "name": "小明", "message": "Hello" }
```

成功 `201`，返回 `{ "item": { ... } }`。

---

## 7. 本地开发

### 7.1 环境

- Node.js 18+
- npm

### 7.2 Express + SQLite（默认）

```bash
npm install
npm start
```

打开 http://localhost:3000

| 命令 | 作用 |
|------|------|
| `npm start` | 启动 Express（Render 同样用这条） |
| `npm run dev:node` | 若存在：watch 模式（以 package.json 为准） |

环境变量：

| 变量 | 含义 | 默认 |
|------|------|------|
| `PORT` | HTTP 端口 | `3000`（Render 会注入） |
| `DATABASE_PATH` | SQLite 文件完整路径 | `data/helloworld.sqlite` |
| `DATABASE_DIR` | 数据目录（`render.yaml` 已配置） | `./data` |

### 7.3 Cloudflare Worker（备选）

```bash
npm run db:migrate:local
npm run dev
```

通常为 http://127.0.0.1:8787

---

## 8. 公网部署

### 8.1 Render（推荐，国内可写库）

1. 打开 https://dashboard.render.com  
2. **New → Blueprint**  
3. 连接 GitHub，选择 `oumingyuan/helloworld`，分支 `main`  
4. 自动加载根目录 **`render.yaml`**  
5. 创建服务，等待 Deploy  
6. 用 `https://xxxx.onrender.com` 打开页面，测试留言  

也可手动 **New → Web Service**：

| 项 | 值 |
|----|-----|
| Build Command | `npm install` |
| Start Command | `npm start` |
| Plan | Free |
| Health Check | `/api/health` |

限制：

- 免费实例会休眠，冷启动较慢  
- 免费磁盘不持久，**Redeploy 可能清空留言**（演示可接受；要持久请接 Neon/Supabase 等）

### 8.2 Cloudflare Workers + D1（备选）

1. `npx wrangler login`  
2. `npx wrangler d1 create helloworld`，把 `database_id` 写入 `wrangler.toml`  
3. `npm run db:migrate` && `npm run deploy`  
4. **绑定自定义域名**后再给国内用户使用  

不要把 `*.workers.dev` 当作国内正式入口。

---

## 9. 国内网络与写库问题

### 9.1 现象

外网能写、国内不能写（针对 Cloudflare `workers.dev`）。

### 9.2 已核实原因

1. **主因**：大陆屏蔽 `workers.dev`（DNS 污染 / 超时 / 连接失败）  
2. **次因**：GitHub Pages 无 API，提交同源 `/api/greetings` 会 404/405  

本机与 Render（Express + SQLite）写库正常，说明业务代码可用。

### 9.3 处理

1. 用 **Render**（本仓库 `render.yaml`）  
2. 或 Worker + **自己的域名**  
3. 不要用 GitHub Pages 测写库  

---

## 10. 前端说明

页面：`public/index.html`

- 默认 `API_BASE = ""`（同源 `/api/...`）  
- 可覆盖：`window.HELLO_API_BASE = "https://your-api.example.com"`  
- GitHub Pages 只有静态副本，**留言会失败**——属预期  

---

## 11. 换成 Postgres / MySQL

保持 `/api/greetings` 不变，服务端换驱动（`pg` / `mysql2`），连接串放环境变量，勿写进前端。

---

## 12. FAQ

### Q1：yaml 在哪？

仓库根目录 `render.yaml`：  
https://github.com/oumingyuan/helloworld/blob/main/render.yaml

### Q2：GitHub Pages 能留言吗？

不能。请用 Render 地址或本地 `npm start`。

### Q3：外网能写、国内不能写？

若访问的是 `workers.dev`，见第 9 节；请改用 Render。

### Q4：如何确认 API 活着？

```bash
curl https://<你的-onrender-域名>/api/health
```

### Q5：数据在哪？

| 环境 | 位置 |
|------|------|
| 本地 / Render | SQLite 文件（默认 `data/helloworld.sqlite`） |
| Cloudflare | D1 库 `helloworld` |

### Q6：Render 第一次打开很慢？

免费实例休眠后的冷启动，等 30–60 秒再试。

---

## 13. 安全边界（演示项目）

未做：登录、验证码、严格限流、管理删帖。  
公网长期使用请自行加强限流与备份。

---

## 14. 相关链接

| 说明 | 链接 |
|------|------|
| 仓库 | https://github.com/oumingyuan/helloworld |
| `render.yaml` | https://github.com/oumingyuan/helloworld/blob/main/render.yaml |
| GitHub Pages | https://oumingyuan.github.io/helloworld/ |
| Render 控制台 | https://dashboard.render.com |
| Render 文档 | https://render.com/docs |
| Cloudflare Workers | https://developers.cloudflare.com/workers/ |
| D1 | https://developers.cloudflare.com/d1/ |

---

## 15. 维护

- 完整文档：`docs/DOCUMENTATION.md`  
- 快速开始：`README.md`  
- 国内部署以根目录 **`render.yaml`** 与 Render 控制台为准  

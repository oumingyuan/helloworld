# Hello World

粉色主题开场页 + 留言板：页面 → API → SQLite。

**国内推荐：Render**（`*.onrender.com`）  
Cloudflare `*.workers.dev` 在大陆常被屏蔽，不要当国内入口。

## 文档

- 完整说明：[docs/DOCUMENTATION.md](./docs/DOCUMENTATION.md)
- Render 配置（仓库根目录）：[render.yaml](./render.yaml)  
  https://github.com/oumingyuan/helloworld/blob/main/render.yaml

## 工程约定

- **前端唯一源**：`public/`（`index.html` + `styles.css` + `app.js`）
- 根目录同名文件由 `npm run sync:pages` 同步（GitHub Pages 用）
- **默认后端**：Express + SQLite（`npm start` / Render）
- Cloudflare Worker 为备选；CI 含同步校验与 dry-run

## 用 Render 免费上公网（推荐）

1. 打开 [Render Dashboard](https://dashboard.render.com)（可用 GitHub 登录）
2. 点 **New → Blueprint**
3. 选择仓库 `oumingyuan/helloworld`，分支选 `main`
4. Render 会自动读取根目录 **`render.yaml`**
5. 等待 Build / Deploy
6. 打开 `https://helloworld-xxxx.onrender.com`，测试留言写库

### 找不到 yaml？

与 `README.md`、`package.json` **同级**，文件名：`render.yaml`（不在 `docs/` 里）。

### 手动 Web Service

| 项 | 值 |
|----|-----|
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance | Free |
| Health Check Path | `/api/health` |

免费档会休眠（冷启动 30–60 秒）；磁盘不持久，重部署可能清空 SQLite。

## 本地运行（可写库）

```bash
npm install
npm start
```

打开 http://localhost:3000

改前端后同步 Pages 副本：

```bash
npm run sync:pages
```

## 备选：Cloudflare Workers + D1

仅建议绑**自己的域名**；裸 `workers.dev` 不可用。

```bash
npm run db:migrate:local
npm run dev
```

## 接口

- `GET /api/health`
- `GET /api/greetings`
- `POST /api/greetings` body: `{ "name", "message" }`

## 相关地址

| 用途 | 地址 |
|------|------|
| 仓库 | https://github.com/oumingyuan/helloworld |
| 静态预览（不能写库） | https://oumingyuan.github.io/helloworld/ |
| Render 控制台 | https://dashboard.render.com |

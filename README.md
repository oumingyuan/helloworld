# Hello World

粉色主题开场页 + 留言板。

**国内推荐：Render 免费部署**（`*.onrender.com`，一般可直连写库）  
Cloudflare `workers.dev` 在大陆常被拦截，仅作备选。

## 文档

完整说明：[docs/DOCUMENTATION.md](./docs/DOCUMENTATION.md)

## 用 Render 免费上公网（推荐）

1. 打开 [https://dashboard.render.com](https://dashboard.render.com) 注册（可用 GitHub 登录）
2. **New → Blueprint**，选择本仓库 `oumingyuan/helloworld`，应用 `render.yaml`
3. 等待 Build / Deploy 完成
4. 打开分配的地址：`https://helloworld-xxxx.onrender.com`

也可 **New → Web Service** 手动填：

| 项 | 值 |
|----|-----|
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance | Free |

注意：

- 免费实例**一段时间无访问会休眠**，第一次打开可能要等 30–60 秒  
- 免费盘**不持久**，重新部署后 SQLite 留言可能清空（演示够用；要持久可再接免费 Postgres）

## 本地运行（可写库）

```bash
npm install
npm start
```

打开 http://localhost:3000

## 备选：Cloudflare Workers + D1

```bash
npm run db:migrate:local
npm run dev
```

公网需自有域名绑 Worker；不要依赖裸 `*.workers.dev` 给国内用户。

## 接口

- `GET /api/health`
- `GET /api/greetings`
- `POST /api/greetings` body: `{ "name", "message" }`

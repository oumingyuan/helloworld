# Hello World

粉色主题开场页 + 留言板：页面 → API → SQLite。

**国内推荐：Render**（`*.onrender.com`）  
Cloudflare `*.workers.dev` 在大陆常被屏蔽，不要当国内入口。

## 文档

- 完整说明：[docs/DOCUMENTATION.md](./docs/DOCUMENTATION.md)
- Render 配置文件（仓库根目录）：[render.yaml](./render.yaml)  
  GitHub 直链：https://github.com/oumingyuan/helloworld/blob/main/render.yaml

## 用 Render 免费上公网（推荐）

1. 打开 [Render Dashboard](https://dashboard.render.com)（可用 GitHub 登录）
2. 点 **New → Blueprint**
3. 选择仓库 `oumingyuan/helloworld`，分支选 `main`
4. Render 会自动读取根目录的 **`render.yaml`**
5. 确认创建后等待 Build / Deploy
6. 打开分配的地址，例如：`https://helloworld-xxxx.onrender.com`  
   在「打个招呼」里提交留言，验证写库

### 找不到 yaml？

文件就在仓库**最外层**（和 `README.md`、`package.json` 同级），文件名是：

```text
render.yaml
```

不是在 `docs/` 或 `server/` 里面。

### 不用 Blueprint 时手动创建 Web Service

| 项 | 值 |
|----|-----|
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance | Free |
| Health Check Path | `/api/health` |

### 免费档注意

- 一段时间无访问会**休眠**，冷启动可能 30–60 秒
- 磁盘**不持久**，重新部署后 SQLite 留言可能被清空（演示够用）

## 本地运行（可写库）

```bash
npm install
npm start
```

打开 http://localhost:3000

## 备选：Cloudflare Workers + D1

仅建议绑**自己的域名**后给国内用；裸 `workers.dev` 不可用。

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

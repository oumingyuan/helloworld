# Hello World

粉色主题开场页 + 留言板，示范：

**页面 → API → 数据库（Cloudflare Workers + D1）**

## 文档

完整说明（架构、接口、部署、国内网络写库问题等）：

**[docs/DOCUMENTATION.md](./docs/DOCUMENTATION.md)**

## 公网地址

- Worker（可写库）：https://helloworld.invented-hibiscus.workers.dev/
- GitHub Pages（仅静态）：https://oumingyuan.github.io/helloworld/

> 国内直连 `*.workers.dev` 常出现「能打开/外网能写，国内不能写」。详见完整文档第 9 节。

临时预览账号认领（若仍在有效期）：  
https://dash.cloudflare.com/claim-preview?claimToken=g3f-k5ho0Cy9CH_7qoFHtfyldPSiHDq8s4YQNDt_Vak

## 快速开始

```bash
npm install
npm run db:migrate:local
npm run dev
```

浏览器打开 `http://127.0.0.1:8787`。

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 本地 Worker |
| `npm run deploy` | 部署到 Cloudflare |
| `npm run db:migrate:local` | 本地 D1 迁移 |
| `npm run db:migrate` | 远程 D1 迁移 |
| `npm run start:node` | 可选：本机 Express + 文件 SQLite |

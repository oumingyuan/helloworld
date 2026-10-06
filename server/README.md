# 可选：本机 Express + 文件版 SQLite

> **公网与默认开发路径请用 Cloudflare Worker + D1**（仓库根目录 `npm run dev`）。  
> 本目录仅作本机对照实验，不参与 `wrangler deploy`。

## 启动

```bash
# 在仓库根目录
npm install better-sqlite3 cors express
npm run start:node
```

打开 http://localhost:3000

## 说明

| 项目 | Worker + D1 | 本目录 Express |
|------|-------------|----------------|
| 默认推荐 | 是 | 否 |
| 公网部署 | `npm run deploy` | 需自备 Node 主机 |
| 数据库 | Cloudflare D1 | `data/helloworld.sqlite` |

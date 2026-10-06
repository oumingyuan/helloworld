# 本机 / Render：Express + SQLite

这是**国内公网推荐路径**的后端实现。

- 本地：`npm start` → http://localhost:3000  
- 公网：仓库根目录 `render.yaml` 一键部署到 Render  

前端源码在 `public/`（`index.html` + `styles.css` + `app.js`），改完后执行 `npm run sync:pages` 同步到根目录（GitHub Pages 用）。

Cloudflare Worker（`src/worker.js`）仍保留作备选；`workers.dev` 在大陆常不可用。

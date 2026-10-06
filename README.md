# Hello World

粉色主题开场页，并示范最常见的数据库接法：

**页面 → Express API → SQLite**

> GitHub Pages 只能托管静态文件，**不能跑这个 API**。本地或云主机用 `npm start` 才会真正连上数据库。

在线静态预览：https://oumingyuan.github.io/helloworld/

## 架构

```
浏览器 index.html
   │  fetch /api/greetings
   ▼
Express (server/index.js)
   │  SQL
   ▼
SQLite (data/helloworld.sqlite)
```

## 本地启动

```bash
npm install
npm start
```

打开 http://localhost:3000

- `GET /api/health`：健康检查
- `GET /api/greetings`：读取留言
- `POST /api/greetings`：写入留言 `{ "name", "message" }`

数据库文件默认在 `data/helloworld.sqlite`，可用环境变量覆盖：

```bash
DATABASE_PATH=/tmp/hello.sqlite PORT=3000 npm start
```

## 换成 Postgres / MySQL

把 `server/db.js` 里的 `better-sqlite3` 换成对应驱动（如 `pg`、`mysql2`），连接串放在服务端环境变量，**不要写进前端**。前端接口路径可以保持不变。

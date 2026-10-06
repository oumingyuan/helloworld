import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import { dbPath, listGreetings, createGreeting } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const publicDir = path.join(rootDir, "public");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json({ limit: "16kb" }));

// 优先 public/，兼容根目录静态文件
app.use(express.static(publicDir));
app.use(express.static(rootDir));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    database: dbPath,
    host: process.env.RENDER ? "render" : "node",
  });
});

app.get("/api/greetings", (_req, res) => {
  try {
    res.json({ items: listGreetings(30) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "读取留言失败" });
  }
});

app.post("/api/greetings", (req, res) => {
  try {
    const name = String(req.body?.name || "").trim().slice(0, 40);
    const message = String(req.body?.message || "").trim().slice(0, 200);

    if (!name || !message) {
      res.status(400).json({ error: "请填写昵称和留言" });
      return;
    }

    const item = createGreeting(name, message);
    res.status(201).json({ item });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "保存留言失败" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Hello World API running at http://0.0.0.0:${PORT}`);
  console.log(`SQLite file: ${dbPath}`);
});

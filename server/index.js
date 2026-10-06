const path = require("path");
const express = require("express");
const cors = require("cors");
const { dbPath, listGreetings, createGreeting } = require("./db");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json({ limit: "16kb" }));
app.use(express.static(path.join(__dirname, "..")));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    database: dbPath,
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

app.listen(PORT, () => {
  console.log(`Hello World API running at http://localhost:${PORT}`);
  console.log(`SQLite file: ${dbPath}`);
});

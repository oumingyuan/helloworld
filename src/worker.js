/**
 * Cloudflare Worker: 静态页 + /api/* + D1 (托管 SQLite)
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env, url);
    }

    return env.ASSETS.fetch(request);
  },
};

async function ensureSchema(env) {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS greetings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`
  ).run();
}

async function handleApi(request, env, url) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    await ensureSchema(env);

    if (url.pathname === "/api/health" && request.method === "GET") {
      return json({ ok: true, database: "cloudflare-d1" }, headers);
    }

    if (url.pathname === "/api/greetings" && request.method === "GET") {
      const { results } = await env.DB.prepare(
        `SELECT id, name, message, created_at
         FROM greetings
         ORDER BY id DESC
         LIMIT 30`
      ).all();
      return json({ items: results || [] }, headers);
    }

    if (url.pathname === "/api/greetings" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const name = String(body?.name || "").trim().slice(0, 40);
      const message = String(body?.message || "").trim().slice(0, 200);

      if (!name || !message) {
        return json({ error: "请填写昵称和留言" }, headers, 400);
      }

      const result = await env.DB.prepare(
        `INSERT INTO greetings (name, message) VALUES (?, ?)`
      )
        .bind(name, message)
        .run();

      const id = result?.meta?.last_row_id;
      const item = await env.DB.prepare(
        `SELECT id, name, message, created_at FROM greetings WHERE id = ?`
      )
        .bind(id)
        .first();

      return json({ item }, headers, 201);
    }

    return json({ error: "未找到接口" }, headers, 404);
  } catch (error) {
    console.error(error);
    return json(
      {
        error: "服务暂时不可用",
        detail: String(error?.message || error),
      },
      headers,
      500
    );
  }
}

function json(data, headers, status = 200) {
  return new Response(JSON.stringify(data), { status, headers });
}

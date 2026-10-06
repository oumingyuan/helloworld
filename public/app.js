    const reveal = document.querySelector("[data-reveal]");
    if (reveal && "IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.35 });
      io.observe(reveal);
    } else if (reveal) {
      reveal.classList.add("is-visible");
    }
    setTimeout(() => reveal && reveal.classList.add("is-visible"), 1200);

    const API_BASE = window.HELLO_API_BASE || "";
    const form = document.getElementById("greeting-form");
    const listEl = document.getElementById("greeting-list");
    const statusEl = document.getElementById("board-status");

    function setStatus(text, tone) {
      statusEl.textContent = text || "";
      statusEl.dataset.tone = tone || "";
    }

    function formatTime(value) {
      try {
        return new Date(value.replace(" ", "T") + "Z").toLocaleString("zh-CN");
      } catch {
        return value;
      }
    }

    function renderGreetings(items) {
      if (!items.length) {
        listEl.innerHTML = '<li class="board__empty">还没有留言，来写第一条吧。</li>';
        return;
      }

      listEl.innerHTML = items
        .map(
          (item) => `
            <li class="board__item">
              <strong>${escapeHtml(item.name)}</strong>
              <time datetime="${escapeHtml(item.created_at)}">${escapeHtml(formatTime(item.created_at))}</time>
              <p>${escapeHtml(item.message)}</p>
            </li>`
        )
        .join("");
    }

    function escapeHtml(value) {
      return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
    }

    async function loadGreetings() {
      try {
        const res = await fetch(`${API_BASE}/api/greetings`);
        if (!res.ok) throw new Error(`load failed (${res.status})`);
        const data = await res.json();
        renderGreetings(data.items || []);
        setStatus("");
      } catch {
        renderGreetings([]);
        setStatus("当前网络连不上 Cloudflare API（国内访问 *.workers.dev 常失败；开外网/代理一般可写库）。", "error");
      }
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const payload = {
        name: String(formData.get("name") || "").trim(),
        message: String(formData.get("message") || "").trim(),
      };

      setStatus("正在写入…");
      try {
        const res = await fetch(`${API_BASE}/api/greetings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || `写入失败（HTTP ${res.status}）`);
        }
        form.reset();
        setStatus("已写入 D1 数据库。", "ok");
        await loadGreetings();
      } catch (error) {
        const msg = String(error?.message || "保存失败");
        const networkLike = /failed|network|fetch|load failed/i.test(msg);
        setStatus(
          networkLike
            ? "写入失败：当前网络无法到达 Cloudflare。请切换外网，或绑定自己的域名后再试。"
            : msg,
          "error"
        );
      }
    });

    loadGreetings();
  
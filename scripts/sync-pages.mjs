#!/usr/bin/env node
/**
 * 单一前端源：public/
 * 同步到仓库根目录，供 GitHub Pages（main 根目录）发布。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "public");
const files = ["index.html", "styles.css", "app.js"];

for (const name of files) {
  const from = path.join(srcDir, name);
  const to = path.join(root, name);
  if (!fs.existsSync(from)) {
    console.error(`missing source: ${from}`);
    process.exit(1);
  }
  fs.copyFileSync(from, to);
  console.log(`synced ${name}`);
}

#!/usr/bin/env node
/**
 * 校验根目录前端文件与 public/ 一致，避免双份漂移。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = ["index.html", "styles.css", "app.js"];
let ok = true;

for (const name of files) {
  const a = path.join(root, "public", name);
  const b = path.join(root, name);
  if (!fs.existsSync(a) || !fs.existsSync(b)) {
    console.error(`missing: ${name}`);
    ok = false;
    continue;
  }
  const same = fs.readFileSync(a).equals(fs.readFileSync(b));
  if (!same) {
    console.error(`out of sync: ${name} (run npm run sync:pages)`);
    ok = false;
  } else {
    console.log(`ok: ${name}`);
  }
}

if (!ok) process.exit(1);
console.log("frontend sync check passed");

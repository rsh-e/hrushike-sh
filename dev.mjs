#!/usr/bin/env node
import { spawn, spawnSync } from "node:child_process";
import { watch } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

function build() {
  const r = spawnSync("node", ["build.mjs"], { cwd: root, stdio: "inherit" });
  if (r.status) console.error("build failed");
}

build();
spawn("npx", ["--yes", "serve", "dist", "-p", "4173"], { cwd: root, stdio: "inherit" });

let timer;
function rebuild() {
  clearTimeout(timer);
  timer = setTimeout(build, 150);
}

for (const p of ["data", "static", "build.mjs"]) {
  watch(join(root, p), { recursive: true }, rebuild);
}

console.log("http://localhost:4173 — watching data/, static/, build.mjs");

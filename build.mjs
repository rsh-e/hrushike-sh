#!/usr/bin/env node
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const DIST = join(ROOT, "dist");
const DATA = JSON.parse(readFileSync(join(ROOT, "data/site.json"), "utf8"));

function gitMeta() {
  try {
    const [hash, date] = execSync("git log -1 --format=%h%n%cs", {
      cwd: ROOT,
      encoding: "utf8",
    })
      .trim()
      .split("\n");
    const dirty = execSync("git status --porcelain", { cwd: ROOT, encoding: "utf8" }).trim();
    return {
      date: date || "",
      // ponytail: dirty tree gets a unique query so local CSS/JS isn't stuck behind the last commit hash
      hash: dirty ? `${hash || "1"}d${Date.now()}` : hash || "1",
    };
  } catch {
    return { date: "", hash: "1" };
  }
}

const GIT = gitMeta();
const ASSET_V = GIT.hash;
const PAGES = [
  { id: "index", href: "/", file: "index.html", label: "index" },
  { id: "projects", href: "/projects.html", file: "projects.html", label: "projects" },
  { id: "reading", href: "/reading.html", file: "reading.html", label: "reading" },
  { id: "links", href: "/links.html", file: "links.html", label: "links" },
  { id: "resume", href: "/resume.html", file: "resume.html", label: "resume" },
];

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function markTodo(text) {
  const t = String(text ?? "");
  if (/TODO/i.test(t)) return `<span class="todo">${esc(t)}</span>`;
  return esc(t);
}

function contactLink(label, url) {
  if (!url || url === "#" || /^TODO/i.test(url)) {
    return `<span class="todo">[${label} — add URL]</span>`;
  }
  return `<a href="${esc(url)}" target="_blank" rel="noopener">[${label}]</a>`;
}

function githubLink() {
  return `<a href="${esc(DATA.contacts.github)}" target="_blank" rel="noopener">github</a>`;
}

function nav(active) {
  const links = PAGES.map((p) => {
    if (p.id === active) return `<span class="here">${p.label}</span>`;
    return `<a href="${p.href}">${p.label}</a>`;
  }).join(" · ");

  return `<div class="nav-bar">
    <div class="nav-links">${links} · ${githubLink()}</div>
    <label class="font-switch">font
      <select id="font-select" aria-label="Typeface">
        <option value="cmu">Computer Modern</option>
        <option value="times">Times New Roman</option>
        <option value="palatino">Palatino</option>
        <option value="georgia">Georgia</option>
        <option value="garamond">Garamond</option>
        <option value="baskerville">Baskerville</option>
        <option value="arial">Arial</option>
        <option value="helvetica">Helvetica</option>
      </select>
    </label>
  </div>`;
}

function statusLineHtml() {
  return `<p class="status-line">
    last updated: <span>${esc(GIT.date)}</span>
  </p>`;
}

function footer() {
  const sitemap = PAGES.map((p) => `<a href="${p.href}">${p.label}</a>`).join(" · ") + ` · ${githubLink()}`;
  return `
<footer class="footer">
  <div class="sitemap">sitemap: ${sitemap}</div>
  <p>© ${new Date().getFullYear()} ${esc(DATA.identity.name)} · <a href="${esc(DATA.domain)}">${esc(DATA.domain.replace(/^https?:\/\//, ""))}</a>
  · <kbd>?</kbd></p>
</footer>
<div id="shortcuts" class="shortcuts" aria-hidden="true">
  <div class="panel">
    <h2>Keyboard</h2>
    <p><kbd>?</kbd> — this panel</p>
    <p><kbd>Esc</kbd> — close</p>
    <p><a href="#" onclick="document.getElementById('shortcuts').classList.remove('open');return false;">close</a></p>
  </div>
</div>
<script src="/js/site.js?v=${ASSET_V}" defer></script>`;
}

function shell({ title, active, body, description }) {
  const pageTitle =
    title === "index" ? `${DATA.identity.aka}'s Website` : `${title} · ${DATA.identity.aka}`;
  const desc = description || DATA.identity.tagline;
  return `<!DOCTYPE html>
<html lang="en" data-font="cmu">
<head>
  <meta charset="utf-8" />
  <script>
    (function () {
      try {
        var f = localStorage.getItem("hrushike_font");
        if (f) document.documentElement.setAttribute("data-font", f);
      } catch (e) {}
    })();
  </script>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(pageTitle)}</title>
  <meta name="description" content="${esc(desc)}" />
  <meta name="author" content="${esc(DATA.identity.name)}" />
  <link rel="canonical" href="${esc(DATA.domain)}${active === "index" ? "/" : "/" + active + ".html"}" />
  <link rel="icon" href="/favicon.ico" />
  <link rel="stylesheet" href="/css/site.css?v=${ASSET_V}" />
</head>
<body>
  <nav class="nav">${nav(active)}</nav>
  <hr />
  ${body}
  ${active === "index" ? "" : statusLineHtml()}
  ${footer()}
</body>
</html>
`;
}

function pageIndex() {
  const id = DATA.identity;
  const contacts = DATA.contacts;
  const stack = DATA.stack
    .map((s) => `<dt>${esc(s.tools)}</dt><dd>${esc(s.role)}</dd>`)
    .join("\n");
  const interests = DATA.interests.map((i) => `<li>${esc(i)}</li>`).join("\n");

  return shell({
    title: "index",
    active: "index",
    body: `
  <div class="home">
    <div class="home-main">
      <h1>${esc(id.name)}</h1>
      <p class="tagline">${esc(id.tagline)}</p>
      <table class="dense">
        <tr><th>Studies</th><td>${esc(id.program)}, ${esc(id.year)} · ${esc(id.school)}</td></tr>
        <tr><th>Location</th><td>${esc(id.location)}</td></tr>
        <tr><th>References</th><td class="mono">
          ${contactLink("Medium", contacts.medium)}
          ${contactLink("X", contacts.x)}
        </td></tr>
      </table>
      <aside class="gazette" id="on-this-day" aria-label="On this day in history">
        <div class="gazette-masthead">
          <div class="gazette-title">On This Day</div>
          <div class="gazette-sub mono" id="otd-date">…</div>
        </div>
        <div class="gazette-body">
          <figure class="gazette-photo" id="otd-photo" hidden>
            <img id="otd-img" alt="" width="320" height="240" referrerpolicy="no-referrer" />
            <figcaption class="mono" id="otd-cap"></figcaption>
          </figure>
          <div class="gazette-heads" id="otd-heads">
            <p class="mono">setting type…</p>
          </div>
        </div>
        <p class="field-note">wikimedia · on this day</p>
      </aside>
      ${statusLineHtml()}
    </div>
    <div class="home-side">
      <div class="home-block">
        <h2>Interests</h2>
        <ul class="plain">${interests}</ul>
      </div>
      <div class="home-block">
        <h2>Stack</h2>
        <dl class="stack">${stack}</dl>
      </div>
      <div class="home-block home-block-end">
        <h2>Index</h2>
        <table class="dense">
          <tr><th><a href="/projects.html">/projects</a></th><td>Things I’ve built</td></tr>
          <tr><th><a href="/reading.html">/reading</a></th><td>Books by year</td></tr>
          <tr><th><a href="/links.html">/links</a></th><td>Interesting things I've found</td></tr>
          <tr><th><a href="/resume.html">/resume</a></th><td>Education &amp; experience</td></tr>
        </table>
      </div>
    </div>
  </div>
`,
  });
}

function pageProjects() {
  const rows = DATA.projects
    .map((p) => {
      const link =
        !p.url || p.url === "#"
          ? esc(p.name)
          : `<a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.name)}</a>`;
      return `<tr>
      <td>${esc(p.year)}</td>
      <td>${link}</td>
      <td class="mono">${esc(p.status)}</td>
      <td>${esc(p.blurb)}${p.why ? `<br /><span class="tagline">${esc(p.why)}</span>` : ""}</td>
    </tr>`;
    })
    .join("\n");

  return shell({
    title: "projects",
    active: "projects",
    description: `Projects by ${DATA.identity.name}`,
    body: `
  <h1>Projects</h1>
  <p class="tagline">Stuff I've been working on</p>
  <hr />
  <table class="dense list projects">
    <thead>
      <tr><th>Year</th><th>Name</th><th>Status</th><th>Notes</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
`,
  });
}

function pageReading() {
  const sections = (DATA.reading || [])
    .map((group) => {
      const rows = group.items
        .map(
          (b) => `<tr>
        <td>${esc(b.title)}</td>
        <td>${esc(b.author)}</td>
        <td class="mono">${esc(b.status)}</td>
      </tr>`
        )
        .join("\n");
      return `
  <h2>${esc(group.year)}</h2>
  <table class="dense list">
    <thead><tr><th>Title</th><th>Author</th><th>Status</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
    })
    .join("\n");

  return shell({
    title: "reading",
    active: "reading",
    description: "Reading list",
    body: `
  <h1>Reading</h1>
  <p class="tagline">Books by year.</p>
  <hr />
  ${sections}
`,
  });
}

function pageLinks() {
  const rows = DATA.links
    .toReversed()
    .map((l) => {
      const title =
        !l.url || l.url === "#"
          ? markTodo(l.title)
          : `<a href="${esc(l.url)}" target="_blank" rel="noopener">${markTodo(l.title)}</a>`;
      return `<tr><td>${title}</td></tr>`;
    })
    .join("\n");

  return shell({
    title: "links",
    active: "links",
    description: "Cool links",
    body: `
  <h1>Links</h1>
  <p class="tagline">Interesting things I've found.</p>
  <hr />
  <table class="dense list">
    <tbody>${rows}</tbody>
  </table>
`,
  });
}

function pageResume() {
  const edu = DATA.resume.education
    .map(
      (e) => `<tr>
      <th>${esc(e.when)}</th>
      <td><strong>${esc(e.where)}</strong><br />${esc(e.what)}${e.detail ? ` <span class="tagline">${esc(e.detail)}</span>` : ""}</td>
    </tr>`
    )
    .join("\n");

  const exp = DATA.resume.experience
    .map(
      (e) => `<tr>
      <th>${esc(e.when)}</th>
      <td><strong>${esc(e.what)}</strong><br />${esc(e.where)}${e.detail ? `<br /><span class="tagline">${esc(e.detail)}</span>` : ""}</td>
    </tr>`
    )
    .join("\n");

  return shell({
    title: "resume",
    active: "resume",
    description: `Resume — ${DATA.identity.name}`,
    body: `
  <h1>Resume</h1>
  <p class="tagline">${esc(DATA.identity.name)} · ${esc(DATA.identity.aka)}</p>
  <hr />
  <h2>Education</h2>
  <table class="dense resume">${edu}</table>
  <h2>Experience</h2>
  <table class="dense resume">${exp}</table>
`,
  });
}

function writeHumans() {
  return `/* TEAM */
Name: ${DATA.identity.name}
Aka: ${DATA.identity.aka}
Site: ${DATA.domain}
GitHub: ${DATA.contacts.github}

/* SITE */
Last update: ${GIT.date}
Standards: HTML5, CSS3
Software: bun, Netlify, a text editor
`;
}

function writeLlms() {
  return `# ${DATA.identity.name} (${DATA.identity.aka})

Personal site at ${DATA.domain}.
MEng Computer Science, University of Bristol (3rd year).

## Pages
- / — identity · On This Day (history + plate)
- /projects.html — Avon, SEC RAG, Game of Life, Scotland Yard AI
- /reading.html — books by year
- /links.html — link directory
- /resume.html — CV

## Content source
data/site.json → build.mjs → static HTML
`;
}

function writeHeaders() {
  return `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/*.html
  Cache-Control: public, max-age=0, must-revalidate

/
  Cache-Control: public, max-age=0, must-revalidate

/css/*
  Cache-Control: public, max-age=31536000, immutable

/js/*
  Cache-Control: public, max-age=31536000, immutable

/fonts/*
  Cache-Control: public, max-age=31536000, immutable
`;
}

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
cpSync(join(ROOT, "static"), DIST, { recursive: true });

const pages = {
  "index.html": pageIndex(),
  "projects.html": pageProjects(),
  "reading.html": pageReading(),
  "links.html": pageLinks(),
  "resume.html": pageResume(),
};

for (const [file, html] of Object.entries(pages)) {
  writeFileSync(join(DIST, file), html);
}

writeFileSync(join(DIST, "humans.txt"), writeHumans());
writeFileSync(join(DIST, "llms.txt"), writeLlms());
writeFileSync(join(DIST, "_headers"), writeHeaders());

console.log(`Built ${Object.keys(pages).length} pages → dist/`);

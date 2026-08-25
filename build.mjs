#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const DIST = join(ROOT, "dist");
const DATA = JSON.parse(readFileSync(join(ROOT, "data/site.json"), "utf8"));
const ASSET_V = DATA.updated.replace(/[^0-9a-z]/gi, "") || "1";
const DEFAULT_TONE = DATA.defaults?.tone || "dry";

const PAGES = [
  { id: "index", href: "/", file: "index.html", label: "index" },
  { id: "now", href: "/now.html", file: "now.html", label: "now" },
  { id: "projects", href: "/projects.html", file: "projects.html", label: "projects" },
  { id: "reading", href: "/reading.html", file: "reading.html", label: "reading" },
  { id: "links", href: "/links.html", file: "links.html", label: "links" },
  { id: "resume", href: "/resume.html", file: "resume.html", label: "resume" },
  { id: "colophon", href: "/colophon.html", file: "colophon.html", label: "colophon" },
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

function nav(active) {
  const links = PAGES.map((p) => {
    if (p.id === active) return `<span class="here">${p.label}</span>`;
    return `<a href="${p.href}">${p.label}</a>`;
  }).join(" · ");

  return `<div class="nav-links">${links}</div>`;
}

function statusLineHtml() {
  return `<p class="status-line">
    last updated: <span>${esc(DATA.updated)}</span>
    &nbsp;·&nbsp;
    <span class="hit-counter" id="hit-base" data-base="${esc(DATA.hitCounterBase)}">
      visitors: <span class="digits" id="hit-digits">0000000</span>
    </span>
  </p>`;
}

function footer() {
  const sitemap = PAGES.map((p) => `<a href="${p.href}">${p.label}</a>`).join(" · ");
  const toneJson = JSON.stringify(DATA.tones);
  return `
<footer class="footer">
  <div class="sitemap">sitemap: ${sitemap}</div>
  <div class="buttons">
    <a class="btn88" href="${esc(DATA.contacts.github)}" target="_blank" rel="noopener">GitHub</a>
    <a class="btn88" href="/colophon.html">made w/ text</a>
  </div>
  <p>© ${new Date().getFullYear()} ${esc(DATA.identity.name)} · <a href="${esc(DATA.domain)}">${esc(DATA.domain.replace(/^https?:\/\//, ""))}</a>
  · <kbd>?</kbd></p>
  <p class="tagline" data-tone-text="footer"></p>
</footer>
<div id="shortcuts" class="shortcuts" aria-hidden="true">
  <div class="panel">
    <h2>Keyboard</h2>
    <p><kbd>?</kbd> — this panel</p>
    <p>lab: <a href="/lab/dossier.html">dossier</a></p>
    <p><kbd>Esc</kbd> — close</p>
    <p><a href="#" onclick="document.getElementById('shortcuts').classList.remove('open');return false;">close</a></p>
  </div>
</div>
<script type="application/json" id="tone-data">${toneJson}</script>
<script src="/js/site.js?v=${ASSET_V}" defer></script>`;
}

function shell({ title, active, body, description }) {
  const pageTitle =
    title === "index" ? `${DATA.identity.aka}'s Website` : `${title} · ${DATA.identity.aka}`;
  const desc = description || DATA.identity.tagline;
  return `<!DOCTYPE html>
<html lang="en" data-tone="${esc(DEFAULT_TONE)}">
<head>
  <meta charset="utf-8" />
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
  const stackRows = DATA.stack
    .map((s) => `<tr><td class="mono">${esc(s.tools)}</td><td>→ ${esc(s.role)}</td></tr>`)
    .join("\n");
  const interests = DATA.interests.map((i) => `<li>${esc(i)}</li>`).join("\n");

  return shell({
    title: "index",
    active: "index",
    body: `
  <div class="home">
    <div class="home-main">
      <h1>${esc(id.name)}</h1>
      <p class="tagline" data-tone-text="blurb"></p>
      <table class="dense">
        <tr><th>Studies</th><td>${esc(id.program)}, ${esc(id.year)} · ${esc(id.school)}</td></tr>
        <tr><th>Location</th><td>${esc(id.location)}</td></tr>
        <tr><th>References</th><td class="mono">
          ${contactLink("GitHub", contacts.github)}
          ${contactLink("Medium", contacts.medium)}
          ${contactLink("X", contacts.x)}
          ${contactLink("Letterboxd", contacts.letterboxd)}
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
        <table class="dense list"><tbody>${stackRows}</tbody></table>
      </div>
      <div class="home-block home-block-end">
        <h2>Index</h2>
        <table class="dense">
          <tr><th><a href="/now.html">/now</a></th><td>What I’m doing</td></tr>
          <tr><th><a href="/projects.html">/projects</a></th><td>Things I’ve built</td></tr>
          <tr><th><a href="/reading.html">/reading</a></th><td>Books by year</td></tr>
          <tr><th><a href="/links.html">/links</a></th><td>Worth sending people</td></tr>
          <tr><th><a href="/resume.html">/resume</a></th><td>Education &amp; experience</td></tr>
          <tr><th><a href="/colophon.html">/colophon</a></th><td>How to edit</td></tr>
          <tr><th><a href="/lab/dossier.html">/lab/dossier</a></th><td>Full dossier layout</td></tr>
        </table>
      </div>
    </div>
  </div>
`,
  });
}

function pageNow() {
  const items = DATA.now.map((n) => `<li>${markTodo(n)}</li>`).join("\n");
  return shell({
    title: "now",
    active: "now",
    description: `What ${DATA.identity.aka} is doing now`,
    body: `
  <h1>Now</h1>
  <p class="tagline">Summer status and recent work.</p>
  <hr />
  <ul class="plain">${items}</ul>
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
  <p class="tagline">ECS work, systems coursework, and what’s on the bench now.</p>
  <hr />
  <table class="dense list">
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

  const lb = DATA.contacts.letterboxd;
  const lbLine =
    !lb || /^TODO/i.test(lb)
      ? `<p class="todo">Letterboxd: add your profile URL in data/site.json → contacts.letterboxd</p>`
      : `<p>Film notes: <a href="${esc(lb)}" target="_blank" rel="noopener">Letterboxd</a></p>`;

  return shell({
    title: "reading",
    active: "reading",
    description: "Reading list",
    body: `
  <h1>Reading</h1>
  <p class="tagline">Books by year. Films live on Letterboxd.</p>
  <hr />
  ${lbLine}
  ${sections}
`,
  });
}

function pageLinks() {
  const rows = DATA.links
    .map((l) => {
      const title =
        !l.url || l.url === "#"
          ? markTodo(l.title)
          : `<a href="${esc(l.url)}" target="_blank" rel="noopener">${markTodo(l.title)}</a>`;
      return `<tr><td>${title}</td><td>${markTodo(l.note)}</td></tr>`;
    })
    .join("\n");

  return shell({
    title: "links",
    active: "links",
    description: "Cool links",
    body: `
  <h1>Links</h1>
  <p class="tagline">Placeholder until you dictate the ones you actually send. Reminder noted.</p>
  <hr />
  <table class="dense list">
    <thead><tr><th>Site</th><th>Why</th></tr></thead>
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
      <td><strong>${esc(e.where)}</strong><br />${esc(e.what)}<br /><span class="tagline">${esc(e.detail)}</span></td>
    </tr>`
    )
    .join("\n");

  const exp = DATA.resume.experience
    .map(
      (e) => `<tr>
      <th>${esc(e.when)}</th>
      <td><strong>${esc(e.where)}</strong><br />${esc(e.what)}<br /><span class="tagline">${esc(e.detail)}</span></td>
    </tr>`
    )
    .join("\n");

  const skills = DATA.resume.skills.map((s) => esc(s)).join(" · ");

  return shell({
    title: "resume",
    active: "resume",
    description: `Resume — ${DATA.identity.name}`,
    body: `
  <h1>Resume</h1>
  <p class="tagline">${esc(DATA.identity.name)} · ${esc(DATA.identity.aka)}</p>
  <hr />
  <h2>Education</h2>
  <table class="dense">${edu}</table>
  <h2>Experience</h2>
  <table class="dense">${exp}</table>
  <h2>Skills</h2>
  <p class="mono">${skills}</p>
`,
  });
}

function pageColophon() {
  return shell({
    title: "colophon",
    active: "colophon",
    description: "How this site is built",
    body: `
  <h1>Colophon</h1>
  <p class="tagline">How this site is made, and how to change it without an AI.</p>
  <hr />

  <h2>Design</h2>
  <p>Dense tables. Dry copy. CMU Serif + Typewriter on white.</p>

  <p>Home: <strong>On This Day</strong> — one Wikimedia history fact + plate.</p>

  <h2>Update content</h2>
  <ol>
    <li>Edit <code>data/site.json</code></li>
    <li><code>bun run build</code> or <code>node build.mjs</code></li>
    <li>Commit and push → Netlify deploys <code>dist/</code></li>
  </ol>
  <p>Still TODO from you: Letterboxd URL, cool links list.</p>
`,
  });
}

function pageLabDossier() {
  const id = DATA.identity;
  const projects = DATA.projects
    .map(
      (p) => `<tr>
      <td>${esc(p.year)}</td>
      <td>${esc(p.name)}</td>
      <td>${esc(p.status)}</td>
      <td>${esc(p.blurb)}</td>
    </tr>`
    )
    .join("\n");
  const interests = DATA.interests.map((i) => `<li>${esc(i)}</li>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>DOSSIER · ${esc(id.aka)}</title>
  <link rel="icon" href="/favicon.ico" />
  <link rel="stylesheet" href="/css/lab.css?v=${ASSET_V}" />
</head>
<body class="lab-dossier">
  <div class="lab-top">
    <span>FILE // HRU-LOG-441 · SECTOR: EDUCATION_UK · CLEARANCE: PUBLIC_PARTIAL</span>
    <a class="lab-exit" href="/">[ EXIT TO SITE ]</a>
  </div>
  <h1>${esc(id.name)}</h1>
  <p class="lab-meta">AKA ${esc(id.aka)} · ${esc(id.program)} · ${esc(id.school)} · LOC 51.45N / 2.60W</p>
  <div class="stamp">AUTHORIZED FOR PUBLIC RELEASE</div>

  <div class="bento">
    <div class="card span-5">
      <h2>01.0 // Subject</h2>
      <table>
        <tr><th>Name</th><td>${esc(id.name)}</td></tr>
        <tr><th>Alias</th><td>${esc(id.aka)}</td></tr>
        <tr><th>Role</th><td>${esc(id.year)} · ${esc(id.program)}</td></tr>
        <tr><th>Org</th><td>${esc(id.school)}</td></tr>
        <tr><th>Refs</th><td class="mono">
          <a href="${esc(DATA.contacts.github)}" target="_blank" rel="noopener">GitHub</a> ·
          <a href="${esc(DATA.contacts.medium)}" target="_blank" rel="noopener">Medium</a> ·
          <a href="${esc(DATA.contacts.x)}" target="_blank" rel="noopener">X</a>
        </td></tr>
      </table>
    </div>
    <div class="card span-7">
      <h2>02.0 // Interests</h2>
      <ul>${interests}</ul>
      <div class="alert" style="margin-top:0.75rem">
        NOTE: Internal memo references <span class="redacted">extraction pipeline Q3</span> — hover to declassify fragment.
      </div>
    </div>
    <div class="card span-12">
      <h2>03.0 // Asset Ledger (Projects)</h2>
      <table>
        <thead><tr><th>Period</th><th>Asset</th><th>State</th><th>Summary</th></tr></thead>
        <tbody>${projects}</tbody>
      </table>
    </div>
    <div class="card span-4">
      <h2>04.0 // Now</h2>
      <ul>${DATA.now.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>
    </div>
    <div class="card span-8">
      <h2>05.0 // Experience Extract</h2>
      <table>
        ${DATA.resume.experience
          .map(
            (e) => `<tr>
          <th>${esc(e.when)}</th>
          <td><strong>${esc(e.where)}</strong> — ${esc(e.what)}<br /><span style="color:#888a85">${esc(e.detail)}</span></td>
        </tr>`
          )
          .join("")}
      </table>
    </div>
  </div>

  <p class="legal">
    Confidentiality notice: property of mining &amp; mineral logistics corp. all rights reserved under trans-global extraction act.
    This public mirror omits classified annexes. Unauthorized redistribution of internal coordinates is a reportable incident.
    Document generated ${esc(DATA.updated)} · return path: <a href="/">hrushike.sh</a>
  </p>
</body>
</html>
`;
}

function pageLabDarpa() {
  const id = DATA.identity;
  const projectRows = DATA.projects
    .map(
      (p) => `<tr>
      <td>${esc(p.year)}</td>
      <td>${esc(p.name).toUpperCase()}</td>
      <td>${esc(p.status).toUpperCase()}</td>
      <td>${esc(p.blurb)}</td>
    </tr>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>[SYS] PROJECT AETHER · ${esc(id.aka)}</title>
  <link rel="icon" href="/favicon.ico" />
  <link rel="stylesheet" href="/css/lab.css?v=${ASSET_V}" />
</head>
<body class="lab-darpa">
  <div class="crt-scanlines" aria-hidden="true"></div>
  <div class="frame">
    <div class="class-bar">CLASSIFICATION: TOP SECRET // PROJECT AETHER // RESTRICTED ACCESS</div>
    <h1>[SYS_INIT] ${esc(id.name).toUpperCase()}</h1>
    <p class="sys">SEC_LOG_PERSONNEL.txt · DEPT_OF_DEFENSE_COMM_UNDERGROUND · NODE: BRISTOL_UK</p>
    <p class="sys">AKA ${esc(id.aka).toUpperCase()} · ${esc(id.program).toUpperCase()} · ${esc(id.year).toUpperCase()}</p>

    <div class="ascii-rule">--------------------------------------------------------------------------------</div>

    <h2>01 · IDENTITY MATRIX</h2>
    <table class="system-grid">
      <tr><th>NAME</th><td>${esc(id.name)}</td></tr>
      <tr><th>CALL</th><td>${esc(id.aka)}</td></tr>
      <tr><th>ASSIGN</th><td>${esc(id.school)} / ${esc(id.program)}</td></tr>
      <tr><th>COORDS</th><td>51.45N / 2.60W</td></tr>
      <tr><th>UPLINK</th><td>
        <a href="${esc(DATA.contacts.github)}" target="_blank" rel="noopener">[ GITHUB ]</a>
        <a href="${esc(DATA.contacts.medium)}" target="_blank" rel="noopener">[ MEDIUM ]</a>
        <a href="${esc(DATA.contacts.x)}" target="_blank" rel="noopener">[ X ]</a>
      </td></tr>
    </table>

    <h2>02 · ACTIVE OPERATIONS</h2>
    <ul>${DATA.now.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>

    <h2>03 · PROJECT LEDGER</h2>
    <table class="system-grid">
      <thead><tr><th>EPOCH</th><th>CODE</th><th>STATE</th><th>BRIEF</th></tr></thead>
      <tbody>${projectRows}</tbody>
    </table>

    <h2>04 · INTEREST VECTORS</h2>
    <ul>${DATA.interests.map((i) => `<li>${esc(i).toUpperCase()}</li>`).join("")}</ul>

    <div class="ascii-rule">--------------------------------------------------------------------------------</div>
    <div class="class-bar">CLASSIFICATION: TOP SECRET // PROJECT AETHER // END TRANSMISSION</div>
    <a class="lab-exit" href="/">[ ACCESS MAIN SITE ]</a>
  </div>
</body>
</html>
`;
}

function writeHumans() {
  return `/* TEAM */
Name: ${DATA.identity.name}
Aka: ${DATA.identity.aka}
Site: ${DATA.domain}
GitHub: ${DATA.contacts.github}

/* SITE */
Last update: ${DATA.updated}
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
- /now.html — current status
- /projects.html — Avon, SEC RAG, Game of Life, Scotland Yard AI
- /reading.html — books by year
- /links.html — link directory
- /resume.html — CV
- /colophon.html — how to edit
- /lab/dossier.html — dossier lab layout

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
mkdirSync(join(DIST, "lab"), { recursive: true });

const pages = {
  "index.html": pageIndex(),
  "now.html": pageNow(),
  "projects.html": pageProjects(),
  "reading.html": pageReading(),
  "links.html": pageLinks(),
  "resume.html": pageResume(),
  "colophon.html": pageColophon(),
  "lab/dossier.html": pageLabDossier(),
};

for (const [file, html] of Object.entries(pages)) {
  writeFileSync(join(DIST, file), html);
}

writeFileSync(join(DIST, "humans.txt"), writeHumans());
writeFileSync(join(DIST, "llms.txt"), writeLlms());
writeFileSync(join(DIST, "_headers"), writeHeaders());

console.log(`Built ${Object.keys(pages).length} pages → dist/`);

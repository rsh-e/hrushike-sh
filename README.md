# hrushike.sh

Personal site for Hrushikesh Emkay (Rishi). Static HTML on Netlify. Utilitarian white pages — dense tables, blue links, local CMU fonts.

**Live:** https://hrushike.sh

## Update content (no AI needed)

1. Edit [`data/site.json`](data/site.json) — identity, contacts, `projects`, `links`, `resume`.
   Last-updated is the date of the latest git commit (same as the last Netlify deploy).
2. Build:

```bash
bun run build
# or: node build.mjs
```

3. Commit and push. Netlify runs the same build and publishes `dist/`.

That is the whole content workflow. Do not edit generated HTML under `dist/` by hand.

### Project rows

```json
{
  "year": "2026",
  "name": "My thing",
  "status": "wip",
  "blurb": "One sentence.",
  "url": "https://github.com/rsh-e/…"
}
```

Rows whose name/blurb contain `TODO` render in amber so placeholders are obvious.

## Local preview

```bash
bun run dev
# or: npm run dev
```

Builds, serves `dist/` at http://localhost:4173, and rebuilds when `data/`, `static/`, or `build.mjs` change.

## Layout

| Path | Role |
|------|------|
| `data/site.json` | **All** site copy |
| `build.mjs` | Renders pages into `dist/` |
| `static/css/site.css` | Styles |
| `static/js/site.js` | Keyboard shortcuts |
| `static/fonts/` | CMU Serif + Typewriter |
| `netlify.toml` | Build + publish dir |

Homepage line: `identity.tagline` in `data/site.json`.

Add more links in `data/site.json` when you have them.

## Design notes

Informed by utilitarian personal sites; default flavour is academic.

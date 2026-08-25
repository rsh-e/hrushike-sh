# hrushike.sh

Personal site for Hrushikesh Emkay (Rishi). Static HTML on Netlify. Utilitarian white pages — dense tables, blue links, local CMU fonts.

**Live:** https://hrushike.sh

## Update content (no AI needed)

1. Edit [`data/site.json`](data/site.json) — identity, contacts, `now`, `projects`, `links`, `resume`, `hitCounterBase`, `updated`.
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
bun run build
npx serve dist -p 4173
```

## Layout

| Path | Role |
|------|------|
| `data/site.json` | **All** site copy |
| `build.mjs` | Renders pages into `dist/` |
| `static/css/site.css` | Styles |
| `static/js/site.js` | Hit counter + keyboard easter eggs |
| `static/fonts/` | CMU Serif + Typewriter |
| `netlify.toml` | Build + publish dir |

## Themes & tones

- **Themes** (`t` or `1`–`3`): **academic** / **dossier light** / **dossier dark**
- Tone locked to **dry**
- Lab: [/lab/dossier.html](/lab/dossier.html)

Still TODO from you: Letterboxd URL, cool links list.

## Design notes

Informed by utilitarian personal sites; default flavour is academic with dossier light/dark.

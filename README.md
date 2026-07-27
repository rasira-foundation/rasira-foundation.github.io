# Rasira Foundation

Landing page and article hub for Rasira Foundation, built with Vite + React
+ TypeScript, deployed to GitHub Pages at `rasira-foundation.github.io`.

## Stack

- Vite + React + TypeScript, no UI framework
- `framer-motion` for scroll/entry animation
- A tiny hand-rolled hash router (`src/hooks/useHashRoute.ts`) — no
  `react-router` dependency, just `#/` for home and `#/article/<slug>` for
  a detail page
- Articles are fetched client-side from a public Google Sheet — publishing
  a new row updates the live site on next page load, no rebuild needed

## Local development

```bash
npm install
npm run dev
```

## Content: the Articles sheet

Create a Google Sheet, publish/share it as "Anyone with the link can view",
and add these columns to a tab (case-insensitive header names, in any order):

Header names are normalized (lowercased, spaces/underscores/hyphens
stripped) before matching, so `Content Markdown`, `content_markdown`, and
`ContentMarkdown` are all treated the same — use whichever style you like.

| Column           | Notes                                                                 |
| ---------------- | ---------------------------------------------------------------------- |
| status           | Must be exactly `publish` for the row to appear. Anything else (e.g. `draft`) is filtered out. |
| title            | Required.                                                             |
| slug             | Optional — derived from title if blank. Used in the `#/article/<slug>` URL. |
| category         | One of `Highlight`, `Toolkit`, `Framework`, `Article`. Defaults to `Article`. Cards with no cover image render as an ASCII-styled card regardless of category. |
| excerpt          | Shown on the grid card.                                               |
| cover_image_url  | A Google Drive share link (`.../file/d/FILE_ID/view`) or any public image URL. Drive links are auto-converted to a direct-viewable URL. Leave blank for an ASCII-styled card instead of a full-bleed image. |
| author           | Defaults to "Rasira Foundation".                                      |
| publish_date     | Free text (or a Sheets date column), used for sort order (newest first) and the detail page byline. |
| read_time        | Optional, e.g. `4 min read`. Auto-estimated from content_markdown word count if left blank. |
| content_markdown | Long-form body. Supports light markdown: `# `/`## ` headers, `> ` blockquotes, `- ` list items, blank-line-separated paragraphs. |

Then point the site at it:

```bash
cp .env.example .env.local
# edit .env.local — VITE_SHEET_ID is the long ID in the sheet's URL,
# VITE_SHEET_GID is the tab (0 = first tab, from the URL's "#gid=")
```

Without `VITE_SHEET_ID` configured (or if the fetch fails), the site falls
back to demo content in `src/data/mockArticles.ts` so it still runs and
looks right locally.

## Deployment

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every
push to `main`.

One-time setup on GitHub:

1. In the repo, go to **Settings → Pages** and set the source to **GitHub Actions**.
2. If you're using a live sheet, go to **Settings → Secrets and variables → Actions → Variables** and add `VITE_SHEET_ID` (and `VITE_SHEET_GID`/`VITE_SHEET_NAME` if not tab 0). These are plain repo variables, not secrets — the sheet ID is already public in the client bundle either way.
3. Push to `main`.

The site is an organization root page (`rasira-foundation.github.io`), so
`vite.config.ts` builds with `base: '/'`.

## Structure

```
src/
  components/
    Splash/     splash screen (mark → wordmark → dawn transition)
    Header/     sticky wordmark
    Hero/       narrative hero — scattered photo moodboard + canvas particle depth
    Nodes/      floating program-node network + "Collabs with us" mailto
    Articles/   Sheet-fed grid, tabs, and article detail page
    Footer/     live clock + closing narrative + contact
  data/         static page copy, mock articles, layout coordinates
  hooks/        hash router, scroll progress, realtime clock
  lib/sheets.ts Google Sheets gviz fetch + parsing
```

## Hero moodboard

`src/data/heroScatter.ts` lays out the hero collage (position, rotation,
scroll-parallax depth) against the real photography in `src/assets/photos/`.
To swap or add a piece: drop the image in that folder, import it, and add/edit
an entry with `kind: 'image'`.

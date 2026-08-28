import { FALLBACK_COVER_IMAGES } from '../data/fallbackCoverImages';

export type ArticleCategory = 'Highlight' | 'Toolkit' | 'Framework' | 'Article';

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: ArticleCategory;
  coverImage: string | null;
  author: string;
  date: string | null;
  readTime: string;
  /** Set from a "Substack URL" / "External URL" / "Link" column. When
   * present, the card links straight out to the original post instead of
   * our own detail page — lets a row point at something already
   * published on Substack without needing its full content pasted in
   * too. */
  externalUrl: string | null;
}

const CATEGORIES: ArticleCategory[] = ['Highlight', 'Toolkit', 'Framework', 'Article'];

const SHEET_ID = import.meta.env.VITE_SHEET_ID as string | undefined;
// Named tab takes priority; otherwise address the tab by gid (0 = first tab,
// matching the "#gid=0" you get by default when copying a sheet's URL).
const SHEET_NAME = import.meta.env.VITE_SHEET_NAME as string | undefined;
const SHEET_GID = (import.meta.env.VITE_SHEET_GID as string | undefined) || '0';

/**
 * Fetches the public Articles sheet client-side via the gviz JSON endpoint
 * (no API key, no backend — the sheet just needs to be shared as "anyone
 * with the link can view"). Publishing a new row updates the live site on
 * next page load, no rebuild required.
 */
export async function fetchArticles(): Promise<Article[]> {
  if (!SHEET_ID) {
    throw new Error('VITE_SHEET_ID is not configured');
  }

  const sheetParam = SHEET_NAME ? `sheet=${encodeURIComponent(SHEET_NAME)}` : `gid=${SHEET_GID}`;
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&${sheetParam}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Sheet fetch failed: ${res.status}`);
  }

  const raw = await res.text();
  const table = parseGvizResponse(raw);
  const rows = tableToRows(table);

  return rows
    .filter((row) => normalize(row.status) === 'publish')
    .map(rowToArticle)
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
}

function parseGvizResponse(raw: string): GvizTable {
  const match = raw.match(/setResponse\(([\s\S]*)\);?\s*$/);
  const jsonText = match ? match[1] : raw;
  const payload = JSON.parse(jsonText) as { table: GvizTable };
  return payload.table;
}

interface GvizTable {
  cols: { label: string }[];
  rows: { c: ({ v: unknown; f?: string } | null)[] }[];
}

type SheetRow = Record<string, string>;

function tableToRows(table: GvizTable): SheetRow[] {
  const keys = table.cols.map((col) => normalize(col.label));
  return table.rows.map((row) => {
    const entry: SheetRow = {};
    row.c.forEach((cell, i) => {
      const key = keys[i];
      if (!key) return;
      entry[key] = cell?.f ?? (cell?.v != null ? String(cell.v) : '');
    });
    return entry;
  });
}

function rowToArticle(row: SheetRow): Article {
  const title = row.title?.trim() || 'Untitled';
  const slug = slugify(row.slug?.trim() || title);
  const category = CATEGORIES.includes(row.category as ArticleCategory)
    ? (row.category as ArticleCategory)
    : 'Article';
  // Header keys are normalized (spaces/underscores/hyphens stripped, see
  // normalize()), so "content_markdown", "Content Markdown" etc. all land
  // on "contentmarkdown" here — check the long form first, short form as
  // a fallback for simpler sheets.
  const content = row.contentmarkdown?.trim() || row.content?.trim() || '';

  return {
    slug,
    title,
    excerpt: row.excerpt?.trim() || '',
    content,
    category,
    coverImage:
      resolveImageUrl(row.coverimageurl?.trim() || row.coverimage?.trim() || row.cover?.trim() || '') ||
      FALLBACK_COVER_IMAGES[slug] ||
      null,
    author: row.author?.trim() || 'Rasira Foundation',
    date: row.publishdate?.trim() || row.date?.trim() || null,
    readTime: row.readtime?.trim() || estimateReadTime(content),
    externalUrl: row.substackurl?.trim() || row.externalurl?.trim() || row.link?.trim() || row.url?.trim() || null,
  };
}

/** Turns a Google Drive share link into a directly-embeddable image URL.
 * Exported so markdown.tsx can apply the same handling to inline images
 * pasted into article content, not just the Cover Image column. */
export function resolveImageUrl(url: string): string | null {
  if (!url) return null;
  const driveMatch = url.match(/\/d\/([\w-]+)/) ?? url.match(/[?&]id=([\w-]+)/);
  if (driveMatch) {
    return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
  }
  return url;
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/[\s_-]+/g, '');
}

function estimateReadTime(content: string): string {
  const words = content.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Allow only http(s) URLs through to an href or src.
 *
 * Article rows come from a Google Sheet, and anyone who can edit that Sheet
 * can put anything in the Link or Cover Image column. A value of
 * `javascript:...` pasted there would end up in an anchor's href and run on
 * click — stored XSS, arriving through a spreadsheet rather than a form.
 * `data:` is refused for the same reason: a data: document navigated to from
 * a link inherits nothing useful but is a standard phishing shape.
 *
 * This is not defence against a hostile stranger — it takes Sheet access to
 * exploit. It is defence against a content editor pasting something odd, and
 * against that Sheet ever being shared more widely than it is today.
 */
export function safeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  try {
    /* Parsed rather than pattern-matched. A regex on the raw string is
       fooled by leading control characters and by casing —
       "java\tscript:" and "JaVaScript:" both survive most hand-written
       checks, and the URL parser normalises them away. */
    const parsed = new URL(trimmed, window.location.origin);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? trimmed : undefined;
  } catch {
    return undefined;
  }
}

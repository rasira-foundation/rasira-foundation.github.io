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
}

const CATEGORIES: ArticleCategory[] = ['Highlight', 'Toolkit', 'Framework', 'Article'];

const SHEET_ID = import.meta.env.VITE_SHEET_ID as string | undefined;
const SHEET_NAME = (import.meta.env.VITE_SHEET_NAME as string | undefined) || 'Articles';

/**
 * Fetches the public "Articles" sheet client-side via the gviz JSON
 * endpoint (no API key, no backend — the sheet just needs to be published
 * or shared as "anyone with the link can view"). Publishing a new row
 * updates the live site on next page load, no rebuild required.
 */
export async function fetchArticles(): Promise<Article[]> {
  if (!SHEET_ID) {
    throw new Error('VITE_SHEET_ID is not configured');
  }

  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Sheet fetch failed: ${res.status}`);
  }

  const raw = await res.text();
  const table = parseGvizResponse(raw);
  const rows = tableToRows(table);

  return rows
    .filter((row) => normalize(row.status) === 'published')
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

  return {
    slug,
    title,
    excerpt: row.excerpt?.trim() || '',
    content: row.content?.trim() || '',
    category,
    coverImage: resolveImageUrl(row.coverimage?.trim() || row.cover?.trim() || ''),
    author: row.author?.trim() || 'Rasira Foundation',
    date: row.date?.trim() || null,
  };
}

/** Turns a Google Drive share link into a directly-embeddable image URL. */
function resolveImageUrl(url: string): string | null {
  if (!url) return null;
  const driveMatch = url.match(/\/d\/([\w-]+)/) ?? url.match(/[?&]id=([\w-]+)/);
  if (driveMatch) {
    return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
  }
  return url;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

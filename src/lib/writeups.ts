import { load as loadYaml } from 'js-yaml';

// Loads every .md file in src/content/writeups/ at build time.
// Frontmatter fields:
//
// ---
// title: Buffer Overflow on Vulnerable Server
// date: 2026-03-14
// category: [Binary Exploitation]
// tags: [pwn, x86, ropchain]
// difficulty: Hard
// pinned: true            # optional: shows in the "Pinned" section on the homepage
// summary: One-line description shown on the list page.
// ---

export interface WriteupMeta {
  slug: string;
  title: string;
  date: string;
  categories: string[];
  tags: string[];
  difficulty?: string;
  summary?: string;
  pinned: boolean;
}

export interface Writeup extends WriteupMeta {
  content: string;
  searchIndex: string; // lowercased text used by the search box
}

export type SortMode = 'latest' | 'oldest' | 'title';

function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };

  const [, block, content] = match;
  let data: Record<string, unknown> = {};
  try {
    data = (loadYaml(block) as Record<string, unknown>) ?? {};
  } catch {
    data = {};
  }
  return { data, content: content.trim() };
}

const modules = import.meta.glob('/src/content/writeups/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function slugFromPath(path: string): string {
  const file = path.split('/').pop() ?? path;
  return file.replace(/\.md$/, '');
}

// YAML parses an unquoted date like "2026-02-11" as a real Date object.
// Normalize either case back to a plain YYYY-MM-DD string.
function normalizeDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'string') return value;
  return '';
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (value) return [String(value)];
  return [];
}

const writeups: Writeup[] = Object.entries(modules).map(([path, raw]) => {
  const { data, content } = parseFrontmatter(raw);
  const slug = slugFromPath(path);
  const categories = toStringArray(data.category);
  const tags = toStringArray(data.tags);
  const title = (data.title as string) ?? slug;
  const summary = data.summary as string | undefined;
  const difficulty = data.difficulty as string | undefined;

  return {
    slug,
    title,
    date: normalizeDate(data.date),
    categories: categories.length ? categories : ['Uncategorized'],
    tags,
    difficulty,
    summary,
    pinned: data.pinned === true || data.pinned === 'true',
    content,
    searchIndex: [title, summary, difficulty, ...categories, ...tags, content]
      .filter(Boolean)
      .join('\n')
      .toLowerCase(),
  };
});

// Date -> number so sorting doesn't depend on string format (missing/odd dates sort last).
function time(w: Writeup): number {
  const t = Date.parse(w.date);
  return Number.isNaN(t) ? 0 : t;
}

export function sortWriteups(list: Writeup[], mode: SortMode = 'latest'): Writeup[] {
  const sorted = [...list];
  if (mode === 'title') return sorted.sort((a, b) => a.title.localeCompare(b.title));
  const dir = mode === 'latest' ? -1 : 1;
  return sorted.sort((a, b) => (time(a) - time(b)) * dir || a.title.localeCompare(b.title));
}

// Every whitespace-separated term must appear somewhere in the writeup (title, tags, body...).
export function matchesQuery(w: Writeup, query: string): boolean {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return terms.every((t) => w.searchIndex.includes(t));
}

export function getAllWriteups(mode: SortMode = 'latest'): Writeup[] {
  return sortWriteups(writeups, mode);
}

export function getWriteupBySlug(slug: string): Writeup | undefined {
  return writeups.find((w) => w.slug === slug);
}

export function getAllCategories(): string[] {
  return [...new Set(writeups.flatMap((w) => w.categories))].sort();
}

const DIFFICULTY_ORDER = ['easy', 'medium', 'hard', 'insane'];

export function getAllDifficulties(): string[] {
  const set = [...new Set(writeups.map((w) => w.difficulty).filter(Boolean) as string[])];
  return set.sort((a, b) => {
    const ia = DIFFICULTY_ORDER.indexOf(a.toLowerCase());
    const ib = DIFFICULTY_ORDER.indexOf(b.toLowerCase());
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    return a.localeCompare(b);
  });
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getAllWriteups,
  getAllCategories,
  getAllDifficulties,
  matchesQuery,
  sortWriteups,
  type SortMode,
  type Writeup,
} from '../lib/writeups';

function Meta({ w }: { w: Writeup }) {
  return (
    <div className="flex flex-wrap gap-x-2 gap-y-1 font-mono text-[11px] text-ink-soft">
      <span className="text-accent">{w.categories.join(' · ')}</span>
      {w.difficulty && <span>· {w.difficulty}</span>}
      {w.tags.map((tag) => (
        <span key={tag}>#{tag}</span>
      ))}
    </div>
  );
}

function PinnedCard({ w }: { w: Writeup }) {
  return (
    <Link
      to={`/writeups/${w.slug}`}
      className="group flex flex-col gap-2 rounded-xl border border-line bg-surface p-5 transition-colors hover:border-accent"
    >
      {w.date && <time className="font-mono text-[11px] text-ink-soft">{w.date}</time>}
      <h3 className="font-medium leading-snug transition-colors group-hover:text-accent">
        {w.title}
      </h3>
      {w.summary && <p className="line-clamp-2 text-sm text-ink-soft">{w.summary}</p>}
      <div className="mt-auto pt-2">
        <Meta w={w} />
      </div>
    </Link>
  );
}

const pill = (active: boolean) =>
  `px-3 py-1 rounded-full border font-mono text-xs transition-colors ${
    active
      ? 'bg-accent text-paper border-accent'
      : 'border-line text-ink-soft hover:border-accent hover:text-ink'
  }`;

const selectClass =
  'rounded-md border border-line bg-surface px-3 py-1.5 font-mono text-xs text-ink-soft outline-none transition-colors hover:border-accent focus:border-accent';

export default function Home() {
  const all = useMemo(() => getAllWriteups('latest'), []);
  const categories = useMemo(() => getAllCategories(), []);
  const difficulties = useMemo(() => getAllDifficulties(), []);
  const pinned = useMemo(() => all.filter((w) => w.pinned), [all]);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState('all');
  const [sort, setSort] = useState<SortMode>('latest'); // default: latest first
  const searchRef = useRef<HTMLInputElement>(null);

  // Press "/" anywhere to jump to the search box.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target;
      const typing =
        t instanceof HTMLInputElement ||
        t instanceof HTMLTextAreaElement ||
        t instanceof HTMLSelectElement;
      if (e.key === '/' && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const isFiltering = query.trim() !== '' || category !== null || difficulty !== 'all';

  const results = useMemo(() => {
    const filtered = all.filter(
      (w) =>
        (!category || w.categories.includes(category)) &&
        (difficulty === 'all' || w.difficulty === difficulty) &&
        (!query.trim() || matchesQuery(w, query)),
    );
    return sortWriteups(filtered, sort);
  }, [all, category, difficulty, query, sort]);

  const resetFilters = () => {
    setQuery('');
    setCategory(null);
    setDifficulty('all');
  };

  return (
    <div>
      <div className="mb-10">
        <h1 className="mb-2 text-2xl font-semibold">Lab Writeups</h1>
        <p className="max-w-[60ch] text-ink-soft">
          Notes and reports (or maybe drafts) from labs and exercises — methodology, findings, and what I learned
          working through each one.
        </p>
      </div>

      {/* Pinned writeups: hidden while searching/filtering so results stay focused */}
      {pinned.length > 0 && !isFiltering && (
        <section className="mb-12">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-accent">Featured</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {pinned.map((w) => (
              <PinnedCard key={w.slug} w={w} />
            ))}
          </div>
        </section>
      )}

      {/* Search + filters */}
      <section className="mb-6 flex flex-col gap-4">
        <div className="relative">
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && (setQuery(''), e.currentTarget.blur())}
            placeholder="Search titles, tags, content…"
            aria-label="Search writeups"
            className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 pr-10 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft focus:border-accent"
          />
          {!query && (
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-line px-1.5 font-mono text-[11px] text-ink-soft">
              /
            </kbd>
          )}
        </div>

        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setCategory(null)} className={pill(category === null)}>
              all
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(category === cat ? null : cat)}
                className={pill(category === cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {difficulties.length > 1 && (
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              aria-label="Filter by difficulty"
              className={selectClass}
            >
              <option value="all">any difficulty</option>
              {difficulties.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          )}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            aria-label="Sort writeups"
            className={selectClass}
          >
            <option value="latest">latest first</option>
            <option value="oldest">oldest first</option>
            <option value="title">title A–Z</option>
          </select>

          <span className="ml-auto font-mono text-xs text-ink-soft">
            {isFiltering ? `${results.length} of ${all.length}` : all.length} writeup
            {all.length === 1 ? '' : 's'}
          </span>
          {isFiltering && (
            <button
              onClick={resetFilters}
              className="font-mono text-xs text-accent underline underline-offset-2 hover:text-accent-text"
            >
              clear
            </button>
          )}
        </div>
      </section>

      {/* Results */}
      {results.length === 0 ? (
        <p className="font-mono text-sm text-ink-soft">
          {all.length === 0
            ? 'No writeups yet. Drop a .md file into src/content/writeups/ to get started.'
            : 'No writeups match your search.'}
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-line">
          {results.map((w) => (
            <li key={w.slug} className="py-5 first:pt-0">
              <Link to={`/writeups/${w.slug}`} className="group block">
                <div className="mb-1.5 flex items-baseline justify-between gap-4">
                  <h2 className="font-medium transition-colors group-hover:text-accent">
                    {w.title}
                  </h2>
                  {w.date && (
                    <time className="shrink-0 font-mono text-xs text-ink-soft">{w.date}</time>
                  )}
                </div>
                {w.summary && (
                  <p className="mb-2 max-w-[60ch] text-sm text-ink-soft">{w.summary}</p>
                )}
                <Meta w={w} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

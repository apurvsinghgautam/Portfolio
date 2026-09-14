#!/usr/bin/env bun
/**
 * Static site generator for the blog. Markdown in -> dossier-themed HTML out.
 *
 *   bun run build.ts            build into ../blog
 *   bun run build.ts --serve    build, then serve it on :4000 for local review
 *
 * Replaces Jekyll. No Ruby, no framework — just marked + gray-matter.
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, cpSync, statSync } from "node:fs";
import { join, dirname, basename, extname } from "node:path";
import matter from "gray-matter";
import { Marked } from "marked";
import { site, categoryMap, categoryOrder, categoryDefault, wordsPerMinute, teaserCount } from "./site.config.ts";

const ROOT = dirname(Bun.fileURLToPath(import.meta.url));
const POSTS_DIR = join(ROOT, "posts");
const TEMPLATES = join(ROOT, "templates");
const OUT = join(ROOT, "..", "blog");

// ---------------------------------------------------------------- types

interface Post {
  slug: string;
  title: string;
  date: Date;
  categories: string[];
  tags: string[];
  chip: string;
  minutes: number;
  html: string;
  headings: { id: string; text: string }[];
  url: string;
  /** Set when the entry links out (e.g. a PDF or an off-site post) instead of generating a page. */
  external?: string;
  /** Badge shown for an external entry. Defaults to "PDF" so existing entries are unchanged. */
  externalLabel?: string;
  /** Pinned into the portfolio teaser regardless of date. */
  featured: boolean;
}

// ---------------------------------------------------------------- helpers

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Badge text for an entry: explicit label, else "PDF" for external, else reading time. */
const badge = (p: Post, unit: string) =>
  p.external ? (p.externalLabel ?? "PDF") : `${p.minutes}${unit}`;

/** Absolute form of an entry url — external entries may already be absolute. */
const absUrl = (u: string) => (/^https?:\/\//i.test(u) ? u : `${site.url}${u}`);

/** Slug matching kramdown's auto-generated heading ids, so old anchor links keep working. */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-") || "section";
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ");
}

/**
 * Undo the escaping marked already applied. Without this, text pulled out of
 * rendered HTML still carries `&amp;`, and render()'s esc() would escape it a
 * second time — the browser then displays a literal "&amp;" in meta tags.
 */
function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&"); // must be last, or it re-creates the others
}

/** Plain-text summary safe to hand to render()'s single-brace escaping path. */
function summarize(html: string, words = 32): string {
  return decodeEntities(stripHtml(html)).trim().split(/\s+/).slice(0, words).join(" ");
}

/** Post slugs become URLs and land in href attributes — keep them boring. */
function safeSlug(raw: string): string {
  const s = raw.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  if (s !== raw) console.warn(`  note: slug "${raw}" normalised to "${s}"`);
  return s || "post";
}

/**
 * JSON.stringify does not escape `<`, so a title containing "</script>" would
 * close an inline JSON-LD block early. Escape it before embedding.
 */
function jsonForScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

/** Ceiling division so a 1-word post still reads as 1 MIN, never 0. */
function readingMinutes(html: string): number {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

function chipFor(categories: string[]): string {
  for (const c of categories) if (categoryMap[c]) return categoryMap[c];
  return categoryDefault;
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** The portfolio's own casing for categories — Title Case, except OSINT. */
const CHIP_DISPLAY: Record<string, string> = {
  OSINT: "OSINT",
  MALWARE: "Malware",
  CAREER: "Career",
  FORENSICS: "Forensics",
  PRIVACY: "Privacy",
};
const chipDisplay = (chip: string) => CHIP_DISPLAY[chip] ?? chip;

/** "Sep 2020" — the portfolio's date format, distinct from the blog's "SEP 2020". */
const fmtShortMixed = (d: Date) => {
  const m = MONTHS[d.getUTCMonth()];
  return `${m[0]}${m.slice(1).toLowerCase()} ${d.getUTCFullYear()}`;
};
const fmtShort = (d: Date) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
const fmtLong = (d: Date) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;

/** Minimal mustache-style fill. {{key}} escapes, {{{key}}} does not. */
function render(tpl: string, vars: Record<string, string | number>): string {
  return tpl
    .replace(/\{\{\{(\w+)\}\}\}/g, (_, k) => String(vars[k] ?? ""))
    .replace(/\{\{(\w+)\}\}/g, (_, k) => esc(String(vars[k] ?? "")));
}

// ---------------------------------------------------------------- markdown

function makeMarked() {
  const m = new Marked({ gfm: true, breaks: false });
  const seen = new Map<string, number>();
  const headings: { id: string; text: string }[] = [];

  m.use({
    hooks: { preprocess: (src) => { seen.clear(); headings.length = 0; return src; } },
    renderer: {
      // Reproduce the design's code panel: a labelled header bar above the code.
      code({ text, lang }: any) {
        const label = (lang || "code").split(/\s+/)[0];
        return `<div class="codepanel"><div class="codepanel__bar">${esc(label)}</div><pre><code class="language-${esc(label)}">${esc(text)}\n</code></pre></div>\n`;
      },
      heading(this: any, token: any) {
        const text = this.parser.parseInline(token.tokens);
        const plain = stripHtml(text).trim();
        let id = slugify(plain);
        // De-duplicate colliding slugs the way kramdown does: -1, -2, ...
        const n = seen.get(id) ?? 0;
        seen.set(id, n + 1);
        if (n > 0) id = `${id}-${n}`;
        if (token.depth === 2) headings.push({ id, text: plain });
        return `<h${token.depth} id="${id}">${text}</h${token.depth}>\n`;
      },
    },
  });

  return { marked: m, headings };
}

// ---------------------------------------------------------------- load

function loadPosts(): Post[] {
  const files = readdirSync(POSTS_DIR).filter((f) => extname(f) === ".md");
  const posts: Post[] = [];

  for (const file of files) {
    const raw = readFileSync(join(POSTS_DIR, file), "utf8");
    const { data, content } = matter(raw);

    // Filename convention: YYYY-MM-DD-slug.md
    const m = /^(\d{4})-(\d{2})-(\d{2})-(.+)$/.exec(basename(file, ".md"));
    if (!m) {
      console.warn(`  skip (bad filename, expected YYYY-MM-DD-slug.md): ${file}`);
      continue;
    }
    const [, y, mo, d, rawSlug] = m;
    const slug = safeSlug(rawSlug);
    const date = data.date ? new Date(data.date) : new Date(`${y}-${mo}-${d}T12:00:00Z`);

    const { marked, headings } = makeMarked();
    const html = marked.parse(content) as string;

    posts.push({
      slug,
      title: String(data.title ?? slug),
      date,
      categories: Array.isArray(data.categories) ? data.categories.map(String) : [],
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      chip: chipFor(Array.isArray(data.categories) ? data.categories.map(String) : []),
      minutes: readingMinutes(html),
      html,
      headings: [...headings],
      url: data.external ? String(data.external) : `${site.baseurl}/${slug}/`,
      external: data.external ? String(data.external) : undefined,
      externalLabel: data.externalLabel ? String(data.externalLabel) : undefined,
      featured: data.featured === true,
    });
  }

  // Newest first, matching the design's index ordering.
  return posts.sort((a, b) => b.date.getTime() - a.date.getTime());
}

// ---------------------------------------------------------------- emit

function buildIndex(posts: Post[], tpl: string): string {
  const chips = [
    `<button class="chip is-active" data-filter="ALL" aria-pressed="true">ALL</button>`,
    ...categoryOrder.map(
      (c) => `<button class="chip" data-filter="${c}" aria-pressed="false">${c}</button>`,
    ),
  ].join("\n    ");

  // Group by year, preserving the newest-first order.
  const byYear = new Map<number, Post[]>();
  for (const p of posts) {
    const y = p.date.getUTCFullYear();
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push(p);
  }

  const entries = [...byYear.entries()]
    .map(([year, list]) => {
      const rows = list
        .map(
          (p) => `  <a class="entry" href="${p.external ?? p.url}"${p.external ? ' target="_blank" rel="noopener"' : ""} data-cat="${p.chip}">
    <span class="entry__date">${fmtShort(p.date)}</span>
    <span class="entry__title">${esc(p.title)}</span>
    <span class="entry__tag">${p.chip} &middot; ${badge(p, " MIN")}</span>
  </a>`,
        )
        .join("\n");
      return `  <div class="entries__year" data-year="${year}">${year}</div>\n${rows}`;
    })
    .join("\n");

  return render(tpl, {
    title: site.title,
    description: site.description,
    canonical: `${site.url}${site.baseurl}/`,
    kicker: "// FIELD NOTES",
    heading: "WRITING",
    blurb: "Research notes, dark-web tradecraft, and career field guides — indexed and filterable.",
    chips,
    entries,
    year: new Date().getUTCFullYear(),
    baseurl: site.baseurl,
    siteUrl: site.url,
    author: site.author,
    li: site.social.linkedin,
    gh: site.social.github,
    tw: site.social.twitter,
  });
}

function buildPost(p: Post, prev: Post | undefined, next: Post | undefined, tpl: string): string {
  const toc = p.headings.length
    ? p.headings.map((h) => `<a href="#${h.id}">— ${esc(h.text)}</a>`).join("\n        ")
    : "";

  const tagrow = p.tags.length
    ? `<div class="tagrow">${p.tags
        .map((t) => `<a href="${site.baseurl}/tags/#${encodeURIComponent(t)}">#${esc(t)}</a>`)
        .join("")}</div>`
    : "";

  const pagerCell = (post: Post | undefined, label: string, cls: string) =>
    post
      ? `<div class="pager__cell${cls}"><a href="${post.url}">
        <div class="pager__label">${label}</div>
        <div class="pager__title">${esc(post.title)}</div>
      </a></div>`
      : `<div class="pager__cell${cls}">
        <div class="pager__label">${label}</div>
        <div class="pager__title">&mdash;</div>
      </div>`;

  const canonical = `${site.url}${p.url}`;

  return render(tpl, {
    title: `${p.title} - ${site.title}`,
    postTitle: p.title,
    description: summarize(p.html),
    canonical,
    chip: p.chip,
    dateLong: fmtLong(p.date),
    dateIso: p.date.toISOString(),
    minutes: p.minutes,
    toc,
    tocHidden: p.headings.length ? "" : " hidden",
    content: p.html,
    tagrow,
    pagerPrev: pagerCell(prev, "&larr; PREVIOUS", ""),
    pagerNext: pagerCell(next, "NEXT &rarr;", " pager__cell--next"),
    shareX: `https://twitter.com/intent/tweet?url=${encodeURIComponent(canonical)}&text=${encodeURIComponent(p.title)}`,
    shareLi: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonical)}`,
    copyUrl: canonical,
    jsonld: jsonForScript({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: p.title,
      datePublished: p.date.toISOString(),
      author: { "@type": "Person", name: site.author },
      url: canonical,
      articleSection: p.chip,
    }),
    year: new Date().getUTCFullYear(),
    baseurl: site.baseurl,
    siteUrl: site.url,
    author: site.author,
    li: site.social.linkedin,
    gh: site.social.github,
    tw: site.social.twitter,
  });
}

function buildTags(posts: Post[], tpl: string): string {
  const tags = new Map<string, Post[]>();
  for (const p of posts) {
    for (const t of p.tags) {
      if (!tags.has(t)) tags.set(t, []);
      tags.get(t)!.push(p);
    }
  }
  const sorted = [...tags.keys()].sort();

  const chips = sorted
    .map(
      (t) =>
        `<a class="chip" href="#${encodeURIComponent(t)}">${esc(t.toUpperCase())} (${tags.get(t)!.length})</a>`,
    )
    .join("\n    ");

  const entries = sorted
    .map((t) => {
      const rows = tags
        .get(t)!
        .map(
          (p) => `  <a class="entry" href="${p.url}">
    <span class="entry__date">${fmtShort(p.date)}</span>
    <span class="entry__title">${esc(p.title)}</span>
    <span class="entry__tag">${p.chip}</span>
  </a>`,
        )
        .join("\n");
      return `  <div class="entries__year" id="${encodeURIComponent(t)}">#${esc(t.toUpperCase())}</div>\n${rows}`;
    })
    .join("\n");

  return render(tpl, {
    title: `Tags - ${site.title}`,
    description: "Every tag used across the archive.",
    canonical: `${site.url}${site.baseurl}/tags/`,
    kicker: "// CROSS-REFERENCE",
    heading: "TAGS",
    blurb: "Every tag used across the archive, with the entries filed under it.",
    chips,
    entries,
    year: new Date().getUTCFullYear(),
    baseurl: site.baseurl,
    siteUrl: site.url,
    author: site.author,
    li: site.social.linkedin,
    gh: site.social.github,
    tw: site.social.twitter,
  });
}

/**
 * Rewrites the portfolio's teaser grid + VIEW ALL count in place, between marker
 * comments. Keeps `index.html` the single home page while making its post list a
 * build artifact — so writing one .md updates the portfolio and the blog together.
 *
 * No-ops (with a warning) if the markers are missing, which is what happens if
 * index.html is ever re-exported from the design tool. Re-add the markers then.
 */
function syncPortfolioTeaser(posts: Post[], count = teaserCount): void {
  const indexPath = join(ROOT, "..", "index.html");
  if (!existsSync(indexPath)) return void console.warn("  note: ../index.html not found, teaser skipped");

  let html = readFileSync(indexPath, "utf8");
  const START = "<!--BLOG:TEASER:START-->";
  const END = "<!--BLOG:TEASER:END-->";
  const s = html.indexOf(START);
  const e = html.indexOf(END);
  if (s === -1 || e === -1) {
    console.warn("  note: teaser markers missing in index.html — portfolio not synced");
    return;
  }

  const ordered = [...posts.filter((p) => p.featured), ...posts.filter((p) => !p.featured)];
  const rows = ordered
    .slice(0, count)
    .map(
      (p) =>
        `<a class="teaser-row" href="${absUrl(p.url)}" target="_blank"><span class="teaser-row__title">${esc(p.title)}</span><span class="teaser-row__tag">${p.chip}</span></a>`,
    )
    .join("\n      ");

  html = html.slice(0, s + START.length) + "\n      " + rows + "\n      " + html.slice(e);

  // The "VIEW ALL" modal's full post list — pre-rendered static rows (plain
  // HTML/JS homepage, no build-time templating there), so without this every
  // new post would need a manual edit to index.html.
  const PS = "<!--BLOG:POSTS:START-->";
  const PE = "<!--BLOG:POSTS:END-->";
  const ps = html.indexOf(PS);
  const pe = html.indexOf(PE);
  if (ps === -1 || pe === -1) {
    console.warn("  note: BLOG:POSTS markers missing — modal list not synced");
  } else {
    const entries = posts
      .map(
        (p) =>
          `        <a class="modal-row modal-row--blog" data-cat="${chipDisplay(p.chip)}" href="${absUrl(p.url)}" target="_blank"><span class="modal-row__date">${fmtShortMixed(p.date)}</span><span><span class="modal-row__title">${esc(p.title)}</span><span class="modal-row__outlet">${badge(p, " min read")}</span></span><span class="modal-row__cat">${chipDisplay(p.chip)}</span></a>`,
      )
      .join("\n");
    html = html.slice(0, ps + PS.length) + "\n" + entries + "\n        " + html.slice(pe);
  }

  writeFileSync(indexPath, html);
  console.log(`  synced portfolio: teaser ${Math.min(count, posts.length)}, modal list ${posts.length}`);
}

function buildSitemap(posts: Post[]): string {
  const urls = [
    `${site.url}${site.baseurl}/`,
    `${site.url}${site.baseurl}/tags/`,
    ...posts.filter((p) => !p.external).map((p) => `${site.url}${p.url}`),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}
</urlset>
`;
}

// ---------------------------------------------------------------- main

function build() {
  const t0 = performance.now();
  const posts = loadPosts();
  if (!posts.length) throw new Error("no posts found in " + POSTS_DIR);

  const indexTpl = readFileSync(join(TEMPLATES, "index.html"), "utf8");
  const postTpl = readFileSync(join(TEMPLATES, "post.html"), "utf8");

  // Wipe only generated HTML, then re-emit. Keeps the dir replaceable without
  // clobbering anything hand-placed that we deliberately copy back below.
  if (existsSync(OUT)) rmSync(OUT, { recursive: true });
  mkdirSync(OUT, { recursive: true });

  writeFileSync(join(OUT, "index.html"), buildIndex(posts, indexTpl));

  mkdirSync(join(OUT, "tags"), { recursive: true });
  writeFileSync(join(OUT, "tags", "index.html"), buildTags(posts, indexTpl));

  // External entries (e.g. a PDF) appear in every list but generate no page.
  const pages = posts.filter((p) => !p.external);
  pages.forEach((p, i) => {
    // "previous" = older, "next" = newer, matching the old Jekyll pager.
    const prev = pages[i + 1];
    const next = pages[i - 1];
    mkdirSync(join(OUT, p.slug), { recursive: true });
    writeFileSync(join(OUT, p.slug, "index.html"), buildPost(p, prev, next, postTpl));
  });

  // Static passthrough: stylesheet, logo, PDF, robots.
  cpSync(join(ROOT, "static"), OUT, { recursive: true });
  writeFileSync(join(OUT, "sitemap.xml"), buildSitemap(posts));
  writeFileSync(
    join(OUT, "robots.txt"),
    `User-agent: *\nAllow: /\nSitemap: ${site.url}${site.baseurl}/sitemap.xml\n`,
  );

  syncPortfolioTeaser(posts);

  const ms = (performance.now() - t0).toFixed(0);
  console.log(`  built ${posts.length} posts + index + tags in ${ms}ms -> ${OUT}`);
  for (const p of posts) console.log(`    ${p.chip.padEnd(9)} ${p.minutes} MIN  ${p.slug}`);
}

build();

if (process.argv.includes("--serve")) {
  const port = 4000;
  Bun.serve({
    port,
    fetch(req) {
      const url = new URL(req.url);
      let path = decodeURIComponent(url.pathname);
      if (path.startsWith(site.baseurl)) path = path.slice(site.baseurl.length);
      let file = join(OUT, path);
      if (path.endsWith("/") || !extname(path)) file = join(file, "index.html");
      if (!existsSync(file) || !statSync(file).isFile()) return new Response("404", { status: 404 });
      return new Response(Bun.file(file));
    },
  });
  console.log(`  serving ${OUT} at http://localhost:${port}${site.baseurl}/`);
}

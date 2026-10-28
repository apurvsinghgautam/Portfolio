// Refresh the GitHub star counts shown on index.html.
// Repo counts round to the nearest 0.1k (2,588 -> 2.6k, as done by hand before);
// the headline total rounds down because it carries a "+". The file is only
// rewritten when a displayed value changes.
import { readFileSync, writeFileSync } from "node:fs";

const USER = "apurvsinghgautam";
const FILE = "index.html";
const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function repos(): Promise<{ name: string; stars: number; fork: boolean }[]> {
  const out: { name: string; stars: number; fork: boolean }[] = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`https://api.github.com/users/${USER}/repos?per_page=100&type=owner&page=${page}`, { headers });
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const batch = (await res.json()) as { name: string; stargazers_count: number; fork: boolean }[];
    out.push(...batch.map((r) => ({ name: r.name, stars: r.stargazers_count, fork: r.fork })));
    if (batch.length < 100) return out;
  }
}

// 7731 -> "7.7k", 2588 -> "2.6k", 89 -> "89"
const short = (n: number) => (n >= 1000 ? `${Math.round(n / 100) / 10}k` : String(n));
// 10650 -> "10.6K"
const floorK = (n: number) => (n >= 1000 ? `${Math.floor(n / 100) / 10}K` : String(n));

const all = await repos();
const stars = new Map(all.map((r) => [r.name.toLowerCase(), r.stars]));
const total = all.filter((r) => !r.fork).reduce((sum, r) => sum + r.stars, 0);

let html = readFileSync(FILE, "utf8");
const before = html;

// Headline total: <div class="stat__num">9.9K+</div> ... GITHUB ★ STARS
html = html.replace(
  /(<div class="stat__num">)[^<]*(<\/div><div class="stat__label">GITHUB ★ STARS)/,
  `$1${floorK(total)}+$2`,
);

// Flagship card (Robin): <div class="project-flagship__stat">★ 7.1k</div>
const robin = stars.get("robin");
if (robin !== undefined) html = html.replace(/(<div class="project-flagship__stat">★ )[^<]*(<\/div>)/, `$1${short(robin)}$2`);

// Project cards: href=".../<repo>" ... <span class="proj-card__stars">★ N</span>
html = html.replace(
  /(href="https:\/\/github\.com\/apurvsinghgautam\/([^"]+)"[^>]*>(?:(?!<\/a>)[\s\S])*?<span class="proj-card__stars">★ )[^<]*(<\/span>)/g,
  (m, head: string, repo: string, tail: string) => {
    const n = stars.get(repo.toLowerCase());
    return n === undefined ? m : `${head}${short(n)}${tail}`;
  },
);

if (html === before) {
  console.log(`No displayed change (total ${total}, robin ${robin}).`);
} else {
  writeFileSync(FILE, html);
  console.log(`Updated star counts (total ${total}, robin ${robin}).`);
}

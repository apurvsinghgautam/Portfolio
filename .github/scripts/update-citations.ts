// Refresh the Google Scholar citation count shown on index.html.
// Run from a home machine (LifeOS workflow `portfolio-citations`), not from
// GitHub Actions: Scholar returns 403 to cloud runners. A failed fetch or parse
// leaves the page untouched and prints a "Citations not updated" warning.
import { readFileSync, writeFileSync } from "node:fs";

const PROFILE = "https://scholar.google.com/citations?user=KnvejewAAAAJ&hl=en";
const FILE = "index.html";

function skip(reason: string): never {
  console.log(`::warning::Citations not updated: ${reason}`);
  process.exit(0);
}

const res = await fetch(PROFILE, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
  },
}).catch((e) => skip(`fetch failed (${e})`));
if (!res.ok) skip(`Scholar returned HTTP ${res.status}`);
const page = await res.text();

// The stats table lists All / Since-year pairs for citations, h-index and
// i10-index; the first cell is all-time citations.
const cells = [...page.matchAll(/class="gsc_rsb_std">(\d+)</g)].map((m) => Number(m[1]));
if (!page.includes('id="gsc_rsb_st"') || cells.length < 2) skip("stats table not found (likely a CAPTCHA page)");
const total = cells[0];
if (!Number.isFinite(total) || total <= 0) skip(`implausible total ${total}`);

let html = readFileSync(FILE, "utf8");
const before = html;
html = html.replace(/(<div class="stat__num">)[^<]*(<\/div><div class="stat__label">CITATIONS)/, `$1${total}$2`);

if (html === before) {
  console.log(`No displayed change (citations ${total}).`);
} else {
  writeFileSync(FILE, html);
  console.log(`Updated citations to ${total}.`);
}

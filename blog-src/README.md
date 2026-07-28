# blog-src

The blog's source. Markdown in, static HTML out. No Jekyll, no Ruby.

## Add a post

1. Create `posts/YYYY-MM-DD-your-slug.md`. The filename sets both the URL
   (`/blog/your-slug/`) and the date.
2. Write frontmatter + Markdown:

   ```markdown
   ---
   title: How To Do The Thing
   date: 2026-07-28 12:00:00 +0500
   categories: [DarkWeb, InfoSec]
   tags: [darkweb, guide]
   ---

   Your opening paragraph becomes the serif lede.

   ## A section heading
   Every `##` becomes an entry in the CONTENTS rail automatically.
   ```
3. `git push`. The `Build blog` Action regenerates `blog/` and commits it.
   Live on <https://apurvsinghgautam.me/blog/> within a minute or two.

That's the whole workflow — you never touch HTML.

## Categories

`categories` maps onto the four filter chips via `site.config.ts`:

| frontmatter | chip |
|---|---|
| `DarkWeb` | OSINT |
| `Ransomware` | MALWARE |
| `Blockchain` | FORENSICS |
| `Guide`, `Experience`, `Professional Growth` | CAREER |

Anything unmapped falls back to `CAREER`. To add a chip, edit `categoryMap`
and `categoryOrder` in `site.config.ts` — nothing else needs changing.

## Local preview

```bash
cd blog-src
bun install
bun run build.ts --serve     # http://localhost:4000/blog/
```

Plain `bun run build.ts` builds without serving.

## Layout

```
blog-src/
  posts/*.md          your writing — the only thing you normally edit
  templates/          index.html (also used for /tags/), post.html
  static/             copied verbatim into blog/ (CSS, logo, PDF)
  site.config.ts      title, URLs, socials, category map
  build.ts            the generator (~300 lines)
```

Output goes to `../blog/`, which is committed and served by GitHub Pages.
`build.ts` wipes and re-emits that directory, so **never hand-edit `blog/`** —
put anything that must survive into `static/`.

## Gotchas

- Don't start a line with `[1]:` for citations. Markdown reads that as a link
  reference definition. Use `1.` for an ordered list instead.
- Reading time strips HTML before counting, so code blocks don't inflate it.
- Heading IDs match the old kramdown slugs, so existing deep links still work.

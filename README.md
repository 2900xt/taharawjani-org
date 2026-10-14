# taharawjani.org

A dependency-free static HTML, CSS, and JavaScript site with a Markdown blog.

## Development

Run `npm run dev` to serve the repository at `http://localhost:3000`, or open
`index.html` directly. The local server uses only Node.js built-ins.

Run `npm run check` to validate the static assets and essential semantic markup.
`npm run build` copies the production files into `dist/` for deployment.

## Writing

Posts are Markdown files in `writing/`, with optional frontmatter:

```md
---
title: post title
subtitle: shown under the title
date: 2026-10-14
description: shown in link previews
draft: true
---
```

They are rendered into the homepage's window template at `/writing/<slug>`,
with an index at `/writing`. `npm run dev` renders them on each request;
`npm run build` writes them to `dist/`. Drafts are skipped.

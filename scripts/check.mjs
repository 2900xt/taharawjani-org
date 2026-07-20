import { access, readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const html = await readFile(new URL("index.html", root), "utf8");
const requiredFiles = [
  "styles.css",
  "script.js",
  "favicon.ico",
  "resume.pdf",
  "isef_poster.pdf",
  "robots.txt",
  "sitemap.xml",
  "llms.txt",
];
const requiredMarkup = [
  "<main",
  "<header",
  "<section",
  "<footer",
  'type="application/ld+json"',
  'rel="canonical"',
  "/_vercel/insights/script.js",
];

await Promise.all(requiredFiles.map((file) => access(new URL(file, root))));

for (const fragment of requiredMarkup) {
  if (!html.includes(fragment)) throw new Error(`Missing required markup: ${fragment}`);
}

const localLinks = [...html.matchAll(/(?:href|src)="(?!https?:|mailto:|\/\/|\/_)([^"#?]+)"/g)].map(
  (match) => match[1].replace(/^\//, ""),
);
await Promise.all(localLinks.map((file) => access(new URL(file, root))));

if ((html.match(/class="topbar-cava"/g) ?? []).length !== 1) {
  throw new Error("Expected exactly one visualizer.");
}

console.log(`Static checks passed (${requiredFiles.length} assets, ${localLinks.length} local links).`);

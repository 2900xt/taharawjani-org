import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { loadPosts, renderIndex, renderPost } from "./writing.mjs";

const outputDirectory = new URL("../dist/", import.meta.url);
const rootDirectory = new URL("../", import.meta.url);
const staticFiles = [
  "index.html",
  "styles.css",
  "script.js",
  "favicon.ico",
  "resume.pdf",
  "isef_poster.pdf",
  "robots.txt",
  "sitemap.xml",
  "llms.txt",
  "tr.png",
];

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

await Promise.all(
  staticFiles.map((file) => cp(new URL(file, rootDirectory), new URL(file, outputDirectory))),
);

const posts = await loadPosts();
await mkdir(new URL("writing/", outputDirectory), { recursive: true });
await writeFile(new URL("writing.html", outputDirectory), await renderIndex(posts));
await Promise.all(
  posts.map(async (post) => writeFile(new URL(`writing/${post.slug}.html`, outputDirectory), await renderPost(post))),
);

console.log(`Built ${staticFiles.length} static files and ${posts.length} posts in dist/.`);

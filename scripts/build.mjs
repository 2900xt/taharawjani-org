import { cp, mkdir, rm } from "node:fs/promises";

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
];

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

await Promise.all(
  staticFiles.map((file) => cp(new URL(file, rootDirectory), new URL(file, outputDirectory))),
);

console.log(`Built ${staticFiles.length} static files in dist/.`);

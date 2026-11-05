import { readdir, readFile } from "node:fs/promises";
import { parseFrontmatter, renderMarkdown } from "./markdown.mjs";

// Posts live in writing/<slug>.md. index.html is the template, so the head stays in sync.

const root = new URL("../", import.meta.url);
const postsDirectory = new URL("writing/", root);
const siteUrl = "https://taharawjani.org";

const escapeHtml = (text) =>
  String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function formatDate(date) {
  if (!date) return "";
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return escapeHtml(date);
  return parsed.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).toLowerCase();
}

export async function loadPosts() {
  let files;
  try {
    files = await readdir(postsDirectory);
  } catch {
    return [];
  }

  const posts = await Promise.all(
    files
      .filter((file) => file.endsWith(".md") && !file.startsWith("_"))
      .map(async (file) => {
        const slug = file.slice(0, -3);
        const { data, body } = parseFrontmatter(await readFile(new URL(file, postsDirectory), "utf8"));
        return { slug, title: data.title ?? slug, date: data.date ?? "", subtitle: data.subtitle ?? "", description: data.description ?? "", draft: data.draft === "true", body };
      }),
  );

  return posts.filter((post) => !post.draft).sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

async function renderPage({ title, description, path, content }) {
  const template = await readFile(new URL("index.html", root), "utf8");
  const url = `${siteUrl}${path}`;

  // Replacement callbacks (rather than strings) keep "$" in post content literal.
  const set = (value) => (_, prefix) => `${prefix}${value}"`;

  return template
    .replace(/<title>.*?<\/title>/, () => `<title>${escapeHtml(title)}</title>`)
    .replace(/(<meta (?:name="description"|property="og:description") content=")[^"]*"/g, set(escapeHtml(description)))
    .replace(/(<meta property="og:title" content=")[^"]*"/, set(escapeHtml(title)))
    .replace(/(<meta property="og:type" content=")[^"]*"/, set("article"))
    .replace(/(<meta property="og:url" content=")[^"]*"/, set(url))
    .replace(/(<link rel="canonical" href=")[^"]*"/, set(url))
    .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/, "")
    .replace(
      /<main>[\s\S]*<\/main>/,
      () => `<main>
${content}
    </main>`,
    );
}

export async function renderPost(post) {
  return renderPage({
    title: `${post.title} ~ ahat.`,
    description: post.description || post.subtitle || post.title,
    path: `/writing/${post.slug}`,
    content: `          <p><a href="/">home</a> / <a href="/writing">writing</a></p>
          <article>
            <header>
              <h1>${escapeHtml(post.title)}</h1>
              ${post.subtitle ? `<p>${escapeHtml(post.subtitle)}</p>` : ""}
              ${post.date ? `<p><time datetime="${escapeHtml(post.date)}">${formatDate(post.date)}</time></p>` : ""}
            </header>
${renderMarkdown(post.body)}
          </article>`,
  });
}

export async function renderIndex(posts) {
  const items = posts
    .map(
      (post) => `            <li>
              <a href="/writing/${post.slug}">${escapeHtml(post.title)}</a>${post.date ? ` - <time datetime="${escapeHtml(post.date)}">${formatDate(post.date)}</time>` : ""}
            </li>`,
    )
    .join("\n");

  return renderPage({
    title: "writing ~ ahat.",
    description: "writing ~ ahat.",
    path: "/writing",
    content: `          <p><a href="/">home</a></p>
          <h1>writing</h1>
          ${posts.length ? `<ul>\n${items}\n          </ul>` : "<p>nothing here yet.</p>"}`,
  });
}

// A small, dependency-free Markdown renderer covering the subset used for posts:
// headings, paragraphs, lists, blockquotes, fenced code, rules, raw HTML blocks,
// and inline code, links, images, bold, italics, strikethrough and backslash escapes.

const escapeHtml = (text) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const escapeAttribute = (text) => escapeHtml(text.replace(/&amp;/g, "&"));

export function parseFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, body: source };

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([\w-]+):\s*(.*)$/);
    if (field) data[field[1]] = field[2].replace(/^(["'])(.*)\1$/, "$2");
  }
  return { data, body: source.slice(match[0].length) };
}

const emphasize = (html) =>
  html
    .replace(/(\*\*|(?<!\w)__)(?=\S)(.+?)(?<=\S)\1/g, "<strong>$2</strong>")
    .replace(/\*(?=\S)(.+?)(?<=\S)\*/g, "<em>$1</em>")
    .replace(/(?<!\w)_(?=\S)(.+?)(?<=\S)_(?!\w)/g, "<em>$1</em>")
    .replace(/~~(?=\S)(.+?)(?<=\S)~~/g, "<del>$1</del>");

function renderInline(text) {
  // Code spans, images and links are set aside first so emphasis never rewrites
  // their contents or URLs.
  const stash = [];
  const hold = (html) => `\u0000${stash.push(html) - 1}\u0000`;

  const html = escapeHtml(text)
    .replace(/`([^`]+)`/g, (_, code) => hold(`<code>${code}</code>`))
    .replace(/\\([\\`*_{}[\]()#+\-.!~|])/g, (_, character) => hold(character))
    .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;(.*?)&quot;)?\)/g, (_, alt, src, title) =>
      hold(`<img src="${escapeAttribute(src)}" alt="${alt}"${title ? ` title="${title}"` : ""} loading="lazy">`),
    )
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) =>
      hold(`<a href="${escapeAttribute(href)}">${emphasize(label)}</a>`),
    )
    .replace(/&lt;(https?:\/\/[^\s&]+)&gt;/g, (_, href) => hold(`<a href="${href}">${href}</a>`));

  // Placeholders can nest (a code span inside a link label), so unwrap until none remain.
  let output = emphasize(html).replace(/ {2,}\n|\\\n/g, "<br>\n");
  while (output.includes("\u0000")) output = output.replace(/\u0000(\d+)\u0000/g, (_, index) => stash[index]);
  return output;
}

const listItem = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const blockStart = /^(#{1,6}\s|```|>|\s*([-*+]|\d+[.)])\s+|(\*\s*){3,}$|(-\s*){3,}$|(_\s*){3,}$|<\w)/;

export function renderMarkdown(source) {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const output = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
    } else if (line.startsWith("```")) {
      const language = line.slice(3).trim();
      const code = [];
      for (i += 1; i < lines.length && !lines[i].startsWith("```"); i += 1) code.push(lines[i]);
      i += 1;
      const languageClass = language ? ` class="language-${escapeAttribute(language)}"` : "";
      output.push(`<pre><code${languageClass}>${escapeHtml(code.join("\n"))}</code></pre>`);
    } else if (/^#{1,6}\s/.test(line)) {
      const [, hashes, text] = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
      output.push(`<h${hashes.length}>${renderInline(text)}</h${hashes.length}>`);
      i += 1;
    } else if (/^((\*\s*){3,}|(-\s*){3,}|(_\s*){3,})$/.test(line.trim())) {
      output.push("<hr>");
      i += 1;
    } else if (line.startsWith(">")) {
      const quote = [];
      for (; i < lines.length && lines[i].startsWith(">"); i += 1) quote.push(lines[i].replace(/^>\s?/, ""));
      output.push(`<blockquote>\n${renderMarkdown(quote.join("\n"))}\n</blockquote>`);
    } else if (listItem.test(line)) {
      const ordered = /\d/.test(line.match(listItem)[2]);
      const items = [];
      for (; i < lines.length && (listItem.test(lines[i]) || /^\s+\S/.test(lines[i])); i += 1) {
        const item = lines[i].match(listItem);
        if (item && item[1].length === 0) items.push(item[3]);
        else items[items.length - 1] += `\n${lines[i].trim()}`;
      }
      const tag = ordered ? "ol" : "ul";
      output.push(`<${tag}>\n${items.map((item) => `<li>${renderInline(item)}</li>`).join("\n")}\n</${tag}>`);
    } else if (/^<\w/.test(line)) {
      const html = [];
      for (; i < lines.length && lines[i].trim(); i += 1) html.push(lines[i]);
      output.push(html.join("\n"));
    } else {
      const paragraph = [lines[i]];
      for (i += 1; i < lines.length && lines[i].trim() && !blockStart.test(lines[i]); i += 1) paragraph.push(lines[i]);
      output.push(`<p>${renderInline(paragraph.join("\n"))}</p>`);
    }
  }

  return output.join("\n");
}

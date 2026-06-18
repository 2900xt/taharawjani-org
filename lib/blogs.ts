// Single source of truth for blog metadata.
// Pure data only (no `fs`) so this is safe to import from client components.
// Content lives in /public/blogs/*.md and is read server-side in the feed route.

export const SITE_URL = 'https://taharawjani.org'
export const SITE_TITLE = "Taha Rawjani"
export const SITE_DESCRIPTION = "Taha Rawjani's blog — essays on competition, building, and figuring things out."

export interface BlogMeta {
  title: string
  filename: string // public path, e.g. /blogs/meritocracy.md
  publishedDate: string
}

export const BLOG_LIST: BlogMeta[] = [
  {
    title: 'college apps reflection',
    filename: '/blogs/college-apps-reflection.md',
    publishedDate: '2026-5-15'
  },
  {
    title: 'hop off the treadmill',
    filename: '/blogs/hedonic-treadmill.md',
    publishedDate: '2026-6-17'
  },
  {
    title: 'what you had',
    filename: '/blogs/what-you-had.md',
    publishedDate: '2026-4-11'
  },
  {
    title: 'Searching For a World That Doesn\'t Exist',
    filename: '/blogs/searching-for-a-world.md',
    publishedDate: '2026-3-30'
  },
  {
    title: 'Life Aint Chess',
    filename: '/blogs/life-is-not-chess.md',
    publishedDate: '2026-2-26'
  },
  {
    title: 'Technoblade Never Dies',
    filename: '/blogs/technoblade.md',
    publishedDate: '2026-1-31'
  },
  {
    title: 'The Meritocracy',
    filename: '/blogs/meritocracy.md',
    publishedDate: '2026-1-14'
  },
  {
    title: 'Hypercompetition',
    filename: '/blogs/hypercompetition.md',
    publishedDate: '2025-12-04'
  },
  {
    title: 'Round Two: RD',
    filename: '/blogs/round-two-rd.md',
    publishedDate: '2025-11-24'
  },
  {
    title: "Nobody's reading, so why bother?",
    filename: '/blogs/noones-reading.md',
    publishedDate: '2025-11-12'
  },
  {
    title: 'Early Action: Tale of a burning ship',
    filename: '/blogs/early-action.md',
    publishedDate: '2025-11-02'
  },
  {
    title: 'The Mom Test',
    filename: '/blogs/the-mom-test.md',
    publishedDate: '2025-10-25'
  },
  {
    title: 'Meeting Literal Geniuses: ISEF 2025',
    filename: '/blogs/isef2025.md',
    publishedDate: '2025-05-22'
  },
  {
    title: 'Getting Last in TSA: VA Technosphere 2025',
    filename: '/blogs/tsa-last.md',
    publishedDate: '2025-05-05'
  },
]

// Pinned blog filenames — add or remove your favorites here
export const PINNED_FILENAMES = new Set([
  '/blogs/hedonic-treadmill.md',
  '/blogs/noones-reading.md',
  '/blogs/meritocracy.md',
])

/** "meritocracy" from "/blogs/meritocracy.md" */
export function slugFromFilename(filename: string): string {
  return filename.replace('/blogs/', '').replace('.md', '')
}

/** Look up a post by its URL slug, e.g. "meritocracy". */
export function getPostBySlug(slug: string): BlogMeta | undefined {
  return BLOG_LIST.find((b) => slugFromFilename(b.filename) === slug)
}

/** Canonical, shareable URL for a post — a real server-rendered page. */
export function postUrl(blog: BlogMeta): string {
  return `${SITE_URL}/blog/${slugFromFilename(blog.filename)}`
}

/** Plain-text excerpt from markdown, for meta descriptions and feed summaries. */
export function excerptFromMarkdown(content: string, maxLen = 160): string {
  const text = content
    .replace(/```[\s\S]*?```/g, '') // code blocks
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links → text
    .replace(/[#>*_`~]/g, '') // markdown syntax
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen).replace(/\s+\S*$/, '').trim() + '…'
}

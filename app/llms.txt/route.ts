import {
  BLOG_LIST,
  SITE_URL,
  SITE_TITLE,
  postUrl,
} from '@/lib/blogs'

export const dynamic = 'force-static'
export const revalidate = 3600

// https://llmstxt.org/ — a map of the site for LLMs/agents.
export function GET() {
  const posts = BLOG_LIST.map(
    (b) => `- [${b.title}](${postUrl(b)}) — ${b.publishedDate}`
  ).join('\n')

  const body = `# ${SITE_TITLE}

> Personal site of Taha Rawjani — software engineer, competitive programmer, and writer. Contains a blog, projects, and games.

## Pages
- [Home](${SITE_URL}/): experience, stats, and links
- [Blog](${SITE_URL}/blog): essays (full content available via the RSS feed at ${SITE_URL}/feed.xml)
- [Projects](${SITE_URL}/projects): software projects with descriptions and tech stacks
- [Games](${SITE_URL}/games): interactive games

## Blog posts
${posts}

## Feeds
- RSS (full post content): ${SITE_URL}/feed.xml
- Sitemap: ${SITE_URL}/sitemap.xml
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}

import { readFile } from 'fs/promises'
import path from 'path'
import {
  BLOG_LIST,
  SITE_URL,
  SITE_TITLE,
  SITE_DESCRIPTION,
  postUrl,
  type BlogMeta,
} from '@/lib/blogs'

export const dynamic = 'force-static'
// Rebuild the feed at most once an hour.
export const revalidate = 3600

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

async function readPost(blog: BlogMeta): Promise<string> {
  try {
    const filePath = path.join(process.cwd(), 'public', blog.filename)
    return await readFile(filePath, 'utf-8')
  } catch {
    return ''
  }
}

export async function GET() {
  const items = await Promise.all(
    BLOG_LIST.map(async (blog) => {
      const content = await readPost(blog)
      const url = postUrl(blog)
      const pubDate = new Date(blog.publishedDate).toUTCString()
      return `    <item>
      <title>${escapeXml(blog.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(content.slice(0, 280).trim())}…</description>
      <content:encoded><![CDATA[${content}]]></content:encoded>
    </item>`
    })
  )

  const lastBuild = new Date().toUTCString()
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}/blog</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items.join('\n')}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}

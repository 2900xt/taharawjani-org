import type { MetadataRoute } from 'next'
import { BLOG_LIST, SITE_URL, postUrl } from '@/lib/blogs'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    '',
    '/blog',
    '/projects',
    '/games',
  ].map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: 'weekly',
    priority: p === '' ? 1 : 0.7,
  }))

  const blogPages: MetadataRoute.Sitemap = BLOG_LIST.map((blog) => ({
    url: postUrl(blog),
    lastModified: new Date(blog.publishedDate),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticPages, ...blogPages]
}

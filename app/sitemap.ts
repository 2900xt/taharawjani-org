import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [{
    url: 'https://taharawjani.org',
    changeFrequency: 'monthly',
    priority: 1,
  }]
}

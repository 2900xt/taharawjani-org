import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  BLOG_LIST,
  SITE_URL,
  SITE_TITLE,
  getPostBySlug,
  slugFromFilename,
  excerptFromMarkdown,
} from '@/lib/blogs'
import { getPostContent } from '@/lib/posts.server'
import BlogArticle from '@/components/BlogArticle'

// Prerender every post at build time (SSG) for fast loads and clean indexing.
export function generateStaticParams() {
  return BLOG_LIST.map((b) => ({ slug: slugFromFilename(b.filename) }))
}

// Reject unknown slugs instead of rendering an empty shell.
export const dynamicParams = false

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}

  const content = (await getPostContent(slug)) ?? ''
  const description = excerptFromMarkdown(content)
  const url = `${SITE_URL}/blog/${slug}`

  return {
    title: `${post.title} — ${SITE_TITLE}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url,
      siteName: SITE_TITLE,
      publishedTime: new Date(post.publishedDate).toISOString(),
    },
    twitter: {
      card: 'summary',
      title: post.title,
      description,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const content = await getPostContent(slug)
  if (content === null) notFound()

  // JSON-LD so search engines and agents get structured article data.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: new Date(post.publishedDate).toISOString(),
    author: { '@type': 'Person', name: SITE_TITLE },
    url: `${SITE_URL}/blog/${slug}`,
    description: excerptFromMarkdown(content),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogArticle title={post.title} content={content} />
    </>
  )
}

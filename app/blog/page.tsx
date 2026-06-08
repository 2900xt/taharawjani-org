'use client';

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BLOG_LIST, PINNED_FILENAMES, slugFromFilename, type BlogMeta } from '@/lib/blogs'

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function BlogRow({ blog, pinned }: { blog: BlogMeta; pinned?: boolean }) {
  return (
    <Link
      href={`/blog/${slugFromFilename(blog.filename)}`}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        padding: '4px 0',
        cursor: 'pointer',
        borderBottom: '1px solid #eee',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <span style={{ fontSize: '14px' }}>{pinned ? `* ${blog.title}` : blog.title}</span>
      <span style={{ fontSize: '11px', color: '#888', whiteSpace: 'nowrap', marginLeft: '12px' }}>
        {formatDate(blog.publishedDate)}
      </span>
    </Link>
  )
}

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  // Backward compatibility: redirect legacy /blog?blog=<slug> links to /blog/<slug>.
  useEffect(() => {
    const blogParam = new URLSearchParams(window.location.search).get('blog')
    if (blogParam) {
      const slug = blogParam.replace(/\.md$/, '')
      router.replace(`/blog/${slug}`)
    }
  }, [router])

  const filteredBlogs = BLOG_LIST.filter((blog) =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pinnedBlogs = filteredBlogs.filter(b => PINNED_FILENAMES.has(b.filename))
  const otherBlogs = filteredBlogs.filter(b => !PINNED_FILENAMES.has(b.filename))

  return (
    <div className="window">
      <div className="window-title">Blog</div>
      <div className="window-content active">
        <div className="stats-box" style={{ width: '100%', marginBottom: '15px', height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
          <div className="stats-title" style={{ flexShrink: 0 }}>Blog Posts</div>

          <div style={{ marginBottom: '15px', flexShrink: 0 }}>
            <input
              type="text"
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
            {filteredBlogs.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                No blog posts found.
              </p>
            ) : (
              <>
                {pinnedBlogs.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                      Pinned
                    </div>
                    {pinnedBlogs.map((blog) => (
                      <BlogRow key={`pinned-${blog.filename}`} blog={blog} pinned />
                    ))}
                  </div>
                )}

                <div>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                    All Posts
                  </div>
                  {otherBlogs.map((blog) => (
                    <BlogRow key={blog.filename} blog={blog} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

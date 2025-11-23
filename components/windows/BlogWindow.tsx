'use client'

import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

interface BlogPost {
  title: string
  content: string
  filename: string
  publishedDate: string
}

export default function BlogWindow() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [blogs, setBlogs] = useState<BlogPost[]>([])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const blogParam = urlParams.get('blog')
    
    if (blogParam) {
      const foundBlog = blogs.find(blog => 
        blog.filename === `/blogs/${blogParam}.md` || 
        blog.filename === `/blogs/${blogParam}`
      )
      if (foundBlog) {
        setSelectedPost(foundBlog)
      }
    }
  }, [blogs])

  useEffect(() => {
    const loadBlogs = async () => {
      const blogs: BlogPost[] = [
        {
          title: "Nobody's reading, so why bother?",
          content: '',
          filename: '/blogs/noones-reading.md',
          publishedDate: '2025-11-12'
        },
        {
          title: 'Early Action: Tale of a burning ship',
          content: '',
          filename: '/blogs/early-action.md',
          publishedDate: '2025-11-02'
        },
        {
          title: 'The Mom Test',
          content: '',
          filename: '/blogs/the-mom-test.md',
          publishedDate: '2025-10-25'
        },
        {
          title: 'Meeting Literal Geniuses: ISEF 2025',
          content: '',
          filename: '/blogs/isef2025.md',
          publishedDate: '2025-05-22'
        },
        {
          title: 'Getting Last in TSA: VA Technosphere 2025',
          content: '',
          filename: '/blogs/tsa-last.md',
          publishedDate: '2025-05-05'
        },
        {
          title: 'Create your own Bootsector OS',
          content: '',
          filename: '/blogs/bootsector-fundamentals.md',
          publishedDate: '2025-02-10'
        },
        {
          title: 'Building Cross Compilers',
          content: '',
          filename: '/blogs/cross-compiler.md',
          publishedDate: '2025-01-20'
        },
        {
          title: 'Page Frame Allocation',
          content: '',
          filename: '/blogs/page-frame-allocator.md',
          publishedDate: '2024-12-05'
        },
      ]

      try {
        const loaded = await Promise.all(
          blogs.map(async (blog) => {
            try {
              const response = await fetch(blog.filename)
              if (!response.ok) throw new Error(`HTTP ${response.status}`)
              const content = await response.text()
              return {
                title: blog.title,
                content,
                filename: blog.filename,
                publishedDate: blog.publishedDate
              } as BlogPost
            } catch (err) {
              console.error('Failed to load', blog.filename, err)
              return {
                title: blog.title,
                content: 'Failed to load content.',
                filename: blog.filename,
                publishedDate: blog.publishedDate
              } as BlogPost
            }
          })
        )

        setBlogs(loaded)
      } catch (err) {
        console.error('Unexpected error loading blogs', err)
        setBlogs(blogs)
      }
    }

    loadBlogs()
  }, [])

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleBlogSelect = (blog: BlogPost) => {
    setSelectedPost(blog)
    const blogId = blog.filename.replace('/blogs/', '').replace('.md', '')
    const newUrl = `${window.location.pathname}?blog=${blogId}`
    window.history.pushState({}, '', newUrl)
  }

  const handleBackToList = () => {
    setSelectedPost(null)
    const newUrl = window.location.pathname
    window.history.pushState({}, '', newUrl)
  }

  const handleShareBlog = async () => {
    const currentUrl = window.location.href
    try {
      await navigator.clipboard.writeText(currentUrl)
      alert('Blog URL copied to clipboard!')
    } catch (err) {
      alert(`Share this blog: ${currentUrl}`)
    }
  }


  if (selectedPost) {
    return (
      <div className="window">
        <div className="window-title">Blog - {selectedPost.title}</div>
        <div className="window-content active">
          <div className="stats-box" style={{ width: '100%', marginBottom: '15px', height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexShrink: 0 }}>
              <button 
                onClick={handleBackToList}
                style={{ 
                  padding: '5px 10px', 
                  background: '#333', 
                  color: 'white', 
                  border: 'none', 
                  cursor: 'pointer'
                }}
              >
                ← Back to Blog List
              </button>
              <button 
                onClick={handleShareBlog}
                style={{ 
                  padding: '5px 10px', 
                  background: '#007acc', 
                  color: 'white', 
                  border: 'none', 
                  cursor: 'pointer'
                }}
              >
                📋 Share
              </button>
            </div>
            <div 
              style={{ 
                flex: 1,
                overflowY: 'auto',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#fafafa'
              }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  h1: ({children}) => <h1 style={{margin: '10px 0 5px 0', fontSize: '18px'}}>{children}</h1>,
                  h2: ({children}) => <h2 style={{margin: '10px 0 5px 0', fontSize: '16px'}}>{children}</h2>,
                  h3: ({children}) => <h3 style={{margin: '10px 0 5px 0', fontSize: '14px'}}>{children}</h3>,
                  p: ({children}) => <p style={{margin: '8px 0', lineHeight: '1.6'}}>{children}</p>,
                  ul: ({children}) => <ul style={{margin: '5px 0', paddingLeft: '20px'}}>{children}</ul>,
                  ol: ({children}) => <ol style={{margin: '5px 0', paddingLeft: '20px'}}>{children}</ol>,
                  code: ({children, ...props}) => 
                    <code style={{background: '#f4f4f4', padding: '2px 4px', borderRadius: '3px', fontFamily: 'monospace', fontSize: '12px'}} {...props}>{children}</code>,
                  pre: ({children}) => <pre style={{background: '#f4f4f4', padding: '10px', borderRadius: '4px', margin: '10px 0', overflowX: 'auto'}}>{children}</pre>
                }}
              >
                {selectedPost.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    )
  }

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

          <div className="blog-list" style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
            {filteredBlogs.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                No blog posts found.
              </p>
            ) : (
              filteredBlogs.map((blog, index) => (
                <div 
                  key={index}
                  onClick={() => handleBlogSelect(blog)}
                  style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginBottom: '10px',
                    cursor: 'pointer',
                    backgroundColor: '#f9f9f9'
                  }}
                >
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{blog.title}</h3>
                  <p style={{ margin: '0', color: '#666', fontSize: '12px' }}>
                    {new Date(blog.publishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
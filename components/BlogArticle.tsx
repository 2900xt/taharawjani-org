'use client'

import React from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

interface BlogArticleProps {
  title: string
  content: string
}

export default function BlogArticle({ title, content }: BlogArticleProps) {
  const handleShare = async () => {
    const currentUrl = window.location.href
    try {
      await navigator.clipboard.writeText(currentUrl)
      alert('Blog URL copied to clipboard!')
    } catch {
      alert(`Share this blog: ${currentUrl}`)
    }
  }

  return (
    <div className="window">
      <div className="window-title">Blog - {title}</div>
      <div className="window-content active">
        <div className="stats-box" style={{ width: '100%', marginBottom: '15px', height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexShrink: 0 }}>
            <Link
              href="/blog"
              style={{
                padding: '5px 10px',
                background: '#333',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'none',
              }}
            >
              ← Back to Blog List
            </Link>
            <button
              onClick={handleShare}
              style={{
                padding: '5px 10px',
                background: '#007acc',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
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
              backgroundColor: '#fafafa',
            }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                h1: ({ children }) => <h1 style={{ margin: '10px 0 5px 0', fontSize: '18px' }}>{children}</h1>,
                h2: ({ children }) => <h2 style={{ margin: '10px 0 5px 0', fontSize: '16px' }}>{children}</h2>,
                h3: ({ children }) => <h3 style={{ margin: '10px 0 5px 0', fontSize: '14px' }}>{children}</h3>,
                p: ({ children }) => <p style={{ margin: '8px 0', lineHeight: '1.6' }}>{children}</p>,
                ul: ({ children }) => <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>{children}</ul>,
                ol: ({ children }) => <ol style={{ margin: '5px 0', paddingLeft: '20px' }}>{children}</ol>,
                blockquote: ({ children }) => <blockquote style={{ margin: '10px 0', paddingLeft: '15px', borderLeft: '4px solid #ddd', color: '#666', fontStyle: 'italic' }}>{children}</blockquote>,
                code: ({ children, ...props }) =>
                  <code style={{ background: '#f4f4f4', padding: '2px 4px', borderRadius: '3px', fontFamily: 'monospace', fontSize: '12px' }} {...props}>{children}</code>,
                pre: ({ children }) => <pre style={{ background: '#f4f4f4', padding: '10px', borderRadius: '4px', margin: '10px 0', overflowX: 'auto' }}>{children}</pre>,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}

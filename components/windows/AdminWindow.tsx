'use client'

import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { createClient } from '@/lib/supabase/client'

interface BlogPost {
  name: string
  created_at: string
  filename: string
}

export default function AdminWindow() {
  const [activeTab, setActiveTab] = useState('create')
  const [blogName, setBlogName] = useState('')
  const [blogContent, setBlogContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [isEditMode, setIsEditMode] = useState(false)
  const [originalBlogName, setOriginalBlogName] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (activeTab === 'manage') {
      loadBlogs()
    }
  }, [activeTab])

  const loadBlogs = async () => {
    try {
      const response = await fetch('/api/admin/blogs')
      const data = await response.json()
      if (response.ok) {
        setBlogs(data.blogs || [])
      } else {
        setMessage(`Error loading blogs: ${data.error}`)
      }
    } catch (error) {
      setMessage(`Error loading blogs: ${(error as Error).message}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      if (isEditMode) {
        // Update existing blog
        const response = await fetch('/api/admin/update-blog', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: blogName,
            content: blogContent,
            originalName: originalBlogName
          })
        })

        const data = await response.json()

        if (response.ok) {
          setMessage('Blog updated successfully!')
          setBlogName('')
          setBlogContent('')
          setIsEditMode(false)
          setOriginalBlogName('')
          loadBlogs()
        } else {
          setMessage(`Error: ${data.error}`)
        }
      } else {
        // Create new blog
        const response = await fetch('/api/admin/create-blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: blogName, content: blogContent })
        })

        const data = await response.json()

        if (response.ok) {
          setMessage('Blog created successfully!')
          setBlogName('')
          setBlogContent('')
        } else {
          setMessage(`Error: ${data.error}`)
        }
      }
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (blog: BlogPost) => {
    // Fetch blog content from storage
    const supabase = createClient()
    const { data, error } = await supabase.storage
      .from('blogs')
      .download(blog.filename)

    if (error || !data) {
      setMessage(`Error loading blog content: ${error?.message}`)
      return
    }

    const content = await data.text()

    setBlogName(blog.name)
    setBlogContent(content)
    setIsEditMode(true)
    setOriginalBlogName(blog.name)
    setActiveTab('create')
    setMessage('')
  }

  const handleDelete = async (blogName: string) => {
    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/delete-blog', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: blogName })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Blog deleted successfully!')
        setDeleteConfirm(null)
        loadBlogs()
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const cancelEdit = () => {
    setBlogName('')
    setBlogContent('')
    setIsEditMode(false)
    setOriginalBlogName('')
    setMessage('')
  }

  return (
    <div className="window">
      <div className="window-title">Admin Dashboard</div>

      <div className="tab-container" style={{ display: 'flex', borderBottom: '1px solid #ccc' }}>
        <div
          className={`tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
          style={{
            padding: '10px 20px',
            cursor: 'pointer',
            borderBottom: activeTab === 'create' ? '2px solid #007acc' : 'none',
            fontWeight: activeTab === 'create' ? 'bold' : 'normal'
          }}
        >
          {isEditMode ? 'Edit Post' : 'Create Post'}
        </div>
        <div
          className={`tab ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage')}
          style={{
            padding: '10px 20px',
            cursor: 'pointer',
            borderBottom: activeTab === 'manage' ? '2px solid #007acc' : 'none',
            fontWeight: activeTab === 'manage' ? 'bold' : 'normal'
          }}
        >
          Manage Posts
        </div>
        <div
          className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
          style={{
            padding: '10px 20px',
            cursor: 'pointer',
            borderBottom: activeTab === 'preview' ? '2px solid #007acc' : 'none',
            fontWeight: activeTab === 'preview' ? 'bold' : 'normal'
          }}
        >
          Preview
        </div>
      </div>

      {activeTab === 'create' && (
        <div className="window-content active">
          <form onSubmit={handleSubmit}>
            <div className="stats-box" style={{ width: '100%', marginBottom: '15px' }}>
              <div className="stats-title">Blog Information</div>

              {message && (
                <div style={{
                  marginBottom: '10px',
                  padding: '10px',
                  background: message.includes('Error') ? '#ffebee' : '#e8f5e9',
                  border: `1px solid ${message.includes('Error') ? '#f44336' : '#4caf50'}`,
                  borderRadius: '4px'
                }}>
                  {message}
                </div>
              )}

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Title:
                </label>
                <input
                  type="text"
                  value={blogName}
                  onChange={(e) => setBlogName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                  placeholder="Enter blog title..."
                  required
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Content (Markdown):
                </label>
                <textarea
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                  style={{
                    width: '100%',
                    height: '400px',
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    resize: 'vertical'
                  }}
                  placeholder="Write your blog content in Markdown..."
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 20px',
                    background: isSubmitting ? '#ccc' : '#007acc',
                    color: 'white',
                    border: 'none',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                >
                  {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Blog Post' : 'Create Blog Post')}
                </button>

                {isEditMode && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    style={{
                      padding: '10px 20px',
                      background: '#666',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      fontSize: '16px'
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="window-content active">
          <div className="stats-box" style={{ width: '100%', height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
            <div className="stats-title">Manage Blog Posts</div>

            {message && (
              <div style={{
                marginBottom: '10px',
                padding: '10px',
                background: message.includes('Error') ? '#ffebee' : '#e8f5e9',
                border: `1px solid ${message.includes('Error') ? '#f44336' : '#4caf50'}`,
                borderRadius: '4px'
              }}>
                {message}
              </div>
            )}

            <div className="blog-list" style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
              {blogs.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  No blogs found. Create your first blog post!
                </p>
              ) : (
                blogs.map((blog) => (
                  <div
                    key={blog.name}
                    style={{
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      marginBottom: '10px',
                      backgroundColor: '#f9f9f9'
                    }}
                  >
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{blog.name}</h3>
                    <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '12px' }}>
                      {new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>

                    {deleteConfirm === blog.name ? (
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#d32f2f' }}>Are you sure?</span>
                        <button
                          onClick={() => handleDelete(blog.name)}
                          disabled={isSubmitting}
                          style={{
                            padding: '5px 10px',
                            background: '#d32f2f',
                            color: 'white',
                            border: 'none',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        >
                          {isSubmitting ? 'Deleting...' : 'Yes, Delete'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          style={{
                            padding: '5px 10px',
                            background: '#666',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleEdit(blog)}
                          style={{
                            padding: '5px 10px',
                            background: '#007acc',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(blog.name)}
                          style={{
                            padding: '5px 10px',
                            background: '#d32f2f',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            fontSize: '14px'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="window-content active">
          <div className="stats-box" style={{ width: '100%', height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
            <div className="stats-title">{blogName || 'Preview'}</div>
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: '#fafafa'
            }}>
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
                  pre: ({ children }) => <pre style={{ background: '#f4f4f4', padding: '10px', borderRadius: '4px', margin: '10px 0', overflowX: 'auto' }}>{children}</pre>
                }}
              >
                {blogContent || '*No content to preview*'}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
interface BlogPost {
  name: string
  created_at: string
  filename: string
}

export default function BlogWindow() {
  const [searchTerm, setSearchTerm] = useState('')
  const [blogs, setBlogs] = useState<BlogPost[]>([])

  useEffect(() => {
    const loadBlogs = async () => {
      const supabase = createClient();
      const { data: blogList, error } = await supabase.from('blogs').select('*');
      const blogs: BlogPost[] = blogList || [];
      setBlogs(blogs);
    }

    loadBlogs()
  }, [])

  const filteredBlogs = blogs.filter(blog =>
    blog.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const router = useRouter();

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
                Loading Blogs....
              </p>
            ) : (
              filteredBlogs.map((blog, index) => (
                <div
                  key={index}
                  onClick={() => {
                    router.push(`/blog/${blog.name}`);
                  }}
                  style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginBottom: '10px',
                    cursor: 'pointer',
                    backgroundColor: '#f9f9f9'
                  }}
                >
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{blog.name}</h3>
                  <p style={{ margin: '0', color: '#666', fontSize: '12px' }}>
                    {new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
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
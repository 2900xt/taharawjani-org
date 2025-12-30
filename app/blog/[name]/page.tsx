import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import ShareButton from '@/components/ShareButton';

// Force dynamic rendering to properly handle database queries
export const dynamic = 'force-dynamic';

export default async function BlogViewer({ params }: { params: Promise<{ name: string }> }) {
  const resolvedParams = await params;
  const blog_name = decodeURIComponent(resolvedParams.name);
  
  const supabase = await createClient();

  const { data: dbData, error: dbError } = await supabase
    .from('blogs')
    .select('*')
    .eq('name', blog_name)
    .single();
  
  console.log("Fetching: ", blog_name);

  if (dbError || !dbData) {
    console.error('Error fetching blog:', dbError);
    return (
      <div className="window">
        <div className="window-title">Blog - Error</div>
        <div className="window-content active">
          <div className="stats-box" style={{ width: '100%', marginBottom: '15px' }}>
            <p>Error loading blog: {dbError?.message || 'Blog not found'}</p>
            <Link
              style={{
                padding: '5px 10px',
                background: '#333',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-block',
                marginTop: '10px'
              }}
              href="/blog"
            >
              ← Back to Blog List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { data: bucketData, error: bucketError } = await supabase.storage
    .from('blogs')
    .download(dbData.filename || '');

  if (bucketError || !bucketData) {
    console.error('Error downloading blog:', bucketError);
    return (
      <div className="window">
        <div className="window-title">Blog - Error</div>
        <div className="window-content active">
          <div className="stats-box" style={{ width: '100%', marginBottom: '15px' }}>
            <p>Error loading blog content: {bucketError?.message}</p>
            <Link
              style={{
                padding: '5px 10px',
                background: '#333',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-block',
                marginTop: '10px'
              }}
              href="/blog"
            >
              ← Back to Blog List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const content = await bucketData.text();

  return (
    <div className="window">
      <div className="window-title">Blog - {blog_name || 'Loading...'}</div>
      <div className="window-content active">
        <div className="stats-box" style={{ width: '100%', marginBottom: '15px', minHeight: '300px', maxHeight: '600px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexShrink: 0 }}>
            <Link
              style={{
                padding: '5px 10px',
                background: '#333',
                color: 'white',
                border: 'none',
                cursor: 'pointer'
              }}
              href="/blog"
            >
              ← Back to Blog List
            </Link>
            <ShareButton />
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
                img: ({ src, alt }) => <img src={src} alt={alt} style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '10px 0', borderRadius: '4px' }} />
              }}
            >
              {content || ''}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
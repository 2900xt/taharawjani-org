import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    requireAdmin()

    const { name, content } = await request.json()

    // Validate inputs
    if (!name || !content) {
      return NextResponse.json(
        { error: 'Name and content are required' },
        { status: 400 }
      )
    }

    // Generate filename (sanitize and make lowercase with hyphens)
    const filename = `${name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.md`

    const supabase = createAdminClient()

    // Insert into database
    const { data: blogData, error: dbError } = await supabase
      .from('blogs')
      .insert({
        name,
        filename,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      return NextResponse.json(
        { error: dbError.message },
        { status: 500 }
      )
    }

    // Upload to storage
    const { error: storageError } = await supabase.storage
      .from('blogs')
      .upload(filename, content, {
        contentType: 'text/markdown',
        upsert: false
      })

    if (storageError) {
      // Rollback: delete database entry
      await supabase.from('blogs').delete().eq('name', name)
      return NextResponse.json(
        { error: storageError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, blog: blogData })

  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

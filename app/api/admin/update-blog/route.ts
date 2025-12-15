import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin-auth'

export async function PUT(request: NextRequest) {
  try {
    requireAdmin()

    const { name, content, originalName } = await request.json()

    // Validate inputs
    if (!name || !content || !originalName) {
      return NextResponse.json(
        { error: 'Name, content, and originalName are required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get the current blog to find its filename
    const { data: existingBlog, error: fetchError } = await supabase
      .from('blogs')
      .select('filename')
      .eq('name', originalName)
      .single()

    if (fetchError || !existingBlog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      )
    }

    const oldFilename = existingBlog.filename
    const newFilename = `${name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.md`

    // Update database record
    const { error: dbError } = await supabase
      .from('blogs')
      .update({
        name,
        filename: newFilename
      })
      .eq('name', originalName)

    if (dbError) {
      return NextResponse.json(
        { error: dbError.message },
        { status: 500 }
      )
    }

    // If filename changed, delete old file
    if (oldFilename !== newFilename) {
      await supabase.storage.from('blogs').remove([oldFilename])
    }

    // Upload new content (upsert to overwrite if exists)
    const { error: storageError } = await supabase.storage
      .from('blogs')
      .upload(newFilename, content, {
        contentType: 'text/markdown',
        upsert: true
      })

    if (storageError) {
      return NextResponse.json(
        { error: storageError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}

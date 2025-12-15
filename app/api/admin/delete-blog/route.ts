import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin-auth'

export async function DELETE(request: NextRequest) {
  try {
    requireAdmin()

    const { name } = await request.json()

    // Validate inputs
    if (!name) {
      return NextResponse.json(
        { error: 'Blog name is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get the blog to find its filename
    const { data: blog, error: fetchError } = await supabase
      .from('blogs')
      .select('filename')
      .eq('name', name)
      .single()

    if (fetchError || !blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      )
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('blogs')
      .remove([blog.filename])

    if (storageError) {
      return NextResponse.json(
        { error: storageError.message },
        { status: 500 }
      )
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('blogs')
      .delete()
      .eq('name', name)

    if (dbError) {
      return NextResponse.json(
        { error: dbError.message },
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

import 'server-only'
import { readFile } from 'fs/promises'
import path from 'path'
import { getPostBySlug } from './blogs'

/** Read a post's markdown from /public/blogs. Returns null if missing. */
export async function getPostContent(slug: string): Promise<string | null> {
  const post = getPostBySlug(slug)
  if (!post) return null
  try {
    const filePath = path.join(process.cwd(), 'public', post.filename)
    return await readFile(filePath, 'utf-8')
  } catch {
    return null
  }
}

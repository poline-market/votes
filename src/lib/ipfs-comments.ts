// IPFS-based comments with Storacha integration
import { uploadToStoracha, fetchFromStoracha } from './storacha'

export interface Comment {
  author: string
  text: string
  timestamp: number
}

interface CommentList {
  comments: Comment[]
}

// localStorage for caching and CID tracking
function getCacheKey(proposalId: string): string {
  return `ipfs-comments-${proposalId}`
}

function getCIDKey(proposalId: string): string {
  return `ipfs-cid-${proposalId}`
}

/**
 * Load comments from cache
 */
export function loadComments(proposalId: string): Comment[] {
  if (typeof window === 'undefined') return []

  const cached = localStorage.getItem(getCacheKey(proposalId))
  if (cached) {
    try {
      const data: CommentList = JSON.parse(cached)
      return data.comments
    } catch {
      return []
    }
  }

  return []
}

/**
 * Load comments from IPFS via Storacha
 */
export async function loadCommentsFromIPFS(proposalId: string): Promise<Comment[]> {
  if (typeof window === 'undefined') return []

  const cid = localStorage.getItem(getCIDKey(proposalId))

  if (!cid) {
    return loadComments(proposalId)
  }

  try {
    const response = await fetchFromStoracha(cid)

    if (!response.ok) {
      return loadComments(proposalId)
    }

    const data: CommentList = await response.json()

    // Update cache
    localStorage.setItem(getCacheKey(proposalId), JSON.stringify(data))
    return data.comments
  } catch (error) {
    console.error('Failed to fetch from IPFS:', error)
    return loadComments(proposalId)
  }
}

/**
 * Upload comment to IPFS via Storacha
 */
export async function uploadComment(proposalId: string, comment: Comment): Promise<string> {
  if (typeof window === 'undefined') throw new Error('Not in browser')

  // Load existing comments
  const existing = loadComments(proposalId)
  existing.push(comment)

  const commentList: CommentList = {
    comments: existing,
  }

  try {
    // Create JSON file
    const jsonBlob = new Blob([JSON.stringify(commentList)], { type: 'application/json' })
    const file = new File([jsonBlob], `comments-${proposalId}.json`)

    // Upload to Storacha
    const cid = await uploadToStoracha(file)

    // Store CID and cache
    localStorage.setItem(getCIDKey(proposalId), cid)
    localStorage.setItem(getCacheKey(proposalId), JSON.stringify(commentList))

    console.log(`✅ Comments uploaded to IPFS: ${cid}`)
    return cid
  } catch (error) {
    // Fallback to localStorage
    console.warn('⚠️ IPFS upload failed, using localStorage fallback')
    localStorage.setItem(getCacheKey(proposalId), JSON.stringify(commentList))
    throw error
  }
}

/**
 * Delete comment and re-upload to IPFS
 */
export async function deleteComment(proposalId: string, timestamp: number, author: string): Promise<boolean> {
  if (typeof window === 'undefined') return false

  const comments = loadComments(proposalId)
  const filtered = comments.filter(
    c => !(c.timestamp === timestamp && c.author.toLowerCase() === author.toLowerCase())
  )

  const commentList: CommentList = {
    comments: filtered,
  }

  try {
    // Create JSON file
    const jsonBlob = new Blob([JSON.stringify(commentList)], { type: 'application/json' })
    const file = new File([jsonBlob], `comments-${proposalId}.json`)

    // Upload updated list
    const cid = await uploadToStoracha(file)

    // Update storage
    localStorage.setItem(getCIDKey(proposalId), cid)
    localStorage.setItem(getCacheKey(proposalId), JSON.stringify(commentList))

    return true
  } catch (error) {
    // Fallback
    localStorage.setItem(getCacheKey(proposalId), JSON.stringify(commentList))
    return true
  }
}

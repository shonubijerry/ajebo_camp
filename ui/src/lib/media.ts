/**
 * Helper to get the full media URL
 * Handles both production R2 URLs and local development keys
 */
export function getMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null

  // Already a full URL (production)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  // Local development - prepend API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6001'
  return `${apiUrl}/api/v1/media/${encodeURIComponent(path)}`
}

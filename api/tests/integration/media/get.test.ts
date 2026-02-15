import { SELF, env } from 'cloudflare:test'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('GET /api/v1/media/:key', () => {
  beforeEach(() => {
    env.MEDIA_BUCKET.get = vi.fn().mockResolvedValue({
      body: new Uint8Array([1, 2, 3]),
      httpEtag: 'etag',
      writeHttpMetadata: () => undefined,
    })
  })

  it('returns media content', async () => {
    const response = await SELF.fetch('http://local.test/api/v1/media/file.jpg')

    expect(response.status).toBe(200)
  })

  it('should not return media content if not found', async () => {
    env.MEDIA_BUCKET.get = vi.fn().mockResolvedValue(null)
    const response = await SELF.fetch('http://local.test/api/v1/media/file.jpg')

    expect(response.status).toBe(404)
  })
})

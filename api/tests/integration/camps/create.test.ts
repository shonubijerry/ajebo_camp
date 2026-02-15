import { SELF, env } from 'cloudflare:test'
import { describe, expect, it, vi } from 'vitest'
import { fixtures } from '../../utils/fixtures'
import { getAuthHeader } from '../../utils/auth'

describe('POST /api/v1/camps', () => {
  it('creates a camp with valid form data', async () => {
    const auth = await getAuthHeader()
    const formData = new FormData()

    formData.set('title', fixtures.campCreate.title)
    formData.set('entity_id', fixtures.campCreate.entity_id)
    formData.set('year', String(fixtures.campCreate.year))
    formData.set('fee', String(fixtures.campCreate.fee))
    formData.set('start_date', fixtures.campCreate.start_date)
    formData.set('end_date', fixtures.campCreate.end_date)

    const response = await SELF.fetch('http://local.test/api/v1/camps', {
      method: 'POST',
      headers: { Authorization: auth },
      body: formData,
    })
    const body = await response.json<{ success: boolean; data: unknown }>()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toBeDefined()
  })

  it('uploads a banner when provided', async () => {
    const originalEnvironment = env.ENVIRONMENT
    env.ENVIRONMENT = 'development'
    env.MEDIA_BUCKET.put = vi.fn().mockResolvedValue(undefined)

    const auth = await getAuthHeader()
    const formData = new FormData()
    const banner = new File([new Uint8Array([1, 2, 3])], 'banner.jpg', {
      type: 'image/jpeg',
    })

    formData.set('title', fixtures.campCreate.title)
    formData.set('entity_id', fixtures.campCreate.entity_id)
    formData.set('year', String(fixtures.campCreate.year))
    formData.set('fee', String(fixtures.campCreate.fee))
    formData.set('start_date', fixtures.campCreate.start_date)
    formData.set('end_date', fixtures.campCreate.end_date)
    formData.set('banner', banner)

    const response = await SELF.fetch('http://local.test/api/v1/camps', {
      method: 'POST',
      headers: { Authorization: auth },
      body: formData,
    })

    expect(response.status).toBe(200)
    expect(env.MEDIA_BUCKET.put).toHaveBeenCalled()

    env.ENVIRONMENT = originalEnvironment
  })

  it('builds banner URLs in production environments', async () => {
    const originalEnvironment = env.ENVIRONMENT
    const originalBaseUrl = env.R2_PUBLIC_BASE_URL
    env.ENVIRONMENT = 'production'
    env.R2_PUBLIC_BASE_URL = 'https://media.example.com'
    env.MEDIA_BUCKET.put = vi.fn().mockResolvedValue(undefined)

    const auth = await getAuthHeader()
    const formData = new FormData()
    const banner = new File([new Uint8Array([7, 8, 9])], 'banner.webp', {
      type: 'image/webp',
    })

    formData.set('title', fixtures.campCreate.title)
    formData.set('entity_id', fixtures.campCreate.entity_id)
    formData.set('year', String(fixtures.campCreate.year))
    formData.set('fee', String(fixtures.campCreate.fee))
    formData.set('start_date', fixtures.campCreate.start_date)
    formData.set('end_date', fixtures.campCreate.end_date)
    formData.set('banner', banner)

    const response = await SELF.fetch('http://local.test/api/v1/camps', {
      method: 'POST',
      headers: { Authorization: auth },
      body: formData,
    })

    expect(response.status).toBe(200)
    expect(env.MEDIA_BUCKET.put).toHaveBeenCalled()

    env.ENVIRONMENT = originalEnvironment
    env.R2_PUBLIC_BASE_URL = originalBaseUrl
  })

  it('returns 400 for invalid camp data', async () => {
    const auth = await getAuthHeader()
    const formData = new FormData()
    formData.set('title', '')

    const response = await SELF.fetch('http://local.test/api/v1/camps', {
      method: 'POST',
      headers: { Authorization: auth },
      body: formData,
    })
    const body = await response.json<{ success: boolean }>()

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
  })
})

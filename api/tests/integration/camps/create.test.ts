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
    const spy = vi
      .spyOn(env.MEDIA_BUCKET, 'put')
      .mockResolvedValue(null as unknown as R2Object)

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
    expect(spy).toHaveBeenCalled()
  })

  it('builds banner URLs in production environments', async () => {
    const originalEnv = env.WRANGLER_ENVIRONMENT
    env.WRANGLER_ENVIRONMENT = 'production'
    const spy = vi
      .spyOn(env.MEDIA_BUCKET, 'put')
      .mockResolvedValue(null as unknown as R2Object)

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
    expect(spy).toHaveBeenCalled()

    env.WRANGLER_ENVIRONMENT = originalEnv
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

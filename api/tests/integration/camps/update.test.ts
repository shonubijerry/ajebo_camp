import { SELF } from 'cloudflare:test'
import { describe, expect, it } from 'vitest'
import { fixtures } from '../../utils/fixtures'
import { getAuthHeader } from '../../utils/auth'

describe('PATCH /api/v1/camps/:id', () => {
  it('updates a camp with valid form data', async () => {
    const auth = await getAuthHeader()
    const formData = new FormData()

    formData.set('title', fixtures.campCreate.title)
    formData.set('entity_id', fixtures.campCreate.entity_id)
    formData.set('year', String(fixtures.campCreate.year))
    formData.set('fee', String(fixtures.campCreate.fee))
    formData.set('start_date', fixtures.campCreate.start_date)
    formData.set('end_date', fixtures.campCreate.end_date)

    const response = await SELF.fetch('http://local.test/api/v1/camps/camp-1', {
      method: 'PATCH',
      headers: { Authorization: auth },
      body: formData,
    })
    const body = await response.json<{ success: boolean; data: unknown }>()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toBeDefined()
  })
})

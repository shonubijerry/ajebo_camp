import { SELF } from 'cloudflare:test'
import { it } from 'vitest'

it('dispatches fetch event', async ({ expect }) => {
  const response = await SELF.fetch('http://example.com')
  expect(await response.json()).toEqual({ status: 'ok' })
})

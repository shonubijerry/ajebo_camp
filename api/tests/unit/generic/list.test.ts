import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import {
  ListEndpoint,
  listRequestQuerySchema,
} from '../../../src/routes/generic/list'
import { AppContext } from '../../../src/types'

class ResponseListEndpoint extends ListEndpoint {
  meta = {
    requestSchema: z.object({
      query: listRequestQuerySchema,
    }),
    responseSchema: z.object({}),
  }

  async getPagination() {
    return {
      page: 1,
      take: 1,
      skip: 0,
      where: {},
      orderBy: {},
    }
  }

  async action() {
    return new Response('ok', { status: 204 })
  }
}

describe.skip('ListEndpoint', () => {
  it('returns a Response when action returns a Response', async () => {
    const endpoint = new ResponseListEndpoint()
    const ctx = {
      env: {},
      user: { sub: 'user-1', email: 'user@example.com', role: 'admin' },
      json: () => new Response('json'),
    } as unknown as AppContext

    const response = await endpoint.handle(ctx)

    expect(response.status).toBe(204)
  })
})

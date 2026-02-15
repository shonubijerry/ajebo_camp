import { describe, expect, it } from 'vitest'
import {
  parseQuerySort,
  queryParamsToPrismaWhere,
  queryStringToPrismaWhere,
} from '../../../src/routes/generic/query'

describe('generic query helpers', () => {
  it('parses nested filters and operators', () => {
    const where = queryParamsToPrismaWhere({
      '[email][contains]': 'example.com',
      '[email][mode]': 'insensitive',
      '[age][gte]': '18',
      '[active]': 'true',
      '[score]': '"123"',
      '[tags][in]': '["a","b"]',
      '[profile][name][contains]': 'Ada',
      '[meta]': '{"foo":"bar"}',
    })

    expect(where).toEqual({
      email: { contains: 'example.com', mode: 'insensitive' },
      age: { gte: 18 },
      active: true,
      score: '123',
      tags: { in: ['a', 'b'] },
      profile: { name: { contains: 'Ada' } },
      meta: { foo: 'bar' },
    })
  })

  it('parses query strings into Prisma where clauses', () => {
    const where = queryStringToPrismaWhere(
      '[id]=1&[id]=2&[name]=Ada&[active]=false',
    )

    expect(where).toEqual({ id: [1, 2], name: 'Ada', active: false })
  })

  it('parses query sort strings', () => {
    const sort = parseQuerySort('[firstname]=desc&[created_at]=asc')

    expect(sort).toEqual({ firstname: 'desc', created_at: 'asc' })
    expect(parseQuerySort('')).toEqual({})
  })
})

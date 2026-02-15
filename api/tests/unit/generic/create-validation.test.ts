import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { OpenAPIEndpoint } from '../../../src/routes/generic/create'
import { AppContext } from '../../../src/types'

class ValidationTestEndpoint extends OpenAPIEndpoint {
  meta = {
    requestSchema: z.object({}),
    responseSchema: z.object({}),
  }

  async action() {
    return {}
  }
}

class HandleTestEndpoint extends OpenAPIEndpoint {
  meta = {
    requestSchema: z.object({}),
    responseSchema: z.object({}),
  }

  async preAction() {
    return {}
  }

  async action() {
    return null
  }
}

const createContext = (): AppContext =>
  ({
    env: {},
    req: new Request('http://local.test'),
    json: (body: unknown, status = 200) =>
      new Response(JSON.stringify(body), { status }),
  }) as unknown as AppContext

describe.skip('OpenAPIEndpoint.handleValidationError', () => {
  it('formats validation errors for common cases', async () => {
    const endpoint = new ValidationTestEndpoint()
    const issues: z.ZodIssue[] = [
      {
        code: 'invalid_type',
        path: ['body', 'name'],
        expected: 'string',
        received: 'number',
        message: 'Invalid type',
      } as z.ZodIssue,
      {
        code: 'too_small',
        path: ['body', 'title'],
        minimum: 3,
        type: 'string',
        inclusive: true,
        exact: false,
        message: 'Too small',
      } as z.ZodIssue,
      {
        code: 'too_small',
        path: ['body', 'age'],
        minimum: 1,
        type: 'number',
        inclusive: true,
        exact: false,
        message: 'Too small',
      } as z.ZodIssue,
      {
        code: 'too_small',
        path: ['body', 'tags'],
        minimum: 2,
        type: 'array',
        inclusive: true,
        exact: false,
        message: 'Too small',
      } as z.ZodIssue,
      {
        code: 'too_big',
        path: ['body', 'slug'],
        maximum: 5,
        type: 'string',
        inclusive: true,
        exact: false,
        message: 'Too big',
      } as z.ZodIssue,
      {
        code: 'too_big',
        path: ['body', 'count'],
        maximum: 10,
        type: 'number',
        inclusive: true,
        exact: false,
        message: 'Too big',
      } as z.ZodIssue,
      {
        code: 'too_big',
        path: ['body', 'items'],
        maximum: 3,
        type: 'array',
        inclusive: true,
        exact: false,
        message: 'Too big',
      } as z.ZodIssue,
      {
        code: 'invalid_string',
        path: ['body', 'email'],
        validation: 'email',
        message: 'Invalid email',
      } as z.ZodIssue,
      {
        code: 'invalid_string',
        path: ['body', 'website'],
        validation: 'url',
        message: 'Invalid URL',
      } as z.ZodIssue,
      {
        code: 'invalid_enum_value',
        path: ['body', 'role'],
        options: ['admin', 'user'],
        message: 'Invalid enum',
      } as z.ZodIssue,
      {
        code: 'custom',
        path: ['body', 'custom'],
        message: 'Custom error',
      } as z.ZodIssue,
    ]

    const response = endpoint.handleValidationError(issues)
    const body = await response.json()

    expect(body.errors).toContain('name: Expected string, but received number')
    expect(body.errors).toContain('title: Must be at least 3 characters')
    expect(body.errors).toContain('age: Must be at least 1')
    expect(body.errors).toContain('tags: Must have at least 2 items')
    expect(body.errors).toContain('slug: Must be at most 5 characters')
    expect(body.errors).toContain('count: Must be at most 10')
    expect(body.errors).toContain('items: Must have at most 3 items')
    expect(body.errors).toContain('email: Invalid email address')
    expect(body.errors).toContain('website: Invalid URL')
    expect(body.errors).toContain('role: Must be one of: admin, user')
    expect(body.errors).toContain('Custom error')
  })

  it('returns 404 when action resolves to null', async () => {
    const endpoint = new HandleTestEndpoint()
    const response = await endpoint.handle(createContext())
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.success).toBe(false)
  })

  it('passes through Response results', async () => {
    class ResponseEndpoint extends HandleTestEndpoint {
      async action() {
        return new Response('ok', { status: 204 })
      }
    }

    const endpoint = new ResponseEndpoint()
    const response = await endpoint.handle(createContext())

    expect(response.status).toBe(204)
  })

  it('wraps successful results', async () => {
    class SuccessEndpoint extends HandleTestEndpoint {
      async action() {
        return { id: 'value' }
      }
    }

    const endpoint = new SuccessEndpoint()
    const response = await endpoint.handle(createContext())
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toEqual({ id: 'value' })
  })
})

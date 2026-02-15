import { env } from 'cloudflare:test'
import { sign } from 'hono/jwt'

type AuthPayloadOverrides = Partial<{
  sub: string
  email: string
  role: string
}>

export const getAuthHeader = async (overrides: AuthPayloadOverrides = {}) => {
  const token = await sign(
    {
      sub: 'test-user-id',
      email: 'test@example.com',
      role: 'admin',
      ...overrides,
    },
    env.JWT_SECRET,
  )

  return `Bearer ${token}`
}

import createFetchClient from 'openapi-fetch'
import createClient from 'openapi-react-query'
import type { paths } from '@/lib/api/v1'

export const fetchClient = createFetchClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:6001',
  fetch: async (input) => {
    const token = localStorage.getItem('token')

    return fetch(input, {
      ...input,
      headers: {
        ...input?.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
  },
})

export const api = createClient(fetchClient)

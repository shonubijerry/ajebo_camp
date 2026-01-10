import { useMemo } from 'react'
import { api } from './client'

export function useApi() {
  const $api = useMemo(() => api, [])
  return { $api }
}

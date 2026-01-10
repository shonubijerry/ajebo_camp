import React from 'react'
import { useApi } from '@/lib/api/useApi'

interface UseDistrictSearchOptions {
  perPage?: number
}

export const useDistrictSearch = (options?: UseDistrictSearchOptions) => {
  const { $api } = useApi()
  const [districtSearch, setDistrictSearch] = React.useState('')

  const districtsQuery = $api.useQuery('get', '/api/v1/districts/list', {
    params: { query: { page: 0, per_page: options?.perPage ?? 100 } },
  })

  const allDistricts = React.useMemo(
    () => districtsQuery.data?.data ?? [],
    [districtsQuery.data],
  )

  const filteredDistricts = React.useMemo(() => {
    if (!districtSearch) return allDistricts
    const term = districtSearch.toLowerCase()
    return allDistricts.filter((d) => d.name.toLowerCase().includes(term))
  }, [allDistricts, districtSearch])

  const refreshDistricts = React.useCallback(() => {
    districtsQuery.refetch()
  }, [districtsQuery])

  return {
    districtSearch,
    setDistrictSearch,
    districts: allDistricts,
    filteredDistricts,
    isLoading: districtsQuery.isLoading,
    refreshDistricts,
  }
}

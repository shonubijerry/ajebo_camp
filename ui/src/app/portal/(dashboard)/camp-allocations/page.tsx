'use client'

import CampAllocationForm from '@/components/forms/CampAllocationForm'
import { ColumnDef } from '@tanstack/react-table'
import { CampAllocation } from '@/interfaces'
import CRUDPage from '@/components/portal/CRUDPage'
import { useApi } from '@/lib/api/useApi'

function CampAllocationsPageContent() {
  const { $api } = useApi()
  const campsResult = $api.useQuery('get', '/api/v1/camps/list', {
    params: { query: { page: 1, per_page: 100 } },
  })

  const camps = campsResult.data?.success ? campsResult.data.data : []
  const campsMap = new Map(camps.map((camp) => [camp.id, camp]))

  const columns: ColumnDef<CampAllocation>[] = [
    {
      accessorKey: 'camp_id',
      header: 'Camp',
      cell: ({ getValue }) => {
        const campId = getValue() as string
        const camp = campsMap.get(campId)
        return camp ? `${camp.title} (${camp.year})` : campId
      },
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'items',
      header: 'Items',
      cell: ({ getValue }) => {
        const items = getValue() as string[]
        return items?.join(', ') || '-'
      },
    },
    {
      accessorKey: 'allocation_type',
      header: 'Type',
      cell: ({ getValue }) => {
        const type = getValue() as string
        return type ? type.charAt(0).toUpperCase() + type.slice(1) : '-'
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ getValue }) => new Date(String(getValue())).toLocaleDateString(),
    },
  ]

  return (
    <CRUDPage<CampAllocation>
      title="Camp Allocations Management"
      description="View and manage all camp allocations"
      entityName="camp-allocation"
      entityNamePlural="camp-allocations"
      listEndpoint="/api/v1/camp-allocations/list"
      deleteEndpoint="/api/v1/camp-allocations/{id}"
      columns={columns}
      FormComponent={CampAllocationForm}
      getDeleteMessage={(campAllocation) =>
        `Are you sure you want to delete ${campAllocation?.name}? This action cannot be undone.`
      }
      orderBy="[created_at]=desc"
    />
  )
}

export default function CampAllocationsPage() {
  return <CampAllocationsPageContent />
}

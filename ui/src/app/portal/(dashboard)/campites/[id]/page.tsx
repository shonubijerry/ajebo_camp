'use client'

import CampitesBulkForm from '@/components/forms/CampitesBulkForm'
import React from 'react'

export default function CampitePage() {
  const handleSuccess = () => {
    // Redirect or refresh
    window.location.href = '/portal/campites'
  }

  const handleCancel = () => {
    window.location.href = '/portal/campites'
  }

  return (
    <CampitesBulkForm
      mode="view"
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  )
}

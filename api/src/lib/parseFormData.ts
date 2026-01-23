// Helper function to get string value from FormData, handling Files
function getFormString(formData: FormData, key: string): string | null {
  const value = formData.get(key)
  if (value === null) return null
  if (typeof value === 'string') return value
  return null
}

// Helper function to parse camp form data
export function parseCampFormData(formData: FormData): unknown {
  const premiumFeesRaw = getFormString(formData, 'premium_fees') || '[]'
  let premiumFees: number[] = []
  try {
    premiumFees = JSON.parse(premiumFeesRaw) as number[]
  } catch {
    premiumFees = []
  }

  let highlights = undefined
  const highlightsRaw = getFormString(formData, 'highlights')
  if (highlightsRaw) {
    try {
      highlights = JSON.parse(highlightsRaw) as string[]
    } catch {
      highlights = undefined
    }
  }

  return {
    title: getFormString(formData, 'title') || '',
    theme: getFormString(formData, 'theme') || null,
    verse: getFormString(formData, 'verse') || null,
    entity_id: getFormString(formData, 'entity_id') || '',
    banner: null,
    year: Number(getFormString(formData, 'year')),
    fee: Number(getFormString(formData, 'fee')),
    premium_fees: premiumFees,
    start_date: getFormString(formData, 'start_date') || '',
    end_date: getFormString(formData, 'end_date') || '',
    highlights: highlights,
    registration_deadline:
      getFormString(formData, 'registration_deadline') || null,
    contact_email: getFormString(formData, 'contact_email') || null,
    contact_phone: getFormString(formData, 'contact_phone') || null,
  }
}

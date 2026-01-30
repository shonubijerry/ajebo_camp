import { DetailedAnalytics } from '@/interfaces'

export const downloadAsXlsx = (
  campTitle: string,
  period: string,
  analytics?: DetailedAnalytics,
) => {
  if (!analytics) return

  const { overview } = analytics

  const genderBreakdown = analytics?.campites?.by_gender ?? []
  const ageBreakdown = analytics?.campites?.by_age_group ?? []
  const typeBreakdown = analytics?.campites?.by_type ?? []
  const districtBreakdown = analytics?.campites?.by_district ?? []
  const timelineDaily = analytics?.timeline?.daily ?? []

  const data = [
    ['ANALYTICS REPORT', campTitle || 'Camp Analytics'],
    ['Period', period],
    ['Generated', new Date().toLocaleString()],
    [],
    ['OVERVIEW'],
    ['Total Campites', overview?.total_campites ?? 0],
    ['Total Revenue', overview?.total_revenue ?? 0],
    ['Total Districts', overview?.total_districts ?? 0],
    ['Pending Payments', overview?.pending_payments ?? 0],
    [],
    ['GENDER BREAKDOWN'],
    ['Gender', 'Count'],
    ...genderBreakdown.map((g) => [g.gender || 'Unknown', g.count]),
    [],
    ['AGE GROUP BREAKDOWN'],
    ['Age Group', 'Count'],
    ...ageBreakdown.map((a) => [a.age_group || 'Unknown', a.count]),
    [],
    ['TYPE BREAKDOWN'],
    ['Type', 'Count', 'Revenue'],
    ...typeBreakdown.map((t) => [t.type || 'Unknown', t.count, t.revenue]),
    [],
    ['DISTRICT BREAKDOWN'],
    ['District', 'Count'],
    ...districtBreakdown.map((d) => [d.district_name || 'Unknown', d.count]),
    [],
    ['DAILY TIMELINE'],
    ['Date', 'Count', 'Revenue'],
    ...timelineDaily.map((t) => [t.date, t.count, t.revenue]),
  ]

  const csv = data
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute(
    'download',
    `${campTitle || 'analytics'}-${new Date().toISOString().split('T')[0]}.xlsx`,
  )
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

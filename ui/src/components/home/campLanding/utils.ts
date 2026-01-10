import { alpha } from '@mui/material/styles'

export const colors = {
  red: '#c8102e',
  blue: '#0033a0',
  yellow: '#ffd100',
  navy: '#0b1c3f',
  light: '#f8fafc',
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatDateShort(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatMoney(amount: number) {
  return amount <= 0 ? 'Free' : `₦${amount.toLocaleString()}`
}

export function getCampDuration(startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const days =
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  return `${days} ${days === 1 ? 'Day' : 'Days'}`
}

export const translucentWhiteBorder = `1px solid ${alpha('#ffffff', 0.3)}`

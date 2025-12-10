import { generateRandomString } from './generators'

export const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }
  const formattedDate = date
    .toLocaleString('en-NG', options)
    .replace(/at/i, '')
    .replaceAll('/', '-')
  return formattedDate
}

export const unixTime = () => {
  const unix = Math.floor(Date.now() / 1000)

  return unix
}

export const formatLocalDate = (dateString?: string | Date) => {
  let date = new Date()

  if (dateString) {
    date = new Date(dateString)
  }

  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')

  return `${day}-${month}-${year}`
}

export const generateDateTimeId = (
  suffix: string = generateRandomString(),
): string => {
  const now = new Date()

  // Adjust to Africa/Lagos timezone (GMT+1)
  const lagosTime = new Date(now.getTime() + 60 * 60 * 1000)

  const year = lagosTime.getFullYear()
  const month = String(lagosTime.getMonth() + 1).padStart(2, '0') // Months are 0-based
  const day = String(lagosTime.getDate()).padStart(2, '0')
  const hours = String(lagosTime.getHours()).padStart(2, '0')
  const minutes = String(lagosTime.getMinutes()).padStart(2, '0')

  // Format the date and time as YYYYMMDDHHII
  const baseId = `${year}${month}${day}${hours}${minutes}`

  return `${baseId}${suffix}`
}

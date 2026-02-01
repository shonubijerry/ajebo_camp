import { createHash, randomUUID } from 'crypto'
import { Env } from '../env'
import * as qr from 'qr-image'

/**
 * @param length lenght of the string
 * @param isAlphanumeric should be number and letter
 * @returns
 */
export const generateRandomString = (
  length = 6,
  isAlphanumeric = false,
): string => {
  let chars = '0123456789'
  if (isAlphanumeric) {
    chars += 'ABCDEFGHJKLMNOPQRSTUVWXYZ'
  }

  let result = ''
  for (let i = length; i > 0; i -= 1) {
    result += chars[Math.round(Math.random() * (chars.length - 1))]
  }
  return result
}

export function generateObjectId() {
  const timestamp = Math.floor(Date.now() / 1000).toString(16)
  const machineId = Math.random().toString(16).slice(2, 12).padStart(10, '0')
  const counter = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0')

  return timestamp + machineId + counter
}

/**
 * @param email
 * @param phoneNumber
 * @returns
 */
export function modEmailPhone(email: string, phoneNumber: string | null) {
  const randomDigits = Math.floor(100 + Math.random() * 999)

  const transformedEmail = email + randomDigits + 'deleted'

  // Append random 4-digit number to the phone number
  let transformedPhoneNumber: string | null = null
  if (phoneNumber) {
    transformedPhoneNumber = `${phoneNumber}${randomDigits}00000`
  }

  return { transformedEmail, transformedPhoneNumber }
}

export function uuidTo8Digit(uuid = randomUUID()): string {
  const hash = createHash('sha256').update(uuid).digest('hex')
  // Take first 8 hex characters and convert to decimal
  const hashHex = hash.substring(0, 8)
  const code = parseInt(hashHex, 16) % 100000000
  // Pad with leading zeros to ensure 8 digits
  return code.toString().padStart(8, '0')
}

export const generateRegistrationNumber = async (env: Env) => {
  let code = uuidTo8Digit()
  let attempt = 0
  const maxAttempts = 100

  while (
    (await env.PRISMA.campite.count({ where: { registration_no: code } })) > 0
  ) {
    attempt++
    if (attempt >= maxAttempts) {
      throw new Error('Failed to generate unique code after maximum attempts')
    }

    code = uuidTo8Digit()
  }

  return code
}

export const generateQrCode = (data: string) => {
  return qr.imageSync(data, { type: 'png', size: 10 }).toString('base64')
}

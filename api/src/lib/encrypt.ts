import * as crypto from 'node:crypto'

// Function to import a secret key for HMAC SHA-512
export async function importHMACKey(secret: string) {
  // Encode the secret as a Uint8Array
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)

  // Import the secret key for HMAC
  return crypto.subtle.importKey(
    'raw', // Raw key material
    keyData, // Key data
    { name: 'HMAC', hash: 'SHA-256' }, // Key algorithm and hash function
    false, // Non-extractable
    ['sign', 'verify'], // Key usages
  )
}

// Function to create an HMAC SHA-512 signature
export async function hash(secret: string, data: string) {
  // Import the HMAC key
  const key = await importHMACKey(secret)

  // Encode the data as a Uint8Array
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(JSON.stringify(data))

  // Generate the HMAC signature
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, dataBuffer)

  // Convert the signature to a hex string
  const signatureArray = Array.from(new Uint8Array(signatureBuffer))
  const signatureHex = signatureArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return signatureHex
}

// Function to create an HMAC SHA-512 signature
export async function compare(
  secret: string,
  data: string,
  compateWith: string,
) {
  const key = await importHMACKey(secret)

  // Encode the data as a Uint8Array
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(JSON.stringify(data))

  // Convert the expected signature from hex string to Uint8Array
  const signature = Uint8Array.from(
    (compateWith.match(/.{1,2}/g) || []).map((byte) => parseInt(byte, 16)),
  )

  // Generate the HMAC signature
  return await crypto.subtle.verify('HMAC', key, signature, dataBuffer)
}

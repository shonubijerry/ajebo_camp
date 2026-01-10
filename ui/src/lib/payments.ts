export function generateRandomPaymentRef(prefix = 'PAY'): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 5).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

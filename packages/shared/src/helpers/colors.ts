export function generateRandomDarkColor(): string {
  // Generate random RGB values for a dark color
  const red = Math.floor(Math.random() * 128)
  const green = Math.floor(Math.random() * 128)
  const blue = Math.floor(Math.random() * 128)

  // Convert RGB values to hexadecimal format
  const hexRed = red.toString(16).padStart(2, '0')
  const hexGreen = green.toString(16).padStart(2, '0')
  const hexBlue = blue.toString(16).padStart(2, '0')

  return `#${hexRed}${hexGreen}${hexBlue}`
}

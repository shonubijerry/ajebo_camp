export const round2dp = (num: number) => {
  return Math.round(num * 100) / 100
}

export const round5dp = (num: number) => {
  return Math.round(num * 100000) / 100000
}

export const getPercentage = (amount: number, value: number) => {
  return round2dp((amount * value) / 100)
}

export const getRandomIntInRange = (min: number, max: number) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const maskString = (number: string, lastDigitsToExpose = 2) => {
  if (number.length <= lastDigitsToExpose) return 'Invalid number'

  return (
    '*'.repeat(number.length - lastDigitsToExpose) +
    number.slice(-lastDigitsToExpose)
  )
}

export const add = (nums: number[]) => {
  return nums.reduce((prev, curr) => prev + Math.trunc(curr * 100), 0) / 100
}

export const subtract = (num1: number, num2: number) => {
  return (Math.trunc(num1 * 100) - Math.trunc(num2 * 100)) / 100
}

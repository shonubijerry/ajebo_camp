export function groupBy<T extends object>(arr: T[], prop: string) {
  const groups: Record<string, T[]> = {}
  for (const obj of arr) {
    const key = obj[prop as keyof T]

    if (!groups[key as string]) {
      groups[key as string] = []
    }
    groups[key as string].push(obj)
  }

  return groups
}

export function groupByUniqueProp<T extends Record<string, unknown>>(
  arr: T[],
  prop: string,
) {
  const groups: Record<string, T> = {}
  for (const obj of arr) {
    const key = obj[prop]

    groups[key as string] = obj
  }

  return groups
}

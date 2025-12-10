export const rewardDict: Record<string, string> = {
  c: 'cashback',
  r: 'referral',
  p: 'point',
  db: 'debit',
  cr: 'credit',
}

export const stringToObject = (
  input: string,
  dict = rewardDict,
  delimeter = '-',
) => {
  const parts = input.split(delimeter)
  const output = []

  for (let i = 0; i < parts.length; i += 3) {
    output.push({
      name: dict[parts[i]],
      action: dict[parts[i + 1]],
      value: parts[i + 2],
    })
  }

  return output
}

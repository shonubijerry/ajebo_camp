import { z } from 'zod'

export const zodRecord = z.record(z.number())

const defaultDate = new Date().toISOString().slice(0, 10)

export const dateSchema = z
  .string()
  .datetime()
  .default(defaultDate)
  .describe('Defaults to today')

export type UpdateJSONPayload = JSONQueryPayload & {
  value: string | number | [] | object
}

export type JSONQueryPayload = {
  table: string
  field: string
  keyPath: string
  where?: string
}

import { z } from 'zod'

const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(jsonValueSchema),
  ]),
)

export const operatorSchema: z.ZodType<Record<string, JsonValue>> = z
  .object({
    equals: jsonValueSchema.optional(),
    in: z.array(jsonValueSchema).optional(),
    notIn: z.array(jsonValueSchema).optional(),
    lt: z.number().optional(),
    lte: z.number().optional(),
    gt: z.number().optional(),
    gte: z.number().optional(),
    contains: z.string().optional(),
    startsWith: z.string().optional(),
    endsWith: z.string().optional(),
    mode: z.enum(['default', 'insensitive']).optional(),
    // not: z.lazy(() => z.union([jsonValueSchema, operatorSchema])).optional(),
    some: jsonValueSchema.optional(),
    none: jsonValueSchema.optional(),
    every: jsonValueSchema.optional(),
  })
  .openapi({
    type: 'object',
    additionalProperties: true,
    description: 'Filter operators for querying',
  })

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }
type PrismaWhere = Record<string, any>

/**
 * Parse nested bracket notation from query params
 * Example: "[firstname][contains]" => ["firstname", "contains"]
 */
function parseBracketNotation(key: string): string[] {
  const matches = key.match(/\[([^\]]+)\]/g)
  if (!matches) return [key]
  return matches.map((m) => m.slice(1, -1))
}

/**
 * Convert query params to Prisma where clause
 * @param queryParams - Object containing query parameters
 * @returns Prisma where clause object
 *
 * Example:
 * ```
  const advancedParams = {
    '[email][contains]': 'example.com',
    '[email][mode]': 'insensitive',
    '[status][in]': '["active","pending"]',
    '[createdAt][gte]': '2024-01-01',
  }

  const where3 = queryParamsToPrismaWhere(advancedParams)
  ```
 */
export function queryParamsToPrismaWhere<T>(
  queryParams: Record<string, string | string[]>,
): T {
  const where: PrismaWhere = {}

  for (const [key, value] of Object.entries(queryParams)) {
    const parts = parseBracketNotation(key)

    if (parts.length === 1) {
      // Simple field: [id]=1
      where[parts[0]] = parseValue(value)
    } else if (parts.length === 2) {
      // Field with operator: [firstname][contains]=string
      const [field, operator] = parts

      if (!where[field]) {
        where[field] = {}
      }

      where[field][operator] = parseValue(value)
    } else if (parts.length > 2) {
      // Nested operators: [user][name][contains]=string
      let current = where

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i]
        if (!current[part]) {
          current[part] = {}
        }
        if (i === parts.length - 2) {
          // Last level before operator
          current[part][parts[parts.length - 1]] = parseValue(value)
        } else {
          current = current[part]
        }
      }
    }
  }

  return where as T
}

/**
 * Parse string value to appropriate type
 */
function parseValue(value: string | string[]): JsonValue {
  if (Array.isArray(value)) {
    return value.map((v) => parseValue(v))
  }

  // Try parsing as number
  if (!isNaN(Number(value)) && value.trim() !== '') {
    return Number(value)
  }

  // Try parsing as boolean
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === 'null') return null

  // Try parsing as JSON array or object
  if (value.startsWith('[') || value.startsWith('{')) {
    try {
      return JSON.parse(value)
    } catch {
      // If parsing fails, return as string
    }
  }

  return value
}

/**
 * Parse query string to Prisma where clause
 * @param queryString - URL query string (e.g., "?[firstname][contains]=john&[id]=1")
 * @returns Prisma where clause object
 *
 * Example:
 *
 ```
 const queryString = '[firstname][contains]=john&[id]=1&[age][gte]=18&[age][lte]=65';
 const where2 = queryStringToPrismaWhere(queryString);
```
 */
export function queryStringToPrismaWhere<T = PrismaWhere>(queryString: string) {
  const params = new URLSearchParams(queryString)
  const queryParams: Record<string, string | string[]> = {}

  for (const [key, value] of params.entries()) {
    if (queryParams[key]) {
      // Handle multiple values for same key
      if (Array.isArray(queryParams[key])) {
        queryParams[key].push(value)
      } else {
        queryParams[key] = [queryParams[key], value]
      }
    } else {
      queryParams[key] = value
    }
  }

  return queryParamsToPrismaWhere<T>(queryParams)
}

/**
 * Parse query string sort parameters to an object  * in the format { field: direction }
 * @param queryString 
 * @returns
 * Example:
 * ```
  const queryString = '[firstname]=desc&[created_at]=asc';
  const sort = parseQuerySort(queryString);
  // Result: { firstname: 'desc', created_at: 'asc' }
  ```
 */
export function parseQuerySort<T = Record<string, 'asc' | 'desc'>>(
  queryString: string,
): T {
  if (!queryString) return {} as T

  const result: Record<string, 'asc' | 'desc'>[] = []

  // Split by & to get individual parameters
  const params = queryString.split('&')

  for (const param of params) {
    // Match pattern: [key]=value
    const match = param.match(/\[([^\]]+)\]=(asc|desc)/)
    if (match) {
      const key = match[1]
      const value = match[2].replace(/'/g, '') as 'asc' | 'desc'
      result.push({ [key]: value })
    }
  }

  return result as T
}

export const GenericError = z.object({
  success: z.literal(false),
  errors: z.array(
    z.object({
      code: z.string(),
      message: z.string(),
    }),
  ),
})

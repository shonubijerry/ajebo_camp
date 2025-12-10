import { z } from 'zod'

export const basePaginationShema = z
  .object({
    before: z.string(),
    after: z.string(),
  })
  .partial()

export const paginationMetaSchema = z.object({
  ...basePaginationShema.shape,
  limit: z.coerce
    .number()
    .default(1000)
    .describe('If set to 0, all data is returned without pagination'),
})

export type PaginationMeta = z.infer<typeof paginationMetaSchema>
export type BasePagination = z.infer<typeof basePaginationShema>

export const paginationPayload = z
  .object({
    filters: z.string().array(),
    ...paginationMetaSchema.shape,
  })
  .partial()

export type PaginationPayload = z.infer<typeof paginationPayload>

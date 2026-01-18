import { z } from 'zod'
import { OpenAPIEndpoint } from './generic/create'
import { ListEndpoint, listRequestQuerySchema } from './generic/list'
import { GetEndpoint } from './generic/get'
import { UpdateEndpoint } from './generic/update'
import { DeleteEndpoint } from './generic/delete'
import { requestBodies, responseBodies } from '../schemas'
import { AppContext } from '../types'
import { Prisma } from '@ajebo_camp/database'
import { AwaitedReturnType } from './generic/types'
import { AuthenticatedUser } from '../middlewares/auth'
import { he } from 'zod/v4/locales'

const campMeta = {
  collection: 'Camp' as const,
  responseSchema: responseBodies.camp,
}

// Helper function to parse camp form data
function parseCampFormData(formData: FormData): unknown {
  const premiumFeesRaw = formData.get('premium_fees')?.toString() || '[]'
  let premiumFees: number[] = []
  try {
    premiumFees = JSON.parse(premiumFeesRaw)
  } catch {
    premiumFees = []
  }

  let highlights = undefined
  const highlightsRaw = formData.get('highlights')?.toString()
  if (highlightsRaw) {
    try {
      highlights = JSON.parse(highlightsRaw)
    } catch {
      highlights = undefined
    }
  }

  return {
    title: formData.get('title')?.toString() || '',
    theme: formData.get('theme')?.toString() || null,
    verse: formData.get('verse')?.toString() || null,
    entity_id: formData.get('entity_id')?.toString() || '',
    banner: null,
    year: Number(formData.get('year')),
    fee: Number(formData.get('fee')),
    premium_fees: premiumFees,
    start_date: formData.get('start_date')?.toString() || '',
    end_date: formData.get('end_date')?.toString() || '',
    highlights: highlights,
    registration_deadline:
      formData.get('registration_deadline')?.toString() || null,
    contact_email: formData.get('contact_email')?.toString() || null,
    contact_phone: formData.get('contact_phone')?.toString() || null,
  }
}

// Helper function to upload banner to R2
async function uploadBannerToR2(
  file: File,
  env: AppContext['env'],
): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpeg'
  const key = `camps/${crypto.randomUUID()}.${ext}`
  const bytes = await file.arrayBuffer()

  await env.MEDIA_BUCKET.put(key, bytes, {
    httpMetadata: {
      contentType: file.type || 'application/octet-stream',
    },
  })

  // In local development, R2_PUBLIC_BASE_URL is not available
  // Store just the key, and serve via a local route in production
  if (env.ENVIRONMENT === 'development') {
    return key
  }

  const base = (env.R2_PUBLIC_BASE_URL || '').replace(/\/$/, '')
  return base ? `${base}/${key}` : key
}

export class CreateCampEndpoint extends OpenAPIEndpoint {
  meta = {
    ...campMeta,
    requestSchema: z.object({
      body: requestBodies.camp,
    }),
    permission: 'camp:create' as const,
    supportsFormData: true,
  }

  async action(
    c: AppContext & {
      user?: AuthenticatedUser
    },
    payload: typeof this.meta.requestSchema._type,
  ) {
    const formData = await c.req.formData()
    const file = formData.get('banner')
    const bodyInput = parseCampFormData(formData)

    const parsed = requestBodies.camp.safeParse(bodyInput)
    if (!parsed.success) {
      return c.json({ success: false, errors: parsed.error.issues }, 400)
    }

    const campData = {
      ...parsed.data,
      user_id: c.user?.sub,
      ...{
        banner:
          file instanceof File && file.size > 0
            ? await uploadBannerToR2(file, c.env)
            : undefined,
      },
    }

    return c.env.PRISMA.camp.create({ data: campData })
  }
}

export class ListCampsEndpoint extends ListEndpoint<
  Prisma.CampWhereInput,
  Prisma.CampOrderByWithRelationInput
> {
  meta = {
    ...campMeta,
    requestSchema: listRequestQuerySchema,
    permission: 'camp:view' as const,
  }
  protected pageSize = 25

  async action(
    c: AppContext,
    params: AwaitedReturnType<typeof this.preAction>,
  ) {
    const [data, total] = await Promise.all([
      c.env.PRISMA.camp.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy,
      }),
      c.env.PRISMA.camp.count({ where: params.where }),
    ])

    return { data, total }
  }
}

export class GetCampEndpoint extends GetEndpoint {
  meta = {
    ...campMeta,
    requestSchema: z.object({
      params: responseBodies.camp.pick({
        id: true,
      }),
    }),
    permission: 'camp:view' as const,
  }

  async action(
    c: AppContext,
    { params }: typeof this.meta.requestSchema._type,
  ) {
    return c.env.PRISMA.camp.findFirst({ where: { id: params.id } })
  }
}

export class UpdateCampEndpoint extends UpdateEndpoint {
  meta = {
    ...campMeta,
    requestSchema: z.object({
      params: responseBodies.camp.pick({ id: true }),
      body: requestBodies.camp.partial(),
    }),
    permission: 'camp:update' as const,
    supportsFormData: true,
  }

  async action(
    c: AppContext,
    { params, body }: typeof this.meta.requestSchema._type,
  ) {
    const formData = await c.req.formData()
    const file = formData.get('banner')
    const bodyInput = parseCampFormData(formData)

    const parsed = requestBodies.camp.safeParse(bodyInput)
    if (!parsed.success) {
      return c.json({ success: false, errors: parsed.error.issues }, 400)
    }

    const campData = {
      ...parsed.data,
      ...{
        banner:
          file instanceof File && file.size > 0
            ? await uploadBannerToR2(file, c.env)
            : undefined,
      },
    }

    return c.env.PRISMA.camp.update({
      where: { id: params.id },
      data: campData,
    })
  }
}

export class DeleteCampEndpoint extends DeleteEndpoint {
  meta = {
    ...campMeta,
    requestSchema: z.object({
      params: responseBodies.camp.pick({ id: true }),
      query: z.object({
        soft: z.boolean().optional(),
      }),
    }),
    permission: 'camp:delete' as const,
  }

  action(c: AppContext, input: AwaitedReturnType<typeof this.preAction>) {
    const { where } = input

    return c.env.PRISMA.camp.delete({ where })
  }
}

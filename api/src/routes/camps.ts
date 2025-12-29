import { z } from 'zod'
import { OpenAPIEndpoint } from './generic/create'
import { ListEndpoint, listRequestQuerySchema } from './generic/list'
import { GetEndpoint } from './generic/get'
import { UpdateEndpoint } from './generic/update'
import { DeleteEndpoint } from './generic/delete'
import { requestBodies, responseBodies } from '../schemas'
import { AppContext } from '..'
import { Prisma } from '@ajebo_camp/database'
import { AwaitedReturnType } from './generic/types'

const campMeta = {
  collection: 'Camp' as const,
  responseSchema: responseBodies.camp,
}

export class CreateCampEndpoint extends OpenAPIEndpoint {
  meta = {
    ...campMeta,
    requestSchema: z.object({
      body: requestBodies.camp,
    }),
  }

  async action(c: AppContext, payload: typeof this.meta.requestSchema._type) {
    const contentType = c.req.header('content-type')?.toLowerCase() || ''
    let file: File | null = null
    let bodyInput: unknown = payload?.body

    if (contentType.includes('multipart/form-data')) {
      const formData = await c.req.formData()
      file = (formData.get('banner') as File) || null

      const premiumFeesRaw = formData.get('premium_fees')?.toString() || '[]'
      let premiumFees: number[] = []
      try {
        premiumFees = JSON.parse(premiumFeesRaw)
      } catch {
        premiumFees = []
      }

      bodyInput = {
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
      }
    }

    const parsed = requestBodies.camp.safeParse(bodyInput)
    if (!parsed.success) {
      return c.json({ success: false, errors: parsed.error.issues }, 400)
    }

    const campData = { ...parsed.data }

    if (file && file.size > 0) {
      const key = `camps/${crypto.randomUUID()}`
      const bytes = await file.arrayBuffer()

      await c.env.MEDIA_BUCKET.put(key, bytes, {
        httpMetadata: {
          contentType: file.type || 'application/octet-stream',
        },
      })

      const base = (c.env.R2_PUBLIC_BASE_URL || '').replace(/\/$/, '')
      campData.banner = base ? `${base}/${key}` : key
    }

    return c.env.PRISMA.camp.create({ data: campData })
  }
}

export class ListCampsEndpoint extends ListEndpoint<Prisma.CampWhereInput> {
  meta = {
    ...campMeta,
    requestSchema: listRequestQuerySchema,
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
  }

  action(c: AppContext, { params }: typeof this.meta.requestSchema._type) {
    return c.env.PRISMA.camp.findFirst({ where: { id: params.id } })
  }
}

export class UpdateCampEndpoint extends UpdateEndpoint {
  meta = {
    ...campMeta,
    requestSchema: z.object({
      params: responseBodies.camp.pick({ id: true }),
      body: requestBodies.camp,
    }),
  }

  async action(
    c: AppContext,
    { params, body }: typeof this.meta.requestSchema._type,
  ) {
    return c.env.PRISMA.camp.update({
      where: { id: params.id },
      data: body,
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
  }

  action(c: AppContext, input: AwaitedReturnType<typeof this.preAction>) {
    const { where } = input

    return c.env.PRISMA.camp.delete({ where })
  }
}

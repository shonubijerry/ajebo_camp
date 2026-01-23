import { z } from 'zod'
import { OpenAPIEndpoint } from './generic/create'
import { ListEndpoint, listRequestQuerySchema } from './generic/list'
import { GetEndpoint } from './generic/get'
import { UpdateEndpoint } from './generic/update'
import { DeleteEndpoint } from './generic/delete'
import { requestBodies, responseBodies } from '@ajebo_camp/database'
import { Prisma } from '@ajebo_camp/database'
import { AppContext } from '../types'

const districtMeta = {
  collection: 'District' as const,
  responseSchema: responseBodies.district,
}

export class CreateDistrictEndpoint extends OpenAPIEndpoint {
  meta = {
    ...districtMeta,
    requestSchema: z.object({
      body: requestBodies.district,
    }),
    permission: 'district:create' as const,
  }

  async action(c: AppContext, { body }: typeof this.meta.requestSchema._type) {
    return c.env.PRISMA.district.create({ data: body })
  }
}

export class ListDistrictsEndpoint extends ListEndpoint<
  Prisma.DistrictWhereInput,
  Prisma.DistrictOrderByWithRelationInput
> {
  meta = {
    ...districtMeta,
    requestSchema: z.object({
      query: listRequestQuerySchema,
    }),
    permission: 'district:view' as const,
  }
  protected pageSize = 25

  async action(c: AppContext) {
    const params = await this.getPagination()

    if (!params.page) {
      const result = await c.env.PRISMA.district.findMany({
        where: params.where,
        orderBy: params.orderBy,
      })

      return { data: result }
    }

    const [data, total] = await Promise.all([
      c.env.PRISMA.district.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy,
      }),
      c.env.PRISMA.district.count({ where: params.where }),
    ])

    return { data, total }
  }
}

export class GetDistrictEndpoint extends GetEndpoint {
  meta = {
    ...districtMeta,
    requestSchema: z.object({
      params: responseBodies.district.pick({
        id: true,
      }),
    }),
    permission: 'district:view' as const,
  }

  async action(
    c: AppContext,
    { params }: typeof this.meta.requestSchema._type,
  ) {
    const result = await c.env.PRISMA.district.findFirst({
      where: { id: params.id },
    })

    if (!result) {
      return c.json(
        {
          success: false,
          errors: [{ code: 'not_found', message: 'District not found' }],
        },
        404,
      )
    }

    return result
  }
}

export class UpdateDistrictEndpoint extends UpdateEndpoint {
  meta = {
    ...districtMeta,
    requestSchema: z.object({
      params: responseBodies.district.pick({ id: true }),
      body: requestBodies.district.partial(),
    }),
    permission: 'district:update' as const,
  }

  async action(
    c: AppContext,
    { params, body }: typeof this.meta.requestSchema._type,
  ) {
    return c.env.PRISMA.district.update({
      where: { id: params.id },
      data: body,
    })
  }
}

export class DeleteDistrictEndpoint extends DeleteEndpoint {
  meta = {
    ...districtMeta,
    requestSchema: z.object({
      params: responseBodies.district.pick({ id: true }),
      query: z.object({
        soft: z.boolean().optional(),
      }),
    }),
    permission: 'district:delete' as const,
  }

  async action(c: AppContext) {
    const { params } = await this.whereInput()

    return c.env.PRISMA.district.delete({ where: { id: params?.id } })
  }
}

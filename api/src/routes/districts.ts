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
  }

  async action(c: AppContext, { body }: typeof this.meta.requestSchema._type) {
    return c.env.PRISMA.district.create({ data: body })
  }
}

export class ListDistrictsEndpoint extends ListEndpoint<Prisma.DistrictWhereInput> {
  meta = {
    ...districtMeta,
    requestSchema: listRequestQuerySchema,
  }
  protected pageSize = 25

  async action(
    c: AppContext,
    params: AwaitedReturnType<typeof this.preAction>,
  ) {
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
  }

  action(c: AppContext, { params }: typeof this.meta.requestSchema._type) {
    return c.env.PRISMA.district.findFirst({ where: { id: params.id } })
  }
}

export class UpdateDistrictEndpoint extends UpdateEndpoint {
  meta = {
    ...districtMeta,
    requestSchema: z.object({
      params: responseBodies.district.pick({ id: true }),
      body: requestBodies.district,
    }),
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
  }

  action(c: AppContext, input: AwaitedReturnType<typeof this.preAction>) {
    const { data, where } = input
    if (data) {
      return c.env.PRISMA.district.update({ where, data })
    }
    return c.env.PRISMA.district.delete({ where })
  }
}
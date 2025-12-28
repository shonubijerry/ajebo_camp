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

const campiteMeta = {
  collection: 'Campite' as const,
  responseSchema: responseBodies.campite,
}

export class CreateCampiteEndpoint extends OpenAPIEndpoint {
  meta = {
    ...campiteMeta,
    requestSchema: z.object({
      body: requestBodies.campite,
    }),
  }

  async action(c: AppContext, { body }: typeof this.meta.requestSchema._type) {
    return c.env.PRISMA.campite.create({ data: body })
  }
}

export class ListCampitesEndpoint extends ListEndpoint<Prisma.CampiteWhereInput> {
  meta = {
    ...campiteMeta,
    requestSchema: listRequestQuerySchema,
  }
  protected pageSize = 25

  async action(
    c: AppContext,
    params: AwaitedReturnType<typeof this.preAction>,
  ) {
    const [data, total] = await Promise.all([
      c.env.PRISMA.campite.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy,
      }),
      c.env.PRISMA.campite.count({ where: params.where }),
    ])

    return { data, total }
  }
}

export class GetCampiteEndpoint extends GetEndpoint {
  meta = {
    ...campiteMeta,
    requestSchema: z.object({
      params: responseBodies.campite.pick({
        id: true,
      }),
    }),
  }

  action(c: AppContext, { params }: typeof this.meta.requestSchema._type) {
    return c.env.PRISMA.campite.findFirst({ where: { id: params.id } })
  }
}

export class UpdateCampiteEndpoint extends UpdateEndpoint {
  meta = {
    ...campiteMeta,
    requestSchema: z.object({
      params: responseBodies.campite.pick({ id: true }),
      body: requestBodies.campite,
    }),
  }

  async action(
    c: AppContext,
    { params, body }: typeof this.meta.requestSchema._type,
  ) {
    return c.env.PRISMA.campite.update({
      where: { id: params.id },
      data: body,
    })
  }
}

export class DeleteCampiteEndpoint extends DeleteEndpoint {
  meta = {
    ...campiteMeta,
    requestSchema: z.object({
      params: responseBodies.campite.pick({ id: true }),
      query: z.object({
        soft: z.boolean().optional(),
      }),
    }),
  }

  action(c: AppContext, input: AwaitedReturnType<typeof this.preAction>) {
    const { where } = input

    return c.env.PRISMA.campite.delete({ where })
  }
}

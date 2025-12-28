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

const entityMeta = {
  collection: 'Entity' as const,
  responseSchema: responseBodies.entity,
}

export class CreateEntityEndpoint extends OpenAPIEndpoint {
  meta = {
    ...entityMeta,
    requestSchema: z.object({
      body: requestBodies.entity,
    }),
  }

  async action(c: AppContext, { body }: typeof this.meta.requestSchema._type) {
    return c.env.PRISMA.entity.create({ data: body })
  }
}

export class ListEntitiesEndpoint extends ListEndpoint<Prisma.EntityWhereInput> {
  meta = {
    ...entityMeta,
    requestSchema: listRequestQuerySchema,
  }
  protected pageSize = 25

  async action(
    c: AppContext,
    params: AwaitedReturnType<typeof this.preAction>,
  ) {
    const [data, total] = await Promise.all([
      c.env.PRISMA.entity.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy,
      }),
      c.env.PRISMA.entity.count({ where: params.where }),
    ])

    return { data, total }
  }
}

export class GetEntityEndpoint extends GetEndpoint {
  meta = {
    ...entityMeta,
    requestSchema: z.object({
      params: responseBodies.entity.pick({
        id: true,
      }),
    }),
  }

  action(c: AppContext, { params }: typeof this.meta.requestSchema._type) {
    return c.env.PRISMA.entity.findFirst({ where: { id: params.id } })
  }
}

export class UpdateEntityEndpoint extends UpdateEndpoint {
  meta = {
    ...entityMeta,
    requestSchema: z.object({
      params: responseBodies.entity.pick({ id: true }),
      body: requestBodies.entity,
    }),
  }

  async action(
    c: AppContext,
    { params, body }: typeof this.meta.requestSchema._type,
  ) {
    return c.env.PRISMA.entity.update({
      where: { id: params.id },
      data: body,
    })
  }
}

export class DeleteEntityEndpoint extends DeleteEndpoint {
  meta = {
    ...entityMeta,
    requestSchema: z.object({
      params: responseBodies.entity.pick({ id: true }),
      query: z.object({
        soft: z.boolean().optional(),
      }),
    }),
  }

  action(c: AppContext, input: AwaitedReturnType<typeof this.preAction>) {
    const { where } = input

    return c.env.PRISMA.entity.delete({ where })
  }
}

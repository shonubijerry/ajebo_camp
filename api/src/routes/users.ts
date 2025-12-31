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
import { AuthenticatedUser } from '../middlewares/auth'

const userMeta = {
  collection: 'User' as const,
  responseSchema: responseBodies.user,
}

export class CreateUserEndpoint extends OpenAPIEndpoint {
  meta = {
    ...userMeta,
    requestSchema: z.object({
      body: requestBodies.user.extend({
        password: z.string().optional(),
      }),
    }),
  }

  async action(c: AppContext, { body }: typeof this.meta.requestSchema._type) {
    const exist = await c.env.PRISMA.user.findUnique({
      where: { email: body.email },
    })

    if (exist) {
      return exist
    }

    return c.env.PRISMA.user.create({
      data: body,
    })
  }
}

export class ListUsersEndpoint extends ListEndpoint<Prisma.UserWhereInput> {
  meta = {
    ...userMeta,
    requestSchema: listRequestQuerySchema,
  }
  protected pageSize = 25

  async action(
    c: AppContext,
    params: AwaitedReturnType<typeof this.preAction>,
  ) {
    const [data, total] = await Promise.all([
      c.env.PRISMA.user.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy,
        omit: {
          password: true,
        },
      }),
      c.env.PRISMA.user.count({ where: params.where }),
    ])

    return { data, total }
  }
}
export class GetUserEndpoint extends GetEndpoint {
  meta = {
    ...userMeta,
    requestSchema: z.object({
      params: responseBodies.user.pick({
        id: true,
      }),
    }),
  }

  action(c: AppContext, { params }: typeof this.meta.requestSchema._type) {
    return c.env.PRISMA.user.findFirst({ where: { id: params.id } })
  }
}

export class UpdateUserEndpoint extends UpdateEndpoint {
  meta = {
    ...userMeta,
    requestSchema: z.object({
      params: responseBodies.user.pick({ id: true }),
      body: requestBodies.user.partial(),
    }),
  }

  async action(
    c: AppContext,
    { params, body }: typeof this.meta.requestSchema._type,
  ) {
    return c.env.PRISMA.user.update({
      where: { id: params.id },
      data: body,
    })
  }
}

export class GetCurrentUserEndpoint extends OpenAPIEndpoint {
  meta = {
    ...userMeta,
    requestSchema: null,
  }

  async action(c: AppContext & { user?: AuthenticatedUser }) {
    if (!c.user?.sub) {
      throw new Error('Unauthorized')
    }

    return c.env.PRISMA.user.findUnique({
      where: { id: c.user.sub },
    })
  }
}

export class DeleteUserEndpoint extends DeleteEndpoint {
  meta = {
    ...userMeta,
    requestSchema: z.object({
      params: responseBodies.user.pick({ id: true }),
      query: z.object({
        soft: z.boolean().default(true),
      }),
    }),
  }

  async action(c: AppContext, input: AwaitedReturnType<typeof this.preAction>) {
    const { where } = input

    return c.env.PRISMA.user.delete({ where })
  }
}

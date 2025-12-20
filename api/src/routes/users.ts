import { z } from 'zod'
import { CreateEndpoint } from './generic/create'
import { ListEndpoint } from './generic/list'
import { GetEndpoint } from './generic/get'
import { UpdateEndpoint } from './generic/update'
import { DeleteEndpoint } from './generic/delete'
import { requestBodies, responseBodies } from '../schemas'
import { AppContext } from '..'
import { Prisma } from '@ajebo_camp/database'
import { AwaitedReturnType } from './generic/types'
import { contentJson } from 'chanfana'
import { DefaultArgs } from '@ajebo_camp/database/src/generated/prisma/runtime/client'

/**
 * User creation endpoint.
 * Uses centralized schemas from `schemas.ts` for request/response shapes.
 */
export class CreateUserEndpoint extends CreateEndpoint<Prisma.UserCreateInput> {
  collection = 'user' as const
  requestBodySchema = {
    body: contentJson(
      requestBodies.user.extend({
        password: z.string().optional(),
      }),
    ),
  }
  responseSchema = responseBodies.user

  async action(c: AppContext, data: AwaitedReturnType<typeof this.preAction>) {
    return c.env.PRISMA.user.create({ data })
  }

  async afterAction(user: AwaitedReturnType<typeof this.action>) {
    user.password = null
    return user
  }
}

export class ListUsersEndpoint extends ListEndpoint<
  Prisma.UserWhereInput,
  Prisma.UserOrderByWithRelationInput
> {
  collection = 'user' as const
  responseSchema = responseBodies.user
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
      }),
      c.env.PRISMA.user.count({ where: params.where }),
    ])

    return { data, total }
  }

  async afterAction(users: Prisma.$UserPayload['scalars'][]) {
    return users.map((user) => ({ ...user, password: null }))
  }
}
export class GetUserEndpoint extends GetEndpoint<Prisma.UserWhereInput> {
  collection = 'user' as const
  requestSchema = {
    params: responseBodies.user.pick({
      id: true,
    }),
  }
  responseSchema = responseBodies.user
  action(c: AppContext, where: Prisma.UserWhereInput) {
    return c.env.PRISMA.user.findFirst({ where })
  }
}

export class UpdateUserEndpoint extends UpdateEndpoint<Prisma.UserUpdateInput> {
  collection = 'user' as const
  requestBodySchema = {
    params: responseBodies.user.pick({ id: true }),
    body: contentJson(requestBodies.user),
  }
  responseSchema = responseBodies.user

  async action(
    c: AppContext,
    id: string,
    data: NonNullable<AwaitedReturnType<typeof this.preAction>['body']>,
  ) {
    return c.env.PRISMA.user.update({
      where: { id },
      data,
    })
  }
}

export class DeleteUserEndpoint extends DeleteEndpoint {
  collection = 'user' as const
  action(c: AppContext, input: AwaitedReturnType<typeof this.preAction>) {
    const { data, where } = input
    if (data) {
      return c.env.PRISMA.user.update({ where, data })
    }
    return c.env.PRISMA.user.delete({ where })
  }
}

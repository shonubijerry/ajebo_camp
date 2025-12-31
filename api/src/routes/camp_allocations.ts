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

const campAllocationMeta = {
  collection: 'Camp_Allocation' as const,
  responseSchema: responseBodies.camp_Allocation,
}

export class CreateCampAllocationEndpoint extends OpenAPIEndpoint {
  meta = {
    ...campAllocationMeta,
    requestSchema: z.object({
      body: requestBodies.camp_Allocation,
    }),
    permission: 'camp-allocation:create' as const,
  }

  async action(c: AppContext, { body }: typeof this.meta.requestSchema._type) {
    return c.env.PRISMA.camp_Allocation.create({ data: body })
  }
}

export class ListCampAllocationsEndpoint extends ListEndpoint<
  Prisma.Camp_AllocationWhereInput,
  Prisma.Camp_AllocationOrderByWithRelationInput
> {
  meta = {
    ...campAllocationMeta,
    requestSchema: listRequestQuerySchema,
    permission: 'camp-allocation:view' as const,
  }
  protected pageSize = 25

  async action(
    c: AppContext,
    params: AwaitedReturnType<typeof this.preAction>,
  ) {
    const [data, total] = await Promise.all([
      c.env.PRISMA.camp_Allocation.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy,
        include: { camp: true },
      }),
      c.env.PRISMA.camp_Allocation.count({ where: params.where }),
    ])

    return { data, total }
  }
}

export class GetCampAllocationEndpoint extends GetEndpoint {
  meta = {
    ...campAllocationMeta,
    requestSchema: z.object({
      params: responseBodies.camp_Allocation.pick({
        id: true,
      }),
    }),
    permission: 'camp-allocation:view' as const,
  }

  action(c: AppContext, { params }: typeof this.meta.requestSchema._type) {
    return c.env.PRISMA.camp_Allocation.findFirst({ where: { id: params.id } })
  }
}

export class UpdateCampAllocationEndpoint extends UpdateEndpoint {
  meta = {
    ...campAllocationMeta,
    requestSchema: z.object({
      params: responseBodies.camp_Allocation.pick({ id: true }),
      body: requestBodies.camp_Allocation.partial(),
    }),
    permission: 'camp-allocation:update' as const,
  }

  async action(
    c: AppContext,
    { params, body }: typeof this.meta.requestSchema._type,
  ) {
    return c.env.PRISMA.camp_Allocation.update({
      where: { id: params.id },
      data: body,
    })
  }
}

export class DeleteCampAllocationEndpoint extends DeleteEndpoint {
  meta = {
    ...campAllocationMeta,
    requestSchema: z.object({
      params: responseBodies.camp_Allocation.pick({ id: true }),
      query: z.object({
        soft: z.boolean().optional(),
      }),
    }),
    permission: 'camp-allocation:delete' as const,
  }

  action(c: AppContext, input: AwaitedReturnType<typeof this.preAction>) {
    const { where } = input

    return c.env.PRISMA.camp_Allocation.delete({ where })
  }
}

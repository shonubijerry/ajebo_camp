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
    const [camp, allocations] = await Promise.all([
      c.env.PRISMA.camp.findUnique({ where: { id: body.camp_id } }),
      c.env.PRISMA.camp_Allocation.findMany({
        where: { camp_id: body.camp_id },
      }),
    ])

    if (!camp) {
      throw new Error('Camp not found')
    }

    const availableItems = allocations.map((allocation) => {
      if (!allocation.items || !Array.isArray(allocation.items))
        return [] as string[]
      return allocation.items.filter(Boolean)
    })

    const allocated_items = availableItems.map(
      (item) => item[Math.floor(Math.random() * item.length)] ?? '',
    )

    return c.env.PRISMA.campite.create({
      data: {
        ...body,
        amount: camp.fee,
        allocated_items: allocated_items.join(','),
      },
    })
  }
}

export class ListCampitesEndpoint extends ListEndpoint<
  Prisma.CampiteWhereInput,
  Prisma.CampiteOrderByWithRelationInput
> {
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
        include: { camp: { select: { id: true, title: true } } },
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
      body: requestBodies.campite._def.schema.partial(),
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

export class BulkCreateCampitesEndpoint extends OpenAPIEndpoint {
  meta = {
    ...campiteMeta,
    requestSchema: z.object({
      body: z.object({
        user_id: z.string().describe('User ID for all campites'),
        camp_id: z.string().describe('Camp ID for all campites'),
        district_id: z.string().describe('District ID for all campites'),
        payment_ref: z
          .string()
          .optional()
          .nullable()
          .describe('Payment reference for all campites'),
        campites: z.array(
          z.object({
            firstname: z.string().min(1),
            lastname: z.string().min(1),
            phone: z.string().min(1),
            age_group: z.string().min(1),
            gender: z.string().min(1),
          }),
        ),
      }),
    }),
  }

  async action(c: AppContext, { body }: typeof this.meta.requestSchema._type) {
    const { campites, user_id, camp_id, district_id, payment_ref } = body

    // Validate campites array is not empty
    if (!campites || campites.length === 0) {
      throw new Error('At least one campite is required')
    }

    const [camp, allocations] = await Promise.all([
      c.env.PRISMA.camp.findUnique({ where: { id: camp_id } }),
      c.env.PRISMA.camp_Allocation.findMany({ where: { camp_id } }),
    ])

    if (!camp) {
      throw new Error('Camp not found')
    }

    const availableItems = allocations.flatMap((allocation) => {
      if (!allocation.items || !Array.isArray(allocation.items))
        return [] as string[]
      return allocation.items.filter(Boolean)
    })

    // Create all campites
    const createdCampites = []

    for (const campite of campites) {
      try {
        const allocated_items = availableItems.length
          ? availableItems[Math.floor(Math.random() * availableItems.length)]
          : ''

        const created = await c.env.PRISMA.campite.create({
          data: {
            firstname: campite.firstname,
            lastname: campite.lastname,
            email: null,
            phone: campite.phone,
            age_group: campite.age_group,
            gender: campite.gender,
            camp_id,
            user_id,
            district_id,
            payment_ref: payment_ref || null,
            type: 'regular',
            amount: camp.fee,
            allocated_items,
          },
        })
        createdCampites.push(created)
      } catch (error) {
        throw new Error(
          `Failed to create campite ${campite.firstname} ${campite.lastname}: ${(error as Error).message}`,
        )
      }
    }

    return {
      success: true,
      count: createdCampites.length,
      data: createdCampites,
    }
  }
}

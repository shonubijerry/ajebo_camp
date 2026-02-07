import { z } from 'zod'
import { OpenAPIEndpoint } from './generic/create'
import { ListEndpoint, listRequestQuerySchema } from './generic/list'
import { GetEndpoint } from './generic/get'
import { UpdateEndpoint } from './generic/update'
import { DeleteEndpoint } from './generic/delete'
import { requestBodies, responseBodies } from '@ajebo_camp/database'
import { AppContext } from '../types'
import { Prisma } from '@ajebo_camp/database'
import { generateQrCode, generateRegistrationNumber } from '../lib/generators'
import { sendHtmlMail } from '../services/email.service'
import { registrationSuccessTemplate } from '../templates/registration-success'

const campiteMeta = {
  collection: 'Campite' as const,
  responseSchema: responseBodies.campite,
}

export class CreateCampiteEndpoint extends OpenAPIEndpoint {
  meta = {
    ...campiteMeta,
    requestSchema: z.object({
      body: requestBodies.campite._def.schema,
    }),
    permission: 'campite:create' as const,
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

    if (!camp.is_active) {
      throw new Error('Registration for this camp is closed')
    }

    const availableItems = allocations.map((allocation) => {
      if (!allocation.items || !Array.isArray(allocation.items))
        return [] as string[]
      return allocation.items.filter(Boolean)
    })

    const allocated_items = availableItems.map(
      (item) => item[Math.floor(Math.random() * item.length)] ?? '',
    )

    const campite = await c.env.PRISMA.campite.create({
      data: {
        ...body,
        amount: camp.fee,
        registration_no: await generateRegistrationNumber(c.env),
        allocated_items: allocated_items.join(','),
      },
    })

    if (campite.email) {
      await sendHtmlMail(
        c.env,
        campite.email,
        `${camp.title} Registration Successful`,
        registrationSuccessTemplate({
          first_name: campite.firstname,
          registration_number: campite.registration_no,
          camp_name: camp.title,
        }),
        [
          {
            filename: 'qr-code.png',
            content: generateQrCode(campite.registration_no),
            contentId: 'qr-code',
            contentType: 'image/png',
          },
        ],
      )
    }

    return campite
  }
}

export class ListCampitesEndpoint extends ListEndpoint<
  Prisma.CampiteWhereInput,
  Prisma.CampiteOrderByWithRelationInput
> {
  meta = {
    ...campiteMeta,
    requestSchema: z.object({
      query: listRequestQuerySchema,
    }),
    permission: 'campite:view' as const,
  }
  protected pageSize = 25

  async action(c: AppContext) {
    const params = await this.getPagination()
    console.log(params)

    // Scope regular users to their own campites
    if (c.user?.role === 'user') {
      params.where = { ...(params.where || {}), user_id: c.user.sub }
    }

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

export class OfflineCampitesEndpoint extends OpenAPIEndpoint {
  meta = {
    ...campiteMeta,
    requestSchema: z.object({
      query: z.object({
        page: z.coerce.number().min(1).default(1),
        per_page: z.coerce.number().min(1).max(1000).default(500),
        camp_id: z.string().optional(),
      }),
    }),
    responseSchema: z.object({
      data: z.array(
        responseBodies.campite.pick({
          id: true,
          registration_no: true,
          user_id: true,
          camp_id: true,
          firstname: true,
          lastname: true,
          phone: true,
          gender: true,
          age_group: true,
          type: true,
          checkin_at: true,
        }),
      ),
    }),
    permission: 'campite:view' as const,
  }

  async action(c: AppContext, { query }: typeof this.meta.requestSchema._type) {
    const where: Prisma.CampiteWhereInput = {}

    if (query.camp_id) {
      where.camp_id = query.camp_id
    }

    // Scope regular users to their own campites
    if (c.user?.role === 'user') {
      throw new Error('Unauthorized') // Regular users should not access this endpoint
    }

    const skip = (query.page - 1) * query.per_page
    const take = query.per_page

    const data = await c.env.PRISMA.campite.findMany({
      where,
      skip,
      take,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        registration_no: true,
        user_id: true,
        camp_id: true,
        firstname: true,
        lastname: true,
        phone: true,
        gender: true,
        age_group: true,
        type: true,
        checkin_at: true,
      },
    })

    return { success: true, data }
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
    permission: 'campite:view' as const,
  }

  async action(
    c: AppContext,
    { params }: typeof this.meta.requestSchema._type,
  ) {
    const where: Prisma.CampiteWhereInput = { id: params.id }

    // Scope regular users to their own campites
    if (c.user?.role === 'user') {
      where.user_id = c.user.sub
    }

    const result = await c.env.PRISMA.campite.findFirst({ where })

    if (!result) {
      return c.json(
        {
          success: false,
          errors: [{ code: 'not_found', message: 'Campite not found' }],
        },
        404,
      )
    }

    return result
  }
}

export class UpdateCampiteEndpoint extends UpdateEndpoint {
  meta = {
    ...campiteMeta,
    requestSchema: z.object({
      params: responseBodies.campite.pick({ id: true }),
      body: requestBodies.campite._def.schema.partial(),
    }),
    permission: 'campite:update' as const,
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

export class BulkUpdateCampitesEndpoint extends OpenAPIEndpoint {
  meta = {
    ...campiteMeta,
    requestSchema: z.object({
      body: z.object({
        ids: z
          .array(z.string().min(1))
          .min(1)
          .describe('Array of campite IDs to update'),
        data: requestBodies.campite._def.schema
          .pick({
            checkin_at: true,
          })
          .partial()
          .describe('Data to update'),
      }),
    }),
    responseSchema: z.object({
      success: z.boolean(),
      count: z.number(),
    }),
    permission: 'campite:update' as const,
  }

  async action(c: AppContext, { body }: typeof this.meta.requestSchema._type) {
    const { ids, data } = body

    // Update all campites with the given IDs
    const result = await c.env.PRISMA.campite.updateMany({
      where: { id: { in: ids } },
      data,
    })

    return {
      success: true,
      count: result.count,
    }
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
    permission: 'campite:delete' as const,
  }

  async action(c: AppContext) {
    const { params } = await this.whereInput()

    return c.env.PRISMA.campite.delete({ where: { id: params?.id } })
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
    permission: 'campite:create' as const,
  }

  async action(c: AppContext, { body }: typeof this.meta.requestSchema._type) {
    const { campites, user_id, camp_id, district_id, payment_ref } = body

    // Validate campites array is not empty
    if (!campites || campites.length === 0) {
      throw new Error('At least one campite is required')
    }

    const [camp, allocations, user, oneRegisteredCampite] = await Promise.all([
      c.env.PRISMA.camp.findUnique({ where: { id: camp_id } }),
      c.env.PRISMA.camp_Allocation.findMany({ where: { camp_id } }),
      c.env.PRISMA.user.findUnique({ where: { id: user_id } }),
      c.env.PRISMA.campite.findFirst({ where: { user_id, camp_id } }),
    ])

    if (!user) {
      throw new Error('User not found')
    }

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
            registration_no: await generateRegistrationNumber(c.env),
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

    if (createdCampites.length && user.email) {
      const registrationNo = oneRegisteredCampite
        ? `BULK-${oneRegisteredCampite.registration_no}`
        : `BULK-${createdCampites[0].registration_no}`

      await sendHtmlMail(
        c.env,
        user.email || '',
        `${camp.title} Registration Successful`,
        registrationSuccessTemplate({
          first_name: user.firstname || '',
          registration_number: registrationNo,
          camp_name: camp.title,
        }),
        [
          {
            filename: 'qr-code.png',
            content: generateQrCode(registrationNo),
            contentId: 'qr-code',
            contentType: 'image/png',
          },
        ],
      )
    }

    return {
      success: true,
      count: createdCampites.length,
      data: createdCampites,
    }
  }
}

export class ExportCampitesEndpoint extends OpenAPIEndpoint {
  meta = {
    ...campiteMeta,
    requestSchema: z.object({
      query: z.object({
        camp_id: z.string().min(1),
      }),
    }),
    responseSchema: z.string().describe('CSV content as string'),
    permission: 'campite:export' as const,
  }

  async action(c: AppContext, { query }: typeof this.meta.requestSchema._type) {
    const districts = await c.env.PRISMA.district.findMany()
    const districtMap = new Map(districts.map((d) => [d.id, d.name]))
    const campites = await c.env.PRISMA.campite.findMany({
      where: { camp_id: query.camp_id },
      orderBy: { created_at: 'desc' },
    })

    const headers = [
      'First Name',
      'Last Name',
      'Gender',
      'Phone',
      'Email',
      'District',
      'Amount',
      'Created At',
    ]

    const escapeCsv = (value: unknown) => {
      if (value === null || value === undefined) return ''
      if (typeof value === 'string') {
        return value.includes(',') ||
          value.includes('"') ||
          value.includes('\n')
          ? '"' + value.replace(/"/g, '""') + '"'
          : value
      }
      if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value)
      }
      return JSON.stringify(value)
    }

    const rows = campites.map((c) => [
      c.firstname,
      c.lastname,
      c.gender,
      c.phone,
      c.email ?? '',
      districtMap.get(c.district_id ?? '') ?? '',
      c.amount ?? '',
      c.created_at ? new Date(c.created_at).toISOString() : '',
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(','))
      .join('\n')

    return c.newResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="campites-${query.camp_id}-${Date.now()}.xlsx"`,
      },
    })
  }
}

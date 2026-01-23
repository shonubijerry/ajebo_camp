import { z } from 'zod'
import { ListEndpoint, listRequestQuerySchema } from './generic/list'
import { GetEndpoint } from './generic/get'
import { responseBodies } from '../schemas'
import { Prisma } from '@ajebo_camp/database'
import { AppContext } from '../types'

const paymentMeta = {
  collection: 'Payment' as const,
  responseSchema: responseBodies.payment,
  permission: 'payment:view' as const,
}

export class ListPaymentsEndpoint extends ListEndpoint<
  Prisma.PaymentWhereInput,
  Prisma.PaymentOrderByWithRelationInput
> {
  meta = {
    ...paymentMeta,
    requestSchema: z.object({
      query: listRequestQuerySchema,
    }),
  }
  protected pageSize = 25

  async action(c: AppContext) {
    const params = await this.getPagination()
    const [data, total] = await Promise.all([
      c.env.PRISMA.payment.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy,
      }),
      c.env.PRISMA.payment.count({ where: params.where }),
    ])

    return { data, total }
  }
}

export class GetPaymentEndpoint extends GetEndpoint {
  meta = {
    ...paymentMeta,
    requestSchema: z.object({
      params: responseBodies.payment.pick({
        id: true,
      }),
    }),
  }

  action(c: AppContext, { params }: typeof this.meta.requestSchema._type) {
    return c.env.PRISMA.payment.findFirst({ where: { id: params.id } })
  }
}

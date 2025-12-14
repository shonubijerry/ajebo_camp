import { z } from 'zod'
import { CreateEndpoint } from './generic/create'
import { requestBodies, responseBodies } from '../schemas'

export class CreatePaymentEndpoint extends CreateEndpoint<
  z.infer<typeof requestBodies.payment>,
  'payment'
> {
  collection = 'payment' as const
  requestBodySchema = requestBodies.payment
  responseSchema = responseBodies.payment
}

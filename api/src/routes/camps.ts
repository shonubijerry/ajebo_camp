import { z } from 'zod'
import { CreateEndpoint } from './generic/create'
import { requestBodies, responseBodies } from '../schemas'

export class CreateCampEndpoint extends CreateEndpoint<
  z.infer<typeof requestBodies.camp>,
  'camp'
> {
  collection = 'camp' as const
  requestBodySchema = requestBodies.camp
  responseSchema = responseBodies.camp
}

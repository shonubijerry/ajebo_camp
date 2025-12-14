import { z } from 'zod'
import { CreateEndpoint } from './generic/create'
import { requestBodies, responseBodies } from '../schemas'

export class CreateEntityEndpoint extends CreateEndpoint<
  z.infer<typeof requestBodies.entity>,
  'entity'
> {
  collection = 'entity' as const
  requestBodySchema = requestBodies.entity
  responseSchema = responseBodies.entity
}

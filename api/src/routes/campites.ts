import { z } from 'zod'
import { CreateEndpoint } from './generic/create'
import { requestBodies, responseBodies } from '../schemas'

export class CreateCampiteEndpoint extends CreateEndpoint<
  z.infer<typeof requestBodies.campite>,
  'campite'
> {
  collection = 'campite' as const
  requestBodySchema = requestBodies.campite
  responseSchema = responseBodies.campite
}

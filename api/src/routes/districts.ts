import { z } from 'zod'
import { CreateEndpoint } from './generic/create'
import { requestBodies, responseBodies } from '../schemas'

export class CreateDistrictEndpoint extends CreateEndpoint<
  z.infer<typeof requestBodies.district>,
  'district'
> {
  collection = 'district' as const
  requestBodySchema = requestBodies.district
  responseSchema = responseBodies.district
}

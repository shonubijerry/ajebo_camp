import { z } from 'zod'
import { CreateEndpoint } from './generic/create'
import { requestBodies, responseBodies } from '../schemas'

export class CreateCampAllocationEndpoint extends CreateEndpoint<
  z.infer<typeof requestBodies.camp_Allocation>,
  'camp_Allocation'
> {
  collection = 'camp_Allocation' as const
  requestBodySchema = requestBodies.camp_Allocation
  responseSchema = responseBodies.camp_Allocation
}

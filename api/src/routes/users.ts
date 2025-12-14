import { z } from 'zod'
import { CreateEndpoint } from './generic/create'
import { ListEndpoint, listRequestQuerySchema } from './generic/list'
import { GetEndpoint } from './generic/get'
import { UpdateEndpoint, updateRequestSchema } from './generic/update'
import { DeleteEndpoint, deleteRequestSchema } from './generic/delete'
import { requestBodies, responseBodies } from '../schemas'

/**
 * User creation endpoint.
 * Uses centralized schemas from `schemas.ts` for request/response shapes.
 */
export class CreateUserEndpoint extends CreateEndpoint<
  z.infer<typeof requestBodies.user>,
  'user'
> {
  collection = 'user' as const
  requestBodySchema = requestBodies.user
  responseSchema = responseBodies.user
}

export class ListUsersEndpoint extends ListEndpoint<
  z.infer<typeof listRequestQuerySchema>,
  'user'
> {
  collection = 'user' as const
  requestBodySchema = listRequestQuerySchema
  responseSchema = responseBodies.user
}

export class GetUserEndpoint extends GetEndpoint<
  z.infer<typeof responseBodies.user>,
  'user'
> {
  collection = 'user' as const
  responseSchema = responseBodies.user
}

export class UpdateUserEndpoint extends UpdateEndpoint<
  z.infer<typeof updateRequestSchema>,
  'user'
> {
  collection = 'user' as const
  requestBodySchema = updateRequestSchema
  responseSchema = responseBodies.user
}

export class DeleteUserEndpoint extends DeleteEndpoint<
  z.infer<typeof deleteRequestSchema>,
  'user'
> {
  collection = 'user' as const
  responseSchema = responseBodies.user
}

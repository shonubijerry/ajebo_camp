import { Context } from 'hono'
import { Env } from '../env'

export type AppBindings = {
  Bindings: Env
}

export type AppContext = Context<AppBindings>

import { Env } from './env'
import { WorkerEntrypoint } from 'cloudflare:workers'
import router from './router'

export default class extends WorkerEntrypoint<Env> {
  /**
   * @ignore
   */
  fetch(request: Request) {
    return router.fetch(request, this.env, this.ctx)
  }
}

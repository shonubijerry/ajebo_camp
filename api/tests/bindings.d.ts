declare module 'cloudflare:test' {
  //@ts-expect-error The error is us re-declaring this SELF var, but it's expected.
  export const SELF: Service<import('../src/index').default>
  type ProvidedEnv = import('../src/env').Env
}

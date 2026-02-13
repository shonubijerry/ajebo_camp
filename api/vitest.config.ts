import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersConfig({
  test: {
    include: ['test/**/*.spec.ts'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: 'test/coverage',
      include: ['src/**/*.ts'],
      exclude: ['src/**/index.ts', 'src/**/worker-configuration.d.ts'],
    },
    poolOptions: {
      workers: {
        singleWorker: true,
        remoteBindings: false,
        wrangler: { configPath: './wrangler.jsonc' },
        miniflare: {
          serviceBindings: {
            DATABASE: () => {
              throw new Error('Request to DATABASE binding not mocked')
            },
            MEDIA_BUCKET: () => {
              throw new Error('Request to MEDIA_BUCKET binding not mocked')
            },
            DB: () => {
              throw new Error('Request to DB binding not mocked')
            },
          },
        },
      },
    },
  },
})

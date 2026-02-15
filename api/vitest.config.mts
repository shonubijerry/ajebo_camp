import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config'

export default defineWorkersConfig({
  esbuild: {
    target: 'esnext',
  },
  test: {
    setupFiles: ['tests/vitest.setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.spec.ts'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: 'test/coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/index.ts',
        'src/**/worker-configuration.d.ts',
        'src/services/email.service.ts',
        'src/lib/generators.ts',
        'src/lib/encrypt.ts',
        'src/lib/prisma.ts',
      ],
    },
    poolOptions: {
      workers: {
        singleWorker: true,
        wrangler: {
          configPath: 'wrangler.jsonc',
        },
        miniflare: {
          compatibilityFlags: [
            'experimental',
            'nodejs_compat',
            'enable_nodejs_tty_module',
            'enable_nodejs_fs_module',
            'enable_nodejs_http_modules',
            'enable_nodejs_perf_hooks_module',
          ],
          serviceBindings: {
            DATABASE: () => {
              throw new Error('Request to DATABASE binding not mocked')
            },
          },
        },
      },
    },
  },
})

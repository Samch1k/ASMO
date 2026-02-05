import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  external: [
    // Node built-ins (process omitted — it's a global, shims: true handles it)
    'path',
    'fs',
    'os',
    'util',
    'events',
    'stream',
    'buffer',
    'crypto',
    'url',
    'http',
    'https',
    'net',
    'tls',
    'dns',
    'child_process',
    'cluster',
    'worker_threads',
    'perf_hooks',
    'async_hooks',
    'string_decoder',
    'querystring',
    'zlib',
    // Runtime dependencies (externalized to avoid bundling issues)
    'yaml',
    'js-yaml',
    'ajv',
    'pg',              // optional peer dependency for metrics persistence
    'lru-cache',
    'better-sqlite3',  // native addon, must not be bundled
    '@anthropic-ai/sdk',
    'zod',
  ],
  platform: 'node',
  target: 'node20',
  shims: true,
  treeshake: true,
  minify: false,
})

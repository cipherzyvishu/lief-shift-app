import { defineConfig } from 'prisma/generator-helper'

export default defineConfig({
  seed: 'ts-node --project prisma/tsconfig.seed.json prisma/seed.ts'
})

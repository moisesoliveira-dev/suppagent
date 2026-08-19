import { config } from 'dotenv'
import { resolve } from 'node:path'
import { defineConfig } from 'prisma/config'

config({ path: resolve(__dirname, '../../.env') })
config({ path: resolve(__dirname, '.env') })

const databaseUrl =
  process.env.DATABASE_URL ??
  'postgresql://suppagent:suppagent@localhost:5432/suppagent?schema=public'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: databaseUrl,
  },
})

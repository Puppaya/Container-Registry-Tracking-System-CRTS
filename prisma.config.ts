import 'dotenv/config'
import { defineConfig } from 'prisma/config'

function buildDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL
  }

  const server = process.env.DB_SERVER
  const port = process.env.DB_PORT || '1433'
  const database = process.env.DB_DATABASE
  const user = process.env.DB_USER
  const password = process.env.DB_PASSWORD

  if (!server || !database || !user || !password) {
    throw new Error('Missing DB_SERVER, DB_DATABASE, DB_USER, or DB_PASSWORD in environment')
  }

  return `sqlserver://${server}:${port};database=${database};user=${user};password=${password};trustServerCertificate=true;encrypt=false`
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'bun ./prisma/seed.ts'
  },
  datasource: {
    url: buildDatabaseUrl()
  }
})

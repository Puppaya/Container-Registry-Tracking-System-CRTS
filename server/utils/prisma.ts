import { PrismaClient } from '@prisma/client'
import { PrismaMssql } from '@prisma/adapter-mssql'
import { dbLogger } from './logger'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

const adapter = new PrismaMssql({
    server: process.env.DB_SERVER!,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_DATABASE!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    options: {
        trustServerCertificate: true,
        requestTimeout: 15000,      // Query timeout 15s — ไม่ค้างตลอดกาล
        connectionTimeout: 10000    // Connect timeout 10s
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
        acquireTimeoutMillis: 15000  // รอ connection จาก pool ไม่เกิน 15s
    }
})

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log: [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'info' },
            { emit: 'event', level: 'warn' },
        ],
    })

// Bind Prisma events to our custom logger
if (process.env.NODE_ENV === 'development') {
    (prisma as any).$on('query', (e: any) => {
        dbLogger.debug(`${e.query} (${e.duration}ms)`)
    })
}

(prisma as any).$on('error', (e: any) => {
    dbLogger.error(e.message)
});

(prisma as any).$on('warn', (e: any) => {
    dbLogger.warn(e.message)
})

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}

export default prisma
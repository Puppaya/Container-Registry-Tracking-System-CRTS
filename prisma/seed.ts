import { PrismaClient } from '@prisma/client'
import { PrismaMssql } from '@prisma/adapter-mssql'
import 'dotenv/config'

const adapter = new PrismaMssql({
    server: process.env.DB_SERVER!,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_DATABASE!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    options: {
        trustServerCertificate: true
    }
})

const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Seeding database...')

    // Create default admin user
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            username: 'admin',
            email: 'admin@example.com',
            name: 'Admin User',
            password: 'password123',
            avatar: 'https://ipx.nuxt.com/f_auto,s_192x192/gh_avatar/benjamincanac',
            role: 'ADMIN'
        }
    })

    // Seed customers
    const customerData = [
        { name: 'Alex Smith', email: 'alex.smith@example.com', status: 'subscribed', location: 'New York, USA', avatar: 'https://i.pravatar.cc/128?u=1' },
        { name: 'Jordan Brown', email: 'jordan.brown@example.com', status: 'unsubscribed', location: 'London, UK', avatar: 'https://i.pravatar.cc/128?u=2' },
        { name: 'Taylor Green', email: 'taylor.green@example.com', status: 'bounced', location: 'Paris, France', avatar: 'https://i.pravatar.cc/128?u=3' },
        { name: 'Morgan White', email: 'morgan.white@example.com', status: 'subscribed', location: 'Berlin, Germany', avatar: 'https://i.pravatar.cc/128?u=4' },
        { name: 'Casey Gray', email: 'casey.gray@example.com', status: 'subscribed', location: 'Tokyo, Japan', avatar: 'https://i.pravatar.cc/128?u=5' }
    ]

    for (const customer of customerData) {
        await prisma.customer.upsert({
            where: { email: customer.email },
            update: {},
            create: customer
        })
    }

    console.log('Seeding completed.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })

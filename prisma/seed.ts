import { PrismaClient } from '@prisma/client'
import { PrismaMssql } from '@prisma/adapter-mssql'
import 'dotenv/config'
import { hashPassword } from '../server/utils/crypto'
import { generateContainerNumber } from '../server/utils/container-validation'
import { buildContainerQrContent } from '../server/utils/qr-code'
import { ROLES } from '../server/utils/roles'

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

const defaultPassword = 'password123'

async function seedUser(data: {
  username: string
  email: string
  name: string
  role: string
}) {
  const passwordHash = await hashPassword(defaultPassword)

  return prisma.user.upsert({
    where: { email: data.email },
    update: { role: data.role },
    create: {
      ...data,
      password: passwordHash,
      avatar: 'https://ipx.nuxt.com/f_auto,s_192x192/gh_avatar/benjamincanac'
    }
  })
}

async function seedMasterDataItem(data: {
  category: string
  code: string
  name: string
  description?: string
  sortOrder?: number
}) {
  return prisma.masterData.upsert({
    where: {
      category_code: {
        category: data.category,
        code: data.code
      }
    },
    update: {
      name: data.name,
      description: data.description ?? null,
      sortOrder: data.sortOrder ?? 0,
      isActive: true
    },
    create: {
      category: data.category,
      code: data.code,
      name: data.name,
      description: data.description ?? null,
      sortOrder: data.sortOrder ?? 0,
      isActive: true,
      createdBy: 'system'
    }
  })
}

async function seedMasterData() {
  const isoTypes = [
    { code: '22G1', name: '22G1 (General Purpose 20ft)' },
    { code: '42G1', name: '42G1 (General Purpose 40ft)' },
    { code: '45G1', name: '45G1 (High Cube 40ft)' },
    { code: '22R1', name: '22R1 (Reefer 20ft)' },
    { code: '42R1', name: '42R1 (Reefer 40ft)' },
    { code: '22T1', name: '22T1 (Tank 20ft)' }
  ]

  const sizes = [
    { code: '20', name: "20' ST" },
    { code: '40', name: "40' ST" },
    { code: '45', name: "45' HC" }
  ]

  const categories = [
    { code: 'Dry', name: 'Dry Freight' },
    { code: 'Reefer', name: 'Reefer' },
    { code: 'Tank', name: 'Tank' },
    { code: 'Open Top', name: 'Open Top' },
    { code: 'Flat Rack', name: 'Flat Rack' }
  ]

  const manufacturers = [
    { code: 'CIMC Group', name: 'CIMC Group' },
    { code: 'CXIC Group', name: 'CXIC Group' },
    { code: 'Dong Fang International', name: 'Dong Fang International' },
    { code: 'Maersk Container Industry', name: 'Maersk Container Industry' },
    { code: 'W&K Container', name: 'W&K Container' },
    { code: 'CIMC', name: 'CIMC' },
    { code: 'COSCO', name: 'COSCO' },
    { code: 'Other', name: 'Other' }
  ]

  const owners = [
    { code: 'MSC', name: 'Mediterranean Shipping Company (MSC)' },
    { code: 'Hapag-Lloyd', name: 'Hapag-Lloyd' },
    { code: 'Maersk', name: 'Maersk Line' },
    { code: 'CMA CGM', name: 'CMA CGM' }
  ]

  const locations = [
    { code: 'NLRTM', name: 'Port of Rotterdam (NLRTM)' },
    { code: 'LAVTE', name: 'Vientiane Dry Port (LAVTE)' },
    { code: 'THBKK', name: 'Bangkok Port (THBKK)' }
  ]

  const documentTypes = [
    { code: 'Registration', name: 'Registration Certificate' },
    { code: 'Survey', name: 'Survey Report' },
    { code: 'Repair', name: 'Repair Record' },
    { code: 'Maintenance', name: 'Maintenance Record' },
    { code: 'Certificate', name: 'Certificate' },
    { code: 'Other', name: 'Other' }
  ]

  let sortOrder = 0
  for (const item of isoTypes) {
    await seedMasterDataItem({ category: 'IsoType', ...item, sortOrder: sortOrder++ })
  }

  sortOrder = 0
  for (const item of sizes) {
    await seedMasterDataItem({ category: 'ContainerSize', ...item, sortOrder: sortOrder++ })
  }

  sortOrder = 0
  for (const item of categories) {
    await seedMasterDataItem({ category: 'ContainerCategory', ...item, sortOrder: sortOrder++ })
  }

  sortOrder = 0
  for (const item of manufacturers) {
    await seedMasterDataItem({ category: 'Manufacturer', ...item, sortOrder: sortOrder++ })
  }

  sortOrder = 0
  for (const item of owners) {
    await seedMasterDataItem({ category: 'Owner', ...item, sortOrder: sortOrder++ })
  }

  sortOrder = 0
  for (const item of locations) {
    await seedMasterDataItem({ category: 'Location', ...item, sortOrder: sortOrder++ })
  }

  sortOrder = 0
  for (const item of documentTypes) {
    await seedMasterDataItem({ category: 'DocumentType', ...item, sortOrder: sortOrder++ })
  }
}

async function main() {
  console.log('Seeding CRTS database...')

  await seedUser({
    username: 'admin',
    email: 'admin@crts.local',
    name: 'System Administrator',
    role: ROLES.ADMINISTRATOR
  })

  await seedUser({
    username: 'registry',
    email: 'registry@crts.local',
    name: 'Registry Officer',
    role: ROLES.REGISTRY_OFFICER
  })

  await seedUser({
    username: 'survey',
    email: 'survey@crts.local',
    name: 'Survey Team',
    role: ROLES.SURVEY_TEAM
  })

  await seedUser({
    username: 'management',
    email: 'management@crts.local',
    name: 'Management User',
    role: ROLES.MANAGEMENT
  })

  await seedMasterData()

  const sampleContainers = [
    {
      prefix: 'MSCU123456',
      isoType: '22G1',
      containerSize: '20',
      containerCategory: 'Dry',
      owner: 'MSC',
      manufacturer: 'CIMC',
      yearBuilt: 2020
    },
    {
      prefix: 'HLCU654321',
      isoType: '45G1',
      containerSize: '40',
      containerCategory: 'Dry',
      owner: 'Hapag-Lloyd',
      manufacturer: 'COSCO',
      yearBuilt: 2019
    }
  ]

  for (const sample of sampleContainers) {
    const containerNumber = generateContainerNumber(sample.prefix)
    const qrCode = buildContainerQrContent(containerNumber)

    const container = await prisma.container.upsert({
      where: { containerNumber },
      update: {},
      create: {
        containerNumber,
        isoType: sample.isoType,
        containerSize: sample.containerSize,
        containerCategory: sample.containerCategory,
        owner: sample.owner,
        manufacturer: sample.manufacturer,
        yearBuilt: sample.yearBuilt,
        registrationDate: new Date(),
        status: 'Active',
        qrCode,
        createdBy: 'system'
      }
    })

    const existingEvent = await prisma.containerEvent.findFirst({
      where: {
        containerId: container.containerId,
        eventType: 'Registration'
      }
    })

    if (!existingEvent) {
      await prisma.containerEvent.create({
        data: {
          containerId: container.containerId,
          eventType: 'Registration',
          eventDescription: `Container ${containerNumber} registered in CRTS`,
          eventDate: container.registrationDate,
          createdBy: 'system'
        }
      })
    }
  }

  console.log('Seeding completed.')
  console.log('Login with username (not email). Default password:', defaultPassword)
  console.log('Usernames: admin, registry, survey, management')
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

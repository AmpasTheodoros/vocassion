const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Create default community if it doesn't exist
  const defaultCommunity = await prisma.community.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      name: 'General',
      description: 'The main community for all users',
    },
  })

  console.log({ defaultCommunity })
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

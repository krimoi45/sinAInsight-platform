import { PrismaClient } from '../generated/client/index.js'

// Initialisation unique du client Prisma
const prisma = new PrismaClient()

// Gestion des connexions et déconnexions
export async function connectDB() {
  try {
    await prisma.$connect()
    console.log('Connecté à la base de données')
  } catch (error) {
    console.error('Erreur de connexion à la base de données', error)
    process.exit(1)
  }
}

export async function disconnectDB() {
  await prisma.$disconnect()
}

export default prisma;
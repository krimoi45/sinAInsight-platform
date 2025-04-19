import { PrismaClient } from '../../generated/client/index.js'

class SinAInsightDatabase {
  constructor() {
    this._prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      },
      // Configuration des délais et connexions
      log: ['query', 'info', 'warn', 'error'],
      transactionOptions: {
        maxWait: 5000, // 5 secondes
        timeout: 10000  // 10 secondes
      }
    })
  }

  async connect() {
    try {
      await this._prisma.$connect()
      console.log('✅ Connexion réussie à MongoDB SinAInsight')
    } catch (error) {
      console.error('❌ Échec de connexion à MongoDB:', error)
      process.exit(1)
    }
  }

  async disconnect() {
    await this._prisma.$disconnect()
    console.log('📴 Déconnexion de MongoDB')
  }

  // Méthode de test de connexion
  async testConnection() {
    try {
      // Test simple avec la création d'un log
      const log = await this._prisma.applicationLog.create({
        data: {
          serviceName: 'TestConnection',
          logLevel: 'INFO',
          message: 'Test de connexion MongoDB réussi',
          timestamp: new Date()
        }
      })
      console.log('🔍 Test de connexion réussi:', log)
      return true
    } catch (error) {
      console.error('❌ Échec du test de connexion:', error)
      return false
    }
  }

  // Méthodes de monitoring
  async recordMetric(data) {
    return this._prisma.monitoringMetric.create({ data })
  }

  async recordLog(data) {
    return this._prisma.applicationLog.create({ data })
  }

  async recordPerformance(data) {
    return this._prisma.resourcePerformance.create({ data })
  }

  async recordTransactionTrace(data) {
    return this._prisma.transactionTrace.create({ data })
  }

  // Méthodes de requête
  get client() {
    return this._prisma
  }
}

// Singleton pour la connexion
const db = new SinAInsightDatabase()
export default db
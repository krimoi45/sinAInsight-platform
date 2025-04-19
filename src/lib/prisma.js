import { PrismaClient } from '../../generated/client/index.js'

class DatabaseClient {
  constructor() {
    this._prisma = new PrismaClient()
  }

  async connect() {
    try {
      await this._prisma.$connect()
      console.log('✅ Connexion réussie à MongoDB')
    } catch (error) {
      console.error('❌ Échec de connexion à MongoDB:', error)
      process.exit(1)
    }
  }

  async disconnect() {
    await this._prisma.$disconnect()
    console.log('📴 Déconnexion de MongoDB')
  }

  // Méthodes de test de connexion
  async testConnection() {
    try {
      // Test simple avec la création d'un utilisateur
      const user = await this._prisma.user.create({
        data: {
          email: `test-${Date.now()}@sinainsight.com`,
          name: 'Test Connexion'
        }
      })
      console.log('🔍 Test de connexion réussi:', user)
      
      // Suppression du user de test
      await this._prisma.user.delete({
        where: { id: user.id }
      })
      
      return true
    } catch (error) {
      console.error('❌ Échec du test de connexion:', error)
      return false
    }
  }

  // Exemple de méthode pour insérer des données de monitoring
  async insertMonitoringData(deviceId, metric, value) {
    return this._prisma.monitoringData.create({
      data: {
        deviceId,
        metric,
        value,
        timestamp: new Date()
      }
    })
  }
}

// Singleton pour la connexion
const db = new DatabaseClient()
export default db
import db from './lib/prisma.js'

async function main() {
  try {
    // Connexion à la base de données
    await db.connect()

    // Test de connexion
    const connectionResult = await db.testConnection()
    
    if (connectionResult) {
      // Exemple d'insertion de métriques de monitoring
      const monitoringMetric = await db.recordMetric({
        resourceId: 'resource-001',
        resourceName: 'WebServer-01',
        metricType: 'CPU_USAGE',
        value: 65.5,
        unit: '%',
        status: 'WARNING'
      })
      console.log('📊 Métrique de monitoring insérée:', monitoringMetric)

      // Exemple d'insertion de log applicatif
      const applicationLog = await db.recordLog({
        serviceName: 'AuthService',
        logLevel: 'WARN',
        message: 'Tentative de connexion échouée',
        context: {
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0'
        }
      })
      console.log('📝 Log applicatif inséré:', applicationLog)

      // Exemple de trace de performance
      const performanceTrace = await db.recordPerformance({
        resourceId: 'resource-002',
        resourceName: 'DatabaseCluster',
        performanceKey: 'QUERY_RESPONSE_TIME',
        value: 250.75,
        unit: 'ms'
      })
      console.log('⏱️ Performance trace insérée:', performanceTrace)
    }
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  } finally {
    // Déconnexion de la base de données
    await db.disconnect()
  }
}

// Gestion des erreurs non gérées
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

// Exécution du script principal
main().catch(console.error)
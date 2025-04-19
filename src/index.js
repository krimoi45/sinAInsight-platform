import db from './lib/prisma.js'

async function main() {
  // Connexion à la base de données
  await db.connect()

  try {
    // Test de la connexion
    const connectionResult = await db.testConnection()
    
    if (connectionResult) {
      // Exemple d'insertion de données de monitoring
      const monitoringData = await db.insertMonitoringData(
        'device-001', 
        'temperature', 
        25.5
      )
      console.log('📊 Données de monitoring insérées:', monitoringData)
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
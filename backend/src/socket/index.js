const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Configuration et gestion des WebSockets pour les mises à jour en temps réel
 */
const setupSocketHandlers = (io, prisma) => {
  // Middleware d'authentification pour les sockets
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentification requise'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      
      next();
    } catch (error) {
      logger.error(`Erreur d'authentification socket: ${error.message}`);
      next(new Error('Token invalide'));
    }
  });

  // Gestion des connexions
  io.on('connection', (socket) => {
    const userId = socket.user.id;
    const userName = socket.user.name;
    
    logger.info(`Utilisateur connecté via socket: ${userName} (${userId})`);
    
    // Rejoindre une room privée pour l'utilisateur
    socket.join(`user:${userId}`);
    
    // Écoute des abonnements aux ressources
    socket.on('subscribe:resource', async (resourceId) => {
      try {
        // Vérifier si la ressource existe
        const resource = await prisma.resource.findUnique({
          where: { id: resourceId }
        });
        
        if (!resource) {
          socket.emit('error', { message: 'Ressource non trouvée' });
          return;
        }
        
        // Rejoindre la room pour cette ressource
        socket.join(`resource:${resourceId}`);
        logger.info(`Utilisateur ${userName} (${userId}) s'est abonné à la ressource ${resourceId}`);
        
        // Envoyer l'état actuel de la ressource
        const status = await getResourceStatus(prisma, resourceId);
        socket.emit('resource:status', status);
      } catch (error) {
        logger.error(`Erreur lors de l'abonnement à la ressource: ${error.message}`);
        socket.emit('error', { message: 'Erreur lors de l\'abonnement à la ressource' });
      }
    });
    
    // Écoute des désabonnements aux ressources
    socket.on('unsubscribe:resource', (resourceId) => {
      socket.leave(`resource:${resourceId}`);
      logger.info(`Utilisateur ${userName} (${userId}) s'est désabonné de la ressource ${resourceId}`);
    });
    
    // Écoute des abonnements aux alertes
    socket.on('subscribe:alerts', () => {
      socket.join('alerts');
      logger.info(`Utilisateur ${userName} (${userId}) s'est abonné aux alertes`);
    });
    
    // Écoute des désabonnements aux alertes
    socket.on('unsubscribe:alerts', () => {
      socket.leave('alerts');
      logger.info(`Utilisateur ${userName} (${userId}) s'est désabonné des alertes`);
    });

    // Gestion de la déconnexion
    socket.on('disconnect', () => {
      logger.info(`Utilisateur déconnecté: ${userName} (${userId})`);
    });
  });
  
  return {
    // Méthode pour diffuser une mise à jour d'état de ressource
    broadcastResourceStatus: async (resourceId) => {
      try {
        const status = await getResourceStatus(prisma, resourceId);
        io.to(`resource:${resourceId}`).emit('resource:status', status);
      } catch (error) {
        logger.error(`Erreur lors de la diffusion du statut de la ressource: ${error.message}`);
      }
    },
    
    // Méthode pour diffuser un nouvel événement de log
    broadcastResourceLog: (resourceId, log) => {
      io.to(`resource:${resourceId}`).emit('resource:log', log);
    },
    
    // Méthode pour diffuser une nouvelle alerte
    broadcastAlert: (alert) => {
      io.to('alerts').emit('alert:new', alert);
      
      // Si l'alerte est liée à une ressource, l'envoyer aussi aux abonnés de cette ressource
      if (alert.resourceId) {
        io.to(`resource:${alert.resourceId}`).emit('resource:alert', alert);
      }
    }
  };
};

/**
 * Récupération du statut d'une ressource
 */
const getResourceStatus = async (prisma, resourceId) => {
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    select: {
      id: true,
      name: true,
      lastControl: true,
      lastChange: true,
      nextcheck: true,
      dontcheck: true,
      reason: true,
      elapsed: true
    }
  });
  
  if (!resource) {
    throw new Error('Ressource non trouvée');
  }
  
  // Calculer le statut en fonction des propriétés
  let status = 'unknown';
  if (resource.dontcheck === 1) {
    status = 'disabled';
  } else if (resource.reason) {
    status = 'error';
  } else if (resource.lastControl) {
    status = 'ok';
  }
  
  return {
    id: resource.id,
    name: resource.name,
    status,
    lastCheckTimestamp: resource.lastControl,
    lastChangeTimestamp: resource.lastChange,
    nextCheckTimestamp: resource.nextcheck,
    disabled: resource.dontcheck === 1,
    errorReason: resource.reason,
    lastExecutionTime: resource.elapsed
  };
};

module.exports = {
  setupSocketHandlers
};
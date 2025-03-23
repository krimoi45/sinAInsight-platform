const { z } = require('zod');
const logger = require('../utils/logger');

// Schéma de validation pour la création de ressource
const createResourceSchema = z.object({
  clientRef: z.string(),
  clientName: z.string(),
  clientCode: z.string(),
  name: z.string(),
  alias: z.string().optional(),
  probe: z.string().optional(),
  cycle: z.number().int().positive(),
  validityPeriod: z.string().optional(),
  url: z.string().url().optional(),
  scenarioContent: z.string().optional(),
  scenarioName: z.string().optional(),
  scenarioExt: z.string().optional(),
  scenarioNbretry: z.number().int().nonnegative().optional(),
  scenarioTimeout: z.number().int().positive().optional(),
  poolName: z.string().optional(),
  process: z.string().optional(),
  applicationSource: z.string().optional(),
  tz: z.string().optional(),
  queueName: z.string().optional(),
  indicatorGroupRef: z.string().optional()
});

// Schéma de validation pour la mise à jour de ressource
const updateResourceSchema = createResourceSchema.partial();

/**
 * Récupérer toutes les ressources avec filtrage
 */
const getAllResources = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      clientRef,
      name,
      status,
      sort = 'name:asc'
    } = req.query;

    // Construction des filtres
    const filters = {};
    if (clientRef) filters.clientRef = clientRef;
    if (name) filters.name = { contains: name };
    if (status) filters.status = status;

    // Construction du tri
    const [sortField, sortOrder] = sort.split(':');
    const orderBy = {
      [sortField]: sortOrder === 'desc' ? 'desc' : 'asc'
    };

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Récupération des ressources
    const [resources, totalCount] = await Promise.all([
      req.prisma.resource.findMany({
        where: filters,
        orderBy,
        skip,
        take,
        include: {
          client: {
            select: {
              name: true,
              code: true
            }
          }
        }
      }),
      req.prisma.resource.count({
        where: filters
      })
    ]);

    // Pagination metadata
    const totalPages = Math.ceil(totalCount / take);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    // Réponse
    res.status(200).json({
      status: 'success',
      data: {
        resources,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalItems: totalCount,
          totalPages,
          hasNext,
          hasPrev
        }
      }
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération des ressources: ${error.message}`);
    
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des ressources'
    });
  }
};

/**
 * Récupérer une ressource par son ID
 */
const getResourceById = async (req, res) => {
  try {
    const { id } = req.params;

    // Récupération de la ressource
    const resource = await req.prisma.resource.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            name: true,
            code: true
          }
        }
      }
    });

    if (!resource) {
      return res.status(404).json({
        status: 'error',
        message: 'Ressource non trouvée'
      });
    }

    // Réponse
    res.status(200).json({
      status: 'success',
      data: {
        resource
      }
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération de la ressource: ${error.message}`);
    
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération de la ressource'
    });
  }
};

/**
 * Créer une nouvelle ressource
 */
const createResource = async (req, res) => {
  try {
    // Validation des données
    const validatedData = createResourceSchema.parse(req.body);

    // Vérifier si le client existe
    const client = await req.prisma.client.findUnique({
      where: { id: validatedData.clientRef }
    });

    if (!client) {
      return res.status(400).json({
        status: 'error',
        message: 'Client non trouvé'
      });
    }

    // Création de la ressource
    const resource = await req.prisma.resource.create({
      data: validatedData
    });

    // Réponse
    res.status(201).json({
      status: 'success',
      message: 'Ressource créée avec succès',
      data: {
        resource
      }
    });
  } catch (error) {
    logger.error(`Erreur lors de la création de la ressource: ${error.message}`);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Données invalides',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la création de la ressource'
    });
  }
};

/**
 * Mettre à jour une ressource
 */
const updateResource = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si la ressource existe
    const existingResource = await req.prisma.resource.findUnique({
      where: { id }
    });

    if (!existingResource) {
      return res.status(404).json({
        status: 'error',
        message: 'Ressource non trouvée'
      });
    }

    // Validation des données
    const validatedData = updateResourceSchema.parse(req.body);

    // Si clientRef est modifié, vérifier si le client existe
    if (validatedData.clientRef && validatedData.clientRef !== existingResource.clientRef) {
      const client = await req.prisma.client.findUnique({
        where: { id: validatedData.clientRef }
      });

      if (!client) {
        return res.status(400).json({
          status: 'error',
          message: 'Client non trouvé'
        });
      }
    }

    // Mise à jour de la ressource
    const updatedResource = await req.prisma.resource.update({
      where: { id },
      data: validatedData
    });

    // Réponse
    res.status(200).json({
      status: 'success',
      message: 'Ressource mise à jour avec succès',
      data: {
        resource: updatedResource
      }
    });
  } catch (error) {
    logger.error(`Erreur lors de la mise à jour de la ressource: ${error.message}`);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Données invalides',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la mise à jour de la ressource'
    });
  }
};

/**
 * Supprimer une ressource
 */
const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si la ressource existe
    const existingResource = await req.prisma.resource.findUnique({
      where: { id }
    });

    if (!existingResource) {
      return res.status(404).json({
        status: 'error',
        message: 'Ressource non trouvée'
      });
    }

    // Supprimer la ressource
    await req.prisma.resource.delete({
      where: { id }
    });

    // Réponse
    res.status(200).json({
      status: 'success',
      message: 'Ressource supprimée avec succès'
    });
  } catch (error) {
    logger.error(`Erreur lors de la suppression de la ressource: ${error.message}`);
    
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la suppression de la ressource'
    });
  }
};

/**
 * Récupérer le statut d'une ressource
 */
const getResourceStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Récupération de la ressource
    const resource = await req.prisma.resource.findUnique({
      where: { id },
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
      return res.status(404).json({
        status: 'error',
        message: 'Ressource non trouvée'
      });
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

    // Réponse
    res.status(200).json({
      status: 'success',
      data: {
        id: resource.id,
        name: resource.name,
        status,
        lastCheckTimestamp: resource.lastControl,
        lastChangeTimestamp: resource.lastChange,
        nextCheckTimestamp: resource.nextcheck,
        disabled: resource.dontcheck === 1,
        errorReason: resource.reason,
        lastExecutionTime: resource.elapsed
      }
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération du statut de la ressource: ${error.message}`);
    
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération du statut de la ressource'
    });
  }
};

/**
 * Récupérer les logs d'une ressource
 */
const getResourceLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 100 } = req.query;

    // Vérifier si la ressource existe
    const existingResource = await req.prisma.resource.findUnique({
      where: { id }
    });

    if (!existingResource) {
      return res.status(404).json({
        status: 'error',
        message: 'Ressource non trouvée'
      });
    }

    // Récupérer les logs
    const logs = await req.prisma.log.findMany({
      where: { resourceId: id },
      orderBy: { timestamp: 'desc' },
      take: Number(limit)
    });

    // Réponse
    res.status(200).json({
      status: 'success',
      data: {
        logs
      }
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération des logs de la ressource: ${error.message}`);
    
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des logs de la ressource'
    });
  }
};

/**
 * Récupérer les captures d'écran d'une ressource
 */
const getResourceScreenshots = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20 } = req.query;

    // Vérifier si la ressource existe
    const existingResource = await req.prisma.resource.findUnique({
      where: { id }
    });

    if (!existingResource) {
      return res.status(404).json({
        status: 'error',
        message: 'Ressource non trouvée'
      });
    }

    // Récupérer les captures d'écran
    const screenshots = await req.prisma.screenshot.findMany({
      where: { resourceId: id },
      orderBy: { timestamp: 'desc' },
      take: Number(limit)
    });

    // Réponse
    res.status(200).json({
      status: 'success',
      data: {
        screenshots
      }
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération des captures d'écran de la ressource: ${error.message}`);
    
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la récupération des captures d\'écran de la ressource'
    });
  }
};

/**
 * Exécuter une ressource (scénario)
 */
const executeResource = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si la ressource existe
    const resource = await req.prisma.resource.findUnique({
      where: { id }
    });

    if (!resource) {
      return res.status(404).json({
        status: 'error',
        message: 'Ressource non trouvée'
      });
    }

    // Vérifier si la ressource est un scénario
    if (!resource.scenarioContent) {
      return res.status(400).json({
        status: 'error',
        message: 'Cette ressource n\'est pas un scénario exécutable'
      });
    }

    // Logique d'exécution du scénario (implémentation simplifiée)
    logger.info(`Démarrage de l'exécution du scénario ${resource.name} (${id})`);

    // Insérer un log pour le démarrage de l'exécution
    await req.prisma.log.create({
      data: {
        resourceId: id,
        resourceName: resource.name,
        level: 'info',
        message: `Exécution du scénario démarrée manuellement par ${req.user.name}`,
        metadata: {
          userId: req.user.id,
          userName: req.user.name,
          manual: true
        }
      }
    });

    // Mise à jour de la ressource pour indiquer qu'elle est en cours d'exécution
    await req.prisma.resource.update({
      where: { id },
      data: {
        jobId: `manual-${Date.now()}`,
        lastControl: Math.floor(Date.now() / 1000)
      }
    });

    // Dans une implémentation réelle, nous enverrions la tâche à un worker
    // Pour cet exemple, nous simulons simplement une réponse réussie

    // Réponse immédiate pour indiquer que l'exécution a été démarrée
    res.status(200).json({
      status: 'success',
      message: 'Exécution du scénario démarrée',
      data: {
        resourceId: id,
        resourceName: resource.name,
        jobId: `manual-${Date.now()}`,
        startTime: new Date().toISOString()
      }
    });

    // Dans une implémentation réelle, le reste du traitement serait fait de manière asynchrone
    // et les résultats seraient envoyés via WebSockets ou stockés pour être récupérés ultérieurement
  } catch (error) {
    logger.error(`Erreur lors de l'exécution de la ressource: ${error.message}`);
    
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de l\'exécution de la ressource'
    });
  }
};

module.exports = {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  getResourceStatus,
  getResourceLogs,
  getResourceScreenshots,
  executeResource
};
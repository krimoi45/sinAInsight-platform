const express = require('express');
const resourceController = require('../controllers/resource.controller');
const { authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @route GET /api/resources
 * @description Récupérer toutes les ressources avec filtrage
 * @access Private
 */
router.get('/', resourceController.getAllResources);

/**
 * @route GET /api/resources/:id
 * @description Récupérer une ressource par son ID
 * @access Private
 */
router.get('/:id', resourceController.getResourceById);

/**
 * @route POST /api/resources
 * @description Créer une nouvelle ressource
 * @access Private - Admin only
 */
router.post('/', authorize(['admin']), resourceController.createResource);

/**
 * @route PUT /api/resources/:id
 * @description Mettre à jour une ressource
 * @access Private - Admin only
 */
router.put('/:id', authorize(['admin']), resourceController.updateResource);

/**
 * @route DELETE /api/resources/:id
 * @description Supprimer une ressource
 * @access Private - Admin only
 */
router.delete('/:id', authorize(['admin']), resourceController.deleteResource);

/**
 * @route GET /api/resources/:id/status
 * @description Récupérer le statut d'une ressource
 * @access Private
 */
router.get('/:id/status', resourceController.getResourceStatus);

/**
 * @route GET /api/resources/:id/logs
 * @description Récupérer les logs d'une ressource
 * @access Private
 */
router.get('/:id/logs', resourceController.getResourceLogs);

/**
 * @route GET /api/resources/:id/screenshots
 * @description Récupérer les captures d'écran d'une ressource
 * @access Private
 */
router.get('/:id/screenshots', resourceController.getResourceScreenshots);

/**
 * @route POST /api/resources/:id/execute
 * @description Exécuter une ressource (scénario)
 * @access Private
 */
router.post('/:id/execute', resourceController.executeResource);

module.exports = router;
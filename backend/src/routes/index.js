const express = require('express');
const authRoutes = require('./auth.routes');
const resourceRoutes = require('./resource.routes');
const alertRoutes = require('./alert.routes');
const screenshotRoutes = require('./screenshot.routes');
const logRoutes = require('./log.routes');
const probeRoutes = require('./probe.routes');
const schedulerRoutes = require('./scheduler.routes');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

// Routes publiques
router.use('/auth', authRoutes);

// Routes protégées
router.use('/resources', authenticate, resourceRoutes);
router.use('/alerts', authenticate, alertRoutes);
router.use('/screenshots', authenticate, screenshotRoutes);
router.use('/logs', authenticate, logRoutes);
router.use('/probes', authenticate, probeRoutes);
router.use('/schedulers', authenticate, schedulerRoutes);

module.exports = router;
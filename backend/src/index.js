require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const routes = require('./routes');
const logger = require('./utils/logger');
const { setupSocketHandlers } = require('./socket');

// Initialisation du client Prisma
const prisma = new PrismaClient();

// Création de l'application Express
const app = express();
const httpServer = createServer(app);

// Configuration de Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    methods: ['GET', 'POST']
  }
});

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Middleware pour injecter prisma dans les requêtes
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Routes API
app.use('/api', routes);

// Route de base
app.get('/', (req, res) => {
  res.json({ message: 'SinAInsight API is running' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

// Configuration des gestionnaires de Socket.io
setupSocketHandlers(io, prisma);

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Gestion de la fermeture propre
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = app;
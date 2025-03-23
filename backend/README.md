# SinAInsight Backend

API et services pour la plateforme SinAInsight.

## Technologies

- Node.js avec Express
- Prisma comme ORM pour MongoDB Atlas
- Socket.io pour les communications en temps réel
- Services d'IA open source (LLama-3/Mistral, DeepDetect)

## Installation

```bash
npm install
```

## Configuration

Créez un fichier `.env` basé sur `.env.example` avec vos paramètres de connexion MongoDB Atlas.

## Démarrage

```bash
npm start
```

L'API sera disponible sur http://localhost:3000/
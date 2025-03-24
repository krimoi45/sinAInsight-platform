Guide de déploiement du projet sinAInsight-platform sur un VPS
Prérequis
Vous aurez besoin d'un VPS avec les caractéristiques minimales suivantes:

Linux (Ubuntu 20.04 ou plus récent recommandé)
4 Go de RAM minimum (8 Go recommandés)
2 vCPUs ou plus
50 Go d'espace disque
Accès SSH avec privilèges sudo

Étape 1: Préparation du VPS

Connectez-vous à votre VPS via SSH:
Copierssh root@votre_adresse_ip

Mettez à jour le système:
Copierapt update && apt upgrade -y

Installez les dépendances système nécessaires:
Copierapt install -y git curl build-essential nginx

Configurez le pare-feu (UFW):
Copierufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable


Étape 2: Installation de Docker et Docker Compose

Installez Docker:
Copiercurl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

Installez Docker Compose:
Copiercurl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

Ajoutez votre utilisateur au groupe Docker (si vous n'utilisez pas root):
Copierusermod -aG docker $USER


Étape 3: Récupération et configuration du projet

Clonez le dépôt du projet:
Copiergit clone https://github.com/votreusername/sinAInsight-platform.git
cd sinAInsight-platform

Créez les fichiers d'environnement:
Copiercp .env.example .env

Modifiez le fichier .env avec vos paramètres:
Copiernano .env
Assurez-vous de configurer:

La connexion à la base de données MongoDB (DATABASE_URL)
Les clés de sécurité (NEXTAUTH_SECRET, SESSION_SECRET)
L'URL de l'API Ollama si applicable (OLLAMA_API_URL)
Les paramètres SMTP pour les notifications par email



Étape 4: Configuration de la base de données

Pour MongoDB, vous avez deux options:
Option 1: MongoDB dans un conteneur Docker
Copiermkdir -p data/mongodb
docker run -d --name mongodb -v $(pwd)/data/mongodb:/data/db -p 27017:27017 mongo:latest
Option 2: MongoDB Atlas (service cloud)

Créez un compte sur MongoDB Atlas
Configurez un cluster et obtenez votre chaîne de connexion
Mettez à jour la variable DATABASE_URL dans le fichier .env


Initialisez la base de données avec Prisma:
Copiercd backend
npm install
npx prisma generate
npx prisma db push


Étape 5: Construction et déploiement en environnement de test

Construisez les conteneurs Docker:
Copierdocker-compose -f docker-compose.dev.yml build

Démarrez l'environnement de test:
Copierdocker-compose -f docker-compose.dev.yml up -d

Vérifiez que les services sont opérationnels:
Copierdocker-compose -f docker-compose.dev.yml ps

Accédez à l'application à l'adresse http://votre_adresse_ip:3000

Étape 6: Tests et validation

Exécutez les tests automatisés:
Copierdocker-compose -f docker-compose.dev.yml exec backend npm test

Effectuez les tests manuels en vérifiant:

La création de compte et l'authentification
La création et la gestion des modèles de prédiction
Le fonctionnement des tableaux de bord et visualisations
L'orchestration des scénarios
Les alertes et notifications



Étape 7: Déploiement en production
Après avoir validé l'environnement de test, procédez au déploiement en production:

Arrêtez l'environnement de test:
Copierdocker-compose -f docker-compose.dev.yml down

Configurez le fichier .env pour la production:
Copiercp .env .env.prod
nano .env.prod
Modifiez les paramètres pour la production:

NODE_ENV=production
Ajustez les limites de ressources
Configurez les domaines de production


Construisez et démarrez les conteneurs de production:
Copierdocker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d


Étape 8: Configuration de Nginx comme proxy inverse

Créez un fichier de configuration Nginx:
Copiernano /etc/nginx/sites-available/sinAInsight

Ajoutez la configuration suivante:
Copierserver {
    listen 80;
    server_name votre_domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

Activez la configuration:
Copierln -s /etc/nginx/sites-available/sinAInsight /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx


Étape 9: Configuration SSL avec Let's Encrypt

Installez Certbot:
Copierapt install -y certbot python3-certbot-nginx

Obtenez un certificat SSL:
Copiercertbot --nginx -d votre_domaine.com

Configurez le renouvellement automatique:
Copierecho "0 3 * * * root certbot renew --quiet" | sudo tee -a /etc/crontab > /dev/null


Étape 10: Surveillance et maintenance

Mettez en place la surveillance du système:
Copierdocker-compose -f docker-compose.prod.yml exec backend npm run setup-monitoring

Configurez les sauvegardes automatiques de la base de données:
Copiermkdir -p /backups/mongodb
echo "0 2 * * * root docker exec mongodb mongodump --out=/data/backup && cp -r /data/mongodb/backup/* /backups/mongodb/" | sudo tee -a /etc/crontab > /dev/null

Configurez la rotation des journaux:
Copierapt install -y logrotate


Étape 11: Mise à jour de l'application
Pour mettre à jour l'application lors des futures versions:

Arrêtez les conteneurs:
Copierdocker-compose -f docker-compose.prod.yml down

Récupérez les dernières modifications:
Copiergit pull origin main

Reconstruisez et redémarrez les conteneurs:
Copierdocker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d


Votre application sinAInsight-platform devrait maintenant être opérationnelle sur votre VPS, accessible via HTTPS, avec une configuration robuste pour un environnement de production.

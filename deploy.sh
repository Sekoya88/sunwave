#!/bin/bash

# Arrête le script en cas d'erreur
set -e

echo "🚀 Déploiement de sun-wave.site"

# Création des dossiers nécessaires
mkdir -p certbot/conf
mkdir -p certbot/www
mkdir -p logs

# Vérifie si Docker et Docker Compose sont installés
if ! [ -x "$(command -v docker)" ]; then
  echo "❌ Docker n'est pas installé. Veuillez l'installer avant de continuer."
  exit 1
fi

if ! [ -x "$(command -v docker-compose)" ]; then
  echo "❌ Docker Compose n'est pas installé. Veuillez l'installer avant de continuer."
  exit 1
fi

# Pull des images Docker nécessaires
echo "📦 Téléchargement des images Docker..."
docker pull python:3.8-slim
docker pull nginx:latest
docker pull certbot/certbot

# Construction des conteneurs
echo "🏗️ Construction des conteneurs..."
docker-compose build

# Démarrage de Nginx pour Let's Encrypt
echo "🔒 Configuration du certificat SSL pour sun-wave.site..."
docker-compose up -d nginx

# Attente pour s'assurer que Nginx est prêt
sleep 5

# Génération du certificat SSL avec Let's Encrypt
docker-compose up --force-recreate certbot

# Rechargement de Nginx pour appliquer le certificat
docker exec $(docker-compose ps -q nginx) nginx -s reload

# Démarrage de tous les services
echo "🌐 Démarrage de tous les services..."
docker-compose up -d

echo "✅ Déploiement terminé ! sun-wave.site est maintenant en ligne."
echo "📊 Vérifiez le statut avec: docker-compose ps" 
#!/bin/bash

# Script de renouvellement automatique du certificat SSL
# À placer dans cron pour exécution régulière: 
# 0 0 1 * * /chemin/vers/renew_ssl.sh > /var/log/renew_ssl.log 2>&1

# Arrête le script en cas d'erreur
set -e

echo "🔄 Renouvellement du certificat SSL pour sun-wave.site"
echo "Date: $(date)"

# Vérifier que Docker est en marche
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker n'est pas en cours d'exécution. Démarrage de Docker..."
  systemctl start docker
  sleep 10
fi

# Renouveler le certificat
echo "🔒 Renouvellement du certificat..."
docker-compose run --rm certbot renew

# Recharger NGINX pour appliquer les nouveaux certificats
echo "🔄 Rechargement de la configuration NGINX..."
docker exec $(docker-compose ps -q nginx) nginx -s reload

echo "✅ Renouvellement terminé!" 
#!/bin/bash

# Script de sauvegarde pour SunWave.fr
# À exécuter périodiquement via cron
# 0 2 * * * /chemin/vers/backup.sh > /var/log/backup.log 2>&1

# Configuration
BACKUP_DIR="/backups/sunwave"
DATE=$(date +%Y-%m-%d)
APP_DIR="/chemin/vers/application"
RETENTION_DAYS=30

# Créer le répertoire de sauvegarde s'il n'existe pas
mkdir -p "$BACKUP_DIR"

echo "🔄 Démarrage de la sauvegarde - $(date)"

# Sauvegarde des certificats SSL
echo "📦 Sauvegarde des certificats SSL..."
tar -czf "$BACKUP_DIR/certbot-$DATE.tar.gz" "$APP_DIR/certbot/conf"

# Sauvegarde des logs
echo "📝 Sauvegarde des logs..."
tar -czf "$BACKUP_DIR/logs-$DATE.tar.gz" "$APP_DIR/logs"

# Sauvegarde de la configuration
echo "⚙️ Sauvegarde de la configuration..."
cp "$APP_DIR/.env" "$BACKUP_DIR/.env-$DATE"
cp "$APP_DIR/docker-compose.yml" "$BACKUP_DIR/docker-compose-$DATE.yml"
cp "$APP_DIR/nginx/default.conf" "$BACKUP_DIR/nginx-default-$DATE.conf"

# Suppression des anciennes sauvegardes
echo "🧹 Nettoyage des anciennes sauvegardes (plus de $RETENTION_DAYS jours)..."
find "$BACKUP_DIR" -name "*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.yml" -type f -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.conf" -type f -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name ".env-*" -type f -mtime +$RETENTION_DAYS -delete

echo "✅ Sauvegarde terminée - $(date)" 
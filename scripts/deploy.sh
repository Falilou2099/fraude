#!/bin/bash

# Script de déploiement pour EC2
# Ce script automatise le déploiement de l'application Component Dashboard sur une instance EC2

set -e  # Arrêter le script en cas d'erreur

echo "🚀 Début du déploiement Component Dashboard sur EC2..."

# Variables
APP_DIR="/var/www/component-dashboard"
SERVICE_NAME="component-dashboard"
USER="ubuntu"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Fonction pour vérifier si une commande existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Mise à jour du système
log_info "Mise à jour du système..."
sudo apt update && sudo apt upgrade -y

# 2. Installation de Node.js 18.x
if ! command_exists node; then
    log_info "Installation de Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    log_info "Node.js déjà installé: $(node --version)"
fi

# 3. Installation de PM2 pour la gestion des processus
if ! command_exists pm2; then
    log_info "Installation de PM2..."
    sudo npm install -g pm2
else
    log_info "PM2 déjà installé: $(pm2 --version)"
fi

# 4. Installation de Nginx
if ! command_exists nginx; then
    log_info "Installation de Nginx..."
    sudo apt install -y nginx
    sudo systemctl enable nginx
else
    log_info "Nginx déjà installé"
fi

# 5. Création du répertoire de l'application
log_info "Création du répertoire de l'application..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# 6. Clonage ou mise à jour du code (remplacer par votre repo)
if [ -d "$APP_DIR/.git" ]; then
    log_info "Mise à jour du code existant..."
    cd $APP_DIR
    git pull origin main
else
    log_info "Clonage du repository..."
    # Remplacer par votre URL de repository
    # git clone https://github.com/votre-username/component-dashboard.git $APP_DIR
    # Pour ce script, on copie les fichiers depuis le répertoire courant
    cp -r . $APP_DIR/
    cd $APP_DIR
fi

# 7. Installation des dépendances
log_info "Installation des dépendances..."
npm ci --production

# 8. Configuration des variables d'environnement
log_info "Configuration des variables d'environnement..."
if [ ! -f "$APP_DIR/.env" ]; then
    log_warn "Fichier .env non trouvé. Créez-le à partir de env.example"
    cp env.example .env
    log_warn "⚠️  IMPORTANT: Modifiez le fichier .env avec vos vraies valeurs!"
fi

# 9. Génération du client Prisma et migration de la base de données
log_info "Génération du client Prisma..."
npx prisma generate

log_info "Migration de la base de données..."
npx prisma migrate deploy

# 10. Build de l'application
log_info "Build de l'application Next.js..."
npm run build

# 11. Configuration de PM2
log_info "Configuration de PM2..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$SERVICE_NAME',
    script: 'npm',
    args: 'start',
    cwd: '$APP_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/$SERVICE_NAME-error.log',
    out_file: '/var/log/pm2/$SERVICE_NAME-out.log',
    log_file: '/var/log/pm2/$SERVICE_NAME.log',
    time: true
  }]
};
EOF

# 12. Création du répertoire de logs PM2
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

# 13. Démarrage de l'application avec PM2
log_info "Démarrage de l'application..."
pm2 delete $SERVICE_NAME 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup | tail -1 | sudo bash

# 14. Configuration de Nginx
log_info "Configuration de Nginx..."
sudo tee /etc/nginx/sites-available/$SERVICE_NAME > /dev/null << EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# 15. Activation du site Nginx
sudo ln -sf /etc/nginx/sites-available/$SERVICE_NAME /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# 16. Configuration du firewall
log_info "Configuration du firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# 17. Vérification du déploiement
log_info "Vérification du déploiement..."
sleep 5

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    log_info "✅ Application déployée avec succès!"
    log_info "🌐 Votre application est accessible sur http://$(curl -s ifconfig.me)"
else
    log_error "❌ Erreur lors du déploiement"
    log_info "Vérifiez les logs avec: pm2 logs $SERVICE_NAME"
    exit 1
fi

# 18. Affichage des informations utiles
log_info "📋 Commandes utiles:"
echo "  - Voir les logs: pm2 logs $SERVICE_NAME"
echo "  - Redémarrer l'app: pm2 restart $SERVICE_NAME"
echo "  - Voir le statut: pm2 status"
echo "  - Recharger Nginx: sudo systemctl reload nginx"
echo "  - Voir les logs Nginx: sudo tail -f /var/log/nginx/access.log"

log_info "🎉 Déploiement terminé!"

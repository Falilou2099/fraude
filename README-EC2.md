# Guide Complet Amazon EC2 ☁️

Ce guide vous apprendra à créer, configurer et gérer une instance EC2 pour déployer votre application Component Dashboard avec une architecture de production robuste.

## 📋 Table des Matières

1. [Introduction à Amazon EC2](#introduction)
2. [Prérequis et préparation](#prérequis)
3. [Création d'une instance EC2](#création-instance)
4. [Configuration de sécurité](#configuration-sécurité)
5. [Connexion à l'instance](#connexion)
6. [Installation de l'environnement](#installation-environnement)
7. [Déploiement de l'application](#déploiement)
8. [Configuration du reverse proxy](#reverse-proxy)
9. [Monitoring et logs](#monitoring)
10. [Sauvegarde et snapshots](#sauvegarde)
11. [Mise à l'échelle](#mise-à-échelle)
12. [Optimisation des coûts](#optimisation-coûts)
13. [Dépannage](#dépannage)
14. [Bonnes pratiques](#bonnes-pratiques)

## 🎯 Introduction à Amazon EC2 {#introduction}

Amazon Elastic Compute Cloud (EC2) fournit une capacité de calcul redimensionnable dans le cloud. C'est l'équivalent d'un serveur virtuel que vous pouvez configurer selon vos besoins.

### Avantages d'EC2 :
- **Flexibilité** : Choix du système d'exploitation, CPU, mémoire, stockage
- **Scalabilité** : Redimensionnement vertical et horizontal
- **Fiabilité** : Infrastructure AWS haute disponibilité
- **Sécurité** : Isolation, chiffrement, contrôles d'accès
- **Économique** : Paiement à l'usage, instances réservées

### Types d'instances recommandées :
- **t3.micro** : Free tier, développement/test (1 vCPU, 1 GB RAM)
- **t3.small** : Petites applications (2 vCPU, 2 GB RAM)
- **t3.medium** : Applications moyennes (2 vCPU, 4 GB RAM)
- **c5.large** : Applications CPU-intensives (2 vCPU, 4 GB RAM)

## 🔧 Prérequis et préparation {#prérequis}

### Compte AWS
- Compte AWS actif avec droits EC2
- Carte de crédit valide (même pour free tier)
- Compréhension de base de Linux

### Outils locaux
```bash
# Installation AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configuration AWS CLI
aws configure
# AWS Access Key ID: [Votre clé]
# AWS Secret Access Key: [Votre clé secrète]
# Default region: eu-west-1
# Default output format: json
```

### Génération de clés SSH
```bash
# Génération d'une paire de clés
ssh-keygen -t rsa -b 4096 -f ~/.ssh/component-dashboard-key

# Permissions correctes
chmod 600 ~/.ssh/component-dashboard-key
chmod 644 ~/.ssh/component-dashboard-key.pub
```

## 🚀 Création d'une instance EC2 {#création-instance}

### Étape 1 : Accès à la console EC2

1. Connectez-vous à la [Console AWS](https://console.aws.amazon.com)
2. Région : Sélectionnez votre région (ex: eu-west-1)
3. Services > EC2 > Instances > "Launch Instance"

### Étape 2 : Configuration de l'instance

#### 1. Nom et tags
```
Name: component-dashboard-prod
Environment: production
Project: component-dashboard
```

#### 2. Image de machine Amazon (AMI)
- **Ubuntu Server 22.04 LTS** (recommandé)
- Architecture : 64-bit (x86)
- AMI ID : ami-0694d931cee176e7d (peut varier selon la région)

#### 3. Type d'instance
```
Développement: t3.micro (Free tier eligible)
Production:    t3.small ou t3.medium
Haute charge:  c5.large ou m5.large
```

#### 4. Paire de clés
- Créez une nouvelle paire : `component-dashboard-key`
- Format : `.pem` pour OpenSSH
- **Téléchargez et sauvegardez le fichier .pem**

#### 5. Paramètres réseau
```
VPC: Default VPC (ou votre VPC personnalisé)
Subnet: Public subnet (pour accès internet)
Auto-assign public IP: Enable
```

#### 6. Security Group
Créez un nouveau security group : `component-dashboard-sg`

**Règles d'entrée :**
```
SSH (22)     - Source: Your IP (203.0.113.25/32)
HTTP (80)    - Source: Anywhere (0.0.0.0/0)
HTTPS (443)  - Source: Anywhere (0.0.0.0/0)
Custom (3000)- Source: Anywhere (0.0.0.0/0) [Temporaire pour tests]
```

#### 7. Stockage
```
Volume 1 (Root): 
  - Type: gp3 (General Purpose SSD)
  - Size: 20 GB (minimum)
  - Encrypted: Yes
  - Delete on termination: Yes
```

### Étape 3 : Lancement

1. **Résumé** : Vérifiez la configuration
2. **Launch Instance**
3. **Temps de lancement** : 2-5 minutes

## 🔒 Configuration de sécurité {#configuration-sécurité}

### Security Groups détaillés

```bash
# Création via AWS CLI (optionnel)
aws ec2 create-security-group \
  --group-name component-dashboard-sg \
  --description "Security group for Component Dashboard"

# Règles SSH (votre IP uniquement)
aws ec2 authorize-security-group-ingress \
  --group-name component-dashboard-sg \
  --protocol tcp \
  --port 22 \
  --cidr 203.0.113.25/32

# Règles HTTP/HTTPS
aws ec2 authorize-security-group-ingress \
  --group-name component-dashboard-sg \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-name component-dashboard-sg \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0
```

### Elastic IP (recommandé pour production)

```bash
# Allocation d'une IP élastique
aws ec2 allocate-address --domain vpc

# Association à l'instance
aws ec2 associate-address \
  --instance-id i-1234567890abcdef0 \
  --allocation-id eipalloc-12345678
```

## 🔌 Connexion à l'instance {#connexion}

### Connexion SSH

```bash
# Permissions du fichier clé
chmod 600 ~/.ssh/component-dashboard-key.pem

# Connexion
ssh -i ~/.ssh/component-dashboard-key.pem ubuntu@your-public-ip

# Ou avec l'Elastic IP
ssh -i ~/.ssh/component-dashboard-key.pem ubuntu@your-elastic-ip
```

### Configuration SSH (optionnel)

Créez `~/.ssh/config` :

```
Host component-dashboard
    HostName your-elastic-ip
    User ubuntu
    IdentityFile ~/.ssh/component-dashboard-key.pem
    ServerAliveInterval 60
```

Puis connectez-vous simplement avec :
```bash
ssh component-dashboard
```

### Session Manager (alternative sécurisée)

```bash
# Installation du plugin Session Manager
curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/ubuntu_64bit/session-manager-plugin.deb" -o "session-manager-plugin.deb"
sudo dpkg -i session-manager-plugin.deb

# Connexion sans SSH
aws ssm start-session --target i-1234567890abcdef0
```

## 💻 Installation de l'environnement {#installation-environnement}

### Mise à jour du système

```bash
# Connexion à l'instance
ssh -i ~/.ssh/component-dashboard-key.pem ubuntu@your-ip

# Mise à jour
sudo apt update && sudo apt upgrade -y

# Installation des outils de base
sudo apt install -y curl wget git unzip htop tree
```

### Installation de Node.js

```bash
# Installation de Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérification
node --version  # v18.x.x
npm --version   # 9.x.x
```

### Installation de PM2

```bash
# Installation globale de PM2
sudo npm install -g pm2

# Configuration du démarrage automatique
pm2 startup
# Exécutez la commande affichée avec sudo
```

### Installation de Nginx

```bash
# Installation
sudo apt install -y nginx

# Démarrage et activation
sudo systemctl start nginx
sudo systemctl enable nginx

# Vérification
sudo systemctl status nginx
```

### Installation de PostgreSQL Client

```bash
# Pour se connecter à RDS
sudo apt install -y postgresql-client

# Test de connexion à RDS
psql -h your-rds-endpoint -U postgres -d component_dashboard
```

## 🚀 Déploiement de l'application {#déploiement}

### Méthode 1 : Déploiement automatique avec le script

```bash
# Copie du script de déploiement
scp -i ~/.ssh/component-dashboard-key.pem scripts/deploy.sh ubuntu@your-ip:~/

# Connexion et exécution
ssh -i ~/.ssh/component-dashboard-key.pem ubuntu@your-ip
chmod +x deploy.sh
./deploy.sh
```

### Méthode 2 : Déploiement manuel

```bash
# 1. Clonage du repository
git clone https://github.com/votre-username/component-dashboard.git
cd component-dashboard

# 2. Installation des dépendances
npm ci --production

# 3. Configuration de l'environnement
cp env.example .env
nano .env  # Modifiez avec vos vraies valeurs

# 4. Configuration Prisma
npx prisma generate
npx prisma migrate deploy

# 5. Build de l'application
npm run build

# 6. Configuration PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'component-dashboard',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# 7. Démarrage avec PM2
pm2 start ecosystem.config.js
pm2 save
```

## 🔄 Configuration du reverse proxy {#reverse-proxy}

### Configuration Nginx

```bash
# Création du fichier de configuration
sudo nano /etc/nginx/sites-available/component-dashboard
```

Contenu du fichier :

```nginx
server {
    listen 80;
    server_name your-domain.com your-elastic-ip;

    # Sécurité
    server_tokens off;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Proxy vers l'application Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Fichiers statiques (si applicable)
    location /static/ {
        alias /var/www/component-dashboard/public/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Logs
    access_log /var/log/nginx/component-dashboard.access.log;
    error_log /var/log/nginx/component-dashboard.error.log;
}
```

### Activation de la configuration

```bash
# Activation du site
sudo ln -s /etc/nginx/sites-available/component-dashboard /etc/nginx/sites-enabled/

# Suppression du site par défaut
sudo rm /etc/nginx/sites-enabled/default

# Test de la configuration
sudo nginx -t

# Redémarrage de Nginx
sudo systemctl restart nginx
```

### Configuration HTTPS avec Let's Encrypt

```bash
# Installation de Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtention du certificat SSL
sudo certbot --nginx -d your-domain.com

# Renouvellement automatique
sudo crontab -e
# Ajoutez cette ligne :
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring et logs {#monitoring}

### Configuration CloudWatch Agent

```bash
# Installation de l'agent CloudWatch
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb

# Configuration
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
```

### Monitoring avec PM2

```bash
# Monitoring en temps réel
pm2 monit

# Logs en temps réel
pm2 logs

# Métriques
pm2 show component-dashboard
```

### Logs système importants

```bash
# Logs de l'application
pm2 logs component-dashboard

# Logs Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs système
sudo journalctl -u nginx -f
sudo tail -f /var/log/syslog
```

### Script de monitoring personnalisé

```bash
# Créez /home/ubuntu/monitor.sh
cat > /home/ubuntu/monitor.sh << 'EOF'
#!/bin/bash

# Vérification de l'application
if ! curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "$(date): Application down, restarting..." >> /var/log/app-monitor.log
    pm2 restart component-dashboard
fi

# Vérification de Nginx
if ! systemctl is-active --quiet nginx; then
    echo "$(date): Nginx down, restarting..." >> /var/log/app-monitor.log
    sudo systemctl restart nginx
fi

# Nettoyage des logs (garde 7 jours)
find /var/log/nginx/ -name "*.log" -mtime +7 -delete
pm2 flush
EOF

chmod +x /home/ubuntu/monitor.sh

# Ajout au crontab (vérification toutes les 5 minutes)
crontab -e
# */5 * * * * /home/ubuntu/monitor.sh
```

## 💾 Sauvegarde et snapshots {#sauvegarde}

### Snapshots EBS automatiques

```bash
# Création d'un snapshot manuel
aws ec2 create-snapshot \
  --volume-id vol-1234567890abcdef0 \
  --description "Component Dashboard backup $(date +%Y%m%d)"

# Script de sauvegarde automatique
cat > /home/ubuntu/backup.sh << 'EOF'
#!/bin/bash
INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
VOLUME_ID=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].BlockDeviceMappings[0].Ebs.VolumeId' --output text)

aws ec2 create-snapshot \
  --volume-id $VOLUME_ID \
  --description "Auto backup $(date +%Y%m%d-%H%M)"

# Suppression des snapshots anciens (garde 7 jours)
aws ec2 describe-snapshots --owner-ids self --query 'Snapshots[?StartTime<=`'$(date -d '7 days ago' --iso-8601)'`].SnapshotId' --output text | xargs -n 1 aws ec2 delete-snapshot --snapshot-id
EOF

chmod +x /home/ubuntu/backup.sh

# Sauvegarde quotidienne à 2h du matin
crontab -e
# 0 2 * * * /home/ubuntu/backup.sh
```

### Sauvegarde de l'application

```bash
# Script de sauvegarde de l'application
cat > /home/ubuntu/app-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d-%H%M)

mkdir -p $BACKUP_DIR

# Sauvegarde du code
tar -czf $BACKUP_DIR/app-$DATE.tar.gz /var/www/component-dashboard

# Sauvegarde de la configuration
cp /etc/nginx/sites-available/component-dashboard $BACKUP_DIR/nginx-$DATE.conf

# Nettoyage (garde 30 jours)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.conf" -mtime +30 -delete
EOF

chmod +x /home/ubuntu/app-backup.sh
```

## 📈 Mise à l'échelle {#mise-à-échelle}

### Redimensionnement vertical

```bash
# Arrêt de l'instance
aws ec2 stop-instances --instance-ids i-1234567890abcdef0

# Modification du type d'instance
aws ec2 modify-instance-attribute \
  --instance-id i-1234567890abcdef0 \
  --instance-type Value=t3.medium

# Redémarrage
aws ec2 start-instances --instance-ids i-1234567890abcdef0
```

### Load Balancer (mise à l'échelle horizontale)

1. **Application Load Balancer (ALB)**
   - Créez un ALB dans la console EC2
   - Configurez les target groups
   - Ajoutez vos instances EC2

2. **Auto Scaling Group**
   - Créez un launch template
   - Configurez l'Auto Scaling Group
   - Définissez les politiques de scaling

### Configuration pour le clustering

```javascript
// ecosystem.config.js pour plusieurs instances
module.exports = {
  apps: [{
    name: 'component-dashboard',
    script: 'npm',
    args: 'start',
    instances: 0, // 0 = nombre de CPU
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    max_memory_restart: '1G'
  }]
};
```

## 💰 Optimisation des coûts {#optimisation-coûts}

### Reserved Instances

```bash
# Recherche d'instances réservées
aws ec2 describe-reserved-instances-offerings \
  --instance-type t3.small \
  --product-description "Linux/UNIX"

# Achat d'une instance réservée (1 an)
aws ec2 purchase-reserved-instances-offering \
  --reserved-instances-offering-id 12345678-1234-1234-1234-123456789012 \
  --instance-count 1
```

### Spot Instances (pour dev/test)

```bash
# Lancement d'une Spot Instance
aws ec2 request-spot-instances \
  --spot-price "0.05" \
  --instance-count 1 \
  --type "one-time" \
  --launch-specification file://spot-specification.json
```

### Monitoring des coûts

1. **AWS Cost Explorer** : Analysez vos coûts
2. **Budgets** : Créez des alertes de coût
3. **Trusted Advisor** : Recommandations d'optimisation

## 🔧 Dépannage {#dépannage}

### Problèmes de connexion SSH

```bash
# Vérification du Security Group
aws ec2 describe-security-groups --group-names component-dashboard-sg

# Test de connectivité
telnet your-ip 22

# Logs de connexion SSH
sudo tail -f /var/log/auth.log
```

### Problèmes d'application

```bash
# Statut PM2
pm2 status

# Logs détaillés
pm2 logs component-dashboard --lines 100

# Redémarrage de l'application
pm2 restart component-dashboard

# Monitoring des ressources
htop
df -h
free -h
```

### Problèmes Nginx

```bash
# Test de la configuration
sudo nginx -t

# Statut du service
sudo systemctl status nginx

# Logs d'erreur
sudo tail -f /var/log/nginx/error.log

# Redémarrage
sudo systemctl restart nginx
```

### Problèmes de performance

```bash
# Monitoring en temps réel
htop
iotop
netstat -tulpn

# Analyse des logs
sudo tail -f /var/log/syslog | grep -i error

# Espace disque
df -h
du -sh /var/log/*
```

## ✅ Bonnes pratiques {#bonnes-pratiques}

### Sécurité

1. **Mise à jour régulière** du système
2. **Firewall** configuré (ufw ou Security Groups)
3. **Clés SSH** sécurisées, pas de mot de passe root
4. **Accès limité** aux ports nécessaires
5. **Monitoring** des tentatives de connexion
6. **Chiffrement** des volumes EBS

### Performance

1. **Monitoring** continu des métriques
2. **Load balancing** pour la haute charge
3. **CDN** pour les assets statiques
4. **Cache** approprié (Redis/Memcached)
5. **Optimisation** des requêtes base de données

### Disponibilité

1. **Multi-AZ** deployment
2. **Health checks** automatiques
3. **Auto Scaling** configuré
4. **Sauvegardes** automatiques
5. **Plan de disaster recovery**

### Coûts

1. **Right-sizing** des instances
2. **Reserved Instances** pour la production
3. **Spot Instances** pour dev/test
4. **Monitoring** des coûts
5. **Nettoyage** des ressources inutilisées

## 📚 Ressources supplémentaires

- [Documentation EC2](https://docs.aws.amazon.com/ec2/)
- [Best Practices EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-best-practices.html)
- [Security Groups](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-security-groups.html)
- [Instance Types](https://aws.amazon.com/ec2/instance-types/)
- [Pricing Calculator](https://calculator.aws/#/)

## 🆘 Support

En cas de problème :

1. **AWS Support Center**
2. **AWS Forums**
3. **Stack Overflow** (tag: amazon-ec2)
4. **AWS Documentation**
5. **AWS Training and Certification**

---

**💡 Conseil** : Commencez toujours par une instance t3.micro (free tier) pour vous familiariser avec EC2 avant de passer en production.

**⚠️ Important** : N'oubliez jamais d'arrêter vos instances de test pour éviter des frais inattendus !

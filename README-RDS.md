# Guide Complet Amazon RDS 🗄️

Ce guide vous apprendra à créer, configurer et gérer une base de données PostgreSQL sur Amazon RDS pour votre application Component Dashboard.

## 📋 Table des Matières

1. [Introduction à Amazon RDS](#introduction)
2. [Prérequis](#prérequis)
3. [Création d'une instance RDS PostgreSQL](#création-instance)
4. [Configuration de sécurité](#configuration-sécurité)
5. [Connexion à la base de données](#connexion)
6. [Migration et gestion des données](#migration)
7. [Monitoring et maintenance](#monitoring)
8. [Sauvegarde et restauration](#sauvegarde)
9. [Optimisation des performances](#optimisation)
10. [Dépannage](#dépannage)
11. [Bonnes pratiques](#bonnes-pratiques)

## 🎯 Introduction à Amazon RDS {#introduction}

Amazon Relational Database Service (RDS) est un service de base de données relationnelle managé qui simplifie la configuration, l'exploitation et la mise à l'échelle d'une base de données dans le cloud AWS.

### Avantages d'RDS :
- **Gestion automatisée** : Sauvegardes, mises à jour, monitoring
- **Haute disponibilité** : Multi-AZ, réplication automatique
- **Sécurité** : Chiffrement, isolation réseau, IAM
- **Scalabilité** : Redimensionnement vertical et horizontal
- **Monitoring** : CloudWatch intégré

## 🔧 Prérequis {#prérequis}

### Compte AWS
- Compte AWS actif avec droits administrateur
- AWS CLI configuré (optionnel mais recommandé)

### Connaissances requises
- Bases de PostgreSQL
- Concepts réseau AWS (VPC, Subnets, Security Groups)
- Notions de sécurité AWS

### Outils nécessaires
```bash
# Installation AWS CLI (optionnel)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Vérification
aws --version
```

## 🚀 Création d'une instance RDS PostgreSQL {#création-instance}

### Étape 1 : Accès à la console RDS

1. Connectez-vous à la [Console AWS](https://console.aws.amazon.com)
2. Recherchez "RDS" dans la barre de recherche
3. Cliquez sur "Amazon RDS"

### Étape 2 : Création de la base de données

1. **Cliquez sur "Create database"**

2. **Choisir le moteur de base de données**
   - Sélectionnez "PostgreSQL"
   - Version recommandée : PostgreSQL 15.x (dernière stable)

3. **Modèle de déploiement**
   - **Production** : Multi-AZ, haute disponibilité
   - **Dev/Test** : Instance unique, moins cher
   - **Free tier** : Pour les tests (limitations importantes)

4. **Configuration de l'instance**
   ```
   DB instance identifier: component-dashboard-db
   Master username: postgres
   Master password: [Mot de passe fort - 12+ caractères]
   ```

5. **Classe d'instance**
   - **Production** : `db.t3.medium` ou plus
   - **Dev/Test** : `db.t3.micro` (éligible free tier)
   - **Stockage** : 20 GB minimum, SSD gp2

6. **Paramètres de connectivité**
   ```
   VPC: Default VPC (ou votre VPC personnalisé)
   Subnet group: default
   Public access: Yes (pour développement) / No (pour production)
   VPC security group: Créer nouveau
   ```

7. **Configuration additionnelle**
   ```
   Initial database name: component_dashboard
   Port: 5432 (par défaut PostgreSQL)
   Parameter group: default.postgres15
   Option group: default:postgres-15
   ```

8. **Sauvegarde**
   ```
   Backup retention period: 7 jours (minimum)
   Backup window: 03:00-04:00 UTC (heures creuses)
   ```

9. **Monitoring**
   - Activez "Enhanced monitoring" pour production
   - Intervalle : 60 secondes

10. **Maintenance**
    ```
    Auto minor version upgrade: Yes
    Maintenance window: sun:04:00-sun:05:00 UTC
    ```

### Étape 3 : Finalisation

1. **Estimation des coûts** : Vérifiez l'estimation mensuelle
2. **Cliquez sur "Create database"**
3. **Temps de création** : 10-20 minutes

## 🔒 Configuration de sécurité {#configuration-sécurité}

### Security Groups

1. **Accédez à EC2 > Security Groups**
2. **Trouvez le security group de votre RDS**
3. **Configurez les règles d'entrée** :

```
Type: PostgreSQL
Protocol: TCP
Port: 5432
Source: 
  - Pour développement: 0.0.0.0/0 (⚠️ Temporaire uniquement)
  - Pour production: Security Group de votre EC2
  - IP spécifique: Votre IP publique/32
```

### Exemple de configuration sécurisée pour production :

```
# Règle 1: Accès depuis les instances EC2
Type: PostgreSQL
Port: 5432
Source: sg-xxxxxxxxx (Security Group EC2)

# Règle 2: Accès depuis votre IP pour administration
Type: PostgreSQL
Port: 5432
Source: 203.0.113.25/32 (Votre IP publique)
```

### Chiffrement

- **Chiffrement au repos** : Activé par défaut sur les nouvelles instances
- **Chiffrement en transit** : Utilisez SSL/TLS

## 🔌 Connexion à la base de données {#connexion}

### Récupération des informations de connexion

1. **Console RDS > Databases**
2. **Cliquez sur votre instance**
3. **Onglet "Connectivity & security"**
4. **Notez l'endpoint** : `component-dashboard-db.xxxxxxxxx.eu-west-1.rds.amazonaws.com`

### Test de connexion avec psql

```bash
# Installation de psql (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql-client

# Test de connexion
psql -h component-dashboard-db.xxxxxxxxx.eu-west-1.rds.amazonaws.com \
     -U postgres \
     -d component_dashboard \
     -p 5432

# Saisir le mot de passe quand demandé
```

### Configuration de l'application

Créez le fichier `.env` :

```env
# Base de données PostgreSQL RDS
DATABASE_URL="postgresql://postgres:votre_mot_de_passe@component-dashboard-db.xxxxxxxxx.eu-west-1.rds.amazonaws.com:5432/component_dashboard"

NODE_ENV="production"
PORT=3000
SESSION_SECRET="votre-clé-secrète-super-forte"
```

### Test avec l'application

```bash
# Génération du client Prisma
npx prisma generate

# Test de connexion
npx prisma db push

# Migration (si vous avez des migrations)
npx prisma migrate deploy
```

## 📊 Migration et gestion des données {#migration}

### Initialisation du schéma

```bash
# 1. Génération du client Prisma
npx prisma generate

# 2. Création des tables
npx prisma db push

# 3. Vérification
npx prisma studio
```

### Migration depuis SQLite (si applicable)

```bash
# 1. Export des données SQLite
sqlite3 prisma/dev.db .dump > backup.sql

# 2. Conversion et import (script personnalisé nécessaire)
# Les types de données peuvent différer entre SQLite et PostgreSQL
```

### Seed des données initiales

```bash
# Initialisation des composants d'exemple
curl -X POST http://localhost:3000/api/components/init
```

## 📈 Monitoring et maintenance {#monitoring}

### CloudWatch Metrics

Métriques importantes à surveiller :

- **CPUUtilization** : < 80%
- **DatabaseConnections** : < 80% du maximum
- **FreeableMemory** : > 20% disponible
- **ReadLatency/WriteLatency** : < 20ms
- **FreeStorageSpace** : > 20% disponible

### Configuration d'alertes

```bash
# Exemple avec AWS CLI
aws cloudwatch put-metric-alarm \
  --alarm-name "RDS-CPU-High" \
  --alarm-description "RDS CPU utilization is high" \
  --metric-name CPUUtilization \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=DBInstanceIdentifier,Value=component-dashboard-db \
  --evaluation-periods 2
```

### Logs

```bash
# Activation des logs PostgreSQL
aws rds modify-db-instance \
  --db-instance-identifier component-dashboard-db \
  --cloudwatch-logs-configuration '{"LogTypes":["postgresql"]}'
```

## 💾 Sauvegarde et restauration {#sauvegarde}

### Sauvegardes automatiques

- **Rétention** : 7-35 jours (configurable)
- **Fenêtre** : Configurée lors de la création
- **Point-in-time recovery** : Jusqu'à 5 minutes

### Snapshots manuels

```bash
# Création d'un snapshot
aws rds create-db-snapshot \
  --db-instance-identifier component-dashboard-db \
  --db-snapshot-identifier component-dashboard-snapshot-$(date +%Y%m%d)
```

### Restauration

1. **Console RDS > Snapshots**
2. **Sélectionnez le snapshot**
3. **Actions > Restore snapshot**
4. **Configurez la nouvelle instance**

## ⚡ Optimisation des performances {#optimisation}

### Configuration PostgreSQL

Paramètres recommandés pour l'application :

```sql
-- Connexions simultanées
max_connections = 100

-- Mémoire partagée
shared_buffers = 256MB

-- Cache des requêtes
effective_cache_size = 1GB

-- Maintenance
maintenance_work_mem = 64MB
```

### Index recommandés

```sql
-- Index pour les composants
CREATE INDEX idx_components_created_at ON components(created_at DESC);
CREATE INDEX idx_components_category ON components(category);
CREATE INDEX idx_components_created_by ON components(created_by);

-- Index pour la recherche
CREATE INDEX idx_components_name_search ON components USING gin(to_tsvector('french', name));
CREATE INDEX idx_components_description_search ON components USING gin(to_tsvector('french', description));
```

### Pool de connexions

Configuration recommandée avec Prisma :

```javascript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Configuration du pool
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + "?connection_limit=20&pool_timeout=20"
    }
  }
});
```

## 🔧 Dépannage {#dépannage}

### Problèmes de connexion

```bash
# Test de connectivité réseau
telnet component-dashboard-db.xxxxxxxxx.eu-west-1.rds.amazonaws.com 5432

# Vérification DNS
nslookup component-dashboard-db.xxxxxxxxx.eu-west-1.rds.amazonaws.com

# Test avec timeout
timeout 10 psql -h your-endpoint -U postgres -d component_dashboard
```

### Erreurs courantes

1. **"Connection refused"**
   - Vérifiez le Security Group
   - Vérifiez que l'instance est "Available"

2. **"Authentication failed"**
   - Vérifiez le nom d'utilisateur/mot de passe
   - Vérifiez le nom de la base de données

3. **"SSL connection required"**
   ```env
   DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
   ```

4. **"Too many connections"**
   - Vérifiez le paramètre `max_connections`
   - Implémentez un pool de connexions

### Logs utiles

```bash
# Logs CloudWatch
aws logs describe-log-groups --log-group-name-prefix /aws/rds/instance

# Logs d'erreur PostgreSQL
aws logs get-log-events \
  --log-group-name /aws/rds/instance/component-dashboard-db/postgresql \
  --log-stream-name postgresql.log.2024-01-15-12
```

## ✅ Bonnes pratiques {#bonnes-pratiques}

### Sécurité

1. **Jamais d'accès public en production**
2. **Utilisez des Security Groups restrictifs**
3. **Chiffrement activé (au repos et en transit)**
4. **Rotation régulière des mots de passe**
5. **Utilisez IAM Database Authentication si possible**

### Performance

1. **Monitoring continu des métriques**
2. **Index appropriés sur les colonnes fréquemment requêtées**
3. **Pool de connexions configuré**
4. **Requêtes optimisées avec EXPLAIN**

### Coûts

1. **Dimensionnement approprié de l'instance**
2. **Utilisation des Reserved Instances pour la production**
3. **Monitoring du stockage utilisé**
4. **Nettoyage régulier des anciens snapshots**

### Haute disponibilité

1. **Multi-AZ pour la production**
2. **Read Replicas pour la scalabilité en lecture**
3. **Sauvegardes automatiques activées**
4. **Plan de disaster recovery documenté**

## 📚 Ressources supplémentaires

- [Documentation officielle RDS](https://docs.aws.amazon.com/rds/)
- [PostgreSQL sur RDS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)
- [Bonnes pratiques RDS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.html)
- [Pricing Calculator](https://calculator.aws/#/createCalculator/RDS)

## 🆘 Support

En cas de problème :

1. **Vérifiez les logs CloudWatch**
2. **Consultez AWS Health Dashboard**
3. **Utilisez AWS Support (selon votre plan)**
4. **Forums AWS et Stack Overflow**

---

**💡 Conseil** : Commencez toujours par un environnement de test avant de déployer en production !

**⚠️ Important** : Les coûts RDS peuvent s'accumuler rapidement. Surveillez votre facturation AWS régulièrement.

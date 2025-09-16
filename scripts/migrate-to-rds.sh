#!/bin/bash

# Script de migration vers RDS PostgreSQL
# Ce script prépare et migre la base de données locale vers RDS

set -e

echo "🚀 Script de migration vers RDS PostgreSQL"
echo "=========================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérification des prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    # Vérifier si Node.js est installé
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé"
        exit 1
    fi
    
    # Vérifier si npm est installé
    if ! command -v npm &> /dev/null; then
        log_error "npm n'est pas installé"
        exit 1
    fi
    
    # Vérifier si Prisma CLI est disponible
    if ! command -v npx &> /dev/null; then
        log_error "npx n'est pas disponible"
        exit 1
    fi
    
    # Vérifier si psql est installé (optionnel)
    if ! command -v psql &> /dev/null; then
        log_warning "psql n'est pas installé. Recommandé pour les tests de connexion."
    fi
    
    log_success "Prérequis vérifiés"
}

# Configuration des variables d'environnement
setup_environment() {
    log_info "Configuration de l'environnement..."
    
    # Vérifier si le fichier .env existe
    if [ ! -f .env ]; then
        if [ -f env.example ]; then
            log_info "Copie du fichier env.example vers .env"
            cp env.example .env
            log_warning "Veuillez modifier le fichier .env avec vos vraies valeurs RDS"
            log_warning "DATABASE_URL doit pointer vers votre instance RDS PostgreSQL"
            echo ""
            echo "Exemple de DATABASE_URL pour RDS :"
            echo "DATABASE_URL=\"postgresql://username:password@your-rds-endpoint.region.rds.amazonaws.com:5432/database_name\""
            echo ""
            read -p "Appuyez sur Entrée après avoir configuré le fichier .env..."
        else
            log_error "Fichier env.example introuvable. Créez un fichier .env manuellement."
            exit 1
        fi
    fi
    
    # Charger les variables d'environnement
    if [ -f .env ]; then
        export $(cat .env | grep -v '^#' | xargs)
    fi
    
    # Vérifier que DATABASE_URL est configuré
    if [ -z "$DATABASE_URL" ]; then
        log_error "DATABASE_URL n'est pas configuré dans le fichier .env"
        exit 1
    fi
    
    log_success "Environnement configuré"
}

# Installation des dépendances
install_dependencies() {
    log_info "Installation des dépendances..."
    npm install
    log_success "Dépendances installées"
}

# Génération du client Prisma
generate_prisma_client() {
    log_info "Génération du client Prisma..."
    npm run db:generate
    log_success "Client Prisma généré"
}

# Test de connexion à la base de données
test_database_connection() {
    log_info "Test de connexion à la base de données..."
    
    # Utiliser Prisma pour tester la connexion
    node -e "
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        async function testConnection() {
            try {
                await prisma.\$connect();
                console.log('✅ Connexion à la base de données réussie');
                await prisma.\$disconnect();
                process.exit(0);
            } catch (error) {
                console.error('❌ Erreur de connexion:', error.message);
                process.exit(1);
            }
        }
        
        testConnection();
    "
    
    if [ $? -eq 0 ]; then
        log_success "Connexion à la base de données testée avec succès"
    else
        log_error "Échec du test de connexion à la base de données"
        exit 1
    fi
}

# Migration de la base de données
migrate_database() {
    log_info "Migration de la base de données..."
    
    # Appliquer les migrations
    npm run db:push
    
    if [ $? -eq 0 ]; then
        log_success "Migrations appliquées avec succès"
    else
        log_error "Échec des migrations"
        exit 1
    fi
}

# Initialisation des données
initialize_data() {
    log_info "Initialisation des données par défaut..."
    
    # Créer les utilisateurs par défaut
    log_info "Création des utilisateurs par défaut..."
    curl -s -X POST http://localhost:3000/api/auth/init > /dev/null 2>&1 || {
        log_warning "Impossible de créer les utilisateurs via API (serveur non démarré)"
        log_info "Les utilisateurs seront créés au premier démarrage de l'application"
    }
    
    # Créer les composants d'exemple
    log_info "Création des composants d'exemple..."
    curl -s -X POST http://localhost:3000/api/components/init > /dev/null 2>&1 || {
        log_warning "Impossible de créer les composants via API (serveur non démarré)"
        log_info "Les composants d'exemple seront créés au premier démarrage de l'application"
    }
    
    log_success "Initialisation des données terminée"
}

# Sauvegarde de la base de données (optionnel)
backup_database() {
    if [ "$1" = "--backup" ]; then
        log_info "Création d'une sauvegarde de la base de données..."
        
        # Extraire les informations de connexion de DATABASE_URL
        DB_INFO=$(echo $DATABASE_URL | sed 's/postgresql:\/\/\([^:]*\):\([^@]*\)@\([^:]*\):\([^\/]*\)\/\(.*\)/\1 \2 \3 \4 \5/')
        read DB_USER DB_PASS DB_HOST DB_PORT DB_NAME <<< "$DB_INFO"
        
        # Créer le dossier de sauvegarde
        mkdir -p backups
        
        # Nom du fichier de sauvegarde avec timestamp
        BACKUP_FILE="backups/backup_$(date +%Y%m%d_%H%M%S).sql"
        
        # Créer la sauvegarde
        PGPASSWORD=$DB_PASS pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > $BACKUP_FILE
        
        if [ $? -eq 0 ]; then
            log_success "Sauvegarde créée: $BACKUP_FILE"
        else
            log_warning "Échec de la sauvegarde (pg_dump requis)"
        fi
    fi
}

# Vérification post-migration
post_migration_check() {
    log_info "Vérification post-migration..."
    
    # Vérifier que les tables existent
    node -e "
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        async function checkTables() {
            try {
                const users = await prisma.user.count();
                const components = await prisma.component.count();
                
                console.log('✅ Tables vérifiées:');
                console.log('   - Users:', users, 'enregistrements');
                console.log('   - Components:', components, 'enregistrements');
                
                await prisma.\$disconnect();
                process.exit(0);
            } catch (error) {
                console.error('❌ Erreur lors de la vérification:', error.message);
                process.exit(1);
            }
        }
        
        checkTables();
    "
    
    if [ $? -eq 0 ]; then
        log_success "Vérification post-migration réussie"
    else
        log_error "Échec de la vérification post-migration"
        exit 1
    fi
}

# Fonction principale
main() {
    echo ""
    log_info "Début de la migration vers RDS PostgreSQL"
    echo ""
    
    # Vérifier les arguments
    BACKUP_FLAG=""
    if [ "$1" = "--backup" ]; then
        BACKUP_FLAG="--backup"
        log_info "Mode sauvegarde activé"
    fi
    
    # Exécuter les étapes
    check_prerequisites
    setup_environment
    install_dependencies
    generate_prisma_client
    test_database_connection
    backup_database $BACKUP_FLAG
    migrate_database
    initialize_data
    post_migration_check
    
    echo ""
    log_success "🎉 Migration vers RDS PostgreSQL terminée avec succès!"
    echo ""
    echo "Prochaines étapes:"
    echo "1. Démarrez l'application: npm run dev"
    echo "2. Testez la connexion admin/admin123"
    echo "3. Vérifiez que les composants s'affichent correctement"
    echo ""
    echo "Pour la production:"
    echo "1. Configurez les variables d'environnement sur votre serveur"
    echo "2. Utilisez: npm run deploy"
    echo "3. Suivez le guide README-EC2.md pour le déploiement"
    echo ""
}

# Gestion des erreurs
trap 'log_error "Script interrompu"; exit 1' INT TERM

# Exécuter le script principal
main "$@"

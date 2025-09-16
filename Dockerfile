# Dockerfile pour Component Dashboard
FROM node:18-alpine AS base

# Installation des dépendances système
RUN apk add --no-cache libc6-compat

# Répertoire de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installation des dépendances
RUN npm ci --only=production && npm cache clean --force

# Génération du client Prisma
RUN npx prisma generate

# Copie du code source
COPY . .

# Build de l'application
RUN npm run build

# Création d'un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Permissions appropriées
RUN chown -R nextjs:nodejs /app
USER nextjs

# Exposition du port
EXPOSE 3000

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Commande de démarrage
CMD ["npm", "start"]

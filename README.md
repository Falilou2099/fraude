# Système de Détection de Fraude

Une application web moderne construite avec Next.js pour la gestion et le suivi des cas de fraude. Cette application offre un système complet de gestion des cas, des preuves et des commentaires avec une base de données MySQL directe.

<img width="1919" height="967" alt="image" src="https://github.com/user-attachments/assets/a06b896a-bd2d-40d7-87fc-23f347028f0b" />

## 🚀 Fonctionnalités

- **Gestion des cas de fraude** : Créer, modifier et suivre les cas de fraude
- **Système de preuves** : Télécharger et gérer les documents, images et autres preuves
- **Commentaires** : Ajouter des commentaires et notes sur chaque cas
- **Statuts et priorités** : Organiser les cas par statut (PENDING, INVESTIGATING, RESOLVED, REJECTED) et priorité
- **Interface moderne** : Design élégant avec mode sombre/clair
- **Base de données MySQL** : Stockage persistant avec connexion MySQL directe
- **Authentification** : Système de connexion sécurisé
- **Responsive** : Interface adaptative pour tous les appareils

## 🛠️ Technologies Utilisées

- **Frontend** : Next.js 15, React 19, Tailwind CSS
- **Éditeur** : Monaco Editor (VS Code)
- **Backend** : Next.js API Routes
- **Base de données** : MySQL avec connexion directe (mysql2)
- **Authentification** : bcryptjs, cookies sécurisés
- **UI** : Composants personnalisés, mode sombre/clair

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn
- MySQL 8.0+ (serveur local ou distant)

## 🔧 Installation

1. **Cloner le projet** (si applicable) ou naviguer dans le dossier :
```bash
cd fraude
```

2. **Installer les dépendances** :
```bash
npm install
```

3. **Configurer les variables d'environnement** :
```bash
# Copier le fichier d'exemple
cp env.example .env

# Modifier .env avec vos vraies valeurs MySQL
# DB_HOST=localhost
# DB_USER=votre_utilisateur
# DB_PASSWORD=votre_mot_de_passe
# DB_NAME=fraude_detection
# DB_PORT=3306
```

4. **Configurer la base de données MySQL** :
```bash
# Installer les dépendances
npm install

# Configurer la base de données MySQL
npm run db:setup

# Initialiser avec des composants d'exemple (optionnel)
curl -X POST http://localhost:3000/api/components/seed
```

## 🚀 Démarrage

```bash
# Démarrer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📁 Structure du Projet

```
fraude-detection/
├── app/
│   ├── api/
│   │   ├── auth/                  # Authentification
│   │   ├── components/            # API Routes CRUD composants
│   │   └── fraude-cases/          # API Routes gestion cas de fraude
│   ├── components/
│   │   ├── ui/                    # Composants UI réutilisables
│   │   ├── editor/                # Éditeur Monaco
│   │   └── ComponentCard.js       # Carte de composant
│   ├── context/
│   │   └── ThemeContext.js        # Gestion thème sombre/clair
│   ├── dashboard/                 # Dashboard principal
│   ├── editor/                    # Pages éditeur
│   ├── login/                     # Page de connexion
│   ├── lib/
│   │   └── mysql.js               # Configuration MySQL
│   ├── globals.css                # Styles globaux
│   ├── layout.js                  # Layout principal
│   └── page.js                    # Page d'accueil
├── scripts/
│   ├── setup-mysql.js             # Configuration base de données
│   ├── migrate-to-rds.sh          # Migration RDS (production)
│   └── deploy.sh                  # Script de déploiement
├── package.json
└── README.md
```

## 🗄️ Modèle de Données

### FraudeCase (fraude_cases)
- `id` : Identifiant unique (UUID)
- `title` : Titre du cas
- `description` : Description détaillée
- `amount` : Montant impliqué (optionnel)
- `status` : Statut (PENDING, INVESTIGATING, RESOLVED, REJECTED)
- `priority` : Priorité (LOW, MEDIUM, HIGH, CRITICAL)
- `reported_by` : Nom du rapporteur
- `assigned_to` : Personne assignée (optionnel)
- `created_at` / `updated_at` : Horodatage

### Evidence (evidence)
- `id` : Identifiant unique (UUID)
- `type` : Type de preuve (DOCUMENT, IMAGE, VIDEO, AUDIO, OTHER)
- `filename` : Nom du fichier
- `filepath` : Chemin du fichier
- `description` : Description de la preuve
- `uploaded_by` : Utilisateur qui a téléchargé
- `case_id` : Référence vers le cas de fraude
- `created_at` : Date de création

### Comment (comments)
- `id` : Identifiant unique (UUID)
- `content` : Contenu du commentaire
- `author` : Auteur du commentaire
- `case_id` : Référence vers le cas de fraude
- `created_at` : Date de création

### Component (components)
- `id` : Identifiant unique
- `name` : Nom du composant
- `description` : Description du composant
- `code` : Code source du composant
- `language` : Langage (javascript, html, css)
- `category` : Catégorie du composant
- `tags` : Tags associés
- `created_by` : Créateur
- `created_at` / `updated_at` : Horodatage

### User (users)
- `id` : Identifiant unique
- `username` : Nom d'utilisateur
- `password` : Mot de passe hashé
- `email` : Email (optionnel)
- `role` : Rôle utilisateur
- `created_at` / `updated_at` : Horodatage

## 🎨 Composants Réutilisables

L'application inclut une bibliothèque de composants UI réutilisables :

- **ComponentCard** : Carte d'affichage des composants
- **MonacoEditor** : Éditeur de code intégré
- **ThemeToggle** : Basculeur mode sombre/clair
- **Modal** : Fenêtres modales pour la sauvegarde
- **Button** : Boutons avec différentes variantes
- **Input** : Champs de saisie stylisés

## 🔌 API Endpoints

### Cas de Fraude
- `GET /api/fraude-cases` : Récupérer tous les cas (avec filtres status/priority)
- `POST /api/fraude-cases` : Créer un nouveau cas de fraude
- `GET /api/fraude-cases/[id]` : Récupérer un cas spécifique avec preuves et commentaires
- `PUT /api/fraude-cases/[id]` : Mettre à jour un cas
- `DELETE /api/fraude-cases/[id]` : Supprimer un cas

### Composants
- `GET /api/components` : Récupérer tous les composants (avec filtres)
- `POST /api/components` : Créer un nouveau composant
- `GET /api/components/[id]` : Récupérer un composant spécifique
- `PUT /api/components/[id]` : Mettre à jour un composant
- `DELETE /api/components/[id]` : Supprimer un composant
- `POST /api/components/seed` : Initialiser avec des exemples

### Authentification
- `POST /api/auth/login` : Connexion utilisateur
- `POST /api/auth/logout` : Déconnexion utilisateur
- `PUT /api/auth/update-profile` : Mettre à jour le profil utilisateur
## 🎯 Utilisation

### 1. Connexion
- Utilisez les comptes de test ou créez le vôtre
- Redirection automatique vers le dashboard

### 2. Gérer les Cas de Fraude
- Créez un nouveau cas avec titre, description, montant
- Assignez un statut (PENDING, INVESTIGATING, RESOLVED, REJECTED)
- Définissez une priorité (LOW, MEDIUM, HIGH, CRITICAL)
- Ajoutez des preuves (documents, images, etc.)
- Suivez l'évolution avec des commentaires

### 3. Créer un Composant
- Cliquez sur "Nouveau Composant" dans le dashboard
- Choisissez le langage (JavaScript/React, HTML, CSS)
- Écrivez votre code dans l'éditeur Monaco
- Visualisez le résultat en temps réel dans l'aperçu
- Sauvegardez avec un nom et une description

### 4. Réutiliser du Code
- Utilisez le bouton "📋" pour copier le code
- Intégrez facilement dans vos projets

## 🔧 Configuration

### Variables d'Environnement
Variables MySQL requises dans le fichier `.env` :
```
DB_HOST=localhost
DB_USER=votre_utilisateur_mysql
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=fraude_detection
DB_PORT=3306
```

### Personnalisation
- **Thèmes** : Modifiez `app/context/ThemeContext.js`
- **Authentification** : Adaptez les routes dans `app/api/auth/`
- **Base de données** : Configuration dans `app/lib/mysql.js` et `scripts/setup-mysql.js`
- **Éditeur** : Personnalisez Monaco Editor dans `app/components/editor/`

## 🚀 Déploiement

### Vercel (Recommandé)
```bash
npm run build
# Déployez sur Vercel
```

### Autres Plateformes
```bash
npm run build
npm start
```

## 🛠️ Développement

### Scripts Disponibles
```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # Linting du code
```

### Ajout de Fonctionnalités
1. **Nouveaux langages** : Étendez `generatePreview()` dans l'éditeur
2. **Thèmes éditeur** : Ajoutez des thèmes Monaco personnalisés
3. **Collaboration** : Ajoutez des fonctionnalités temps réel avec WebSocket
4. **Export** : Implémentez l'export de composants en fichiers

## 📋 Fonctionnalités Futures

- [ ] Système de tags et catégories pour les composants
- [ ] Partage de composants entre utilisateurs
- [ ] Export/Import de composants en fichiers
- [ ] Historique des versions avec diff
- [ ] Collaboration en temps réel
- [ ] Thèmes personnalisés pour l'éditeur Monaco
- [ ] Intégration Git pour versioning
- [ ] Marketplace communautaire de composants
- [ ] Support TypeScript
- [ ] Snippets et templates prédéfinis

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) - Framework React
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Éditeur de code
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Vercel](https://vercel.com/) - Plateforme de déploiement

---

**Développé avec ❤️ pour la communauté des développeurs**

# Application de Gestion des Cas de Fraude

Une application web moderne construite avec Next.js pour gérer et suivre les cas de fraude au sein d'une organisation. Cette application offre une interface CRUD complète avec des composants React réutilisables et une base de données SQLite via Prisma.

## 🚀 Fonctionnalités

- **Gestion CRUD complète** : Créer, lire, modifier et supprimer des cas de fraude
- **Interface moderne** : Interface utilisateur élégante avec Tailwind CSS
- **Composants réutilisables** : Bibliothèque de composants UI modulaires
- **Filtrage et recherche** : Filtrer les cas par statut et priorité
- **Base de données** : Stockage persistant avec SQLite et Prisma ORM
- **Validation** : Validation côté client et serveur
- **Responsive** : Interface adaptative pour tous les appareils

## 🛠️ Technologies Utilisées

- **Frontend** : Next.js 15, React 19, Tailwind CSS
- **Backend** : Next.js API Routes
- **Base de données** : SQLite avec Prisma ORM
- **Validation** : Zod, React Hook Form
- **UI** : Composants personnalisés, Lucide React (icônes)

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn

## 🔧 Installation

1. **Cloner le projet** (si applicable) ou naviguer dans le dossier :
```bash
cd fraude
```

2. **Installer les dépendances** :
```bash
npm install
```

3. **Configurer la base de données** :
```bash
# Générer le client Prisma
npx prisma generate

# Créer et migrer la base de données
npx prisma db push

# (Optionnel) Ajouter des données de test
npx prisma db seed
```

4. **Créer le fichier d'environnement** :
```bash
# Créer .env.local
echo "DATABASE_URL=\"file:./dev.db\"" > .env.local
```

## 🚀 Démarrage

```bash
# Démarrer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📁 Structure du Projet

```
fraude/
├── app/
│   ├── api/
│   │   └── fraude-cases/          # API Routes CRUD
│   ├── components/
│   │   ├── ui/                    # Composants UI réutilisables
│   │   │   ├── Button.js
│   │   │   ├── Input.js
│   │   │   ├── Select.js
│   │   │   ├── Modal.js
│   │   │   ├── Table.js
│   │   │   └── Badge.js
│   │   ├── FraudeCaseForm.js      # Formulaire de cas
│   │   └── FraudeCaseList.js      # Liste des cas
│   ├── lib/
│   │   └── prisma.js              # Configuration Prisma
│   ├── globals.css                # Styles globaux
│   ├── layout.js                  # Layout principal
│   └── page.js                    # Page d'accueil
├── prisma/
│   └── schema.prisma              # Schéma de base de données
├── package.json
└── README.md
```

## 🗄️ Modèle de Données

### FraudeCase
- `id` : Identifiant unique
- `title` : Titre du cas
- `description` : Description détaillée
- `amount` : Montant impliqué
- `status` : Statut (PENDING, INVESTIGATING, RESOLVED, REJECTED)
- `priority` : Priorité (LOW, MEDIUM, HIGH, CRITICAL)
- `reportedBy` : Personne qui a rapporté
- `assignedTo` : Personne assignée
- `createdAt` / `updatedAt` : Horodatage

### Evidence
- Preuves associées aux cas de fraude
- Support pour différents types de fichiers

### Comment
- Commentaires sur les cas de fraude
- Suivi des discussions

## 🎨 Composants Réutilisables

L'application inclut une bibliothèque de composants UI réutilisables :

- **Button** : Boutons avec différentes variantes et tailles
- **Input** : Champs de saisie avec validation
- **Select** : Listes déroulantes
- **Modal** : Fenêtres modales
- **Table** : Tableaux de données
- **Badge** : Étiquettes de statut

## 🔌 API Endpoints

- `GET /api/fraude-cases` : Récupérer tous les cas (avec filtres)
- `POST /api/fraude-cases` : Créer un nouveau cas
- `GET /api/fraude-cases/[id]` : Récupérer un cas spécifique
- `PUT /api/fraude-cases/[id]` : Mettre à jour un cas
## 🎯 Utilisation

### 1. Connexion
- Utilisez les comptes de test ou créez le vôtre
- Redirection automatique vers le dashboard

### 2. Créer un Composant
- Cliquez sur "Nouveau Composant" dans le dashboard
- Choisissez le langage (JavaScript/React, HTML, CSS)
- Écrivez votre code dans l'éditeur Monaco
- Visualisez le résultat en temps réel dans l'aperçu
- Sauvegardez avec un nom et une description

### 3. Éditer un Composant
- Cliquez sur "Éditer" depuis le dashboard
- Modifiez le code dans l'éditeur
- L'aperçu se met à jour automatiquement
- Sauvegardez vos modifications

### 4. Réutiliser du Code
- Utilisez le bouton "📋" pour copier le code
- Intégrez facilement dans vos projets

## 🔧 Configuration

### Variables d'Environnement
Aucune variable d'environnement requise pour le développement local.

### Personnalisation
- **Thèmes** : Modifiez `app/context/ThemeContext.js`
- **Authentification** : Adaptez `app/lib/auth.js`
- **Stockage** : Remplacez `app/lib/data.js` par une vraie base de données

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
2. **Persistance** : Remplacez le stockage en mémoire par une base de données
3. **Collaboration** : Ajoutez des fonctionnalités temps réel avec WebSocket

## 📋 Fonctionnalités Futures

- [ ] Base de données persistante (PostgreSQL/MongoDB)
- [ ] Système de tags et catégories
- [ ] Partage de composants entre utilisateurs
- [ ] Export/Import de composants
- [ ] Historique des versions
- [ ] Collaboration en temps réel
- [ ] Thèmes personnalisés pour l'éditeur
- [ ] Intégration Git
- [ ] Marketplace de composants

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

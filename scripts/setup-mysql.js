const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'component_user',
  password: process.env.DB_PASSWORD || 'component_pass',
  port: process.env.DB_PORT || 3306
};

const dbName = process.env.DB_NAME || 'component_library';

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔧 Configuration de la base de données MySQL...');
    
    // Connexion sans spécifier la base de données
    connection = await mysql.createConnection(dbConfig);
    
    // Créer la base de données si elle n'existe pas
    console.log(`📦 Création de la base de données '${dbName}'...`);
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    
    // Se connecter à la base de données
    await connection.changeUser({ database: dbName });
    
    // Créer la table users
    console.log('👥 Création de la table users...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Créer la table components
    console.log('🧩 Création de la table components...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS components (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        code LONGTEXT NOT NULL,
        language VARCHAR(20) DEFAULT 'javascript',
        category VARCHAR(50) DEFAULT 'UI',
        tags TEXT,
        created_by VARCHAR(50) DEFAULT 'system',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Vérifier si les utilisateurs par défaut existent
    const [existingUsers] = await connection.execute('SELECT COUNT(*) as count FROM users');
    
    if (existingUsers[0].count === 0) {
      console.log('🔐 Création des utilisateurs par défaut...');
      
      // Créer l'utilisateur admin
      const adminPassword = await bcrypt.hash('admin123', 12);
      await connection.execute(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        ['admin', adminPassword]
      );
      console.log('✅ Utilisateur admin créé');
      
      // Créer l'utilisateur user
      const userPassword = await bcrypt.hash('user123', 12);
      await connection.execute(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        ['user', userPassword]
      );
      console.log('✅ Utilisateur user créé');
    } else {
      console.log('👥 Utilisateurs déjà existants');
    }
    
    // Vérifier si des composants d'exemple existent
    const [existingComponents] = await connection.execute('SELECT COUNT(*) as count FROM components');
    
    if (existingComponents[0].count === 0) {
      console.log('🧩 Création des composants d\'exemple...');
      
      const exampleComponents = [
        {
          name: 'Button Component',
          description: 'Un bouton React réutilisable avec différentes variantes',
          code: `import React from 'react';

const Button = ({ children, variant = 'primary', size = 'md', onClick, disabled = false }) => {
  const baseClasses = 'font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const classes = \`\${baseClasses} \${variants[variant]} \${sizes[size]} \${disabled ? 'opacity-50 cursor-not-allowed' : ''}\`;
  
  return (
    <button 
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;`,
          language: 'javascript',
          category: 'UI',
          tags: 'button,react,component,ui'
        },
        {
          name: 'Card Component',
          description: 'Une carte moderne avec header, body et footer',
          code: `import React from 'react';

const Card = ({ children, className = '', shadow = 'md' }) => {
  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };
  
  return (
    <div className={\`bg-white rounded-lg border border-gray-200 \${shadowClasses[shadow]} \${className}\`}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => (
  <div className={\`px-6 py-4 border-b border-gray-200 \${className}\`}>
    {children}
  </div>
);

const CardBody = ({ children, className = '' }) => (
  <div className={\`px-6 py-4 \${className}\`}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '' }) => (
  <div className={\`px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg \${className}\`}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;`,
          language: 'javascript',
          category: 'UI',
          tags: 'card,react,component,layout'
        },
        {
          name: 'Loading Spinner',
          description: 'Un spinner de chargement animé',
          code: `import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'blue' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };
  
  const colors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    gray: 'text-gray-600'
  };
  
  return (
    <div className="flex justify-center items-center">
      <div className={\`animate-spin rounded-full border-2 border-gray-300 border-t-current \${sizes[size]} \${colors[color]}\`}></div>
    </div>
  );
};

export default LoadingSpinner;`,
          language: 'javascript',
          category: 'UI',
          tags: 'loading,spinner,animation,react'
        }
      ];
      
      for (const component of exampleComponents) {
        await connection.execute(
          'INSERT INTO components (name, description, code, language, category, tags) VALUES (?, ?, ?, ?, ?, ?)',
          [component.name, component.description, component.code, component.language, component.category, component.tags]
        );
      }
      
      console.log('✅ Composants d\'exemple créés');
    } else {
      console.log('🧩 Composants déjà existants');
    }
    
    console.log('🎉 Configuration de la base de données terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Exécuter le script
setupDatabase();

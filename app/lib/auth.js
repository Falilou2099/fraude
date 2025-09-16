import bcrypt from 'bcryptjs';

// Utilisateurs par défaut (en production, utilisez une vraie base de données)
const users = [
  {
    id: '1',
    username: 'admin',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8xk9s0NUoW', // password: admin123
    name: 'Administrateur'
  },
  {
    id: '2', 
    username: 'user',
    password: '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: user123
    name: 'Utilisateur'
  }
];

export const authenticateUser = async (username, password) => {
  const user = users.find(u => u.username === username);
  
  if (!user) {
    return null;
  }
  
  const isValid = await bcrypt.compare(password, user.password);
  
  if (isValid) {
    return {
      id: user.id,
      username: user.username,
      name: user.name
    };
  }
  
  return null;
};

export const getUserById = (id) => {
  const user = users.find(u => u.id === id);
  if (user) {
    return {
      id: user.id,
      username: user.username,
      name: user.name
    };
  }
  return null;
};

// Fonction pour hasher un mot de passe (utile pour créer de nouveaux utilisateurs)
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

import bcrypt from 'bcryptjs';
import { query } from './mysql';

export const authenticateUser = async (username, password) => {
  try {
    // Chercher l'utilisateur dans la base de données
    const users = await query('SELECT * FROM users WHERE username = ?', [username]);
    
    if (users.length === 0) {
      return null;
    }
    
    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password);
    
    if (isValid) {
      return {
        id: user.id,
        username: user.username,
        created_at: user.created_at
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors de l\'authentification:', error);
    return null;
  }
};

export const getUserById = async (id) => {
  try {
    const users = await query('SELECT * FROM users WHERE id = ?', [id]);
    
    if (users.length > 0) {
      const user = users[0];
      return {
        id: user.id,
        username: user.username,
        created_at: user.created_at
      };
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return null;
  }
};

// Fonction pour hasher un mot de passe (utile pour créer de nouveaux utilisateurs)
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

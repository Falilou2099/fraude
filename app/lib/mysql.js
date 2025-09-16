import mysql from 'mysql2/promise';

// Configuration de la base de données MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'component_library',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Pool de connexions
let pool;

export const getConnection = async () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
};

// Fonction pour exécuter une requête
export const query = async (sql, params = []) => {
  try {
    const connection = await getConnection();
    const [results] = await connection.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Erreur MySQL:', error);
    throw error;
  }
};

// Fonction pour fermer le pool de connexions
export const closeConnection = async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};

export default { query, getConnection, closeConnection };

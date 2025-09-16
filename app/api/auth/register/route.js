import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { query } from '../../../lib/mysql';

export async function POST(request) {
  try {
    const { username, password, email } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Nom d\'utilisateur et mot de passe requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUsers = await query('SELECT id FROM users WHERE username = ?', [username]);
    
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Ce nom d\'utilisateur existe déjà' },
        { status: 409 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const result = await query(
      'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
      [username, hashedPassword, email || null]
    );

    // Récupérer l'utilisateur créé
    const newUser = await query('SELECT id, username, email, created_at FROM users WHERE id = ?', [result.insertId]);

    return NextResponse.json(newUser[0]);
  } catch (error) {
    console.error('Erreur lors de la création du compte:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la création du compte' },
      { status: 500 }
    );
  }
}

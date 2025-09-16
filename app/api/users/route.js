import { NextResponse } from 'next/server';
import { query } from '../../lib/mysql';

// GET - Récupérer tous les utilisateurs (sans les mots de passe)
export async function GET() {
  try {
    const users = await query('SELECT id, username, email, created_at FROM users ORDER BY username ASC');
    return NextResponse.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}

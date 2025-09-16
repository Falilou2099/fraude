import { NextResponse } from 'next/server';
import { query } from '../../lib/mysql';

// GET - Récupérer toutes les catégories
export async function GET() {
  try {
    const categories = await query('SELECT * FROM categories ORDER BY name ASC');
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des catégories' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle catégorie
export async function POST(request) {
  try {
    const { name, description, color } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Le nom est requis' },
        { status: 400 }
      );
    }

    const result = await query(
      'INSERT INTO categories (name, description, color) VALUES (?, ?, ?)',
      [name, description || '', color || '#6B46C1']
    );

    const newCategory = await query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    return NextResponse.json(newCategory[0]);
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Une catégorie avec ce nom existe déjà' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création de la catégorie' },
      { status: 500 }
    );
  }
}

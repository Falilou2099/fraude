import { NextResponse } from 'next/server';
import { query } from '../../lib/mysql';

// GET - Récupérer tous les composants
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    let sql = 'SELECT * FROM components';
    const params = [];
    const conditions = [];
    
    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }
    
    if (search) {
      conditions.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' ORDER BY created_at DESC';

    const components = await query(sql, params);

    return NextResponse.json(components);
  } catch (error) {
    console.error('Erreur lors de la récupération des composants:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des composants' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau composant
export async function POST(request) {
  try {
    const { name, description, code, language, category, tags, createdBy, category_id } = await request.json();

    if (!name || !code) {
      return NextResponse.json(
        { error: 'Le nom et le code sont requis' },
        { status: 400 }
      );
    }

    const result = await query(
      'INSERT INTO components (name, description, code, language, category, tags, created_by, category_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        name,
        description || '',
        code,
        language || 'javascript',
        category || 'UI',
        tags || '',
        createdBy || 'system',
        category_id || null
      ]
    );

    const newComponent = await query('SELECT * FROM components WHERE id = ?', [result.insertId]);
    return NextResponse.json(newComponent[0]);
  } catch (error) {
    console.error('Erreur lors de la création du composant:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Un composant avec ce nom existe déjà' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création du composant' },
      { status: 500 }
    );
  }
}

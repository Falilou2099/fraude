import { NextResponse } from 'next/server';
import { query } from '../../../lib/mysql';

// GET - Récupérer un composant spécifique
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const components = await query('SELECT * FROM components WHERE id = ?', [id]);
    
    if (components.length === 0) {
      return NextResponse.json(
        { error: 'Composant non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(components[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération du composant:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du composant' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un composant
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { name, description, code, language, category, tags, category_id } = await request.json();

    if (!name || !code) {
      return NextResponse.json(
        { error: 'Le nom et le code sont requis' },
        { status: 400 }
      );
    }

    const result = await query(
      'UPDATE components SET name = ?, description = ?, code = ?, language = ?, category = ?, tags = ?, category_id = ?, updated_at = NOW() WHERE id = ?',
      [
        name,
        description || '',
        code,
        language || 'javascript',
        category || 'UI',
        tags || '',
        category_id || null,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Composant non trouvé' },
        { status: 404 }
      );
    }

    const components = await query('SELECT * FROM components WHERE id = ?', [id]);
    return NextResponse.json(components[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du composant:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Un composant avec ce nom existe déjà' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du composant' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un composant
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    const result = await query('DELETE FROM components WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Composant non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Composant supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du composant:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du composant' },
      { status: 500 }
    );
  }
}

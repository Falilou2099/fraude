import { NextResponse } from 'next/server';
import { query } from '../../../lib/mysql';

// GET - Récupérer une catégorie spécifique
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const categories = await query('SELECT * FROM categories WHERE id = ?', [id]);
    
    if (categories.length === 0) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(categories[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la catégorie' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une catégorie
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { name, description, color } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Le nom est requis' },
        { status: 400 }
      );
    }

    const result = await query(
      'UPDATE categories SET name = ?, description = ?, color = ?, updated_at = NOW() WHERE id = ?',
      [name, description || '', color || '#6B46C1', id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    const categories = await query('SELECT * FROM categories WHERE id = ?', [id]);
    return NextResponse.json(categories[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Une catégorie avec ce nom existe déjà' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la catégorie' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une catégorie
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Vérifier s'il y a des composants dans cette catégorie
    const componentsInCategory = await query('SELECT COUNT(*) as count FROM components WHERE category_id = ?', [id]);
    
    if (componentsInCategory[0].count > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer une catégorie contenant des composants' },
        { status: 400 }
      );
    }
    
    const result = await query('DELETE FROM categories WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Catégorie supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la catégorie' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { query } from '../../../lib/mysql';

// GET - Récupérer un cas spécifique
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const [fraudeCase] = await query(
      'SELECT * FROM fraude_cases WHERE id = ?',
      [id]
    );
    
    if (!fraudeCase) {
      return NextResponse.json(
        { error: 'Cas non trouvé' },
        { status: 404 }
      );
    }

    const evidence = await query(
      'SELECT * FROM evidence WHERE case_id = ? ORDER BY created_at DESC',
      [id]
    );
    
    const comments = await query(
      'SELECT * FROM comments WHERE case_id = ? ORDER BY created_at DESC',
      [id]
    );
    
    fraudeCase.evidence = evidence;
    fraudeCase.comments = comments;
    
    return NextResponse.json(fraudeCase);
  } catch (error) {
    console.error('Erreur lors de la récupération du cas:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du cas' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un cas
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const { title, description, amount, status, priority, reportedBy, assignedTo } = body;
    
    // Vérifier si le cas existe
    const [existingCase] = await query(
      'SELECT * FROM fraude_cases WHERE id = ?',
      [id]
    );
    
    if (!existingCase) {
      return NextResponse.json(
        { error: 'Cas non trouvé' },
        { status: 404 }
      );
    }
    
    await query(
      `UPDATE fraude_cases SET 
       title = ?, description = ?, amount = ?, status = ?, priority = ?, 
       reported_by = ?, assigned_to = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title,
        description,
        amount ? parseFloat(amount) : null,
        status,
        priority,
        reportedBy,
        assignedTo || null,
        id
      ]
    );
    
    const [updatedCase] = await query(
      'SELECT * FROM fraude_cases WHERE id = ?',
      [id]
    );
    
    const evidence = await query(
      'SELECT * FROM evidence WHERE case_id = ?',
      [id]
    );
    
    const comments = await query(
      'SELECT * FROM comments WHERE case_id = ?',
      [id]
    );
    
    updatedCase.evidence = evidence;
    updatedCase.comments = comments;
    
    return NextResponse.json(updatedCase);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du cas:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du cas' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un cas
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    // Vérifier si le cas existe
    const [existingCase] = await query(
      'SELECT * FROM fraude_cases WHERE id = ?',
      [id]
    );
    
    if (!existingCase) {
      return NextResponse.json(
        { error: 'Cas non trouvé' },
        { status: 404 }
      );
    }
    
    await query(
      'DELETE FROM fraude_cases WHERE id = ?',
      [id]
    );
    
    return NextResponse.json({ message: 'Cas supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du cas:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du cas' },
      { status: 500 }
    );
  }
}

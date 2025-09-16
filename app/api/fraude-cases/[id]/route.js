import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// GET - Récupérer un cas spécifique
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const fraudeCase = await prisma.fraudeCase.findUnique({
      where: { id },
      include: {
        evidence: {
          orderBy: { createdAt: 'desc' }
        },
        comments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!fraudeCase) {
      return NextResponse.json(
        { error: 'Cas non trouvé' },
        { status: 404 }
      );
    }
    
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
    const existingCase = await prisma.fraudeCase.findUnique({
      where: { id }
    });
    
    if (!existingCase) {
      return NextResponse.json(
        { error: 'Cas non trouvé' },
        { status: 404 }
      );
    }
    
    const updatedCase = await prisma.fraudeCase.update({
      where: { id },
      data: {
        title,
        description,
        amount: amount ? parseFloat(amount) : null,
        status,
        priority,
        reportedBy,
        assignedTo: assignedTo || null
      },
      include: {
        evidence: true,
        comments: true
      }
    });
    
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
    const existingCase = await prisma.fraudeCase.findUnique({
      where: { id }
    });
    
    if (!existingCase) {
      return NextResponse.json(
        { error: 'Cas non trouvé' },
        { status: 404 }
      );
    }
    
    await prisma.fraudeCase.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: 'Cas supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du cas:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du cas' },
      { status: 500 }
    );
  }
}

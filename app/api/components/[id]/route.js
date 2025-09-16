import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// GET - Récupérer un composant spécifique
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const component = await prisma.component.findUnique({
      where: { id }
    });
    
    if (!component) {
      return NextResponse.json(
        { error: 'Composant non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(component);
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
    const body = await request.json();
    
    const { name, description, code, language } = body;
    
    const updatedComponent = await prisma.component.update({
      where: { id },
      data: {
        name,
        description,
        code,
        language
      }
    });
    
    return NextResponse.json(updatedComponent);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du composant:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Composant non trouvé' },
        { status: 404 }
      );
    }
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Un composant avec ce nom existe déjà' },
        { status: 400 }
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
    
    await prisma.component.delete({
      where: { id }
    });
    
    return NextResponse.json(
      { message: 'Composant supprimé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la suppression du composant:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Composant non trouvé' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du composant' },
      { status: 500 }
    );
  }
}

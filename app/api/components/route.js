import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';

// GET - Récupérer tous les composants
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    const where = {};
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ];
    }
    
    const components = await prisma.component.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
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
    const body = await request.json();
    
    const { name, description, code, language, createdBy } = body;
    
    // Validation
    if (!name || !code) {
      return NextResponse.json(
        { error: 'Le nom et le code sont requis' },
        { status: 400 }
      );
    }
    
    const newComponent = await prisma.component.create({
      data: {
        name,
        description,
        code,
        language: language || 'javascript',
        createdBy: createdBy || 'system'
      }
    });
    
    return NextResponse.json(newComponent, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du composant:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Un composant avec ce nom existe déjà' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Erreur lors de la création du composant' },
      { status: 500 }
    );
  }
}

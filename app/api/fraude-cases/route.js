import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';

// GET - Récupérer tous les cas de fraude
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    
    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    
    const cases = await prisma.fraudeCase.findMany({
      where,
      include: {
        evidence: true,
        comments: true,
        _count: {
          select: {
            evidence: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(cases);
  } catch (error) {
    console.error('Erreur lors de la récupération des cas:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des cas' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau cas de fraude
export async function POST(request) {
  try {
    const body = await request.json();
    
    const { title, description, amount, status, priority, reportedBy, assignedTo } = body;
    
    // Validation
    if (!title || !reportedBy) {
      return NextResponse.json(
        { error: 'Le titre et le rapporteur sont requis' },
        { status: 400 }
      );
    }
    
    const newCase = await prisma.fraudeCase.create({
      data: {
        title,
        description,
        amount: amount ? parseFloat(amount) : null,
        status: status || 'PENDING',
        priority: priority || 'MEDIUM',
        reportedBy,
        assignedTo: assignedTo || null
      },
      include: {
        evidence: true,
        comments: true
      }
    });
    
    return NextResponse.json(newCase, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du cas:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du cas' },
      { status: 500 }
    );
  }
}

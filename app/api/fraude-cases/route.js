import { NextResponse } from 'next/server';
import { query } from '../../lib/mysql';
import { v4 as uuidv4 } from 'uuid';

// GET - Récupérer tous les cas de fraude
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    
    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    
    let sql = `
      SELECT 
        fc.*,
        COUNT(DISTINCT e.id) as evidence_count,
        COUNT(DISTINCT c.id) as comments_count
      FROM fraude_cases fc
      LEFT JOIN evidence e ON fc.id = e.case_id
      LEFT JOIN comments c ON fc.id = c.case_id
    `;
    
    const params = [];
    const conditions = [];
    
    if (status) {
      conditions.push('fc.status = ?');
      params.push(status);
    }
    if (priority) {
      conditions.push('fc.priority = ?');
      params.push(priority);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' GROUP BY fc.id ORDER BY fc.created_at DESC';
    
    const cases = await query(sql, params);
    
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
    
    const caseId = uuidv4();
    
    await query(
      `INSERT INTO fraude_cases (id, title, description, amount, status, priority, reported_by, assigned_to) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        caseId,
        title,
        description,
        amount ? parseFloat(amount) : null,
        status || 'PENDING',
        priority || 'MEDIUM',
        reportedBy,
        assignedTo || null
      ]
    );
    
    const [newCase] = await query(
      'SELECT * FROM fraude_cases WHERE id = ?',
      [caseId]
    );
    
    return NextResponse.json(newCase, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du cas:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du cas' },
      { status: 500 }
    );
  }
}

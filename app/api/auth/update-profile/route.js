import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { query } from '../../../lib/mysql';

export async function PUT(request) {
  try {
    const { username, email, currentPassword, newPassword } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: 'Le nom d\'utilisateur est requis' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur actuel par nom d'utilisateur
    const users = await query('SELECT * FROM users WHERE username = ?', [username]);
    
    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const user = users[0];

    // Si un nouveau mot de passe est fourni, vérifier l'ancien
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Le mot de passe actuel est requis pour changer le mot de passe' },
          { status: 400 }
        );
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Mot de passe actuel incorrect' },
          { status: 401 }
        );
      }

      // Hasher le nouveau mot de passe
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      
      // Mettre à jour avec le nouveau mot de passe
      await query(
        'UPDATE users SET email = ?, password = ?, updated_at = NOW() WHERE id = ?',
        [email || null, hashedNewPassword, user.id]
      );
    } else {
      // Mettre à jour sans changer le mot de passe
      await query(
        'UPDATE users SET email = ?, updated_at = NOW() WHERE id = ?',
        [email || null, user.id]
      );
    }

    // Récupérer l'utilisateur mis à jour
    const updatedUsers = await query('SELECT id, username, email, created_at FROM users WHERE id = ?', [user.id]);
    
    return NextResponse.json(updatedUsers[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Ce nom d\'utilisateur ou email existe déjà' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour du profil' },
      { status: 500 }
    );
  }
}

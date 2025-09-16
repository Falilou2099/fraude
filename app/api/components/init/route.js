import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// POST - Initialiser les données d'exemple
export async function POST() {
  try {
    // Vérifier si des composants existent déjà
    const existingComponents = await prisma.component.count();
    if (existingComponents > 0) {
      return NextResponse.json({ 
        message: 'Les composants d\'exemple existent déjà',
        count: existingComponents 
      });
    }

    // Créer les composants d'exemple
    const sampleComponents = [
      {
        name: 'ButtonPrimary',
        description: 'Bouton principal avec style moderne et états hover/focus',
        code: `export default function ButtonPrimary({ children, onClick, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
    >
      {children}
    </button>
  );
}`,
        language: 'javascript',
        category: 'UI',
        tags: ['button', 'primary', 'ui', 'interactive'],
        createdBy: 'system'
      },
      {
        name: 'CardProduct',
        description: 'Carte produit avec image, titre, description et prix',
        code: `export default function CardProduct({ image, title, description, price }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-3">{description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-blue-600">{price}€</span>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}`,
        language: 'javascript',
        category: 'UI',
        tags: ['card', 'product', 'ecommerce', 'ui'],
        createdBy: 'system'
      }
    ];

    const createdComponents = await prisma.component.createMany({
      data: sampleComponents
    });
    
    return NextResponse.json({ 
      message: `${createdComponents.count} composants d'exemple initialisés`,
      count: createdComponents.count 
    });
  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'initialisation des données' },
      { status: 500 }
    );
  }
}

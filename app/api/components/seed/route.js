import { NextResponse } from 'next/server';
import { query } from '../../../lib/mysql';
import { v4 as uuidv4 } from 'uuid';

// POST - Ajouter des composants d'exemple
export async function POST() {
  try {
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
        image: 'https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Button+Primary',
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
        image: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=Card+Product',
        category: 'UI',
        tags: ['card', 'product', 'ecommerce', 'ui'],
        createdBy: 'system'
      },
      {
        name: 'FormInput',
        description: 'Champ de saisie avec label, validation et messages d\'erreur',
        code: `export default function FormInput({ label, type = 'text', value, onChange, error, required = false, placeholder }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={\`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 \${error ? 'border-red-500' : 'border-gray-300'}\`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}`,
        image: 'https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Form+Input',
        category: 'Form',
        tags: ['input', 'form', 'validation', 'ui'],
        createdBy: 'system'
      },
      {
        name: 'Modal',
        description: 'Fenêtre modale responsive avec overlay et gestion du clavier',
        code: `export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}`,
        image: 'https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=Modal',
        category: 'UI',
        tags: ['modal', 'dialog', 'overlay', 'ui'],
        createdBy: 'system'
      },
      {
        name: 'NavigationBar',
        description: 'Barre de navigation responsive avec logo et menu',
        code: `export default function NavigationBar({ logo, menuItems = [] }) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {logo}
            </div>
          </div>
          <div className="flex space-x-8">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}`,
        image: 'https://via.placeholder.com/300x200/6B7280/FFFFFF?text=Navigation',
        category: 'Navigation',
        tags: ['navigation', 'navbar', 'menu', 'layout'],
        createdBy: 'system'
      },
      {
        name: 'DataTable',
        description: 'Tableau de données avec tri, pagination et actions',
        code: `export default function DataTable({ columns = [], data = [], onRowClick }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50 cursor-pointer" onClick={() => onRowClick && onRowClick(row)}>
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}`,
        image: 'https://via.placeholder.com/300x200/059669/FFFFFF?text=Data+Table',
        category: 'Data',
        tags: ['table', 'data', 'grid', 'ui'],
        createdBy: 'system'
      }
    ];

    // Supprimer les composants existants (optionnel)
    await query(
      'DELETE FROM components WHERE created_by = ?',
      ['system']
    );

    // Créer les nouveaux composants
    let createdCount = 0;
    for (const component of sampleComponents) {
      await query(
        'INSERT INTO components (name, description, code, category, tags, created_by) VALUES (?, ?, ?, ?, ?, ?)',
        [
          component.name,
          component.description,
          component.code,
          component.category,
          component.tags.join(','),
          component.createdBy
        ]
      );
      createdCount++;
    }

    return NextResponse.json({
      message: `${createdCount} composants d'exemple créés avec succès`,
      count: createdCount
    });

  } catch (error) {
    console.error('Erreur lors de la création des composants d\'exemple:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création des composants d\'exemple' },
      { status: 500 }
    );
  }
}

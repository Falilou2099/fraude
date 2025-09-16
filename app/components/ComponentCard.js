'use client';

import Button from './ui/Button';
import Badge from './ui/Badge';

export default function ComponentCard({ 
  component, 
  onEdit, 
  onDelete, 
  onCopy, 
  onOpenEditor 
}) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'UI': 'primary',
      'Form': 'success',
      'Layout': 'warning',
      'Navigation': 'danger',
      'Data': 'default'
    };
    return colors[category] || 'default';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Image du composant */}
      <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
        {component.image ? (
          <img
            src={component.image}
            alt={component.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
            </svg>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-4">
        {/* Header avec nom et catégorie */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {component.name}
          </h3>
          <Badge variant={getCategoryColor(component.category)} size="small">
            {component.category}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {component.description || 'Aucune description disponible'}
        </p>

        {/* Tags */}
        {component.tags && component.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {component.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
              >
                {tag}
              </span>
            ))}
            {component.tags.length > 3 && (
              <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                +{component.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Métadonnées */}
        <div className="text-xs text-gray-500 mb-4">
          <div>Créé le {formatDate(component.createdAt)}</div>
          <div>Par {component.createdBy}</div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="small"
            variant="primary"
            onClick={() => onOpenEditor(component)}
            className="flex-1"
          >
            Éditer
          </Button>
          
          <Button
            size="small"
            variant="secondary"
            onClick={() => onCopy(component.code)}
            title="Copier le code"
          >
            📋
          </Button>
          
          <Button
            size="small"
            variant="secondary"
            onClick={() => onEdit(component)}
            title="Modifier les informations"
          >
            ✏️
          </Button>
          
          <Button
            size="small"
            variant="danger"
            onClick={() => onDelete(component)}
            title="Supprimer"
          >
            🗑️
          </Button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Button from './ui/Button';
import Modal from './ui/Modal';
import ComponentCard from './ComponentCard';
import ComponentForm from './ComponentForm';

export default function ComponentsPage() {
  const [components, setComponents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    search: ''
  });

  const categories = [
    { value: '', label: 'Toutes les catégories' },
    { value: 'UI', label: 'Interface' },
    { value: 'Form', label: 'Formulaires' },
    { value: 'Layout', label: 'Mise en page' },
    { value: 'Navigation', label: 'Navigation' },
    { value: 'Data', label: 'Données' }
  ];

  // Charger les composants
  const loadComponents = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      
      const response = await fetch(`/api/components?${params}`);
      if (response.ok) {
        const data = await response.json();
        setComponents(data);
      } else {
        console.error('Erreur lors du chargement des composants');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComponents();
  }, [filters]);

  // Créer un nouveau composant
  const handleCreateComponent = async (formData) => {
    try {
      const response = await fetch('/api/components', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowCreateModal(false);
        loadComponents();
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la création du composant');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création du composant');
    }
  };

  // Modifier un composant
  const handleEditComponent = async (formData) => {
    try {
      const response = await fetch(`/api/components/${selectedComponent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedComponent(null);
        loadComponents();
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la modification du composant');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la modification du composant');
    }
  };

  // Supprimer un composant
  const handleDeleteComponent = async (component) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le composant "${component.name}" ?`)) {
      try {
        const response = await fetch(`/api/components/${component.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          loadComponents();
        } else {
          console.error('Erreur lors de la suppression du composant');
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  // Copier le code dans le presse-papier
  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      // Vous pourriez ajouter une notification toast ici
      alert('Code copié dans le presse-papier !');
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      alert('Erreur lors de la copie du code');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bibliothèque de Composants
          </h1>
          <p className="mt-2 text-gray-600">
            Gérez et réutilisez vos composants React
          </p>
        </div>

        {/* Filtres et Actions */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            
            <input
              type="text"
              name="search"
              placeholder="Rechercher un composant..."
              value={filters.search}
              onChange={handleFilterChange}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <Button
            onClick={() => setShowCreateModal(true)}
            className="whitespace-nowrap"
          >
            Nouveau Composant
          </Button>
        </div>

        {/* Grille des composants */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {components.map((component) => (
              <ComponentCard
                key={component.id}
                component={component}
                onEdit={(comp) => {
                  setSelectedComponent(comp);
                  setShowEditModal(true);
                }}
                onDelete={handleDeleteComponent}
                onCopy={handleCopyCode}
                onOpenEditor={(comp) => {
                  window.open(`/components/editor/${comp.id}`, '_blank');
                }}
              />
            ))}
          </div>
        )}

        {components.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              Aucun composant trouvé
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              Créer votre premier composant
            </Button>
          </div>
        )}

        {/* Modal de création */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Créer un nouveau composant"
          size="large"
        >
          <ComponentForm
            onSubmit={handleCreateComponent}
            onCancel={() => setShowCreateModal(false)}
          />
        </Modal>

        {/* Modal de modification */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedComponent(null);
          }}
          title="Modifier le composant"
          size="large"
        >
          {selectedComponent && (
            <ComponentForm
              initialData={selectedComponent}
              onSubmit={handleEditComponent}
              onCancel={() => {
                setShowEditModal(false);
                setSelectedComponent(null);
              }}
            />
          )}
        </Modal>
      </div>
    </div>
  );
}

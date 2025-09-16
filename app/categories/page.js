'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '../lib/session';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function Categories() {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [components, setComponents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6B46C1'
  });
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session);
    };

    const loadData = async () => {
      try {
        const [categoriesRes, componentsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/components')
        ]);
        
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        }
        
        if (componentsRes.ok) {
          const componentsData = await componentsRes.json();
          setComponents(componentsData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    loadData();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        
        if (editingCategory) {
          setCategories(categories.map(cat => 
            cat.id === editingCategory.id ? data : cat
          ));
        } else {
          setCategories([...categories, data]);
        }
        
        setShowModal(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '', color: '#6B46C1' });
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#6B46C1'
    });
    setShowModal(true);
  };

  const handleDelete = async (categoryId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCategories(categories.filter(cat => cat.id !== categoryId));
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getComponentsInCategory = (categoryId) => {
    return components.filter(comp => comp.category_id === categoryId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <Sidebar user={user} />
      
      <div className="flex-1 flex flex-col">
        <Header title="Catégories" user={user} />
        
        <div className="p-6">
          {/* Actions */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-white">
              Gestion des Catégories ({categories.length})
            </h2>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Nouvelle Catégorie</span>
            </button>
          </div>

          {/* Categories Grid */}
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-4xl">📁</span>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Aucune catégorie trouvée
              </h3>
              <p className="text-gray-400 mb-6">
                Créez votre première catégorie pour organiser vos composants.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="btn-primary"
              >
                Créer une catégorie
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => {
                const categoryComponents = getComponentsInCategory(category.id);
                return (
                  <div
                    key={category.id}
                    className="card-modern group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-400 mb-2">
                            {category.description || 'Aucune description'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {categoryComponents.length} composant{categoryComponents.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                          title="Éditer"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Components in category */}
                    {categoryComponents.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <p className="text-xs text-gray-400 mb-2">Composants :</p>
                        <div className="flex flex-wrap gap-1">
                          {categoryComponents.slice(0, 3).map((comp) => (
                            <span
                              key={comp.id}
                              className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                            >
                              {comp.name}
                            </span>
                          ))}
                          {categoryComponents.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{categoryComponents.length - 3} autres
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card-modern w-96 max-w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-4">
              {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  required
                  className="input-modern w-full"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nom de la catégorie"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  className="input-modern w-full h-20 resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Description de la catégorie"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Couleur
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    className="w-12 h-10 rounded border border-gray-600 bg-gray-800"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                  />
                  <input
                    type="text"
                    className="input-modern flex-1"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    placeholder="#6B46C1"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCategory(null);
                    setFormData({ name: '', description: '', color: '#6B46C1' });
                  }}
                  className="btn-secondary flex-1"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  {editingCategory ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

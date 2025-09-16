'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '../lib/session';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [components, setComponents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fonction pour obtenir les couleurs selon le langage
  const getLanguageColor = (language) => {
    const colors = {
      javascript: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      typescript: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      react: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      html: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      css: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      scss: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      vue: 'bg-green-500/20 text-green-300 border-green-500/30',
      angular: 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return colors[language?.toLowerCase()] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session);
    };

    const loadComponents = async () => {
      try {
        const response = await fetch('/api/components');
        if (response.ok) {
          const data = await response.json();
          setComponents(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des composants:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    loadComponents();
  }, [router]);

  const handleEditComponent = (component) => {
    router.push(`/editor/${component.id}`);
  };

  const handleDeleteComponent = async (componentId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce composant ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/components/${componentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setComponents(components.filter(c => c.id !== componentId));
      } else {
        alert('Erreur lors de la suppression du composant');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression du composant');
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    // TODO: Add toast notification
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
        <Header title="Dashboard" user={user} />
        
        {/* Main Content */}
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Income & Spending Card */}
            <div className="col-span-2">
              <div className="gradient-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Composants & Utilisation</h3>
                  <div className="flex items-center space-x-4">
                    <span className="text-green-300 text-sm font-medium">+{components.length}</span>
                    <span className="text-red-300 text-sm font-medium">-0</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-2">{components.length}</div>
                <div className="text-purple-200 text-sm">Composants disponibles</div>
              </div>
            </div>

            {/* Debit Card */}
            <div className="gradient-purple rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">Favoris</h3>
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white">⭐</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">0</div>
              <div className="text-purple-200 text-xs">Composants favoris</div>
            </div>

            {/* Bank Card */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">Catégories</h3>
                <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <span className="text-blue-400">📁</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">3</div>
              <div className="text-gray-400 text-xs">Types disponibles</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-white">
              Mes Composants ({components.length})
            </h2>
            <button
              onClick={() => router.push('/editor/new')}
              className="btn-primary flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Nouveau Composant</span>
            </button>
          </div>

          {/* Components Grid */}
          {components.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-4xl">📦</span>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Aucun composant trouvé
              </h3>
              <p className="text-gray-400 mb-6">
                Commencez par créer votre premier composant React.
              </p>
              <button
                onClick={() => router.push('/editor/new')}
                className="btn-primary"
              >
                Créer un composant
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {components.map((component) => (
                <div
                  key={component.id}
                  className="card-modern group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
                        {component.name}
                      </h3>
                      <p className="text-sm text-gray-400 mb-2">
                        {component.description || 'Aucune description'}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span 
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ backgroundColor: getLanguageColor(component.language) + '20', color: getLanguageColor(component.language) }}
                        >
                          {component.language}
                        </span>
                        {component.category_id && (
                          <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full">
                            Catégorisé
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(component.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/editor/${component.id}`)}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                      >
                        Éditer
                      </button>
                      <button
                        onClick={() => handleCopyCode(component.code)}
                        className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors"
                      >
                        Copier
                      </button>
                      <button
                        onClick={() => handleDeleteComponent(component.id)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

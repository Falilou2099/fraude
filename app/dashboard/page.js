'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, clearSession } from '../lib/session';
import { ThemeContext } from '../context/ThemeContext';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [components, setComponents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const loadComponents = async () => {
      try {
        // Initialiser les données d'exemple si nécessaire
        const initResponse = await fetch('/api/components/init', { method: 'POST' });
        
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

    if (user) {
      loadComponents();
    }
  }, [user]);

  const handleLogout = async () => {
    await clearSession();
    router.push('/login');
  };

  const handleDeleteComponent = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce composant ?')) {
      try {
        const response = await fetch(`/api/components/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setComponents(components.filter(c => c.id !== id));
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const copyToClipboard = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      alert('Code copié dans le presse-papiers !');
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Dashboard Composants
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Bienvenue, {user.username}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {theme === 'dark' ? '🌞' : '🌙'}
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Actions */}
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Mes Composants ({components.length})
            </h2>
            <button
              onClick={() => router.push('/editor/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Nouveau Composant
            </button>
          </div>
        </div>

        {/* Components Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : components.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun composant</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Commencez par créer votre premier composant.</p>
            <div className="mt-6">
              <button
                onClick={handleNewComponent}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Créer un composant
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {components.map((component) => (
              <div
                key={component.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {component.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {component.description || 'Aucune description'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLanguageColor(component.language)}`}>
                      {component.language || 'React'}
                    </span>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditComponent(component)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteComponent(component)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                    Créé le {new Date(component.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

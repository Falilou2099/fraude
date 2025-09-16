'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSession } from '../../lib/session';
import { useTheme } from '../../context/ThemeContext';
import { CodeDetector } from '../../lib/codeDetector';
import { CodeCompiler } from '../../lib/codeCompiler';
import Editor from '@monaco-editor/react';

export default function ComponentEditor() {
  const params = useParams();
  const router = useRouter();
  const { isDark } = useTheme();
  const [user, setUser] = useState(null);
  const [component, setComponent] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isLoading, setIsLoading] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveForm, setSaveForm] = useState({ name: '', description: '', category_id: null });
  const [categories, setCategories] = useState([]);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [detectedCodeType, setDetectedCodeType] = useState(null);
  const [autoDetectEnabled, setAutoDetectEnabled] = useState(true);
  const previewRef = useRef(null);
  
  const isNewComponent = params.id === 'new';

  // Fonction pour obtenir la taille de prévisualisation selon le mode
  const getPreviewSize = () => {
    switch (previewMode) {
      case 'mobile':
        return 'w-80 h-96';
      case 'tablet':
        return 'w-96 h-[500px]';
      case 'desktop':
      default:
        return 'w-full h-full';
    }
  };

  const languages = [
    { value: 'javascript', label: 'JavaScript/React' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS/SCSS' },
    { value: 'vue', label: 'Vue.js' },
    { value: 'angular', label: 'Angular' },
    { value: 'svelte', label: 'Svelte' }
  ];

  // Auto-détection du type de code
  const detectAndUpdateCodeType = (newCode) => {
    if (autoDetectEnabled && newCode.trim()) {
      const detected = CodeDetector.detectCodeType(newCode);
      setDetectedCodeType(detected);
      
      // Mettre à jour le langage si différent
      if (detected.language !== language) {
        setLanguage(detected.language);
      }
    }
  };

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    setUser(session);
    
    // Charger les catégories
    loadCategories();
    
    if (params.id !== 'new') {
      loadExistingComponent();
    } else {
      setIsLoading(false);
      const defaultCode = `function MyComponent() {
  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <h2 className="text-xl font-bold text-blue-800 mb-2">Mon Composant React</h2>
      <p className="text-blue-600">Ceci est un exemple de composant React.</p>
    </div>
  );
}`;
      setCode(defaultCode);
      detectAndUpdateCodeType(defaultCode);
    }
  }, [params.id, router]);

  const loadExistingComponent = async () => {
    try {
      const response = await fetch(`/api/components/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setComponent(data);
        setCode(data.code);
        setLanguage(data.language || 'javascript');
        setSaveForm({
          name: data.name,
          description: data.description || '',
          category_id: data.category_id || null
        });
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Erreur:', error);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  // Fonction pour mettre à jour la prévisualisation avec auto-détection
  const updatePreview = async () => {
    if (!previewRef.current) return;
    
    const iframe = previewRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    
    try {
      // Utiliser le système de compilation intelligent
      const codeType = detectedCodeType || CodeDetector.detectCodeType(code);
      const compiledContent = await CodeCompiler.compileCode(code, codeType);
      
      doc.open();
      doc.write(compiledContent);
      doc.close();
    } catch (error) {
      console.error('Erreur de compilation:', error);
      const errorContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Erreur de compilation</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-50 p-4">
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Erreur de compilation:</strong> ${error.message}
            <br><small>Vérifiez votre code et réessayez.</small>
          </div>
        </body>
        </html>
      `;
      
      doc.open();
      doc.write(errorContent);
      doc.close();
    }
  };

  // Ancienne fonction de prévisualisation (fallback)
  const updatePreviewLegacy = () => {
    if (!previewRef.current) return;
    
    const iframe = previewRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    
    let content = '';
    
    if (language === 'html') {
      content = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Preview</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="p-4">
          ${code}
        </body>
        </html>
      `;
    } else if (language === 'css') {
      content = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Preview</title>
          <style>${code}</style>
        </head>
        <body class="p-4">
          <div class="my-component">
            <h2>Aperçu CSS</h2>
            <p>Votre CSS est appliqué à cet élément</p>
          </div>
        </body>
        </html>
      `;
    } else if (language === 'javascript') {
      // Pour JavaScript/React, essayer de rendre le composant
      content = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Preview</title>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { font-family: 'Inter', sans-serif; margin: 0; padding: 16px; }
            .error { color: #ef4444; background: #fef2f2; padding: 12px; border-radius: 8px; border: 1px solid #fecaca; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            try {
              ${code}
              
              // Essayer de rendre le composant par défaut
              const componentName = code.match(/export\\s+default\\s+function\\s+(\\w+)/)?.[1] || 
                                   code.match(/const\\s+(\\w+)\\s*=.*=>/)?.[1] ||
                                   'Component';
              
              if (typeof window[componentName] !== 'undefined') {
                ReactDOM.render(React.createElement(window[componentName]), document.getElementById('root'));
              } else if (typeof eval(componentName) !== 'undefined') {
                ReactDOM.render(React.createElement(eval(componentName)), document.getElementById('root'));
              } else {
                // Essayer d'exécuter le code directement
                const Component = eval('(' + code.replace(/export\\s+default\\s+/, '') + ')');
                ReactDOM.render(React.createElement(Component), document.getElementById('root'));
              }
            } catch (error) {
              document.getElementById('root').innerHTML = 
                '<div class="error"><strong>Erreur de compilation:</strong><br>' + error.message + '</div>';
            }
          </script>
        </body>
        </html>
      `;
    } else {
      // Affichage formaté pour autres langages
      content = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Preview</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { font-family: 'Monaco', 'Menlo', monospace; }
            .code-preview { 
              background: #f8f9fa; 
              padding: 1rem; 
              border-radius: 8px; 
              border-left: 4px solid #3b82f6;
              white-space: pre-wrap;
              font-size: 14px;
              line-height: 1.5;
            }
          </style>
        </head>
        <body class="p-4">
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Aperçu du Code ${language.toUpperCase()}</h3>
            <div class="code-preview">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          </div>
        </body>
        </html>
      `;
    }
    
    doc.open();
    doc.write(content);
    doc.close();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      updatePreview();
    }, 500);

    return () => clearTimeout(timer);
  }, [code, language, detectedCodeType]);

  const getDefaultCode = (lang) => {
    const defaults = {
      javascript: `export default function MyComponent() {
  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <h2 className="text-xl font-bold text-blue-900 mb-2">
        Mon Composant
      </h2>
      <p className="text-blue-700">
        Ceci est un exemple de composant React.
      </p>
    </div>
  );
}`,
      html: `<div class="container">
  <h1>Mon Composant HTML</h1>
  <p>Ceci est un exemple de composant HTML.</p>
  <button class="btn">Cliquez-moi</button>
</div>

<style>
.container {
  padding: 20px;
  background: #f0f9ff;
  border-radius: 8px;
  font-family: Arial, sans-serif;
}

.btn {
  background: #3b82f6;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn:hover {
  background: #2563eb;
}
</style>`,
      css: `.my-component {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  border-radius: 12px;
  color: white;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.my-component h2 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.my-component p {
  margin: 0;
  opacity: 0.9;
}`
    };
    return defaults[lang] || defaults.javascript;
  };


  const handleCodeChange = (value) => {
    const newCode = value || '';
    setCode(newCode);
    setHasUnsavedChanges(true);
    
    // Auto-détection du type de code
    detectAndUpdateCodeType(newCode);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!saveForm.name.trim()) {
      alert('Le nom du composant est requis');
      return;
    }

    setIsSaving(true);
    try {
      const url = isNewComponent ? '/api/components' : `/api/components/${params.id}`;
      const method = isNewComponent ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: saveForm.name,
          description: saveForm.description,
          code,
          language,
          category_id: saveForm.category_id,
          createdBy: user.username
        })
      });

      if (response.ok) {
        setHasUnsavedChanges(false);
        setShowSaveModal(false);
        if (isNewComponent) {
          const newComponent = await response.json();
          router.push(`/editor/${newComponent.id}`);
        }
      } else {
        alert('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const generatePreview = () => {
    if (language === 'html') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Preview</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
          </style>
        </head>
        <body class="bg-gray-50">
          ${code}
        </body>
        </html>
      `;
    } else if (language === 'css') {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Preview</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            ${code}
          </style>
        </head>
        <body class="bg-gray-50 p-8">
          <div class="preview-container bg-white p-6 rounded-lg shadow">
            <h1 class="text-2xl font-bold mb-4">CSS Preview</h1>
            <p class="text-gray-600">Votre CSS est appliqué à cette page</p>
            <div class="mt-4 p-4 border rounded">
              <p>Zone de test pour vos styles CSS</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Preview</title>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-50 p-4">
          <div id="root"></div>
          <script type="text/babel">
            ${code}
            
            // Essayer de rendre le composant
            try {
              const container = document.getElementById('root');
              const root = ReactDOM.createRoot(container);
              
              // Chercher le composant exporté par défaut
              let ComponentToRender = MonComposant;
              if (typeof MonComposant === 'undefined') {
                // Essayer d'autres noms communs
                if (typeof Component !== 'undefined') ComponentToRender = Component;
                else if (typeof App !== 'undefined') ComponentToRender = App;
                else throw new Error('Aucun composant trouvé. Assurez-vous d\'exporter un composant par défaut.');
              }
              
              root.render(React.createElement(ComponentToRender));
            } catch (error) {
              document.getElementById('root').innerHTML = 
                '<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">' +
                '<strong>Erreur:</strong> ' + error.message + 
                '</div>';
            }
          </script>
        </body>
        </html>
      `;
    }
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  if (hasUnsavedChanges && !confirm('Vous avez des modifications non sauvegardées. Continuer ?')) {
                    return;
                  }
                  router.push('/dashboard');
                }}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                ← Retour
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isNewComponent ? 'Nouveau Composant' : component?.name || 'Éditeur'}
              </h1>
              {hasUnsavedChanges && (
                <span className="text-orange-500 text-sm">• Non sauvegardé</span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                  ))}
                </select>
                
                <button
                  onClick={() => setAutoDetectEnabled(!autoDetectEnabled)}
                  className={`px-2 py-1 text-xs rounded ${
                    autoDetectEnabled 
                      ? 'bg-green-100 text-green-800 border border-green-300' 
                      : 'bg-gray-100 text-gray-600 border border-gray-300'
                  }`}
                  title="Auto-détection du langage"
                >
                  🔍 Auto
                </button>
                
                {detectedCodeType && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Détecté: {detectedCodeType.framework} ({detectedCodeType.dialect})
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setShowSaveModal(true)}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-medium"
              >
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Editor Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Code Editor */}
        <div className="w-1/2 border-r border-gray-700">
          <Editor
            height="100%"
            language={language === 'javascript' ? 'javascript' : language}
            value={code}
            onChange={handleCodeChange}
            theme={isDark ? 'vs-dark' : 'light'}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              automaticLayout: true,
              scrollBeyondLastLine: false,
              renderWhitespace: 'selection',
              tabSize: 2
            }}
          />
        </div>

        {/* Preview */}
        <div className="w-1/2 bg-gray-900">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Aperçu:</span>
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`px-3 py-1 text-xs rounded ${
                      previewMode === 'desktop' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    🖥️ Desktop
                  </button>
                  <button
                    onClick={() => setPreviewMode('tablet')}
                    className={`px-3 py-1 text-xs rounded ${
                      previewMode === 'tablet' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    📱 Tablet
                  </button>
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`px-3 py-1 text-xs rounded ${
                      previewMode === 'mobile' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    📱 Mobile
                  </button>
                </div>
                
                <button
                  onClick={updatePreview}
                  className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                  title="Recompiler le code"
                >
                  🔄 Recompiler
                </button>
              </div>
              <h3 className="text-lg font-medium text-white">
                Prévisualisation
              </h3>
            </div>
            <div className="flex-1 p-4 flex justify-center items-start">
              <div className={`${getPreviewSize()} transition-all duration-300 border border-gray-600 rounded-lg overflow-hidden`}>
                <iframe
                  ref={previewRef}
                  className="w-full h-full"
                  title="Preview"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Sauvegarder le composant
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  value={saveForm.name}
                  onChange={(e) => setSaveForm({ ...saveForm, name: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Nom du composant"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={saveForm.description}
                  onChange={(e) => setSaveForm({ ...saveForm, description: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="Description du composant"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Catégorie
                </label>
                <select
                  value={saveForm.category_id || ''}
                  onChange={(e) => setSaveForm({ ...saveForm, category_id: e.target.value || null })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Aucune catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !saveForm.name.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-medium"
              >
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

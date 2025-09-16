'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '../../ui/Button';
import Modal from '../../ui/Modal';
import ComponentForm from '../../ComponentForm';

export default function ComponentEditor() {
  const params = useParams();
  const router = useRouter();
  const [component, setComponent] = useState(null);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [compiledOutput, setCompiledOutput] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Charger le composant
  useEffect(() => {
    if (params.id) {
      loadComponent();
    }
  }, [params.id]);

  const loadComponent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/components/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setComponent(data);
        setCode(data.code);
        compileCode(data.code);
      } else {
        console.error('Erreur lors du chargement du composant');
        router.push('/components');
      }
    } catch (error) {
      console.error('Erreur:', error);
      router.push('/components');
    } finally {
      setIsLoading(false);
    }
  };

  // Compiler le code (simulation)
  const compileCode = (codeToCompile) => {
    try {
      // Simulation de compilation - dans un vrai projet, vous utiliseriez Babel ou un autre compilateur
      const wrappedCode = `
        <div style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
          <div style={{ marginBottom: '10px', fontSize: '14px', color: '#6b7280' }}>
            Prévisualisation du composant:
          </div>
          <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #d1d5db' }}>
            ${codeToCompile.replace(/export default function.*?\{/, '').replace(/\}$/, '')}
          </div>
        </div>
      `;
      setCompiledOutput(wrappedCode);
    } catch (error) {
      setCompiledOutput(`
        <div style={{ padding: '20px', border: '1px solid #ef4444', borderRadius: '8px', backgroundColor: '#fef2f2' }}>
          <div style={{ color: '#dc2626', fontWeight: 'bold', marginBottom: '8px' }}>
            Erreur de compilation:
          </div>
          <pre style={{ color: '#dc2626', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
            ${error.message}
          </pre>
        </div>
      `);
    }
  };

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    setHasChanges(newCode !== component?.code);
    compileCode(newCode);
  };

  const handleSave = () => {
    setShowSaveModal(true);
  };

  const handleSaveConfirm = async (formData) => {
    try {
      const response = await fetch(`/api/components/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          code: code
        }),
      });

      if (response.ok) {
        setShowSaveModal(false);
        setHasChanges(false);
        const updatedComponent = await response.json();
        setComponent(updatedComponent);
        alert('Composant sauvegardé avec succès !');
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      if (confirm('Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter ?')) {
        router.push('/components');
      }
    } else {
      router.push('/components');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!component) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Composant non trouvé</h2>
          <Button onClick={() => router.push('/components')}>
            Retour aux composants
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="secondary"
                onClick={handleBack}
                className="flex items-center space-x-2"
              >
                <span>←</span>
                <span>Retour</span>
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {component.name}
                </h1>
                <p className="text-sm text-gray-500">
                  Éditeur de composant
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {hasChanges && (
                <span className="text-sm text-orange-600 font-medium">
                  Modifications non sauvegardées
                </span>
              )}
              <Button
                onClick={handleSave}
                disabled={!hasChanges}
                variant={hasChanges ? 'primary' : 'secondary'}
              >
                Sauvegarder
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Éditeur */}
      <div className="flex h-screen">
        {/* Panneau de code */}
        <div className="w-1/2 bg-white border-r border-gray-200">
          <div className="h-full flex flex-col">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h2 className="text-sm font-medium text-gray-900">Code du composant</h2>
            </div>
            <div className="flex-1 p-4">
              <textarea
                value={code}
                onChange={handleCodeChange}
                className="w-full h-full resize-none border border-gray-300 rounded-md p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Écrivez votre code React ici..."
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        {/* Panneau de prévisualisation */}
        <div className="w-1/2 bg-gray-50">
          <div className="h-full flex flex-col">
            <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
              <h2 className="text-sm font-medium text-gray-900">Prévisualisation</h2>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              <div 
                className="w-full h-full"
                dangerouslySetInnerHTML={{ __html: compiledOutput }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal de sauvegarde */}
      <Modal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title="Sauvegarder le composant"
        size="large"
      >
        <ComponentForm
          initialData={component}
          onSubmit={handleSaveConfirm}
          onCancel={() => setShowSaveModal(false)}
        />
      </Modal>
    </div>
  );
}

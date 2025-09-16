'use client';

import { useState } from 'react';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';

const categoryOptions = [
  { value: 'UI', label: 'Interface' },
  { value: 'Form', label: 'Formulaires' },
  { value: 'Layout', label: 'Mise en page' },
  { value: 'Navigation', label: 'Navigation' },
  { value: 'Data', label: 'Données' }
];

export default function ComponentForm({ 
  initialData = {}, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    code: initialData.code || '',
    image: initialData.image || '',
    category: initialData.category || 'UI',
    tags: initialData.tags ? initialData.tags.join(', ') : '',
    createdBy: initialData.createdBy || 'user'
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }
    
    if (!formData.code.trim()) {
      newErrors.code = 'Le code est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const submitData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };
    
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nom du composant"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
        placeholder="Ex: ButtonPrimary, CardProduct..."
      />
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Description du composant et de son utilisation"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Code du composant
          <span className="text-red-500 ml-1">*</span>
        </label>
        <textarea
          name="code"
          value={formData.code}
          onChange={handleChange}
          error={errors.code}
          rows={8}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm ${
            errors.code ? 'border-red-500' : ''
          }`}
          placeholder="export default function MonComposant() { return <div>Hello</div>; }"
        />
        {errors.code && (
          <p className="mt-1 text-sm text-red-600">{errors.code}</p>
        )}
      </div>
      
      <Input
        label="Image (URL optionnelle)"
        name="image"
        type="url"
        value={formData.image}
        onChange={handleChange}
        placeholder="https://exemple.com/image.png"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Catégorie"
          name="category"
          value={formData.category}
          onChange={handleChange}
          options={categoryOptions}
          required
        />
        
        <Input
          label="Tags (séparés par des virgules)"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="button, primary, ui"
        />
      </div>
      
      <Input
        label="Créé par"
        name="createdBy"
        value={formData.createdBy}
        onChange={handleChange}
        placeholder="Nom de l'auteur"
      />
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
}

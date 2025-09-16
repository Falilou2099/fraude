'use client';

import { useState } from 'react';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';

const statusOptions = [
  { value: 'PENDING', label: 'En attente' },
  { value: 'INVESTIGATING', label: 'En cours d\'investigation' },
  { value: 'RESOLVED', label: 'Résolu' },
  { value: 'REJECTED', label: 'Rejeté' }
];

const priorityOptions = [
  { value: 'LOW', label: 'Faible' },
  { value: 'MEDIUM', label: 'Moyen' },
  { value: 'HIGH', label: 'Élevé' },
  { value: 'CRITICAL', label: 'Critique' }
];

export default function FraudeCaseForm({ 
  initialData = {}, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    amount: initialData.amount || '',
    status: initialData.status || 'PENDING',
    priority: initialData.priority || 'MEDIUM',
    reportedBy: initialData.reportedBy || '',
    assignedTo: initialData.assignedTo || ''
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
    
    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }
    
    if (!formData.reportedBy.trim()) {
      newErrors.reportedBy = 'Le rapporteur est requis';
    }
    
    if (formData.amount && isNaN(parseFloat(formData.amount))) {
      newErrors.amount = 'Le montant doit être un nombre valide';
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
      amount: formData.amount ? parseFloat(formData.amount) : null
    };
    
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Titre"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        required
        placeholder="Titre du cas de fraude"
      />
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Description détaillée du cas de fraude"
        />
      </div>
      
      <Input
        label="Montant (€)"
        name="amount"
        type="number"
        step="0.01"
        value={formData.amount}
        onChange={handleChange}
        error={errors.amount}
        placeholder="Montant impliqué dans la fraude"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Statut"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={statusOptions}
          required
        />
        
        <Select
          label="Priorité"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          options={priorityOptions}
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Rapporté par"
          name="reportedBy"
          value={formData.reportedBy}
          onChange={handleChange}
          error={errors.reportedBy}
          required
          placeholder="Nom de la personne qui a rapporté"
        />
        
        <Input
          label="Assigné à"
          name="assignedTo"
          value={formData.assignedTo}
          onChange={handleChange}
          placeholder="Nom de la personne assignée"
        />
      </div>
      
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

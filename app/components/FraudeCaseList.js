'use client';

import { useState } from 'react';
import Table from './ui/Table';
import Badge from './ui/Badge';
import Button from './ui/Button';

const getStatusVariant = (status) => {
  const variants = {
    'PENDING': 'pending',
    'INVESTIGATING': 'investigating', 
    'RESOLVED': 'resolved',
    'REJECTED': 'rejected'
  };
  return variants[status] || 'default';
};

const getPriorityVariant = (priority) => {
  const variants = {
    'LOW': 'success',
    'MEDIUM': 'warning',
    'HIGH': 'danger',
    'CRITICAL': 'danger'
  };
  return variants[priority] || 'default';
};

const formatAmount = (amount) => {
  if (!amount) return '-';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function FraudeCaseList({ 
  cases = [], 
  onCaseClick, 
  onEdit, 
  onDelete,
  isLoading = false 
}) {
  const [selectedCases, setSelectedCases] = useState([]);

  const columns = [
    {
      key: 'title',
      label: 'Titre',
      render: (value) => (
        <div className="font-medium text-gray-900">{value}</div>
      )
    },
    {
      key: 'status',
      label: 'Statut',
      render: (value) => (
        <Badge variant={getStatusVariant(value)}>
          {value === 'PENDING' && 'En attente'}
          {value === 'INVESTIGATING' && 'Investigation'}
          {value === 'RESOLVED' && 'Résolu'}
          {value === 'REJECTED' && 'Rejeté'}
        </Badge>
      )
    },
    {
      key: 'priority',
      label: 'Priorité',
      render: (value) => (
        <Badge variant={getPriorityVariant(value)}>
          {value === 'LOW' && 'Faible'}
          {value === 'MEDIUM' && 'Moyen'}
          {value === 'HIGH' && 'Élevé'}
          {value === 'CRITICAL' && 'Critique'}
        </Badge>
      )
    },
    {
      key: 'amount',
      label: 'Montant',
      render: (value) => formatAmount(value)
    },
    {
      key: 'reportedBy',
      label: 'Rapporté par'
    },
    {
      key: 'createdAt',
      label: 'Date de création',
      render: (value) => formatDate(value)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <Button
            size="small"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(row);
            }}
          >
            Modifier
          </Button>
          <Button
            size="small"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(row);
            }}
          >
            Supprimer
          </Button>
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <Table
        columns={columns}
        data={cases}
        onRowClick={onCaseClick}
        className="shadow-sm border border-gray-200 rounded-lg"
      />
    </div>
  );
}

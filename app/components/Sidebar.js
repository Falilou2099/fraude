'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { clearSession } from '../lib/session';

export default function Sidebar({ user }) {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      path: '/dashboard'
    },
    {
      id: 'editor',
      label: 'Éditeur',
      icon: '✏️',
      path: '/editor/new'
    },
    {
      id: 'components',
      label: 'Composants',
      icon: '🧩',
      path: '/dashboard'
    },
    {
      id: 'categories',
      label: 'Catégories',
      icon: '📁',
      path: '/categories'
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: '⚙️',
      path: '/settings'
    }
  ];

  const handleLogout = async () => {
    await clearSession();
    router.push('/login');
  };

  return (
    <div className="w-64 h-screen bg-gray-900 border-r border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg">Fraude</h1>
            <p className="text-gray-400 text-xs">Library</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6">
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => router.push(item.path)}
            className={`sidebar-item ${pathname === item.path ? 'active' : ''}`}
          >
            <span className="text-xl mr-3">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </div>
        ))}
      </nav>

      {/* Upgrade Section */}
      <div className="p-6">
        <div className="gradient-purple rounded-xl p-4 text-center">
          <div className="text-white text-2xl mb-2">⭐</div>
          <h3 className="text-white font-semibold mb-1">Upgrade</h3>
          <p className="text-purple-100 text-xs mb-3">
            Accédez à plus de fonctionnalités premium
          </p>
          <button className="w-full bg-white/20 hover:bg-white/30 text-white text-sm py-2 px-4 rounded-lg transition-all duration-200">
            Découvrir →
          </button>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-6 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="text-white font-medium text-sm">{user?.username || 'Utilisateur'}</p>
              <p className="text-gray-400 text-xs">Développeur</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-400 transition-colors duration-200"
            title="Déconnexion"
          >
            🚪
          </button>
        </div>
      </div>
    </div>
  );
}

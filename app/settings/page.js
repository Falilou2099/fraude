'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, setSession, clearSession } from '../lib/session';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [preferences, setPreferences] = useState({
    theme: 'dark',
    language: 'fr',
    editorFontSize: 14,
    autoSave: true,
    showLineNumbers: true,
    wordWrap: true
  });
  const [accounts, setAccounts] = useState([]);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [newAccountForm, setNewAccountForm] = useState({
    username: '',
    password: '',
    confirmPassword: ''
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
      setProfileForm({
        username: session.username,
        email: session.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    };

    const loadAccounts = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setAccounts(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des comptes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    loadAccounts();
  }, [router]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: profileForm.username,
          email: profileForm.email,
          currentPassword: profileForm.currentPassword,
          newPassword: profileForm.newPassword
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        await setSession(updatedUser);
        alert('Profil mis à jour avec succès');
        setProfileForm({
          ...profileForm,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour du profil');
    }
  };

  const handleAccountSwitch = async (account) => {
    if (account.id === user.id) return;
    
    try {
      await setSession(account);
      setUser(account);
      router.push('/dashboard');
    } catch (error) {
      console.error('Erreur lors du changement de compte:', error);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    
    if (newAccountForm.password !== newAccountForm.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newAccountForm.username,
          password: newAccountForm.password
        })
      });

      if (response.ok) {
        const newAccount = await response.json();
        setAccounts([...accounts, newAccount]);
        setShowAccountModal(false);
        setNewAccountForm({ username: '', password: '', confirmPassword: '' });
        alert('Compte créé avec succès');
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la création du compte');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création du compte');
    }
  };

  const savePreferences = () => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    alert('Préférences sauvegardées');
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
        <Header title="Paramètres" user={user} />
        
        <div className="p-6">
          {/* Tabs */}
          <div className="flex space-x-1 mb-6">
            {[
              { id: 'profile', label: 'Profil', icon: '👤' },
              { id: 'preferences', label: 'Préférences', icon: '⚙️' },
              { id: 'accounts', label: 'Comptes', icon: '👥' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card-modern max-w-2xl">
              <h3 className="text-xl font-semibold text-white mb-6">Informations du profil</h3>
              
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom d'utilisateur
                  </label>
                  <input
                    type="text"
                    className="input-modern w-full"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm({...profileForm, username: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="input-modern w-full"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                    placeholder="votre@email.com"
                  />
                </div>
                
                <div className="border-t border-gray-700 pt-4">
                  <h4 className="text-lg font-medium text-white mb-4">Changer le mot de passe</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Mot de passe actuel
                      </label>
                      <input
                        type="password"
                        className="input-modern w-full"
                        value={profileForm.currentPassword}
                        onChange={(e) => setProfileForm({...profileForm, currentPassword: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        className="input-modern w-full"
                        value={profileForm.newPassword}
                        onChange={(e) => setProfileForm({...profileForm, newPassword: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Confirmer le nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        className="input-modern w-full"
                        value={profileForm.confirmPassword}
                        onChange={(e) => setProfileForm({...profileForm, confirmPassword: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button type="submit" className="btn-primary">
                    Mettre à jour le profil
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="card-modern max-w-2xl">
              <h3 className="text-xl font-semibold text-white mb-6">Préférences</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Thème
                  </label>
                  <select
                    className="input-modern w-full"
                    value={preferences.theme}
                    onChange={(e) => setPreferences({...preferences, theme: e.target.value})}
                  >
                    <option value="dark">Sombre</option>
                    <option value="light">Clair</option>
                    <option value="auto">Automatique</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Langue
                  </label>
                  <select
                    className="input-modern w-full"
                    value={preferences.language}
                    onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Taille de police de l'éditeur
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="20"
                    className="w-full"
                    value={preferences.editorFontSize}
                    onChange={(e) => setPreferences({...preferences, editorFontSize: parseInt(e.target.value)})}
                  />
                  <div className="text-sm text-gray-400 mt-1">{preferences.editorFontSize}px</div>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-3"
                      checked={preferences.autoSave}
                      onChange={(e) => setPreferences({...preferences, autoSave: e.target.checked})}
                    />
                    <span className="text-gray-300">Sauvegarde automatique</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-3"
                      checked={preferences.showLineNumbers}
                      onChange={(e) => setPreferences({...preferences, showLineNumbers: e.target.checked})}
                    />
                    <span className="text-gray-300">Afficher les numéros de ligne</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-3"
                      checked={preferences.wordWrap}
                      onChange={(e) => setPreferences({...preferences, wordWrap: e.target.checked})}
                    />
                    <span className="text-gray-300">Retour à la ligne automatique</span>
                  </label>
                </div>
                
                <div className="pt-4">
                  <button onClick={savePreferences} className="btn-primary">
                    Sauvegarder les préférences
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Accounts Tab */}
          {activeTab === 'accounts' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">Gestion des comptes</h3>
                <button
                  onClick={() => setShowAccountModal(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <span>➕</span>
                  <span>Nouveau compte</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className={`card-modern cursor-pointer transition-all ${
                      account.id === user.id ? 'ring-2 ring-purple-500' : 'hover:border-purple-500/30'
                    }`}
                    onClick={() => handleAccountSwitch(account)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {account.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{account.username}</h4>
                        <p className="text-gray-400 text-sm">
                          {account.id === user.id ? 'Compte actuel' : 'Cliquer pour changer'}
                        </p>
                      </div>
                      {account.id === user.id && (
                        <div className="text-green-400">✓</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card-modern w-96 max-w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-4">
              Créer un nouveau compte
            </h3>
            
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  required
                  className="input-modern w-full"
                  value={newAccountForm.username}
                  onChange={(e) => setNewAccountForm({...newAccountForm, username: e.target.value})}
                  placeholder="Nom d'utilisateur"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  required
                  className="input-modern w-full"
                  value={newAccountForm.password}
                  onChange={(e) => setNewAccountForm({...newAccountForm, password: e.target.value})}
                  placeholder="Mot de passe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  required
                  className="input-modern w-full"
                  value={newAccountForm.confirmPassword}
                  onChange={(e) => setNewAccountForm({...newAccountForm, confirmPassword: e.target.value})}
                  placeholder="Confirmer le mot de passe"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAccountModal(false);
                    setNewAccountForm({ username: '', password: '', confirmPassword: '' });
                  }}
                  className="btn-secondary flex-1"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

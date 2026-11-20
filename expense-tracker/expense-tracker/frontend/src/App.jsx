import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import TransactionModal from './components/TransactionModal';
import LoadingSpinner from './components/LoadingSpinner';

export default function App() {
  const { isAuthenticated, loading } = useAuth();
  const [authPage, setAuthPage] = useState('login'); // 'login' | 'register'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey(k => k + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <LoadingSpinner text="Securing session & loading application..." />
      </div>
    );
  }

  // If not authenticated, render Login / Register
  if (!isAuthenticated) {
    if (authPage === 'register') {
      return <Register onNavigateLogin={() => setAuthPage('login')} />;
    }
    return <Login onNavigateRegister={() => setAuthPage('register')} />;
  }

  // Authenticated SaaS Dashboard
  return (
    <MainLayout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      onTransactionSaved={triggerRefresh}
    >
      <div key={refreshKey}>
        {activeTab === 'dashboard' && (
          <Dashboard
            onNavigateTransactions={() => setActiveTab('transactions')}
            onNavigateBudgets={() => setActiveTab('budgets')}
            onNavigateAnalytics={() => setActiveTab('analytics')}
            onOpenAddTransaction={() => setQuickAddOpen(true)}
          />
        )}

        {activeTab === 'transactions' && (
          <Transactions
            onOpenAddTransaction={() => setQuickAddOpen(true)}
          />
        )}

        {activeTab === 'budgets' && (
          <Budgets />
        )}

        {activeTab === 'analytics' && (
          <Analytics />
        )}

        {activeTab === 'reports' && (
          <Reports />
        )}

        {activeTab === 'profile' && (
          <Profile />
        )}

        {activeTab === 'settings' && (
          <Settings />
        )}
      </div>

      {/* Global Quick Add Transaction Modal */}
      <TransactionModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onSuccess={triggerRefresh}
      />
    </MainLayout>
  );
}

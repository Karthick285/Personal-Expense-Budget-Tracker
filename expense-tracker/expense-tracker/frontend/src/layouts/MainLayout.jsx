import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import TransactionModal from '../components/TransactionModal';

export default function MainLayout({
  activeTab,
  onSelectTab,
  children,
  onTransactionSaved
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const tabTitles = {
    dashboard: 'Financial Dashboard',
    transactions: 'Transaction History',
    budgets: 'Monthly Budget Planning',
    analytics: 'Visual Analytics & Charts',
    reports: 'Data Export & Reports',
    profile: 'User Profile & Security',
    settings: 'Application Settings'
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        onOpenAddTransaction={() => setAddModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          activeTabTitle={tabTitles[activeTab] || 'Dashboard'}
          onOpenAddTransaction={() => setAddModalOpen(true)}
          onSelectTab={onSelectTab}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Add Transaction Modal */}
      <TransactionModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => {
          if (onTransactionSaved) onTransactionSaved();
        }}
      />
    </div>
  );
}

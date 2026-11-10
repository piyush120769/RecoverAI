import React, { useState } from 'react';
import { RecoveryProvider } from './context/RecoveryContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { OverviewView } from './components/overview/OverviewView';
import { CustomersView } from './components/customers/CustomersView';
import { CustomerDetailPanel } from './components/customers/CustomerDetailPanel';
import { CampaignsView } from './components/campaigns/CampaignsView';
import { CallHistoryView } from './components/calls/CallHistoryView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsView } from './components/settings/SettingsView';
import { SimulationModal } from './components/simulator/SimulationModal';

function DashboardContent() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F1F4F8] flex font-sans text-[#17243A]">
      {/* Left Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
      />

      {/* Main Content Column */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0 min-h-screen">
        {/* Top bar */}
        <TopBar 
          activeTab={activeTab} 
          onMobileToggle={() => setIsMobileOpen(true)} 
        />

        {/* Page Content with generous desktop padding and natural page scrolling */}
        <main className="flex-1 px-6 sm:px-8 lg:px-9 py-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <OverviewView onNavigateTab={(tab) => setActiveTab(tab)} />
          )}
          {activeTab === 'customers' && <CustomersView />}
          {activeTab === 'campaigns' && <CampaignsView />}
          {activeTab === 'calls' && <CallHistoryView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>

        {/* Professional 3-part Footer: strictly sticks to bottom on short pages, flows naturally on long pages */}
        <footer className="mt-auto px-6 sm:px-8 py-5 border-t border-slate-200/90 bg-white text-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500">
          <div className="text-left font-medium">
            © 2026 RecoverAI. All rights reserved.
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] bg-slate-100 text-slate-600 px-3 py-1.5 rounded-md border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Demo Environment</span>
          </div>
          <div className="text-right text-slate-400 font-medium">
            AI-Powered Autopay Recovery Platform
          </div>
        </footer>
      </div>

      {/* Global Slide-Overs & Modals */}
      <CustomerDetailPanel />
      <SimulationModal />
    </div>
  );
}

export default function App() {
  return (
    <RecoveryProvider>
      <DashboardContent />
    </RecoveryProvider>
  );
}

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardHome } from './pages/DashboardHome';
import { InboxView } from './pages/InboxView';
import { CustomersView } from './pages/CustomersView';
import { LeadsView } from './pages/LeadsView';
import { AppointmentsView } from './pages/AppointmentsView';
import { OrdersView } from './pages/OrdersView';
import { AutomationsView } from './pages/AutomationsView';
import { ProductsView } from './pages/ProductsView';
import { KnowledgeBaseView } from './pages/KnowledgeBaseView';
import { AnalyticsView } from './pages/AnalyticsView';
import { BillingView } from './pages/BillingView';
import { AdminPanelView } from './pages/AdminPanelView';
import { OnboardingWizard } from './pages/OnboardingWizard';
import { LandingPage } from './pages/LandingPage';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [showLanding, setShowLanding] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  if (showLanding) {
    return (
      <LandingPage
        onStartFree={() => {
          setShowLanding(false);
          setShowOnboarding(true);
        }}
        onEnterDashboard={() => {
          setShowLanding(false);
          setCurrentView('dashboard');
        }}
      />
    );
  }

  if (showOnboarding) {
    return (
      <OnboardingWizard
        onComplete={() => {
          setShowOnboarding(false);
          setCurrentView('dashboard');
        }}
      />
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardHome onNavigate={(tab) => setCurrentView(tab)} />;
      case 'inbox':
        return <InboxView />;
      case 'customers':
        return <CustomersView />;
      case 'leads':
        return <LeadsView />;
      case 'appointments':
        return <AppointmentsView />;
      case 'orders':
        return <OrdersView />;
      case 'automations':
        return <AutomationsView />;
      case 'products':
        return <ProductsView />;
      case 'knowledge':
      case 'ai_settings':
        return <KnowledgeBaseView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'billing':
        return <BillingView />;
      case 'admin':
        return <AdminPanelView />;
      default:
        return <DashboardHome onNavigate={(tab) => setCurrentView(tab)} />;
    }
  };

  return (
    <AppLayout currentTab={currentView} setCurrentTab={setCurrentView}>
      {/* Top Banner to switch to Landing or Onboarding demo */}
      <div className="mb-4 flex items-center justify-between bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs shadow-2xs">
        <div className="flex items-center gap-2 text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>ReplyFlow AI Demo Environment</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLanding(true)}
            className="text-slate-600 hover:text-slate-900 font-semibold px-2 py-1 rounded hover:bg-slate-100 transition-colors"
          >
            View Public Landing Page
          </button>
          <span>•</span>
          <button
            onClick={() => setShowOnboarding(true)}
            className="text-emerald-700 hover:text-emerald-800 font-bold px-2 py-1 rounded hover:bg-emerald-50 transition-colors"
          >
            Test 8-Step Onboarding Flow
          </button>
        </div>
      </div>

      {renderContent()}
    </AppLayout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <AppContent />
      </SubscriptionProvider>
    </AuthProvider>
  );
};
export default App;

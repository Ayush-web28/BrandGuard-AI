import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { Studio } from './components/Studio';
import { VaultView } from './components/VaultView';
import { PolicyGraphView } from './components/PolicyGraphView';
import { AnalyticsView } from './components/AnalyticsView';
import { ReviewsView } from './components/ReviewsView';
import { TeamView } from './components/TeamView';
import { SettingsView } from './components/SettingsView';
import { BrandProfile, ReviewerRole, ScanResult } from './types';
import { fetchBrands } from './lib/api';

export function App() {
  const [showLanding, setShowLanding] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>('inkloom');
  const [currentRole, setCurrentRole] = useState<ReviewerRole>('creator');
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null);

  useEffect(() => {
    async function init() {
      const b = await fetchBrands();
      setBrands(b);
      if (b.length > 0) {
        setSelectedBrandId(b[0].brand_id);
      }
    }
    init();
  }, []);

  const currentBrand = brands.find((b) => b.brand_id === selectedBrandId) || brands[0];

  // If showing landing page
  if (showLanding) {
    return <LandingPage onEnterStudio={() => setShowLanding(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F1E9] text-[#202820] flex font-sans antialiased selection:bg-[#D97745] selection:text-white">
      
      {/* Persistent Elegant Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        brands={brands}
        selectedBrandId={selectedBrandId}
        setSelectedBrandId={setSelectedBrandId}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        onExitToLanding={() => setShowLanding(true)}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 overflow-y-auto min-h-screen px-6 lg:px-12 py-8">
        {currentBrand ? (
          <>
            {activeTab === 'overview' && (
              <DashboardView
                currentBrand={currentBrand}
                onNavigateToStudio={() => setActiveTab('studio')}
                onNavigateToReviews={() => setActiveTab('approvals')}
                onNavigateToVault={() => setActiveTab('vault')}
              />
            )}

            {activeTab === 'studio' && (
              <Studio
                currentBrand={currentBrand}
                currentRole={currentRole}
                onScanCompleted={(res) => setLastScanResult(res)}
                onNavigateToReviews={() => setActiveTab('approvals')}
              />
            )}

            {activeTab === 'vault' && (
              <VaultView currentBrand={currentBrand} />
            )}

            {activeTab === 'graph' && (
              <PolicyGraphView currentBrand={currentBrand} />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView />
            )}

            {activeTab === 'approvals' && (
              <ReviewsView
                currentRole={currentRole}
                selectedBrandId={selectedBrandId}
              />
            )}

            {activeTab === 'team' && (
              <TeamView
                currentRole={currentRole}
                setCurrentRole={setCurrentRole}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView />
            )}
          </>
        ) : (
          <div className="flex items-center justify-center min-h-[60vh] text-xs font-mono text-[#82917A]">
            Initializing BrandGuard Studio Knowledge Engine...
          </div>
        )}
      </main>

    </div>
  );
}

export default App;

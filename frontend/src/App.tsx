import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Studio } from './components/Studio';
import { VaultView } from './components/VaultView';
import { ReviewsView } from './components/ReviewsView';
import { AnalyticsView } from './components/AnalyticsView';
import { BrandProfile, ReviewerRole, ScanResult } from './types';
import { fetchBrands } from './lib/api';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('studio');
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

  const currentBrand = brands.find(b => b.brand_id === selectedBrandId) || brands[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        brands={brands}
        selectedBrandId={selectedBrandId}
        setSelectedBrandId={setSelectedBrandId}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentBrand ? (
          <>
            {activeTab === 'studio' && (
              <Studio
                currentBrand={currentBrand}
                currentRole={currentRole}
                onScanCompleted={(res) => setLastScanResult(res)}
                onNavigateToReviews={() => setActiveTab('reviews')}
              />
            )}

            {activeTab === 'vault' && (
              <VaultView currentBrand={currentBrand} />
            )}

            {activeTab === 'reviews' && (
              <ReviewsView
                currentRole={currentRole}
                selectedBrandId={selectedBrandId}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView />
            )}
          </>
        ) : (
          <div className="text-center py-20 text-slate-500">
            Initializing BrandGuard Knowledge Engine...
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong>BrandGuard AI</strong> &bull; Team ZeroToOne (Ayush Trivedi) &bull; CodeZen India 2026
          </span>
          <div className="flex items-center space-x-3 text-slate-400">
            <a
              href="https://github.com/Ayush-web28/BrandGuard-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-400 transition"
            >
              GitHub Repository
            </a>
            <span>&bull;</span>
            <span>Apache 2.0 License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

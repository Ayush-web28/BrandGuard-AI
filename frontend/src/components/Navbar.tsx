import React from 'react';
import { ShieldCheck, Sparkles, Building2, UserCheck, Layers } from 'lucide-react';
import { BrandProfile, ReviewerRole } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  brands: BrandProfile[];
  selectedBrandId: string;
  setSelectedBrandId: (id: string) => void;
  currentRole: ReviewerRole;
  setCurrentRole: (role: ReviewerRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  brands,
  selectedBrandId,
  setSelectedBrandId,
  currentRole,
  setCurrentRole
}) => {
  const selectedBrand = brands.find(b => b.brand_id === selectedBrandId) || brands[0];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Product Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-white">BrandGuard</span>
                <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent font-black text-lg">AI</span>
                <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Round 2 Build
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Intelligent Multimodal Brand Governance Platform</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'studio'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('vault')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'vault'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Brand Vault</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'reviews'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Reviews</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Analytics & Radar</span>
            </button>
          </nav>

          {/* Brand Selector & Active Role Switcher */}
          <div className="flex items-center space-x-3">
            {/* Brand Dropdown */}
            <div className="flex items-center space-x-1.5 bg-slate-800/80 border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-xs">
              <span className="text-slate-400 font-medium">Brand:</span>
              <select
                value={selectedBrandId}
                onChange={(e) => setSelectedBrandId(e.target.value)}
                className="bg-transparent text-indigo-300 font-semibold focus:outline-none cursor-pointer"
              >
                {brands.map((b) => (
                  <option key={b.brand_id} value={b.brand_id} className="bg-slate-900 text-slate-100">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Dropdown */}
            <div className="hidden md:flex items-center space-x-1.5 bg-slate-800/80 border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-xs">
              <span className="text-slate-400 font-medium">Role:</span>
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as ReviewerRole)}
                className="bg-transparent text-emerald-400 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="creator" className="bg-slate-900 text-slate-100">✍️ Creator</option>
                <option value="brand_manager" className="bg-slate-900 text-slate-100">🛡️ Brand Manager</option>
                <option value="legal_compliance" className="bg-slate-900 text-slate-100">⚖️ Legal Compliance</option>
              </select>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};

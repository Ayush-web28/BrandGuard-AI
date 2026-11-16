import React from 'react';
import {
  LayoutDashboard, Sparkles, BookOpen, Network, BarChart3,
  CheckSquare, Users, Settings, ShieldCheck, ChevronRight, LogOut
} from 'lucide-react';
import { BrandProfile, ReviewerRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  brands: BrandProfile[];
  selectedBrandId: string;
  setSelectedBrandId: (id: string) => void;
  currentRole: ReviewerRole;
  setCurrentRole: (role: ReviewerRole) => void;
  onExitToLanding: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  brands,
  selectedBrandId,
  setSelectedBrandId,
  currentRole,
  setCurrentRole,
  onExitToLanding
}) => {
  const workspaceItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'studio', label: 'Creative Review', icon: Sparkles },
    { id: 'vault', label: 'Brand Vault', icon: BookOpen },
    { id: 'graph', label: 'Policy Graph', icon: Network },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const managementItems = [
    { id: 'approvals', label: 'Approvals', icon: CheckSquare },
    { id: 'team', label: 'Team & Roles', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 bg-[#202820] text-[#F5F1E9] border-r border-[#2d382d] flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      
      {/* Brand & Studio Header */}
      <div>
        <div className="p-5 border-b border-[#2d382d]/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#D97745] text-white flex items-center justify-center font-serif font-bold text-lg shadow-sm">
              B
            </div>
            <div>
              <span className="font-serif text-base font-bold text-[#F5F1E9] block leading-tight">
                BrandGuard
              </span>
              <span className="text-[10px] text-[#D8CBB7] uppercase tracking-widest font-mono">
                Studio Edition
              </span>
            </div>
          </div>

          <button
            onClick={onExitToLanding}
            title="Return to Landing Page"
            className="text-[#D8CBB7]/60 hover:text-[#F5F1E9] p-1 rounded-md transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Brand Switcher Pill */}
        <div className="p-4">
          <div className="bg-[#2a342a] border border-[#3b473b] rounded-xl p-2.5 space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#82917A] block font-semibold">
              Active Brand Profile
            </span>
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-[#F5F1E9] focus:outline-none cursor-pointer"
            >
              {brands.map((b) => (
                <option key={b.brand_id} value={b.brand_id} className="bg-[#202820] text-[#F5F1E9]">
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="px-3 space-y-6">
          
          {/* Section: WORKSPACE */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-mono uppercase tracking-widest text-[#82917A] font-semibold block mb-2">
              Workspace
            </span>
            {workspaceItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#D97745] text-white shadow-sm font-semibold'
                      : 'text-[#D8CBB7] hover:bg-[#2a342a] hover:text-[#F5F1E9]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#82917A]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>

          {/* Section: MANAGEMENT */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-mono uppercase tracking-widest text-[#82917A] font-semibold block mb-2">
              Management
            </span>
            {managementItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#D97745] text-white shadow-sm font-semibold'
                      : 'text-[#D8CBB7] hover:bg-[#2a342a] hover:text-[#F5F1E9]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#82917A]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* User / Persona Footer */}
      <div className="p-4 border-t border-[#2d382d]/80 bg-[#1c221c]">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-[#F5F1E9] block">Ayush Trivedi</span>
            <span className="text-[10px] text-[#82917A] font-mono block">ZeroToOne Lead</span>
          </div>

          {/* Role Pill Switcher */}
          <select
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value as ReviewerRole)}
            className="bg-[#2a342a] border border-[#3b473b] text-[10px] font-mono text-[#D8CBB7] rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
          >
            <option value="creator">Creator</option>
            <option value="brand_manager">Reviewer</option>
            <option value="legal_compliance">Legal</option>
          </select>
        </div>
      </div>

    </aside>
  );
};

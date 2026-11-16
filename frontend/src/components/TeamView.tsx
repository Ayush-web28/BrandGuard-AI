import React from 'react';
import { Users, ShieldCheck, UserCheck, Key, Lock, Check } from 'lucide-react';
import { ReviewerRole } from '../types';

interface TeamViewProps {
  currentRole: ReviewerRole;
  setCurrentRole: (role: ReviewerRole) => void;
}

export const TeamView: React.FC<TeamViewProps> = ({ currentRole, setCurrentRole }) => {
  const members = [
    {
      name: 'Ayush Trivedi',
      email: 'ayush.ct0406@gmail.com',
      role: 'Team Lead & AI Systems Architect',
      tier: 'brand_manager',
      status: 'Active',
      github: 'github.com/Ayush-web28'
    },
    {
      name: 'Creative Agency Partner',
      email: 'agency@creative-studio.io',
      role: 'External Copywriter & Designer',
      tier: 'creator',
      status: 'Active',
      github: 'External Contributor'
    },
    {
      name: 'General Counsel & Risk Officer',
      email: 'compliance@enterprise.com',
      role: 'Legal Compliance Officer',
      tier: 'legal_compliance',
      status: 'Active',
      github: 'Sign-off Authority'
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-[#D8CBB7] gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#D97745] font-semibold block mb-1">
            Governance Hierarchy &bull; Team ZeroToOne
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-[#202820] font-normal leading-tight">
            Team & Role Permissions
          </h1>
          <p className="text-xs md:text-sm text-[#202820]/70 mt-1 max-w-xl">
            Configure role boundaries between creative authoring, editorial brand triage, and legal publishing authority.
          </p>
        </div>

        {/* Current Active Persona Switcher */}
        <div className="flex items-center space-x-2 bg-[#FFFFFF] border border-[#D8CBB7] p-2 rounded-xl text-xs shadow-sm">
          <span className="text-[#82917A] font-mono font-semibold">Active Persona:</span>
          <select
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value as ReviewerRole)}
            className="bg-transparent font-bold text-[#202820] focus:outline-none cursor-pointer"
          >
            <option value="creator">✍️ Content Creator</option>
            <option value="brand_manager">🛡️ Brand Manager</option>
            <option value="legal_compliance">⚖️ Legal Compliance</option>
          </select>
        </div>
      </div>

      {/* Team Roster Table */}
      <div className="bg-[#FFFFFF] border border-[#D8CBB7] rounded-2xl overflow-hidden shadow-editorial">
        <div className="p-6 border-b border-[#EBE5D8] flex items-center justify-between">
          <h3 className="font-serif text-xl font-normal text-[#202820]">
            Authorized Personnel
          </h3>
          <span className="text-xs font-mono text-[#82917A]">3 SEATS ALLOCATED</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FDFBF7] text-[#202820] font-mono uppercase text-[10px] tracking-wider border-b border-[#EBE5D8]">
              <tr>
                <th className="p-4">Member Name</th>
                <th className="p-4">Role & Domain</th>
                <th className="p-4">Governance Tier</th>
                <th className="p-4">Access Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE5D8]">
              {members.map((m, idx) => (
                <tr key={idx} className="hover:bg-[#F5F1E9]/40 transition">
                  <td className="p-4">
                    <div className="font-bold text-[#202820]">{m.name}</div>
                    <div className="text-[11px] text-[#202820]/60 font-mono mt-0.5">{m.email}</div>
                  </td>
                  <td className="p-4 text-[#202820]/80">
                    <div>{m.role}</div>
                    <div className="text-[10px] text-[#82917A] font-mono">{m.github}</div>
                  </td>
                  <td className="p-4">
                    <span className="bg-[#EBE5D8] text-[#202820] font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                      {m.tier.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-[#82917A] font-semibold">
                    &bull; {m.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-[#FFFFFF] border border-[#D8CBB7] rounded-2xl p-6 shadow-editorial space-y-4">
        <h3 className="font-serif text-xl font-normal text-[#202820]">
          Role Permissions Matrix
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-[#FDFBF7] rounded-xl border border-[#EBE5D8] space-y-2">
            <h4 className="font-bold text-[#202820]">Creator Tier</h4>
            <ul className="space-y-1.5 text-[#202820]/75">
              <li className="flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5 text-[#82917A]" />
                <span>Run pre-flight policy scans</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5 text-[#82917A]" />
                <span>Apply intent-preserving fixes</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5 text-[#82917A]" />
                <span>Submit to approval queue</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-[#FDFBF7] rounded-xl border border-[#EBE5D8] space-y-2">
            <h4 className="font-bold text-[#202820]">Brand Manager Tier</h4>
            <ul className="space-y-1.5 text-[#202820]/75">
              <li className="flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5 text-[#82917A]" />
                <span>All Creator capabilities</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5 text-[#82917A]" />
                <span>Grant publication clearance</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5 text-[#82917A]" />
                <span>Edit Brand Vault & Tokens</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-[#FDFBF7] rounded-xl border border-[#EBE5D8] space-y-2">
            <h4 className="font-bold text-[#202820]">Legal Compliance Tier</h4>
            <ul className="space-y-1.5 text-[#202820]/75">
              <li className="flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5 text-[#82917A]" />
                <span>All Brand Manager capabilities</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5 text-[#82917A]" />
                <span>Sign cryptographic audit certificates</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5 text-[#82917A]" />
                <span>Update verified factual truth store</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { Layers, ShieldCheck, CheckCircle, Database, Palette, FileText, Plus } from 'lucide-react';
import { BrandProfile, Rule, ApprovedFact } from '../types';

interface VaultViewProps {
  currentBrand: BrandProfile;
}

export const VaultView: React.FC<VaultViewProps> = ({ currentBrand }) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'facts' | 'tokens'>('rules');

  return (
    <div className="space-y-6">
      
      {/* Brand Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-400">
              Active Brand Profile
            </span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
              {currentBrand.brand_id}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">{currentBrand.name}</h1>
          <p className="text-xs text-slate-400 mt-1">{currentBrand.tagline}</p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'rules' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Guidelines & Rules ({currentBrand.rules.length})
          </button>
          <button
            onClick={() => setActiveTab('facts')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'facts' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Approved Facts ({currentBrand.approved_facts.length})
          </button>
          <button
            onClick={() => setActiveTab('tokens')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'tokens' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Design Tokens
          </button>
        </div>
      </div>

      {/* Tab 1: Rules */}
      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentBrand.rules.map((rule) => (
            <div
              key={rule.rule_id}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-500/20 px-2 py-0.5 rounded">
                    {rule.rule_id}
                  </span>
                  <h3 className="text-sm font-bold text-slate-200 mt-1">{rule.title}</h3>
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  rule.severity === 'critical'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {rule.severity}
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{rule.description}</p>

              {rule.forbidden_terms && rule.forbidden_terms.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-red-400 tracking-wider">
                    Forbidden Terms:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {rule.forbidden_terms.map((term) => (
                      <span key={term} className="text-[11px] bg-red-950/40 text-red-300 border border-red-500/20 px-2 py-0.5 rounded font-mono">
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>{rule.source_document}</span>
                <span className="font-mono">{rule.citation_ref}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Approved Facts Database */}
      {activeTab === 'facts' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-200">Verified Factual Truth Store</h3>
              <p className="text-xs text-slate-400">All marketing copy metrics must verify against these approved assertions:</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">ID & Subject</th>
                  <th className="p-3.5">Verified Claim Text</th>
                  <th className="p-3.5">Approved Metric</th>
                  <th className="p-3.5">Source Document</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {currentBrand.approved_facts.map((fact) => (
                  <tr key={fact.fact_id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5">
                      <span className="font-mono text-indigo-400 font-bold">{fact.fact_id}</span>
                      <div className="font-semibold text-slate-200 mt-0.5">{fact.subject}</div>
                    </td>
                    <td className="p-3.5 text-slate-300 max-w-xs">{fact.claim_text}</td>
                    <td className="p-3.5">
                      <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-500/20 font-mono px-2 py-0.5 rounded font-bold">
                        {fact.verified_metric || 'Verified'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">
                      <div>{fact.source_document}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{fact.citation_ref}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Design Tokens */}
      {activeTab === 'tokens' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
              <Palette className="w-4 h-4 text-indigo-400" />
              <span>Palette Tokens</span>
            </h3>

            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-400">Primary Brand Color:</span>
                <div className="flex items-center space-x-3 mt-1">
                  <div
                    className="w-8 h-8 rounded-lg shadow border border-slate-700"
                    style={{ backgroundColor: currentBrand.tokens.primary_color }}
                  />
                  <span className="font-mono text-xs text-slate-200 font-bold">
                    {currentBrand.tokens.primary_color}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400">Secondary Accent:</span>
                <div className="flex items-center space-x-3 mt-1">
                  <div
                    className="w-8 h-8 rounded-lg shadow border border-slate-700"
                    style={{ backgroundColor: currentBrand.tokens.secondary_color }}
                  />
                  <span className="font-mono text-xs text-slate-200 font-bold">
                    {currentBrand.tokens.secondary_color}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400">Supporting Accents:</span>
                <div className="flex space-x-2 mt-1">
                  {currentBrand.tokens.accent_colors.map((c) => (
                    <div
                      key={c}
                      className="w-7 h-7 rounded shadow border border-slate-700"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h3 className="font-bold text-sm text-slate-200 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Accessibility Rules</span>
            </h3>
            <p className="text-xs text-slate-400">
              Minimum Luminance Contrast Ratio required for all published collateral:
            </p>
            <div className="text-2xl font-black text-emerald-400">
              {currentBrand.tokens.min_contrast_ratio}:1 (WCAG AA)
            </div>
            <p className="text-[11px] text-slate-500">
              Evaluated mathematically using W3C relative luminance formula:
              <br /><code className="text-indigo-300">L = 0.2126*R + 0.7152*G + 0.0722*B</code>
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

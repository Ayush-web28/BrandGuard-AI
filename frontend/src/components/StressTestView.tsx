import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, ShieldCheck, Zap, AlertTriangle, Bug, Wrench, RefreshCw,
  CheckCircle2, ArrowRight, Lock, Eye, Sparkles, Scale, Terminal
} from 'lucide-react';
import { BrandProfile, StressTestReport, StressTestScenario } from '../types';
import { runStressTest, patchPolicyLoophole } from '../lib/api';

interface StressTestViewProps {
  brand: BrandProfile;
  onRefreshBrand?: () => void;
}

export const StressTestView: React.FC<StressTestViewProps> = ({ brand, onRefreshBrand }) => {
  const [report, setReport] = useState<StressTestReport | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [patchingId, setPatchingId] = useState<string | null>(null);
  const [patchedSuccess, setPatchedSuccess] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadTestReport();
  }, [brand.brand_id]);

  async function loadTestReport() {
    setIsRunning(true);
    const res = await runStressTest(brand.brand_id);
    setReport(res);
    setIsRunning(false);
  }

  async function handleApplyPatch(scenario: StressTestScenario) {
    if (!scenario.recommended_patch_rule) return;
    setPatchingId(scenario.scenario_id);
    
    await patchPolicyLoophole({
      brand_id: brand.brand_id,
      scenario_id: scenario.scenario_id,
      patch_type: 'add_forbidden_term',
      forbidden_terms: scenario.recommended_patch_rule.prohibited_terms,
      preferred_terms: scenario.recommended_patch_rule.preferred_terms
    });

    setPatchedSuccess((prev) => ({ ...prev, [scenario.scenario_id]: true }));
    setPatchingId(null);
    if (onRefreshBrand) onRefreshBrand();
    
    // Automatically re-run to demonstrate live resilience lift!
    setTimeout(async () => {
      const updated = await runStressTest(brand.brand_id);
      setReport(updated);
    }, 600);
  }

  const categories = [
    { id: 'all', label: 'All Vectors' },
    { id: 'unsubstantiated_superlative', label: 'Superlative Evasion' },
    { id: 'ambiguous_comparative', label: 'Comparative Claims' },
    { id: 'covert_pricing', label: 'Deceptive Pricing' },
    { id: 'statutory_transparency_evasion', label: 'AI Transparency' }
  ];

  const filteredScenarios = report?.scenarios.filter((s) => {
    if (selectedCategory === 'all') return true;
    return s.category === selectedCategory;
  }) || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#D8CBB7]/80 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-[#D97745] font-semibold mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span>Round 3 Improvement 3 &bull; Adversarial Simulation Agent</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-[#202820] font-normal tracking-tight">
            Policy Stress-Testing & Loophole Lab
          </h1>
          <p className="text-sm text-[#202820]/70 max-w-2xl mt-1">
            Autonomous adversarial agent that generates deceptive, synthetic marketing copy to expose regulatory loopholes and ambiguities in <strong>{brand.name}</strong> guidelines before company-wide publication.
          </p>
        </div>

        <button
          onClick={loadTestReport}
          disabled={isRunning}
          className="inline-flex items-center space-x-2 bg-[#202820] hover:bg-[#343e34] text-[#F5F1E9] text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow active:scale-95 shrink-0 disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Simulating Attacks...' : 'Run Adversarial Suite'}</span>
        </button>
      </div>

      {/* Metrics Banner */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-[#D8CBB7] shadow-sm">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#82917A] block mb-1">
              Policy Resilience Score
            </span>
            <div className="flex items-baseline space-x-2">
              <span className={`font-serif text-4xl font-bold ${report.resilience_score >= 80 ? 'text-[#82917A]' : report.resilience_score >= 50 ? 'text-[#D97745]' : 'text-rose-600'}`}>
                {report.resilience_score}%
              </span>
              <span className="text-xs text-[#202820]/60 font-mono">
                {report.resilience_score >= 80 ? 'Hardened' : 'Vulnerable'}
              </span>
            </div>
            <div className="w-full bg-[#F5F1E9] h-2 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${report.resilience_score >= 80 ? 'bg-[#82917A]' : report.resilience_score >= 50 ? 'bg-[#D97745]' : 'bg-rose-500'}`}
                style={{ width: `${report.resilience_score}%` }}
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#D8CBB7] shadow-sm">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#82917A] block mb-1">
              Active Attack Vectors Tested
            </span>
            <span className="font-serif text-4xl font-bold text-[#202820]">
              {report.total_scenarios_tested}
            </span>
            <span className="text-xs text-[#202820]/60 block mt-1 font-mono">
              Synthetic Evasion Simulations
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#D8CBB7] shadow-sm">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#D97745] block mb-1">
              Discovered Policy Loopholes
            </span>
            <span className="font-serif text-4xl font-bold text-[#D97745]">
              {report.loopholes_discovered}
            </span>
            <span className="text-xs text-[#202820]/60 block mt-1 font-mono">
              {report.loopholes_discovered === 0 ? 'Zero Loopholes Detected' : 'Requires Policy Fortification'}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#202820] text-[#F5F1E9] border border-[#202820] shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#D8CBB7] block mb-1">
                Active Governance Engine
              </span>
              <span className="text-xs font-semibold block text-white">
                Multi-Hop GraphRAG &bull; Round 3
              </span>
            </div>
            <div className="pt-3 border-t border-[#343e34] flex items-center justify-between text-[11px] font-mono text-[#D8CBB7]">
              <span>Host Jurisdiction</span>
              <span className="text-[#D97745] font-semibold">{brand.region_code || 'GLOBAL'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`text-xs px-3.5 py-1.5 rounded-full transition font-medium ${
              selectedCategory === cat.id
                ? 'bg-[#202820] text-white shadow-sm'
                : 'bg-white text-[#202820]/75 hover:bg-[#D8CBB7]/40 border border-[#D8CBB7]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Scenarios Grid */}
      <div className="space-y-4">
        {filteredScenarios.map((scenario) => {
          const isEvaded = scenario.status === 'evaded_loophole';
          const isPatched = patchedSuccess[scenario.scenario_id];

          return (
            <div
              key={scenario.scenario_id}
              className={`p-6 rounded-2xl bg-white border transition-all duration-200 shadow-sm ${
                isEvaded && !isPatched
                  ? 'border-rose-300 hover:border-rose-400 bg-gradient-to-r from-rose-50/20 via-white to-white'
                  : 'border-[#D8CBB7] hover:border-[#82917A]'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                
                <div className="space-y-3 flex-1">
                  
                  {/* Status & Category Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#F5F1E9] text-[#202820] border border-[#D8CBB7]">
                      {scenario.scenario_id}
                    </span>

                    {isEvaded && !isPatched ? (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Loophole Evaded Policy</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{isPatched ? 'Policy Patched & Fortified' : 'Intercepted by Policy'}</span>
                      </span>
                    )}

                    <span className="text-[11px] text-[#82917A] font-mono uppercase tracking-wide">
                      {scenario.category.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Title & Attack Vector */}
                  <h3 className="font-serif text-lg font-semibold text-[#202820]">
                    {scenario.title}
                  </h3>

                  {/* Synthetic Adversarial Attack Copy */}
                  <div className="p-3.5 rounded-xl bg-[#F5F1E9]/80 border border-[#D8CBB7]/80 text-xs text-[#202820] font-sans">
                    <div className="flex items-center space-x-1.5 text-[10px] font-mono uppercase text-[#D97745] font-semibold mb-1">
                      <Terminal className="w-3 h-3" />
                      <span>Synthetic Adversarial Copy:</span>
                    </div>
                    <p className="italic font-serif text-sm text-[#202820]">
                      "{scenario.synthetic_attack_copy}"
                    </p>
                  </div>

                  {/* Exploitation Vector Description */}
                  <p className="text-xs text-[#202820]/75 leading-relaxed">
                    <strong>Vector:</strong> {scenario.intended_adversarial_vector}
                  </p>

                  {/* Loophole Explanation if evaded */}
                  {isEvaded && scenario.exploited_loophole && !isPatched && (
                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
                      <span className="font-semibold block flex items-center space-x-1">
                        <Bug className="w-3.5 h-3.5 text-amber-700" />
                        <span>Identified Policy Loophole:</span>
                      </span>
                      <p className="leading-relaxed">
                        {scenario.exploited_loophole}
                      </p>
                    </div>
                  )}

                </div>

                {/* Remediation Action Card */}
                {isEvaded && scenario.recommended_patch_rule && !isPatched && (
                  <div className="w-full md:w-72 shrink-0 p-4 rounded-xl bg-[#F5F1E9] border border-[#D8CBB7] space-y-3 self-center">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#D97745] font-bold flex items-center space-x-1">
                      <Wrench className="w-3 h-3" />
                      <span>Automated Policy Patch</span>
                    </div>
                    
                    <p className="text-[11px] text-[#202820]/80">
                      Inject canonical proscriptions for <strong>{scenario.recommended_patch_rule.prohibited_terms.slice(0, 2).join(', ')}</strong> directly into Brand Vault rule <code>{scenario.recommended_patch_rule.rule_id}</code>.
                    </p>

                    <button
                      onClick={() => handleApplyPatch(scenario)}
                      disabled={patchingId === scenario.scenario_id}
                      className="w-full inline-flex items-center justify-center space-x-2 bg-[#D97745] hover:bg-[#c46534] text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{patchingId === scenario.scenario_id ? 'Patching Policy...' : 'Apply 1-Click Patch'}</span>
                    </button>
                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

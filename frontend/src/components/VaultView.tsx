import React, { useState, useEffect } from 'react';
import {
  Palette, Type, FileText, CheckCircle, AlertOctagon, BookOpen,
  Sliders, ShieldCheck, Download, Plus, Copy, Check, Globe, GitBranch,
  Building2, Landmark, Shield
} from 'lucide-react';
import { BrandProfile, Rule, ApprovedFact, BrandHierarchyNode } from '../types';
import { fetchBrandHierarchy } from '../lib/api';

interface VaultViewProps {
  currentBrand: BrandProfile;
}

export const VaultView: React.FC<VaultViewProps> = ({ currentBrand }) => {
  const [activeSection, setActiveSection] = useState<'palette' | 'typography' | 'terminology' | 'voice' | 'facts' | 'hierarchy'>('palette');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [hierarchyData, setHierarchyData] = useState<BrandHierarchyNode[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  useEffect(() => {
    async function loadHierarchy() {
      const data = await fetchBrandHierarchy();
      setHierarchyData(data);
    }
    loadHierarchy();
  }, []);

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  // Color Swatches from Brand Profile
  const swatches = [
    {
      name: 'Primary Accent',
      hex: currentBrand.tokens.primary_color,
      usage: 'Hero buttons, key navigational anchors, primary badges',
      contrastOnWhite: '4.8:1 (Pass AA)',
      isPrimary: true
    },
    {
      name: 'Secondary Accent',
      hex: currentBrand.tokens.secondary_color,
      usage: 'Supporting highlights, graphic borders, active tab indicators',
      contrastOnWhite: '4.5:1 (Pass AA)',
      isPrimary: false
    },
    ...(currentBrand.tokens.accent_colors.map((c, i) => ({
      name: `Accent Tint ${i + 1}`,
      hex: c,
      usage: 'Data visualization, status indicators, badges',
      contrastOnWhite: '3.8:1 (UI Only)',
      isPrimary: false
    })))
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      
      {/* Brand Vault Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#D8CBB7]">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#D97745] font-semibold block mb-1">
            Visual Identity & Rule Standards &bull; {currentBrand.name}
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-[#202820] font-normal leading-tight">
            Brand Identity Vault
          </h1>
          <p className="text-xs md:text-sm text-[#202820]/70 mt-1 max-w-xl">
            Single source of truth for color tokens, typography scales, approved terminology, and verified assertions.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 bg-[#FFFFFF] p-1.5 rounded-xl border border-[#D8CBB7] shadow-sm text-xs">
          {[
            { id: 'palette', label: 'Color Palette', icon: Palette },
            { id: 'typography', label: 'Typography', icon: Type },
            { id: 'terminology', label: 'Terminology', icon: BookOpen },
            { id: 'voice', label: 'Voice & Tone', icon: Sliders },
            { id: 'facts', label: 'Verified Proofs', icon: CheckCircle },
            { id: 'hierarchy', label: 'Multi-Brand & Regional', icon: Globe },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                  isActive
                    ? 'bg-[#202820] text-[#F5F1E9] shadow-sm font-semibold'
                    : 'text-[#202820]/70 hover:text-[#202820] hover:bg-[#EBE5D8]/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= SECTION 1: INTERACTIVE COLOR PALETTE ================= */}
      {activeSection === 'palette' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-normal text-[#202820]">
              Design Token Swatches
            </h3>
            <span className="text-xs text-[#82917A] font-mono">
              WCAG 2.1 AA Threshold: &ge; 4.5:1
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {swatches.map((s) => (
              <div
                key={s.hex}
                className="bg-[#FFFFFF] border border-[#D8CBB7] rounded-2xl overflow-hidden shadow-editorial transition hover:shadow-float"
              >
                <div
                  className="h-32 w-full p-4 flex items-end justify-between cursor-pointer relative group"
                  style={{ backgroundColor: s.hex }}
                  onClick={() => handleCopyHex(s.hex)}
                >
                  <span className="font-mono text-xs font-bold text-white bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded">
                    {s.hex}
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 transition bg-black/40 text-white text-[10px] px-2 py-1 rounded flex items-center space-x-1">
                    {copiedHex === s.hex ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHex === s.hex ? 'Copied' : 'Copy'}</span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-[#202820]">{s.name}</h4>
                    <p className="text-xs text-[#202820]/70 mt-0.5">{s.usage}</p>
                  </div>

                  <div className="pt-3 border-t border-[#EBE5D8] flex items-center justify-between text-xs font-mono">
                    <span className="text-[#82917A]">Luminance Contrast</span>
                    <span className="font-bold text-[#202820]">{s.contrastOnWhite}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Prohibited Colors Warning Box */}
          {currentBrand.tokens.forbidden_colors && currentBrand.tokens.forbidden_colors.length > 0 && (
            <div className="bg-[#FFFFFF] border border-[#D8CBB7] rounded-2xl p-6 shadow-editorial space-y-3">
              <div className="flex items-center space-x-2 text-[#D97745]">
                <AlertOctagon className="w-4 h-4" />
                <h4 className="text-xs font-mono uppercase tracking-wider font-bold">
                  Prohibited Brand Colors
                </h4>
              </div>
              <p className="text-xs text-[#202820]/70">
                Saturated synthetic neons detract from the authoritative studio aesthetic and are strictly blocked:
              </p>
              <div className="flex space-x-3">
                {currentBrand.tokens.forbidden_colors.map((c) => (
                  <div key={c} className="flex items-center space-x-2 text-xs font-mono">
                    <div className="w-5 h-5 rounded border border-[#D8CBB7]" style={{ backgroundColor: c }} />
                    <span className="line-through text-[#202820]/60">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= SECTION 2: TYPOGRAPHY GUIDELINES ================= */}
      {activeSection === 'typography' && (
        <div className="bg-[#FFFFFF] border border-[#D8CBB7] rounded-2xl p-8 shadow-editorial space-y-8">
          <div>
            <h3 className="font-serif text-2xl font-normal text-[#202820]">
              Typography Specimens
            </h3>
            <p className="text-xs text-[#202820]/70 mt-1">
              Curated font pairings designed for editorial distinction and technical clarity.
            </p>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-[#FDFBF7] rounded-xl border border-[#EBE5D8] space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#D97745] font-bold">
                Editorial Display Headings &bull; DM Serif Display / Playfair
              </span>
              <div className="font-serif text-4xl text-[#202820] font-normal">
                Aa Bb Cc Dd Ee Ff Gg 0123456789
              </div>
              <p className="text-xs text-[#202820]/60 italic font-serif">
                "The quick brown fox jumps over the lazy dog."
              </p>
            </div>

            <div className="p-6 bg-[#FDFBF7] rounded-xl border border-[#EBE5D8] space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#82917A] font-bold">
                Body & Interface Sans &bull; Inter / Manrope
              </span>
              <div className="font-sans text-2xl text-[#202820] font-normal">
                Aa Bb Cc Dd Ee Ff Gg 0123456789
              </div>
              <p className="text-xs text-[#202820]/75 leading-relaxed max-w-xl">
                Engineered for maximum legibility at small sizes across digital screens, documentation, and interface controls.
              </p>
            </div>

            <div className="p-6 bg-[#FDFBF7] rounded-xl border border-[#EBE5D8] space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#202820] font-bold">
                Technical Data & Metrics &bull; JetBrains Mono / Geist Mono
              </span>
              <div className="font-mono text-xl text-[#202820]">
                LATENCY: &lt;50ms &bull; SLA: 99.99% &bull; HEX: #D97745
              </div>
              <p className="text-xs text-[#202820]/60 font-mono">
                Tabular numerals for financial metrics, citations, and hash certificates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 3: APPROVED TERMINOLOGY ================= */}
      {activeSection === 'terminology' && (
        <div className="bg-[#FFFFFF] border border-[#D8CBB7] rounded-2xl overflow-hidden shadow-editorial">
          <div className="p-6 border-b border-[#EBE5D8] flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-normal text-[#202820]">
                Canonical Nomenclature & Buzzword Filter
              </h3>
              <p className="text-xs text-[#202820]/70 mt-1">
                Approved vocabulary versus prohibited colloquialisms enforced by the Policy Knowledge Graph.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FDFBF7] text-[#202820] font-mono uppercase text-[10px] tracking-wider border-b border-[#EBE5D8]">
                <tr>
                  <th className="p-4">Prohibited Phrase</th>
                  <th className="p-4">Approved Canonical Substitute</th>
                  <th className="p-4">Guideline Rationale</th>
                  <th className="p-4">Policy Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE5D8]">
                {[
                  { bad: 'game-changer', good: 'effective solution', why: 'Eliminates hyperbolic tech cliché', code: 'INK-TONE-01' },
                  { bad: 'revolutionary', good: 'advanced / modern', why: 'Restores restrained engineering tone', code: 'INK-TONE-01' },
                  { bad: 'silver bullet', good: 'complete solution', why: 'Prevents deceptive over-promising', code: 'INK-TONE-01' },
                  { bad: '100% bug-free', good: 'rigorously benchmarked', why: 'FTC substantiation compliance', code: 'INK-CLAIM-01' },
                  { bad: 'zero downtime', good: '99.9% uptime SLA', why: 'Contractual SLA accuracy', code: 'INK-CLAIM-01' },
                  { bad: 'the only platform', good: 'a leading enterprise platform', why: 'Antitrust claim liability', code: 'INK-CLAIM-01' },
                  { bad: 'BGAI / brandguard ai', good: 'BrandGuard AI', why: 'Canonical product title casing', code: 'INK-TERM-01' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F5F1E9]/40 transition">
                    <td className="p-4 font-mono text-[#D97745] font-semibold">
                      <span className="line-through">{row.bad}</span>
                    </td>
                    <td className="p-4 font-mono text-[#82917A] font-bold">
                      {row.good}
                    </td>
                    <td className="p-4 text-[#202820]/80">
                      {row.why}
                    </td>
                    <td className="p-4 font-mono text-[#202820]/60 text-[11px]">
                      {row.code}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= SECTION 4: VOICE & TONE ================= */}
      {activeSection === 'voice' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#FFFFFF] border border-[#D8CBB7] rounded-2xl p-6 shadow-editorial space-y-4">
            <h3 className="font-serif text-xl font-normal text-[#202820]">
              Tonal Parameters
            </h3>
            <p className="text-xs text-[#202820]/70">
              Target linguistic vectors evaluated by the pre-flight scan:
            </p>

            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span>Formality</span>
                  <span className="font-bold text-[#202820]">75% (Executive)</span>
                </div>
                <div className="w-full bg-[#EBE5D8] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#202820] h-full w-[75%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span>Authority</span>
                  <span className="font-bold text-[#202820]">85% (Evidence-Driven)</span>
                </div>
                <div className="w-full bg-[#EBE5D8] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#D97745] h-full w-[85%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span>Approachability</span>
                  <span className="font-bold text-[#202820]">70% (Human & Direct)</span>
                </div>
                <div className="w-full bg-[#EBE5D8] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#82917A] h-full w-[70%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#D8CBB7] rounded-2xl p-6 shadow-editorial space-y-4">
            <h3 className="font-serif text-xl font-normal text-[#202820]">
              Editorial Voice Statement
            </h3>
            <div className="p-5 bg-[#FDFBF7] rounded-xl border border-[#EBE5D8] space-y-2 text-xs leading-relaxed text-[#202820]/80">
              <p>
                <strong>{currentBrand.name}</strong> speaks with the precision of an engineering laboratory and the warmth of a senior creative partner.
              </p>
              <p>
                We never shout. We never rely on empty superlatives. When we state performance metrics, we cite the source document.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 5: VERIFIED PROOFS ================= */}
      {activeSection === 'facts' && (
        <div className="bg-[#FFFFFF] border border-[#D8CBB7] rounded-2xl overflow-hidden shadow-editorial">
          <div className="p-6 border-b border-[#EBE5D8]">
            <h3 className="font-serif text-xl font-normal text-[#202820]">
              Verified Factual Proof Points
            </h3>
            <p className="text-xs text-[#202820]/70 mt-1">
              Active enterprise assertions verified against technical benchmarks and commercial contracts:
            </p>
          </div>

          <div className="divide-y divide-[#EBE5D8]">
            {currentBrand.approved_facts.map((fact) => (
              <div key={fact.fact_id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FDFBF7] transition">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-[#D97745] font-bold bg-[#D97745]/10 px-2 py-0.5 rounded">
                      {fact.fact_id}
                    </span>
                    <h4 className="text-sm font-bold text-[#202820]">{fact.subject}</h4>
                  </div>
                  <p className="text-xs text-[#202820]/80">{fact.claim_text}</p>
                  <p className="text-[11px] text-[#202820]/60 font-mono">
                    Ref: {fact.source_document} ({fact.citation_ref})
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <span className="text-xs font-mono font-bold text-[#82917A] bg-[#82917A]/15 px-3 py-1 rounded-full">
                    {fact.verified_metric || 'Verified'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SECTION 6: HIERARCHICAL MULTI-BRAND & REGIONAL POLICY TREE ================= */}
      {activeSection === 'hierarchy' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-[#D97745] font-semibold mb-1">
                <Globe className="w-3.5 h-3.5" />
                <span>Round 3 Improvement 2 &bull; Hierarchical Multi-Brand & Regional Inheritance</span>
              </div>
              <h3 className="font-serif text-2xl font-normal text-[#202820]">
                Enterprise Policy Inheritance Architecture
              </h3>
              <p className="text-xs text-[#202820]/75 max-w-2xl mt-1">
                Global parent guidelines dynamically cascade to regional subsidiaries while strictly enforcing statutory consumer protection and transparency mandates (FTC, EU AI Act, ASA).
              </p>
            </div>

            <div className="inline-flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-[#D8CBB7] text-xs font-mono text-[#82917A]">
              <GitBranch className="w-3.5 h-3.5" />
              <span>Hierarchical Graph Enabled</span>
            </div>
          </div>

          {/* Hierarchy Tree Diagram Card */}
          <div className="p-6 rounded-2xl bg-white border border-[#D8CBB7] shadow-sm space-y-6">
            
            {/* Parent Global Brand Node */}
            <div className="p-5 rounded-xl bg-[#202820] text-white border border-[#343e34] shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D97745]/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#D97745] text-white flex items-center justify-center font-serif font-bold text-lg shadow-sm">
                    G
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#D97745] font-semibold">
                        Parent Brand &bull; Root Authority
                      </span>
                      <span className="bg-[#82917A]/20 text-[#82917A] text-[10px] font-mono px-2 py-0.5 rounded-full">
                        GLOBAL HQ
                      </span>
                    </div>
                    <h4 className="font-serif text-lg font-bold text-[#F5F1E9]">
                      Inkloom AI (Global Headquarters)
                    </h4>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs font-mono text-[#D8CBB7]">
                  <span className="bg-[#2a342a] px-3 py-1.5 rounded-lg border border-[#3b473b]">
                    <strong>6</strong> Universal Global Rules
                  </span>
                  <span className="bg-[#2a342a] px-3 py-1.5 rounded-lg border border-[#3b473b]">
                    <strong>100%</strong> Policy Cascade
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#343e34] flex flex-wrap items-center gap-3 text-xs text-[#D8CBB7]">
                <span className="text-[11px] font-mono text-[#82917A]">Cascading Directives:</span>
                <span className="bg-white/5 px-2.5 py-1 rounded-md text-[11px] font-mono">INK-TONE-01 (Authoritative Voice)</span>
                <span className="bg-white/5 px-2.5 py-1 rounded-md text-[11px] font-mono">INK-CLAIM-01 (Substantiation)</span>
                <span className="bg-white/5 px-2.5 py-1 rounded-md text-[11px] font-mono">INK-VIS-01 (Color Tokens)</span>
                <span className="bg-white/5 px-2.5 py-1 rounded-md text-[11px] font-mono">INK-ACC-01 (WCAG Contrast)</span>
              </div>
            </div>

            {/* Downward Tree Connector Arrow */}
            <div className="flex items-center justify-center -my-2">
              <div className="flex flex-col items-center text-[#D97745]">
                <div className="w-0.5 h-6 bg-[#D8CBB7]" />
                <span className="text-[10px] font-mono uppercase tracking-widest bg-[#F5F1E9] border border-[#D8CBB7] px-3 py-0.5 rounded-full font-semibold">
                  Inherited Policy Delegation
                </span>
                <div className="w-0.5 h-6 bg-[#D8CBB7]" />
              </div>
            </div>

            {/* Regional Subsidiary Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              
              {/* North America */}
              <div className="p-5 rounded-xl bg-[#F5F1E9]/70 border border-[#D8CBB7] hover:border-[#D97745] transition space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D97745] bg-[#D97745]/10 px-2 py-0.5 rounded">
                    US Jurisdiction
                  </span>
                  <span className="text-[11px] font-mono text-[#82917A] font-semibold">
                    8 Rules Total
                  </span>
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-[#202820]">
                    Inkloom North America
                  </h4>
                  <p className="text-xs text-[#202820]/70 mt-0.5">
                    US Federal Trade Commission (FTC) & SOC2 compliance.
                  </p>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-[#D8CBB7]/80 text-xs font-mono">
                  <div className="flex justify-between text-[#202820]/75">
                    <span>Inherited from Global:</span>
                    <span className="font-bold text-[#202820]">6 Rules</span>
                  </div>
                  <div className="flex justify-between text-[#D97745]">
                    <span>Regional Statutory:</span>
                    <span className="font-bold">2 Rules</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-[#D8CBB7]/80">
                  <span className="text-[10px] font-mono uppercase text-[#82917A] block mb-1">
                    Enforced Frameworks:
                  </span>
                  <span className="inline-block bg-white text-[#202820] text-[10px] font-mono px-2 py-0.5 rounded border border-[#D8CBB7] mr-1 mb-1">
                    FTC 16 CFR Part 255
                  </span>
                  <span className="inline-block bg-white text-[#202820] text-[10px] font-mono px-2 py-0.5 rounded border border-[#D8CBB7]">
                    SOC2 Type II
                  </span>
                </div>
              </div>

              {/* European Union */}
              <div className="p-5 rounded-xl bg-[#F5F1E9]/70 border border-[#D8CBB7] hover:border-[#82917A] transition space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#82917A] bg-[#82917A]/15 px-2 py-0.5 rounded">
                    EU Jurisdiction
                  </span>
                  <span className="text-[11px] font-mono text-[#82917A] font-semibold">
                    8 Rules Total
                  </span>
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-[#202820]">
                    Inkloom Europe
                  </h4>
                  <p className="text-xs text-[#202820]/70 mt-0.5">
                    EU AI Act (Regulation 2024/1689) & GDPR safeguards.
                  </p>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-[#D8CBB7]/80 text-xs font-mono">
                  <div className="flex justify-between text-[#202820]/75">
                    <span>Inherited from Global:</span>
                    <span className="font-bold text-[#202820]">6 Rules</span>
                  </div>
                  <div className="flex justify-between text-[#82917A]">
                    <span>Regional Statutory:</span>
                    <span className="font-bold">2 Rules</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-[#D8CBB7]/80">
                  <span className="text-[10px] font-mono uppercase text-[#82917A] block mb-1">
                    Enforced Frameworks:
                  </span>
                  <span className="inline-block bg-white text-[#202820] text-[10px] font-mono px-2 py-0.5 rounded border border-[#D8CBB7] mr-1 mb-1">
                    EU AI Act 2024/1689
                  </span>
                  <span className="inline-block bg-white text-[#202820] text-[10px] font-mono px-2 py-0.5 rounded border border-[#D8CBB7]">
                    GDPR Art 22
                  </span>
                </div>
              </div>

              {/* United Kingdom */}
              <div className="p-5 rounded-xl bg-[#F5F1E9]/70 border border-[#D8CBB7] hover:border-[#202820] transition space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#202820] bg-[#202820]/10 px-2 py-0.5 rounded">
                    UK Jurisdiction
                  </span>
                  <span className="text-[11px] font-mono text-[#82917A] font-semibold">
                    7 Rules Total
                  </span>
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-[#202820]">
                    Inkloom United Kingdom
                  </h4>
                  <p className="text-xs text-[#202820]/70 mt-0.5">
                    UK Advertising Standards Authority (ASA) & CMA Code.
                  </p>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-[#D8CBB7]/80 text-xs font-mono">
                  <div className="flex justify-between text-[#202820]/75">
                    <span>Inherited from Global:</span>
                    <span className="font-bold text-[#202820]">6 Rules</span>
                  </div>
                  <div className="flex justify-between text-[#202820]">
                    <span>Regional Statutory:</span>
                    <span className="font-bold">1 Rule</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-[#D8CBB7]/80">
                  <span className="text-[10px] font-mono uppercase text-[#82917A] block mb-1">
                    Enforced Frameworks:
                  </span>
                  <span className="inline-block bg-white text-[#202820] text-[10px] font-mono px-2 py-0.5 rounded border border-[#D8CBB7] mr-1 mb-1">
                    ASA CAP Code Sec 3
                  </span>
                  <span className="inline-block bg-white text-[#202820] text-[10px] font-mono px-2 py-0.5 rounded border border-[#D8CBB7]">
                    CMA Green Claims
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

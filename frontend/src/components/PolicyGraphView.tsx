import React, { useState } from 'react';
import {
  Network, Search, Filter, BookOpen, ShieldCheck, AlertTriangle,
  Layers, Info, X, Compass, ArrowRight
} from 'lucide-react';
import { BrandProfile, Rule, ApprovedFact } from '../types';

interface PolicyGraphViewProps {
  currentBrand: BrandProfile;
}

interface GraphNode {
  id: string;
  label: string;
  type: 'brand' | 'rule' | 'term' | 'fact' | 'token';
  category: string;
  x: number;
  y: number;
  radius: number;
  details: {
    title: string;
    description: string;
    citation?: string;
    meta?: string;
  };
}

interface GraphEdge {
  from: string;
  to: string;
  relation: string;
}

export const PolicyGraphView: React.FC<PolicyGraphViewProps> = ({ currentBrand }) => {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Generate nodes from active brand
  const nodes: GraphNode[] = [
    {
      id: 'brand-core',
      label: currentBrand.name,
      type: 'brand',
      category: 'core',
      x: 350,
      y: 240,
      radius: 40,
      details: {
        title: `${currentBrand.name} Brand Core`,
        description: currentBrand.tagline,
        meta: 'Central governance anchor'
      }
    },
    // Rules
    {
      id: 'rule-tone',
      label: 'Tone Policy',
      type: 'rule',
      category: 'tone',
      x: 200,
      y: 120,
      radius: 28,
      details: {
        title: 'Authoritative yet Approachable Voice',
        description: 'Enforces evidence-driven voice; restricts hyper-promotional slang and tech clichés.',
        citation: 'Inkloom Brand Manual v2.4 (Section 2.1)'
      }
    },
    {
      id: 'rule-claims',
      label: 'Claims Policy',
      type: 'rule',
      category: 'claim',
      x: 500,
      y: 120,
      radius: 28,
      details: {
        title: 'Performance Claim Substantiation',
        description: 'Absolute assertions must be backed by verified third-party proofs or SLA commitments.',
        citation: 'Inkloom Brand Manual v2.4 (Section 3.4)'
      }
    },
    {
      id: 'rule-regulatory',
      label: 'Regulatory Policy',
      type: 'rule',
      category: 'regulatory',
      x: 540,
      y: 280,
      radius: 26,
      details: {
        title: 'Mandatory AI Content Transparency',
        description: 'Requires explicit statement of AI assistance in compliance with FTC and EU AI Act.',
        citation: 'Inkloom Compliance Playbook (Article 4)'
      }
    },
    {
      id: 'rule-nomenclature',
      label: 'Nomenclature',
      type: 'rule',
      category: 'terminology',
      x: 160,
      y: 280,
      radius: 26,
      details: {
        title: 'Canonical Product Naming',
        description: 'Enforces strict capitalization: "BrandGuard AI". Prohibits abbreviation "BGAI".',
        citation: 'Inkloom Style Guide (Section 1.3)'
      }
    },
    // Terms
    {
      id: 'term-game-changer',
      label: 'game-changer',
      type: 'term',
      category: 'tone',
      x: 90,
      y: 80,
      radius: 20,
      details: {
        title: 'Prohibited Buzzword',
        description: 'Replaced with "effective solution".',
        meta: 'Severity: Warning'
      }
    },
    {
      id: 'term-bug-free',
      label: '100% bug-free',
      type: 'term',
      category: 'claim',
      x: 620,
      y: 60,
      radius: 20,
      details: {
        title: 'Unsubstantiated Superlative',
        description: 'Replaced with "rigorously benchmarked".',
        meta: 'Severity: Critical'
      }
    },
    {
      id: 'term-uptime',
      label: 'zero downtime',
      type: 'term',
      category: 'claim',
      x: 640,
      y: 160,
      radius: 20,
      details: {
        title: 'Contractual Overstatement',
        description: 'Replaced with "99.9% uptime SLA".',
        meta: 'Severity: Critical'
      }
    },
    // Facts
    {
      id: 'fact-latency',
      label: '< 2.0s Latency',
      type: 'fact',
      category: 'claim',
      x: 420,
      y: 380,
      radius: 24,
      details: {
        title: 'Engineering Benchmark',
        description: 'BrandGuard AI evaluates multi-page copy in under 2.0 seconds.',
        citation: 'Q3 2026 Engineering Benchmarks (Page 12)'
      }
    },
    {
      id: 'fact-pricing',
      label: '$499/mo Tier',
      type: 'fact',
      category: 'claim',
      x: 270,
      y: 380,
      radius: 24,
      details: {
        title: 'Commercial Pricing Schedule',
        description: 'Standard active enterprise commercial license starts at $499/mo.',
        citation: '2026 Commercial Pricing Sheet (Rev 4)'
      }
    }
  ];

  // Edges
  const edges: GraphEdge[] = [
    { from: 'brand-core', to: 'rule-tone', relation: 'enforces' },
    { from: 'brand-core', to: 'rule-claims', relation: 'enforces' },
    { from: 'brand-core', to: 'rule-regulatory', relation: 'enforces' },
    { from: 'brand-core', to: 'rule-nomenclature', relation: 'enforces' },
    { from: 'rule-tone', to: 'term-game-changer', relation: 'prohibits' },
    { from: 'rule-claims', to: 'term-bug-free', relation: 'restricts' },
    { from: 'rule-claims', to: 'term-uptime', relation: 'restricts' },
    { from: 'brand-core', to: 'fact-latency', relation: 'substantiates' },
    { from: 'brand-core', to: 'fact-pricing', relation: 'verifies' }
  ];

  // Filter nodes
  const filteredNodes = nodes.filter((n) => {
    if (filter !== 'all' && n.category !== filter && n.type !== 'brand') return false;
    if (searchQuery && !n.label.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const activeNodeIds = new Set(filteredNodes.map((n) => n.id));

  // Node Color Mapping (Terracotta, Sage, Warm Stone, Ink - NO NEON!)
  const getNodeColor = (type: string, isHovered: boolean, isSelected: boolean) => {
    if (isSelected) return '#D97745'; // terracotta accent
    if (isHovered) return '#202820';

    switch (type) {
      case 'brand':
        return '#202820'; // deep charcoal ink
      case 'rule':
        return '#D97745'; // terracotta
      case 'fact':
        return '#82917A'; // muted sage
      case 'term':
        return '#D8CBB7'; // warm stone linen
      default:
        return '#82917A';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Editorial Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#D8CBB7] gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#D97745] font-semibold block mb-0.5">
            GraphRAG Policy Grounding &bull; {currentBrand.name}
          </span>
          <h1 className="font-serif text-2xl md:text-3xl text-[#202820] font-normal">
            Policy Knowledge Graph
          </h1>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#202820]/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search graph rules..."
              className="bg-[#FFFFFF] border border-[#D8CBB7] text-xs pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-[#D97745] font-mono text-[#202820]"
            />
          </div>

          <div className="flex items-center bg-[#FFFFFF] p-1 rounded-lg border border-[#D8CBB7] text-xs">
            {['all', 'tone', 'claim', 'regulatory', 'terminology'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono uppercase transition ${
                  filter === cat ? 'bg-[#202820] text-[#F5F1E9] font-bold' : 'text-[#202820]/60 hover:text-[#202820]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Graph Visual Canvas & Node Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Interactive SVG Canvas (8 Cols) */}
        <div className="lg:col-span-8 bg-[#FFFFFF] border border-[#D8CBB7] rounded-2xl p-4 shadow-editorial relative overflow-hidden min-h-[520px] canvas-grid">
          
          <div className="absolute top-4 left-4 z-10 flex items-center space-x-3 text-[11px] font-mono text-[#202820]/70 bg-[#FDFBF7]/90 px-3 py-1.5 rounded-lg border border-[#EBE5D8] backdrop-blur-sm">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#202820]" />
              <span>Brand Core</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D97745]" />
              <span>Policy Rules</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#82917A]" />
              <span>Verified Proofs</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D8CBB7]" />
              <span>Prohibited Terms</span>
            </span>
          </div>

          {/* SVG Graph Visualization */}
          <svg className="w-full h-[480px]" viewBox="0 0 720 480">
            {/* Edges */}
            {edges.map((edge, idx) => {
              const fromNode = nodes.find((n) => n.id === edge.from);
              const toNode = nodes.find((n) => n.id === edge.to);
              if (!fromNode || !toNode) return null;
              if (!activeNodeIds.has(fromNode.id) || !activeNodeIds.has(toNode.id)) return null;

              const isHighlighted =
                hoveredNodeId === fromNode.id ||
                hoveredNodeId === toNode.id ||
                selectedNode?.id === fromNode.id ||
                selectedNode?.id === toNode.id;

              return (
                <g key={idx}>
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={isHighlighted ? '#D97745' : '#D8CBB7'}
                    strokeWidth={isHighlighted ? 2.5 : 1.2}
                    strokeDasharray={edge.relation === 'prohibits' ? '3,3' : undefined}
                    className="transition-colors duration-200"
                  />
                  {/* Subtle edge relation label */}
                  <text
                    x={(fromNode.x + toNode.x) / 2}
                    y={(fromNode.y + toNode.y) / 2 - 4}
                    fill="#82917A"
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                    textAnchor="middle"
                  >
                    {edge.relation}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {filteredNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isHovered = hoveredNodeId === node.id;
              const color = getNodeColor(node.type, isHovered, isSelected);

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  className="cursor-pointer group"
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius}
                    fill={color}
                    stroke="#FFFFFF"
                    strokeWidth={isSelected ? 3 : 2}
                    className="transition-all duration-200 shadow-sm"
                  />
                  <text
                    x={node.x}
                    y={node.y + 3}
                    textAnchor="middle"
                    fill={node.type === 'term' ? '#202820' : '#FFFFFF'}
                    fontSize={node.type === 'brand' ? '11' : '9.5'}
                    fontWeight={node.type === 'brand' ? 'bold' : '600'}
                    fontFamily="Inter"
                    className="select-none pointer-events-none"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>

        </div>

        {/* Node Detail Drawer / Card (4 Cols) */}
        <div className="lg:col-span-4 bg-[#FFFFFF] border border-[#D8CBB7] rounded-2xl p-6 shadow-editorial space-y-5">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-[#EBE5D8]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#D97745] font-bold block">
                    {selectedNode.type.toUpperCase()} &bull; {selectedNode.category.toUpperCase()}
                  </span>
                  <h3 className="font-serif text-lg text-[#202820] font-bold mt-0.5">
                    {selectedNode.details.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-[#202820]/40 hover:text-[#202820] p-1 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs leading-relaxed text-[#202820]/80">
                <span className="font-mono text-[10px] uppercase font-bold text-[#82917A] block">
                  Policy Specification:
                </span>
                <p>{selectedNode.details.description}</p>
              </div>

              {selectedNode.details.citation && (
                <div className="bg-[#FDFBF7] border border-[#EBE5D8] rounded-xl p-3 space-y-1 text-xs">
                  <div className="flex items-center space-x-1.5 text-[#D97745] font-mono text-[10px] font-bold">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>VERBATIM POLICY CITATION:</span>
                  </div>
                  <p className="font-mono text-[11px] text-[#202820]">
                    {selectedNode.details.citation}
                  </p>
                </div>
              )}

              {selectedNode.details.meta && (
                <div className="text-[11px] text-[#202820]/60 font-mono">
                  {selectedNode.details.meta}
                </div>
              )}

              <div className="pt-2 border-t border-[#EBE5D8] text-[11px] text-[#82917A] flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Deterministic GraphRAG Rule</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-xs text-[#202820]/60 space-y-2">
              <Network className="w-8 h-8 text-[#82917A] mx-auto" />
              <p className="font-serif text-base text-[#202820]">Select a Node to Inspect</p>
              <p className="text-[11px] max-w-xs mx-auto">
                Click any brand policy, prohibited buzzword, or verified assertion in the graph to view its source citation coordinates.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

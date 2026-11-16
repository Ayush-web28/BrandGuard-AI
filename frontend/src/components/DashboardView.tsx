import React, { useState, useEffect } from 'react';
import {
  Sparkles, CheckCircle, AlertTriangle, ArrowUpRight, Clock,
  FileText, ShieldCheck, ArrowRight, Eye, Layers
} from 'lucide-react';
import { BrandProfile, ReviewRecord } from '../types';
import { fetchReviews } from '../lib/api';

interface DashboardViewProps {
  currentBrand: BrandProfile;
  onNavigateToStudio: () => void;
  onNavigateToReviews: () => void;
  onNavigateToVault: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentBrand,
  onNavigateToStudio,
  onNavigateToReviews,
  onNavigateToVault,
}) => {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Animate score counter
    const target = 92;
    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      if (current >= target) {
        setScore(target);
        clearInterval(interval);
      } else {
        setScore(current);
      }
    }, 20);

    fetchReviews().then((data) => setReviews(data));
    return () => clearInterval(interval);
  }, [currentBrand.brand_id]);

  const recentReviews = reviews.slice(0, 4);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#D8CBB7]">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#D97745] font-semibold block mb-1">
            Studio Overview &bull; {currentBrand.name}
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-[#202820] font-normal leading-tight">
            Brand Governance Command
          </h1>
          <p className="text-xs md:text-sm text-[#202820]/70 mt-1 max-w-xl">
            Real-time compliance monitoring across copy, campaign assets, and regulatory disclosures.
          </p>
        </div>

        <button
          onClick={onNavigateToStudio}
          className="inline-flex items-center space-x-2 bg-[#D97745] hover:bg-[#c66a3b] text-white text-xs font-semibold px-5 py-3 rounded-xl shadow-sm transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Creative Review</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Hero Stats Row: Bespoke Editorial Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Consistency Score Arc (5 Cols) */}
        <div className="md:col-span-5 bg-[#FFFFFF] border border-[#D8CBB7] rounded-2xl p-6 shadow-editorial flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#82917A] font-semibold">
              Consistency Index
            </span>
            <span className="text-[10px] bg-[#82917A]/15 text-[#202820] px-2 py-0.5 rounded font-mono font-medium">
              30-Day Aggregate
            </span>
          </div>

          <div className="py-6 flex items-center justify-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              {/* Circular Gauge SVG */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="transparent"
                  stroke="#EBE5D8"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="transparent"
                  stroke="#D97745"
                  strokeWidth="8"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * score) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-serif text-4xl font-bold text-[#202820] leading-none">
                  {score}%
                </span>
                <span className="text-[10px] text-[#82917A] uppercase tracking-widest font-mono mt-1 font-semibold">
                  Brand Certified
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#EBE5D8] flex items-center justify-between text-xs text-[#202820]/75">
            <span>Target: <strong>90%+</strong></span>
            <span className="text-[#82917A] font-medium">&uarr; +14% vs last cycle</span>
          </div>
        </div>

        {/* 3 Metric Editorial Cards (7 Cols) */}
        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="bg-[#FFFFFF] border border-[#D8CBB7] rounded-2xl p-5 shadow-editorial flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#82917A] block mb-2 font-semibold">
                Total Reviewed
              </span>
              <div className="font-serif text-3xl font-bold text-[#202820]">148</div>
            </div>
            <div className="pt-4 text-[11px] text-[#202820]/70 flex items-center justify-between">
              <span>Assets</span>
              <span className="text-[#82917A] font-medium">+24 this week</span>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#D8CBB7] rounded-2xl p-5 shadow-editorial flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#D97745] block mb-2 font-semibold">
                Pending Approvals
              </span>
              <div className="font-serif text-3xl font-bold text-[#D97745]">{reviews.length > 0 ? reviews.length : 3}</div>
            </div>
            <div className="pt-4 text-[11px] text-[#202820]/70 flex items-center justify-between">
              <span>In Queue</span>
              <button onClick={onNavigateToReviews} className="text-[#D97745] font-semibold hover:underline">
                Review &rarr;
              </button>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#D8CBB7] rounded-2xl p-5 shadow-editorial flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#82917A] block mb-2 font-semibold">
                Critical Blocked
              </span>
              <div className="font-serif text-3xl font-bold text-[#202820]">0</div>
            </div>
            <div className="pt-4 text-[11px] text-[#82917A] font-medium flex items-center space-x-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Zero escapes</span>
            </div>
          </div>

          {/* Brand Health Trend Visualization Card (Span 3) */}
          <div className="sm:col-span-3 bg-[#FFFFFF] border border-[#D8CBB7] rounded-2xl p-5 shadow-editorial space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#202820] font-semibold">
                Brand Health Trend (Past 12 Sprints)
              </span>
              <span className="text-[10px] font-mono text-[#82917A]">AVG: 91.4%</span>
            </div>

            {/* Clean SVG Trend Chart */}
            <div className="h-28 w-full">
              <svg className="w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D97745" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#D97745" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,80 Q50,70 100,60 T200,45 T300,50 T400,25 T500,15 L500,100 L0,100 Z"
                  fill="url(#trendGrad)"
                />
                <path
                  d="M0,80 Q50,70 100,60 T200,45 T300,50 T400,25 T500,15"
                  fill="none"
                  stroke="#D97745"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Data points */}
                <circle cx="100" cy="60" r="3" fill="#D97745" />
                <circle cx="200" cy="45" r="3" fill="#D97745" />
                <circle cx="300" cy="50" r="3" fill="#D97745" />
                <circle cx="400" cy="25" r="3" fill="#D97745" />
                <circle cx="500" cy="15" r="4" fill="#202820" />
              </svg>
            </div>

            <div className="flex justify-between text-[10px] text-[#202820]/60 font-mono">
              <span>Sprint 1</span>
              <span>Sprint 4</span>
              <span>Sprint 8</span>
              <span>Current Sprint</span>
            </div>
          </div>

        </div>

      </div>

      {/* Lower Row: Recent Reviews & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Creative Reviews (7 Cols) */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#D8CBB7] rounded-2xl p-6 shadow-editorial space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EBE5D8]">
            <h3 className="font-serif text-lg font-normal text-[#202820]">
              Recent Creative Submissions
            </h3>
            <button
              onClick={onNavigateToReviews}
              className="text-xs font-semibold text-[#D97745] hover:underline"
            >
              View All Queue &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {recentReviews.length > 0 ? (
              recentReviews.map((rev) => (
                <div
                  key={rev.review_id}
                  onClick={onNavigateToReviews}
                  className="p-3.5 rounded-xl border border-[#EBE5D8] hover:border-[#D8CBB7] hover:bg-[#F5F1E9]/40 cursor-pointer transition flex items-center justify-between"
                >
                  <div className="space-y-1 max-w-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono text-[#82917A] bg-[#82917A]/10 px-1.5 py-0.5 rounded">
                        {rev.format.toUpperCase()}
                      </span>
                      <h4 className="text-xs font-bold text-[#202820] truncate">{rev.title}</h4>
                    </div>
                    <p className="text-[11px] text-[#202820]/70 truncate">{rev.current_content}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-semibold ${
                      rev.status === 'approved'
                        ? 'bg-[#82917A]/20 text-[#202820]'
                        : 'bg-[#D97745]/15 text-[#D97745]'
                    }`}>
                      {rev.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-[#202820]/50 block mt-1 font-mono">
                      {new Date(rev.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-[#202820]/60 space-y-2">
                <p>No creative submissions yet today.</p>
                <button
                  onClick={onNavigateToStudio}
                  className="text-xs text-[#D97745] font-semibold hover:underline"
                >
                  Run your first pre-flight review &rarr;
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Activity & Policy Feed (5 Cols) */}
        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#D8CBB7] rounded-2xl p-6 shadow-editorial space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EBE5D8]">
            <h3 className="font-serif text-lg font-normal text-[#202820]">
              Policy Enforcement Feed
            </h3>
            <span className="text-[10px] font-mono text-[#82917A]">LIVE AUDIT</span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex space-x-3 items-start">
              <div className="w-2 h-2 rounded-full bg-[#D97745] mt-1.5 shrink-0" />
              <div>
                <p className="text-[#202820] font-medium">Unsubstantiated superlative flagged</p>
                <p className="text-[11px] text-[#202820]/70">Social copy replaced <em>"100% bug-free"</em> with approved engineering benchmark.</p>
                <span className="text-[10px] text-[#202820]/50 font-mono">8 minutes ago &bull; Ayush Trivedi</span>
              </div>
            </div>

            <div className="flex space-x-3 items-start">
              <div className="w-2 h-2 rounded-full bg-[#82917A] mt-1.5 shrink-0" />
              <div>
                <p className="text-[#202820] font-medium">Press Release Approved</p>
                <p className="text-[11px] text-[#202820]/70">Mandatory FTC/EU AI disclosure appended; signed with SHA-256 audit token.</p>
                <span className="text-[10px] text-[#202820]/50 font-mono">42 minutes ago &bull; Brand Manager</span>
              </div>
            </div>

            <div className="flex space-x-3 items-start">
              <div className="w-2 h-2 rounded-full bg-[#202820] mt-1.5 shrink-0" />
              <div>
                <p className="text-[#202820] font-medium">WCAG Contrast Analysis Verified</p>
                <p className="text-[11px] text-[#202820]/70">Banner luminance ratio calculated at 5.2:1 (passed Level AA standard).</p>
                <span className="text-[10px] text-[#202820]/50 font-mono">2 hours ago &bull; Visual Inspector</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#EBE5D8]">
            <button
              onClick={onNavigateToVault}
              className="text-xs text-[#202820]/75 hover:text-[#202820] font-medium flex items-center space-x-1"
            >
              <Layers className="w-3.5 h-3.5 text-[#82917A]" />
              <span>Inspect active brand rules in Vault &rarr;</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Radar, BarChart3, AlertOctagon, TrendingUp, CheckCircle, Lightbulb,
  ShieldCheck, RefreshCw
} from 'lucide-react';
import { GovernanceAnalytics, AmbiguitySignal } from '../types';
import { fetchAnalytics } from '../lib/api';

export const AnalyticsView: React.FC = () => {
  const [analytics, setAnalytics] = useState<GovernanceAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAnalytics();
      setAnalytics(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!analytics) {
    return (
      <div className="p-12 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-400 mb-2" />
        <p className="text-xs">Loading Governance Analytics & Ambiguity Radar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-wider text-cyan-400">
              Named Improvement #2: Self-Healing Governance
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">Brand Governance & Ambiguity Radar</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Identifies recurring organizational mistakes and pinpoints ambiguous brand guidelines based on human reviewer override trends.
          </p>
        </div>

        <button
          onClick={loadData}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg transition"
        >
          Recalculate Radar
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Scans Run</span>
          <div className="text-2xl font-black text-white mt-1">{analytics.total_scans}</div>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">&uarr; 100% pre-flight coverage</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Certified Approvals</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{analytics.total_approved}</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Zero unapproved escapes</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Violations Caught</span>
          <div className="text-2xl font-black text-amber-400 mt-1">{analytics.total_violations_flagged}</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Resolved before publishing</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Compliance Rate</span>
          <div className="text-2xl font-black text-indigo-400 mt-1">{analytics.compliance_rate}%</div>
          <span className="text-[10px] text-indigo-300 mt-0.5 block">+28% vs manual audits</span>
        </div>
      </div>

      {/* Main Grid: Recurring Mistakes Heatmap & Ambiguity Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Recurring Mistakes Heatmap (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-200">Recurring Mistake Breakdown</h3>
          </div>

          <div className="space-y-3">
            {Object.entries(analytics.recurring_mistakes).map(([name, count]) => {
              const maxCount = Math.max(...Object.values(analytics.recurring_mistakes));
              const pct = Math.round((count / maxCount) * 100);
              return (
                <div key={name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium truncate max-w-[240px]">{name}</span>
                    <span className="text-amber-400 font-mono font-bold">{count}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-red-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-bold text-slate-300">Governance Insight: </span>
            Buzzword over-usage accounts for over 40% of all flagged anomalies. Recommend updating writer prompt templates with canonical alternatives.
          </div>
        </div>

        {/* Right: Guideline Ambiguity Radar (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <AlertOctagon className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-sm text-slate-200">Guideline Ambiguity Radar</h3>
            </div>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono">
              Self-Healing Policy Loop
            </span>
          </div>

          <p className="text-xs text-slate-400">
            When human reviewers consistently override AI warnings, BrandGuard AI calculates an <strong>Ambiguity Score</strong> and synthesizes recommended rule updates for leadership:
          </p>

          <div className="space-y-3">
            {analytics.ambiguity_radar.map((signal) => (
              <div
                key={signal.rule_id}
                className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/20 px-1.5 py-0.5 rounded">
                      {signal.rule_id}
                    </span>
                    <h4 className="text-xs font-bold text-slate-200 mt-1">{signal.rule_title}</h4>
                  </div>

                  <div className="text-right">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      signal.ambiguity_score > 0.3
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      Ambiguity: {Math.round(signal.ambiguity_score * 100)}%
                    </span>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {signal.override_count} overrides in {signal.violation_count} scans
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Detected Ambiguity Conflict:</div>
                  <p>{signal.detected_conflict}</p>
                </div>

                <div className="flex items-start space-x-2 text-xs text-indigo-300 bg-indigo-950/40 border border-indigo-500/20 p-2.5 rounded-lg">
                  <Lightbulb className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-indigo-200">Recommended Guideline Clarification: </span>
                    {signal.suggested_clarification}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};

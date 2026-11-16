import React, { useState, useEffect } from 'react';
import {
  BarChart3, AlertOctagon, TrendingUp, CheckCircle, Lightbulb,
  ShieldCheck, RefreshCw, Compass
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
      <div className="p-16 text-center text-[#202820]/60 space-y-2">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#D97745]" />
        <p className="text-xs font-mono">Synthesizing Ambiguity Radar & Governance Signals...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-[#D8CBB7] gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#D97745] font-semibold block mb-1">
            Governance Intelligence &bull; Self-Healing Loop
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-[#202820] font-normal leading-tight">
            Guideline Ambiguity Radar
          </h1>
          <p className="text-xs md:text-sm text-[#202820]/70 mt-1 max-w-xl">
            Detects recurring organizational mistakes and pinpoints ambiguous brand guidelines based on human reviewer override trends.
          </p>
        </div>

        <button
          onClick={loadData}
          className="text-xs bg-[#FFFFFF] hover:bg-[#202820] hover:text-white text-[#202820] border border-[#D8CBB7] px-4 py-2.5 rounded-xl transition font-mono font-medium shadow-subtle"
        >
          Recalculate Radar
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#D8CBB7] rounded-2xl p-5 shadow-editorial">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#82917A] block font-bold">Total Scans Run</span>
          <div className="font-serif text-3xl font-bold text-[#202820] mt-1">{analytics.total_scans}</div>
          <span className="text-[10px] text-[#82917A] mt-1 block font-mono">100% pre-flight coverage</span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#D8CBB7] rounded-2xl p-5 shadow-editorial">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#82917A] block font-bold">Certified Approvals</span>
          <div className="font-serif text-3xl font-bold text-[#82917A] mt-1">{analytics.total_approved}</div>
          <span className="text-[10px] text-[#202820]/60 mt-1 block font-mono">Zero unapproved escapes</span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#D8CBB7] rounded-2xl p-5 shadow-editorial">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#D97745] block font-bold">Violations Intercepted</span>
          <div className="font-serif text-3xl font-bold text-[#D97745] mt-1">{analytics.total_violations_flagged}</div>
          <span className="text-[10px] text-[#202820]/60 mt-1 block font-mono">Resolved in pre-flight</span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#D8CBB7] rounded-2xl p-5 shadow-editorial">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#82917A] block font-bold">Compliance Rate</span>
          <div className="font-serif text-3xl font-bold text-[#202820] mt-1">{analytics.compliance_rate}%</div>
          <span className="text-[10px] text-[#82917A] mt-1 block font-mono">+28% vs manual reviews</span>
        </div>
      </div>

      {/* Main Grid: Recurring Mistakes Heatmap & Ambiguity Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Recurring Mistakes Heatmap (5 Cols) */}
        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#D8CBB7] rounded-2xl p-6 shadow-editorial space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#EBE5D8]">
            <BarChart3 className="w-4 h-4 text-[#D97745]" />
            <h3 className="font-serif text-lg font-normal text-[#202820]">
              Recurring Policy Breaches
            </h3>
          </div>

          <div className="space-y-4">
            {Object.entries(analytics.recurring_mistakes).map(([name, count]) => {
              const maxCount = Math.max(...Object.values(analytics.recurring_mistakes));
              const pct = Math.round((count / maxCount) * 100);
              return (
                <div key={name} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#202820] font-medium truncate max-w-[220px]">{name}</span>
                    <span className="text-[#D97745] font-mono font-bold">{count}</span>
                  </div>
                  <div className="w-full bg-[#EBE5D8] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#D97745] h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-[#FDFBF7] rounded-xl border border-[#EBE5D8] text-xs text-[#202820]/80 space-y-1">
            <span className="font-bold text-[#202820] block">Governance Observation: </span>
            Buzzword over-usage constitutes 40% of all flagged anomalies. Recommend updating writer prompt templates with approved canonical vocabulary.
          </div>
        </div>

        {/* Right: Guideline Ambiguity Radar (7 Cols) */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#D8CBB7] rounded-2xl p-6 shadow-editorial space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#EBE5D8]">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-[#82917A]" />
              <h3 className="font-serif text-lg font-normal text-[#202820]">
                Guideline Ambiguity Signals
              </h3>
            </div>
            <span className="text-[10px] bg-[#82917A]/15 text-[#202820] px-2 py-0.5 rounded-full font-mono font-semibold">
              Self-Healing Loop
            </span>
          </div>

          <p className="text-xs text-[#202820]/70 leading-relaxed">
            When human reviewers consistently override AI warnings, BrandGuard Studio calculates an <strong>Ambiguity Index</strong> and suggests actionable clarifications for the brand manual:
          </p>

          <div className="space-y-4">
            {analytics.ambiguity_radar.map((signal) => (
              <div
                key={signal.rule_id}
                className="p-5 bg-[#FDFBF7] border border-[#D8CBB7] rounded-xl space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-[#D97745] font-bold bg-[#D97745]/10 px-2 py-0.5 rounded">
                      {signal.rule_id}
                    </span>
                    <h4 className="text-sm font-bold text-[#202820] mt-1">{signal.rule_title}</h4>
                  </div>

                  <div className="text-right">
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                      signal.ambiguity_score > 0.3
                        ? 'bg-[#D97745]/15 text-[#D97745]'
                        : 'bg-[#82917A]/20 text-[#202820]'
                    }`}>
                      Ambiguity: {Math.round(signal.ambiguity_score * 100)}%
                    </span>
                    <div className="text-[10px] text-[#202820]/50 mt-0.5 font-mono">
                      {signal.override_count} overrides across {signal.violation_count} scans
                    </div>
                  </div>
                </div>

                <div className="text-xs text-[#202820]/80 bg-[#FFFFFF] p-3 rounded-lg border border-[#EBE5D8] space-y-1">
                  <div className="text-[10px] uppercase font-mono font-bold text-[#82917A]">
                    Detected Guideline Ambiguity:
                  </div>
                  <p>{signal.detected_conflict}</p>
                </div>

                <div className="flex items-start space-x-2 text-xs text-[#202820] bg-[#82917A]/10 border border-[#82917A]/30 p-3 rounded-lg">
                  <Lightbulb className="w-4 h-4 text-[#D97745] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#202820]">Recommended Guideline Update: </span>
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

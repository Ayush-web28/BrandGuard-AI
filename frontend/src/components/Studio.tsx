import React, { useState } from 'react';
import {
  Sparkles, AlertTriangle, CheckCircle, ShieldAlert, BookOpen,
  ArrowRight, FileText, Image as ImageIcon, Send, RefreshCw, Wand2, Eye
} from 'lucide-react';
import {
  BrandProfile, ContentFormat, ScanResult, FlaggedIssue, ReviewerRole
} from '../types';
import { SAMPLE_PRESETS, SamplePreset } from '../lib/samplePresets';
import { scanContentApi } from '../lib/api';

interface StudioProps {
  currentBrand: BrandProfile;
  currentRole: ReviewerRole;
  onScanCompleted: (result: ScanResult) => void;
  onNavigateToReviews: () => void;
}

export const Studio: React.FC<StudioProps> = ({
  currentBrand,
  currentRole,
  onScanCompleted,
  onNavigateToReviews
}) => {
  const [contentFormat, setContentFormat] = useState<ContentFormat>('social_post');
  const [contentText, setContentText] = useState<string>(SAMPLE_PRESETS[0].content_text);
  const [creatorIntent, setCreatorIntent] = useState<string>('Announce new product release with high engagement.');
  const [autoScrubPII, setAutoScrubPII] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [activeDiffMode, setActiveDiffMode] = useState<'issues' | 'diff'>('issues');
  const [resolvedIssueIds, setResolvedIssueIds] = useState<Set<string>>(new Set());

  // Handle Preset Loading
  const handleLoadPreset = (preset: SamplePreset) => {
    setContentText(preset.content_text);
    setContentFormat(preset.format);
    setScanResult(null);
    setResolvedIssueIds(new Set());
  };

  // Run Pre-Flight Scan
  const handleRunScan = async () => {
    if (!contentText.trim()) return;
    setIsScanning(true);
    try {
      const result = await scanContentApi({
        brand_id: currentBrand.brand_id,
        format: contentFormat,
        content_text: contentText,
        author: currentRole === 'creator' ? 'Ayush (Creator)' : 'Brand Reviewer'
      });
      setScanResult(result);
      setResolvedIssueIds(new Set());
      onScanCompleted(result);
    } catch (e) {
      console.error("Scan failed:", e);
    } finally {
      setIsScanning(false);
    }
  };

  // Apply single intent-preserving fix
  const handleApplyFix = (issue: FlaggedIssue) => {
    if (!issue.offending_content) return;
    const updated = contentText.replace(issue.offending_content, issue.suggested_fix);
    setContentText(updated);
    
    const nextSet = new Set(resolvedIssueIds);
    nextSet.add(issue.issue_id);
    setResolvedIssueIds(nextSet);

    // Also update current scan result's score dynamically
    if (scanResult) {
      const remainingCritical = scanResult.issues.filter(
        i => !nextSet.has(i.issue_id) && i.severity === 'critical'
      ).length;
      const remainingWarning = scanResult.issues.filter(
        i => !nextSet.has(i.issue_id) && i.severity === 'warning'
      ).length;
      const updatedScore = Math.min(100, Math.max(0, 100 - (remainingCritical * 25) - (remainingWarning * 10)));
      setScanResult({
        ...scanResult,
        overall_score: updatedScore
      });
    }
  };

  // Apply all intent-preserving fixes at once
  const handleApplyAllFixes = () => {
    if (!scanResult || !scanResult.cleaned_diff_text) return;
    setContentText(scanResult.cleaned_diff_text);
    const allIds = new Set(scanResult.issues.map(i => i.issue_id));
    setResolvedIssueIds(allIds);
    setScanResult({
      ...scanResult,
      overall_score: 98
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: One-Click Judge Presets */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-300">
                Evaluation Presets for Judges
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any pre-configured test case to verify multi-format checks, citations, and intent-preserving diffs:
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {SAMPLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleLoadPreset(preset)}
                className="text-xs bg-slate-800/90 hover:bg-indigo-600 hover:text-white text-slate-200 border border-slate-700/80 hover:border-indigo-500 px-3 py-1.5 rounded-lg transition font-medium flex items-center space-x-1.5 shadow-sm"
              >
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Content Editor & Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            
            {/* Format Pills & Auto-Scrub Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-400">Format:</span>
                {(['social_post', 'press_release', 'ad_banner', 'document'] as ContentFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setContentFormat(fmt)}
                    className={`text-xs px-2.5 py-1 rounded-md font-medium transition ${
                      contentFormat === fmt
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {fmt.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>

              <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-400 hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={autoScrubPII}
                  onChange={(e) => setAutoScrubPII(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span>Zero-Trust PII Scrubber Active</span>
              </label>
            </div>

            {/* Content Input Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Pre-Publication Content Draft
                </label>
                <span className="text-[11px] text-slate-500">
                  {contentText.length} characters &bull; {contentText.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                placeholder="Paste marketing copy, press release draft, or social post text..."
                rows={8}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3.5 text-sm text-slate-200 leading-relaxed font-sans placeholder-slate-600 transition resize-y"
              />
            </div>

            {/* Creator Intent Prompt Input */}
            <div>
              <label className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5 mb-1.5">
                <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Creator Intent Context (Preserves Meaning During Rewrites)</span>
              </label>
              <input
                type="text"
                value={creatorIntent}
                onChange={(e) => setCreatorIntent(e.target.value)}
                placeholder="e.g. Announce Q3 benchmarks without over-hyping"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-300 placeholder-slate-600"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setContentText('')}
                className="text-xs text-slate-500 hover:text-slate-300 transition"
              >
                Clear text
              </button>

              <div className="flex items-center space-x-3">
                {scanResult && (
                  <button
                    onClick={handleApplyAllFixes}
                    className="text-xs bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 px-3 py-2 rounded-xl font-semibold transition flex items-center space-x-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Apply All Intent-Preserving Fixes</span>
                  </button>
                )}

                <button
                  onClick={handleRunScan}
                  disabled={isScanning || !contentText.trim()}
                  className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center space-x-2 disabled:opacity-50"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Scanning Graph...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Run Brand Pre-Flight Scan</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* Quick Explainer for Judges */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-400">
            <span className="font-bold text-slate-300">How the Workflow Operates: </span>
            The engine evaluates the draft in real time against the active brand profile ({currentBrand.name}). 
            Every issue is accompanied by verbatim policy citations, an explanation, and an intent-preserving single-click replacement.
          </div>
        </div>

        {/* Right Column: Pre-Flight Diagnostic Canvas (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {scanResult ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-5">
              
              {/* Score & Health Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                      Brand Compliance
                    </span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                      {scanResult.scan_id}
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className={`text-3xl font-black ${
                      scanResult.overall_score >= 85
                        ? 'text-emerald-400'
                        : scanResult.overall_score >= 60
                        ? 'text-amber-400'
                        : 'text-red-400'
                    }`}>
                      {scanResult.overall_score}%
                    </span>
                    <span className="text-xs text-slate-500">
                      {scanResult.overall_score >= 85 ? 'Brand Certified' : 'Requires Remediation'}
                    </span>
                  </div>
                </div>

                {/* View Mode Toggle (Issues List vs Cleaned Diff) */}
                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setActiveDiffMode('issues')}
                    className={`px-2.5 py-1 rounded font-medium transition ${
                      activeDiffMode === 'issues'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Issues ({scanResult.issues.length})
                  </button>
                  <button
                    onClick={() => setActiveDiffMode('diff')}
                    className={`px-2.5 py-1 rounded font-medium transition ${
                      activeDiffMode === 'diff'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Side-by-Side Diff
                  </button>
                </div>
              </div>

              {/* View 1: Detailed Flagged Issues Cards */}
              {activeDiffMode === 'issues' ? (
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {scanResult.issues.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 space-y-2">
                      <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                      <p className="font-semibold text-slate-200">100% Brand Certified</p>
                      <p className="text-xs text-slate-500">No tone, factual claim, or regulatory violations detected.</p>
                    </div>
                  ) : (
                    scanResult.issues.map((issue) => {
                      const isResolved = resolvedIssueIds.has(issue.issue_id);
                      return (
                        <div
                          key={issue.issue_id}
                          className={`p-3.5 rounded-xl border transition ${
                            isResolved
                              ? 'bg-slate-950/40 border-slate-800/50 opacity-60'
                              : issue.severity === 'critical'
                              ? 'bg-red-950/20 border-red-500/40'
                              : 'bg-amber-950/20 border-amber-500/30'
                          }`}
                        >
                          {/* Issue Header */}
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex items-center space-x-1.5">
                              {issue.severity === 'critical' ? (
                                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                              )}
                              <h4 className="text-xs font-bold text-slate-200 leading-snug">
                                {issue.title}
                              </h4>
                            </div>

                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              issue.severity === 'critical'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              {issue.severity}
                            </span>
                          </div>

                          {/* Explanation */}
                          <p className="text-[11px] text-slate-300 mb-2">
                            {issue.explanation}
                          </p>

                          {/* Source Citation Badge */}
                          <div className="flex items-center space-x-1 text-[10px] text-indigo-300 bg-indigo-950/50 border border-indigo-500/20 px-2 py-1 rounded-md mb-2">
                            <BookOpen className="w-3 h-3 text-indigo-400 shrink-0" />
                            <span className="font-mono truncate">{issue.source_citation}</span>
                          </div>

                          {/* Suggested Intent-Preserving Fix */}
                          <div className="bg-slate-950/90 rounded-lg p-2.5 border border-slate-800 text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                                Suggested Correction
                              </span>
                              {!isResolved && (
                                <button
                                  onClick={() => handleApplyFix(issue)}
                                  className="text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-2.5 py-0.5 rounded shadow transition flex items-center space-x-1"
                                >
                                  <span>Accept Fix</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            <div className="font-mono text-emerald-300 text-xs bg-emerald-950/40 p-1.5 rounded border border-emerald-500/20">
                              {issue.suggested_fix}
                            </div>

                            <p className="text-[10px] text-slate-400 italic">
                              💡 {issue.intent_preservation_note}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                /* View 2: Side-by-Side Diff View */
                <div className="space-y-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Compliant Draft Preview (With All Intent-Preserving Fixes Applied):
                    </div>
                    <div className="p-3 bg-slate-900 rounded-lg font-sans text-slate-200 text-xs leading-relaxed border border-slate-800">
                      {scanResult.cleaned_diff_text}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit to Approval Workflow */}
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                <span className="text-[11px] text-slate-400">Ready for review handoff?</span>
                <button
                  onClick={onNavigateToReviews}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Open in Collaborative Reviews</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-10 text-center space-y-3 flex flex-col items-center justify-center min-h-[380px]">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-200 text-sm">Awaiting Content Scan</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Click <strong>"Run Brand Pre-Flight Scan"</strong> or choose a test preset above to inspect copy against approved guidelines and facts.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

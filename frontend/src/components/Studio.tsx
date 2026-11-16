import React, { useState } from 'react';
import {
  Sparkles, CheckCircle, AlertTriangle, ShieldAlert, BookOpen,
  ArrowRight, RefreshCw, Wand2, ZoomIn, ZoomOut, Maximize2,
  Image as ImageIcon, Check, Eye, X, ShieldCheck, ArrowLeftRight
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
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [resolvedIssueIds, setResolvedIssueIds] = useState<Set<string>>(new Set());
  const [ignoredIssueIds, setIgnoredIssueIds] = useState<Set<string>>(new Set());
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [viewMode, setViewMode] = useState<'editor' | 'compare'>('editor');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  // Load Preset
  const handleLoadPreset = (preset: SamplePreset) => {
    setContentText(preset.content_text);
    setContentFormat(preset.format);
    setScanResult(null);
    setResolvedIssueIds(new Set());
    setIgnoredIssueIds(new Set());
    setSelectedIssueId(null);
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
      setIgnoredIssueIds(new Set());
      onScanCompleted(result);
      if (result.issues.length > 0) {
        setSelectedIssueId(result.issues[0].issue_id);
      }
    } catch (e) {
      console.error("Scan error:", e);
    } finally {
      setIsScanning(false);
    }
  };

  // Apply single fix
  const handleApplyFix = (issue: FlaggedIssue) => {
    if (!issue.offending_content) return;
    const updated = contentText.replace(issue.offending_content, issue.suggested_fix);
    setContentText(updated);
    
    const nextSet = new Set(resolvedIssueIds);
    nextSet.add(issue.issue_id);
    setResolvedIssueIds(nextSet);

    if (scanResult) {
      const remainingCritical = scanResult.issues.filter(
        i => !nextSet.has(i.issue_id) && !ignoredIssueIds.has(i.issue_id) && i.severity === 'critical'
      ).length;
      const remainingWarning = scanResult.issues.filter(
        i => !nextSet.has(i.issue_id) && !ignoredIssueIds.has(i.issue_id) && i.severity === 'warning'
      ).length;
      const updatedScore = Math.min(100, Math.max(0, 100 - (remainingCritical * 25) - (remainingWarning * 10)));
      setScanResult({
        ...scanResult,
        overall_score: updatedScore
      });
    }
  };

  // Ignore issue (Reviewer override)
  const handleIgnoreIssue = (issueId: string) => {
    const nextIgnored = new Set(ignoredIssueIds);
    nextIgnored.add(issueId);
    setIgnoredIssueIds(nextIgnored);
  };

  // Apply all fixes
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

  // Render Highlighted Text in Canvas Preview
  const renderHighlightedContent = () => {
    if (!scanResult || scanResult.issues.length === 0) {
      return <span>{contentText}</span>;
    }

    let result: React.ReactNode[] = [];
    let remaining = contentText;
    let keyIdx = 0;

    // Active issues that have offending content
    const activeIssues = scanResult.issues.filter(
      i => !resolvedIssueIds.has(i.issue_id) && !ignoredIssueIds.has(i.issue_id) && i.offending_content
    );

    // Sort by position or occurrence
    activeIssues.forEach((issue) => {
      const needle = issue.offending_content;
      const pos = remaining.indexOf(needle);
      if (pos !== -1) {
        // Text before match
        if (pos > 0) {
          result.push(<span key={keyIdx++}>{remaining.slice(0, pos)}</span>);
        }
        // Highlighted match
        const isSelected = selectedIssueId === issue.issue_id;
        result.push(
          <span
            key={keyIdx++}
            onClick={() => setSelectedIssueId(issue.issue_id)}
            className={`cursor-pointer px-1 py-0.5 rounded transition font-medium ${
              isSelected
                ? 'bg-[#D97745] text-white shadow-sm ring-2 ring-[#D97745]/30'
                : issue.severity === 'critical'
                ? 'bg-[#D97745]/20 text-[#202820] border-b-2 border-[#D97745]'
                : 'bg-[#82917A]/25 text-[#202820] border-b-2 border-[#82917A]'
            }`}
            title={`${issue.title}: Click to view guideline citation`}
          >
            {needle}
          </span>
        );
        remaining = remaining.slice(pos + needle.length);
      }
    });

    if (remaining.length > 0) {
      result.push(<span key={keyIdx++}>{remaining}</span>);
    }

    return result;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Editorial Header & Preset Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-[#D8CBB7] gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#D97745] font-semibold block mb-0.5">
            Pre-Publication Verification &bull; {currentBrand.name}
          </span>
          <h1 className="font-serif text-2xl md:text-3xl text-[#202820] font-normal">
            Creative Review Studio
          </h1>
        </div>

        {/* Quick Presets for Judges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono uppercase text-[#82917A] font-semibold mr-1">
            Presets:
          </span>
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleLoadPreset(preset)}
              className="text-xs bg-[#FFFFFF] hover:bg-[#202820] hover:text-[#F5F1E9] text-[#202820] border border-[#D8CBB7] px-3 py-1.5 rounded-lg transition font-medium shadow-subtle"
            >
              {preset.name.split('(')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split-Screen Workspace (Figma / Linear Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= LEFT PANEL: PREVIEW & CANVAS (7 Cols) ================= */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#D8CBB7] rounded-2xl shadow-editorial overflow-hidden flex flex-col min-h-[640px]">
          
          {/* Canvas Top Bar: Zoom Controls, View Toggles */}
          <div className="px-5 py-3 border-b border-[#EBE5D8] bg-[#FDFBF7] flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Format Pills */}
            <div className="flex items-center space-x-1.5">
              {(['social_post', 'press_release', 'ad_banner', 'document'] as ContentFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setContentFormat(fmt)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider transition ${
                    contentFormat === fmt
                      ? 'bg-[#202820] text-[#F5F1E9] font-bold'
                      : 'text-[#202820]/70 hover:bg-[#EBE5D8]'
                  }`}
                >
                  {fmt.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* View Mode & Zoom Controls */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-[#EBE5D8]/70 p-0.5 rounded-lg border border-[#D8CBB7]">
                <button
                  onClick={() => setViewMode('editor')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                    viewMode === 'editor' ? 'bg-[#FFFFFF] text-[#202820] shadow-sm' : 'text-[#202820]/60'
                  }`}
                >
                  Editor
                </button>
                <button
                  onClick={() => setViewMode('compare')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                    viewMode === 'compare' ? 'bg-[#FFFFFF] text-[#202820] shadow-sm' : 'text-[#202820]/60'
                  }`}
                >
                  Side-by-Side
                </button>
              </div>

              <div className="flex items-center space-x-1 text-[#202820]/70">
                <button
                  onClick={() => setZoomLevel(Math.max(80, zoomLevel - 10))}
                  className="p-1 hover:bg-[#EBE5D8] rounded"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] w-9 text-center">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel(Math.min(140, zoomLevel + 10))}
                  className="p-1 hover:bg-[#EBE5D8] rounded"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Canvas Work Area */}
          <div className="relative flex-1 p-6 canvas-grid flex flex-col justify-between overflow-hidden">
            
            {/* Scanning Laser Line Animation during analysis */}
            {isScanning && (
              <div className="animate-scanline pointer-events-none" />
            )}

            {viewMode === 'editor' ? (
              <div
                className="space-y-4 transition-all duration-200"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left' }}
              >
                {/* Visual Canvas Simulation Box */}
                <div className="bg-[#FFFFFF] border border-[#D8CBB7] rounded-xl p-6 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#82917A] pb-2 border-b border-[#EBE5D8]">
                    <span>CANVAS PREVIEW &bull; {contentFormat.toUpperCase()}</span>
                    <span>{contentText.length} CHARACTERS</span>
                  </div>

                  {/* Interactive Annotated Content Preview */}
                  <div className="text-sm md:text-base leading-relaxed text-[#202820] font-sans whitespace-pre-wrap selection:bg-[#D97745]">
                    {renderHighlightedContent()}
                  </div>
                </div>

                {/* Live Raw Textarea for In-Place Edits */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#82917A] font-semibold">
                    Edit Source Content Directly
                  </span>
                  <textarea
                    value={contentText}
                    onChange={(e) => setContentText(e.target.value)}
                    rows={6}
                    placeholder="Enter or paste copy to evaluate..."
                    className="w-full bg-[#FFFFFF] border border-[#D8CBB7] focus:border-[#D97745] focus:ring-1 focus:ring-[#D97745] rounded-xl p-4 text-xs font-mono text-[#202820] leading-relaxed transition outline-none"
                  />
                </div>
              </div>
            ) : (
              /* Side-by-Side Comparison Mode */
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#FFFFFF] border border-[#D8CBB7] rounded-xl p-4 space-y-2 text-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#D97745] font-bold block">
                    Original Submitted Draft
                  </span>
                  <p className="text-[#202820]/80 whitespace-pre-wrap leading-relaxed">
                    {contentText}
                  </p>
                </div>

                <div className="bg-[#FDFBF7] border border-[#82917A] rounded-xl p-4 space-y-2 text-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#82917A] font-bold block">
                    Intent-Preserving Compliant Draft
                  </span>
                  <p className="text-[#202820] font-medium whitespace-pre-wrap leading-relaxed">
                    {scanResult?.cleaned_diff_text || contentText}
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Canvas Toolbar: Scan Trigger & Fix All */}
            <div className="pt-6 mt-6 border-t border-[#EBE5D8] flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-[#202820]/60 font-mono">
                {scanResult ? `${scanResult.issues.length} policy items evaluated` : 'Ready for verification'}
              </span>

              <div className="flex items-center space-x-2">
                {scanResult && scanResult.issues.length > 0 && (
                  <button
                    onClick={handleApplyAllFixes}
                    className="inline-flex items-center space-x-1.5 bg-[#82917A]/15 hover:bg-[#82917A]/25 text-[#202820] border border-[#82917A]/40 text-xs font-semibold px-3.5 py-2 rounded-xl transition"
                  >
                    <Check className="w-3.5 h-3.5 text-[#82917A]" />
                    <span>Apply All Intent-Preserving Fixes</span>
                  </button>
                )}

                <button
                  onClick={handleRunScan}
                  disabled={isScanning || !contentText.trim()}
                  className="inline-flex items-center space-x-2 bg-[#D97745] hover:bg-[#c66a3b] text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow transition disabled:opacity-50"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Evaluating Policy Graph...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Run Brand Pre-Flight Scan</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* ================= RIGHT PANEL: GOVERNANCE INSPECTOR (5 Cols) ================= */}
        <div className="lg:col-span-5 space-y-4">
          
          {scanResult ? (
            <div className="bg-[#FFFFFF] border border-[#D8CBB7] rounded-2xl p-6 shadow-editorial space-y-5">
              
              {/* Score Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#EBE5D8]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#82917A] font-semibold block">
                    Pre-Flight Scorecard
                  </span>
                  <div className="flex items-baseline space-x-2 mt-0.5">
                    <span className="font-serif text-3xl font-bold text-[#202820]">
                      {scanResult.overall_score}%
                    </span>
                    <span className={`text-xs font-semibold ${
                      scanResult.overall_score >= 85 ? 'text-[#82917A]' : 'text-[#D97745]'
                    }`}>
                      {scanResult.overall_score >= 85 ? 'Brand Certified' : 'Changes Recommended'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-[#202820]/60 block">SCAN ID</span>
                  <span className="font-mono text-xs font-semibold text-[#202820]">{scanResult.scan_id}</span>
                </div>
              </div>

              {/* Categorized Issues List */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {scanResult.issues.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#202820]/60 space-y-2">
                    <CheckCircle className="w-8 h-8 text-[#82917A] mx-auto" />
                    <p className="font-serif text-base text-[#202820] font-normal">100% Brand Certified</p>
                    <p>No tone drift, unverified claims, or off-palette tokens detected.</p>
                  </div>
                ) : (
                  scanResult.issues.map((issue) => {
                    const isResolved = resolvedIssueIds.has(issue.issue_id);
                    const isIgnored = ignoredIssueIds.has(issue.issue_id);
                    const isSelected = selectedIssueId === issue.issue_id;

                    return (
                      <div
                        key={issue.issue_id}
                        onClick={() => setSelectedIssueId(issue.issue_id)}
                        className={`p-4 rounded-xl border transition cursor-pointer space-y-2.5 ${
                          isResolved
                            ? 'bg-[#FDFBF7] border-[#EBE5D8] opacity-50'
                            : isIgnored
                            ? 'bg-[#FDFBF7] border-[#EBE5D8] opacity-40 line-through'
                            : isSelected
                            ? 'bg-[#FFFFFF] border-[#D97745] shadow-sm ring-1 ring-[#D97745]'
                            : 'bg-[#FDFBF7] border-[#D8CBB7] hover:border-[#82917A]'
                        }`}
                      >
                        {/* Issue Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#82917A] font-semibold">
                              {issue.category.replace('_', ' ')}
                            </span>
                            <h4 className="text-xs font-bold text-[#202820] leading-snug">
                              {issue.title}
                            </h4>
                          </div>

                          <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                            issue.severity === 'critical'
                              ? 'bg-[#D97745]/15 text-[#D97745]'
                              : 'bg-[#82917A]/20 text-[#202820]'
                          }`}>
                            {issue.severity}
                          </span>
                        </div>

                        {/* Explanation */}
                        <p className="text-xs text-[#202820]/80 leading-relaxed">
                          {issue.explanation}
                        </p>

                        {/* Guideline Source Citation */}
                        <div className="flex items-center space-x-1.5 text-[10px] text-[#202820] bg-[#EBE5D8]/60 px-2 py-1 rounded font-mono">
                          <BookOpen className="w-3 h-3 text-[#D97745] shrink-0" />
                          <span className="truncate">{issue.source_citation}</span>
                        </div>

                        {/* Suggested Correction Box */}
                        <div className="bg-[#FFFFFF] border border-[#D8CBB7] rounded-lg p-2.5 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase text-[#82917A] font-bold">
                              Intent-Preserving Correction:
                            </span>
                            
                            {!isResolved && !isIgnored && (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleIgnoreIssue(issue.issue_id);
                                  }}
                                  className="text-[10px] text-[#202820]/60 hover:text-[#202820] font-medium"
                                >
                                  Ignore
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApplyFix(issue);
                                  }}
                                  className="text-[11px] bg-[#D97745] hover:bg-[#c66a3b] text-white font-semibold px-2.5 py-0.5 rounded transition shadow-sm flex items-center space-x-1"
                                >
                                  <span>Apply Fix</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="font-mono text-xs text-[#202820] font-semibold bg-[#F5F1E9] p-1.5 rounded">
                            {issue.suggested_fix}
                          </div>

                          <p className="text-[10px] text-[#202820]/65 italic">
                            {issue.intent_preservation_note}
                          </p>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

              {/* Submit to Approval Handoff */}
              <div className="pt-4 border-t border-[#EBE5D8] flex items-center justify-between">
                <span className="text-xs text-[#202820]/60">Finished reviewing?</span>
                <button
                  onClick={onNavigateToReviews}
                  className="text-xs bg-[#202820] hover:bg-[#2d382d] text-[#F5F1E9] font-semibold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D97745]" />
                  <span>Submit for Multi-Role Sign-off</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-[#FFFFFF] border border-[#D8CBB7] rounded-2xl p-10 text-center space-y-3 flex flex-col items-center justify-center min-h-[440px] shadow-editorial">
              <div className="w-12 h-12 rounded-xl bg-[#EBE5D8] text-[#D97745] flex items-center justify-center">
                <Wand2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg text-[#202820] font-normal">Awaiting Pre-Flight Evaluation</h3>
              <p className="text-xs text-[#202820]/60 max-w-xs leading-relaxed">
                Click <strong>"Run Brand Pre-Flight Scan"</strong> or choose an evaluation preset above to inspect draft copy against active brand guidelines and facts.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

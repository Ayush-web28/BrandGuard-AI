import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Compass, Sparkles, Layers, Sliders, Check, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

interface LandingPageProps {
  onEnterStudio: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterStudio }) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F1E9] text-[#202820] flex flex-col font-sans selection:bg-[#D97745] selection:text-white overflow-x-hidden">
      
      {/* --- HERO SECTION WITH CINEMATIC BACKGROUND VIDEO --- */}
      <section className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden border-b border-[#D8CBB7]/60">
        
        {/* Background Video & Fallback Graphic */}
        <div className="absolute inset-0 z-0 bg-[#202820] overflow-hidden">
          {!videoError ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              onLoadedData={() => setVideoLoaded(true)}
              onError={() => setVideoError(true)}
              className={`w-full h-full object-cover object-center filter saturate-75 contrast-105 transition-opacity duration-1000 ${
                videoLoaded ? 'opacity-40' : 'opacity-0'
              }`}
            >
              {/* High-quality creative studio, color swatch and typography process video */}
              <source
                src="https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-designer-choosing-colors-from-a-palette-41484-large.mp4"
                type="video/mp4"
              />
            </video>
          ) : null}

          {/* High-end Photographic Fallback (Editorial Studio & Swatches) */}
          <div
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
              videoLoaded && !videoError ? 'opacity-0 pointer-events-none' : 'opacity-45'
            }`}
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=2000&q=80')`
            }}
          />

          {/* Warm Vignette and Editorial Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#202820] via-[#202820]/75 to-[#202820]/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#202820]/80 via-transparent to-[#202820]/80" />
        </div>

        {/* Top Floating Navigation */}
        <header className="relative z-20 max-w-7xl w-full mx-auto px-6 lg:px-12 pt-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#D97745] flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-serif text-xl tracking-tight text-[#F5F1E9] font-bold block leading-none">
                BrandGuard Studio
              </span>
              <span className="text-[10px] text-[#D8CBB7] uppercase tracking-widest font-mono font-medium">
                Editorial Brand Governance
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={onEnterStudio}
              className="group relative inline-flex items-center space-x-2.5 bg-[#F5F1E9] hover:bg-[#FFFFFF] text-[#202820] text-xs font-semibold px-5 py-2.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
            >
              <span>Open Studio</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D97745] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </header>

        {/* Hero Copy & Call-To-Action */}
        <div className="relative z-20 max-w-5xl mx-auto px-6 lg:px-12 py-16 md:py-24 text-center my-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="inline-flex items-center space-x-2 bg-[#F5F1E9]/10 backdrop-blur-md border border-[#F5F1E9]/20 px-3.5 py-1.5 rounded-full text-xs text-[#D8CBB7] font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D97745]" />
              <span>Zero Drift &bull; Multimodal Policy Knowledge Graph</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#F5F1E9] font-normal tracking-tight leading-[1.08] max-w-4xl mx-auto">
              Your brand has a standard. <br />
              <span className="italic text-[#D8CBB7] font-serif">Make every creation</span> live up to it.
            </h1>

            <p className="text-sm md:text-base text-[#D8CBB7] max-w-2xl mx-auto leading-relaxed font-light">
              BrandGuard Studio replaces punitive reviews with an intelligent creative co-pilot. 
              Review copy, typography, and visual assets before publication against approved brand standards, verified facts, and design tokens.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onEnterStudio}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-3 bg-[#D97745] hover:bg-[#c66a3b] text-white text-sm font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-200 active:scale-98"
              >
                <span>Open Creative Review Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('manifesto');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-transparent hover:bg-white/5 text-[#D8CBB7] hover:text-[#F5F1E9] border border-[#D8CBB7]/30 text-sm font-medium px-6 py-4 rounded-xl transition"
              >
                <span>Explore Design System & Rules</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Bottom Metadata Bar */}
        <div className="relative z-20 border-t border-[#D8CBB7]/15 bg-[#202820]/60 backdrop-blur-sm py-4">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-wrap items-center justify-between text-xs text-[#D8CBB7]/80 gap-4 font-mono">
            <div className="flex items-center space-x-4">
              <span>ACTIVE POLICIES: <strong>32 RULES ENFORCED</strong></span>
              <span>&bull;</span>
              <span>WCAG 2.1 AA COMPLIANCE</span>
            </div>
            <div>
              <span>INKLOOM AI HACKATHON &bull; TEAM ZEROTOONE</span>
            </div>
          </div>
        </div>

      </section>

      {/* --- EDITORIAL MANIFESTO SECTION --- */}
      <section id="manifesto" className="py-24 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#D97745] font-semibold">
              01 &bull; The Creative Challenge
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-[#202820] font-normal leading-tight">
              Velocity without governance leads to silent brand erosion.
            </h2>
            <p className="text-sm text-[#202820]/80 leading-relaxed">
              When distributed teams, agencies, and generative tools produce collateral, inconsistent voice, unverified claims, and off-palette visuals slip past review. 
              Traditional governance acts as an opaque bottleneck: rejecting work without explanation.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#D8CBB7] shadow-editorial space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#82917A]/15 text-[#82917A] flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg text-[#202820] font-semibold">
                Multimodal Policy Graph
              </h3>
              <p className="text-xs text-[#202820]/75 leading-relaxed">
                Connects static brand manuals into an active GraphRAG structure linking rules, forbidden buzzwords, design tokens, and source citations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#D8CBB7] shadow-editorial space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#D97745]/15 text-[#D97745] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg text-[#202820] font-semibold">
                Intent-Preserving Fixes
              </h3>
              <p className="text-xs text-[#202820]/75 leading-relaxed">
                Single-click drop-in replacements that resolve non-compliant copy while strictly preserving the creator's persuasive tone and original message thesis.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#D8CBB7] shadow-editorial space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#202820]/10 text-[#202820] flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg text-[#202820] font-semibold">
                WCAG Contrast & Delta-E
              </h3>
              <p className="text-xs text-[#202820]/75 leading-relaxed">
                Mathematical pixel analysis computing W3C relative luminance contrast (4.5:1 AA) and color distance against official brand hex palettes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#D8CBB7] shadow-editorial space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#82917A]/15 text-[#82917A] flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg text-[#202820] font-semibold">
                Self-Healing Ambiguity Radar
              </h3>
              <p className="text-xs text-[#202820]/75 leading-relaxed">
                Analyzes human reviewer override patterns to notify brand leadership when guidelines are contradictory or vaguely defined.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* --- CTA FOOTER --- */}
      <footer className="mt-auto border-t border-[#D8CBB7] bg-[#202820] text-[#F5F1E9] py-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="font-serif text-2xl font-normal text-white">
              Ready to verify creative output?
            </h3>
            <p className="text-xs text-[#D8CBB7] mt-1">
              Open BrandGuard Studio to inspect collateral, explore the policy graph, and run test presets.
            </p>
          </div>

          <button
            onClick={onEnterStudio}
            className="inline-flex items-center space-x-2 bg-[#D97745] hover:bg-[#c66a3b] text-white text-xs font-semibold px-6 py-3 rounded-xl transition shadow"
          >
            <span>Enter Studio Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </footer>

    </div>
  );
};

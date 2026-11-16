import React, { useState } from 'react';
import { Settings, Webhook, ShieldAlert, Key, CheckCircle2, Save } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [webhookUrl, setWebhookUrl] = useState<string>('https://api.inkloom.ai/api/webhook/publish-gate');
  const [cmsPlatform, setCmsPlatform] = useState<string>('webflow');
  const [thresholdScore, setThresholdScore] = useState<number>(85);
  const [piiScrubbing, setPiiScrubbing] = useState<boolean>(true);
  const [apiKey, setApiKey] = useState<string>('');
  const [saved, setSaved] = useState<boolean>(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-[#D8CBB7] gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#D97745] font-semibold block mb-1">
            System Preferences &bull; Infrastructure
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-[#202820] font-normal leading-tight">
            Platform Settings
          </h1>
          <p className="text-xs md:text-sm text-[#202820]/70 mt-1 max-w-xl">
            Configure headless CMS publish webhooks, automated privacy sanitizers, and reasoning engines.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center space-x-2 bg-[#202820] hover:bg-[#2d382d] text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition shadow"
        >
          {saved ? <CheckCircle2 className="w-3.5 h-3.5 text-[#82917A]" /> : <Save className="w-3.5 h-3.5 text-[#D97745]" />}
          <span>{saved ? 'Saved Successfully' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Setting 1: CI/CD CMS Webhook Gate (Named Improvement #3) */}
      <div className="bg-[#FFFFFF] border border-[#D8CBB7] rounded-2xl p-6 shadow-editorial space-y-4">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-[#EBE5D8]">
          <Webhook className="w-5 h-5 text-[#D97745]" />
          <div>
            <h3 className="font-serif text-lg text-[#202820] font-normal">
              CI/CD Pre-Publish Webhook Gateway (Improvement #3)
            </h3>
            <p className="text-xs text-[#202820]/70">
              Enforce automated pre-flight brand gates before content status flips to 'Published' in external CMS systems.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-mono uppercase text-[#82917A] text-[10px] font-bold block mb-1">
              CMS Platform Connector
            </label>
            <select
              value={cmsPlatform}
              onChange={(e) => setCmsPlatform(e.target.value)}
              className="w-full bg-[#FDFBF7] border border-[#D8CBB7] p-2.5 rounded-xl text-xs font-semibold text-[#202820] focus:outline-none"
            >
              <option value="webflow">Webflow CMS</option>
              <option value="wordpress">WordPress REST API</option>
              <option value="ghost">Ghost CMS Webhook</option>
              <option value="notion">Notion Database Trigger</option>
            </select>
          </div>

          <div>
            <label className="font-mono uppercase text-[#82917A] text-[10px] font-bold block mb-1">
              Minimum Compliance Score Threshold
            </label>
            <input
              type="number"
              value={thresholdScore}
              onChange={(e) => setThresholdScore(Number(e.target.value))}
              min={60}
              max={100}
              className="w-full bg-[#FDFBF7] border border-[#D8CBB7] p-2.5 rounded-xl text-xs font-mono text-[#202820] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="font-mono uppercase text-[#82917A] text-[10px] font-bold block mb-1">
            Active Webhook Target Endpoint
          </label>
          <input
            type="text"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="w-full bg-[#FDFBF7] border border-[#D8CBB7] p-2.5 rounded-xl text-xs font-mono text-[#202820] focus:outline-none"
          />
        </div>
      </div>

      {/* Setting 2: Zero-Trust PII & Data Privacy */}
      <div className="bg-[#FFFFFF] border border-[#D8CBB7] rounded-2xl p-6 shadow-editorial space-y-4">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-[#EBE5D8]">
          <ShieldAlert className="w-5 h-5 text-[#82917A]" />
          <div>
            <h3 className="font-serif text-lg text-[#202820] font-normal">
              Enterprise Privacy & Local PII Scrubber
            </h3>
            <p className="text-xs text-[#202820]/70">
              Sanitizes internal email addresses, telephone numbers, and credentials before evaluation.
            </p>
          </div>
        </div>

        <label className="flex items-center space-x-3 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={piiScrubbing}
            onChange={(e) => setPiiScrubbing(e.target.checked)}
            className="rounded border-[#D8CBB7] text-[#D97745] focus:ring-0 w-4 h-4"
          />
          <span className="text-[#202820] font-medium">
            Active Client-Side PII Scrubbing (Masks confidential enterprise identifiers prior to LLM evaluation)
          </span>
        </label>
      </div>

      {/* Setting 3: Reasoning Engine / Gemini API Key */}
      <div className="bg-[#FFFFFF] border border-[#D8CBB7] rounded-2xl p-6 shadow-editorial space-y-4">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-[#EBE5D8]">
          <Key className="w-5 h-5 text-[#202820]" />
          <div>
            <h3 className="font-serif text-lg text-[#202820] font-normal">
              Multimodal Reasoning Engine (Optional)
            </h3>
            <p className="text-xs text-[#202820]/70">
              The platform operates 100% deterministically with built-in GraphRAG rules. Providing an API key enables generative intent-preserving alternatives.
            </p>
          </div>
        </div>

        <div>
          <label className="font-mono uppercase text-[#82917A] text-[10px] font-bold block mb-1">
            Google Gemini API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy... (Leave empty to use deterministic GraphRAG engine)"
            className="w-full bg-[#FDFBF7] border border-[#D8CBB7] p-2.5 rounded-xl text-xs font-mono text-[#202820] focus:outline-none"
          />
        </div>
      </div>

    </div>
  );
};

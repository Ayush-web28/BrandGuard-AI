import { ContentFormat } from '../types';

export interface SamplePreset {
  id: string;
  name: string;
  brand_id: string;
  format: ContentFormat;
  description: string;
  content_text: string;
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: "sample-1",
    name: "🚨 Viral Social Post (Buzzwords & Unverified Claims)",
    brand_id: "inkloom",
    format: "social_post",
    description: "Contains prohibited buzzwords ('game-changer', 'silver bullet'), unverified superlatives ('100% bug-free', 'zero downtime'), and product misnaming ('brandguard ai', 'BGAI').",
    content_text: "We are thrilled to unveil our game-changer platform brandguard ai! It is a revolutionary silver bullet that guarantees 100% bug-free marketing copy with zero downtime. Unlike other tools, BGAI is the only platform in the world that fixes everything automatically."
  },
  {
    id: "sample-2",
    name: "📄 Enterprise Press Release (Missing Regulatory AI Disclosure)",
    brand_id: "inkloom",
    format: "press_release",
    description: "Formal press release containing market claims and a buzzword ('paradigm shift'), missing the mandatory FTC/EU AI transparency disclosure.",
    content_text: "Inkloom AI announces general availability of BrandGuard AI across 500 enterprise customers. The system delivers a paradigm shift in content velocity. Industry benchmarks confirm consistent brand governance increases enterprise revenue by 10% to 33%."
  },
  {
    id: "sample-3",
    name: "⚡ Cloud Infrastructure Ad (TechCorp SLA & Security Violation)",
    brand_id: "techcorp",
    format: "ad_banner",
    description: "TechCorp ad violating cybersecurity FTC standards ('100% unhackable') and advertising false '100% uptime' vs approved '99.99%' SLA.",
    content_text: "TechCorp Cloud guarantees 100% unhackable infrastructure with 100% uptime. Protect your enterprise from every cyber threat without compromise."
  },
  {
    id: "sample-4",
    name: "💰 Obsolete Commercial Pricing Post",
    brand_id: "inkloom",
    format: "social_post",
    description: "States unauthorized promotional pricing ($99/mo) when active enterprise pricing sheet lists $499/mo.",
    content_text: "Supercharge your brand governance today with BrandGuard AI for only $99/mo! Lock in this revolutionary price before rates go up."
  }
];

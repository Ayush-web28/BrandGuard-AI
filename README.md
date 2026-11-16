# BrandGuard AI 🛡️
### Intelligent Multimodal Brand Governance & Policy Knowledge Graph Platform 

---

## 🌟 Executive Overview
**BrandGuard AI** is an intelligent brand-governance co-pilot that verifies marketing copy, public announcements, pitch decks, and visual collateral *before* publication. 

Instead of acting as a punitive gatekeeper that ambiguously rejects drafts, BrandGuard AI:
1. **Parses & Models Brand Identity:** Converts unstructured guidelines, approved fact sheets, and design tokens into a queryable **Multimodal Policy Knowledge Graph (GraphRAG)**.
2. **Performs Multimodal Pre-Flight Scans:** Simultaneously verifies copy tone, deconstructs claims against approved source documents, and calculates visual WCAG 2.1 contrast ratios and palette Delta-E distances.
3. **Explains with Exact Citations:** Pinpoints the precise guideline clause or approved whitepaper for every flagged anomaly.
4. **Suggests Intent-Preserving Corrections:** Uses constrained semantic rewriting to align with brand standards while rigorously preserving the creator’s original thesis and voice.
5. **Enables Human-in-the-Loop Collaboration:** Provides an interactive side-by-side diff studio with role-based sign-offs (Creator, Brand Reviewer, Legal Compliance).
6. **Detects Guideline Ambiguity:** Runs a self-healing analytics engine that analyzes human reviewer overrides to highlight contradictory or vague corporate brand rules.

---

## 🏗️ Architecture

```
                               ┌──────────────────────────────────────────────────┐
                               │           BrandGuard Studio (Next.js 14)        │
                               │  - Interactive Diff Editor & 1-Click Fixes       │
                               │  - Multimodal Canvas & WCAG Visual Inspector     │
                               │  - Role-Based Review (Creator / Reviewer / Legal)│
                               │  - Self-Healing Ambiguity Radar & Heatmaps       │
                               └────────────────────────┬─────────────────────────┘
                                                        │ REST / WebSocket
                               ┌────────────────────────▼─────────────────────────┐
                               │            FastAPI Orchestration Gateway         │
                               │  - Content Ingestion & PII Scrubber              │
                               │  - Async Task Processing & Job Queues            │
                               │  - Relational State & Audit Logging              │
                               └──────┬──────────────────┬─────────────────┬──────┘
                                      │                  │                 │
                ┌─────────────────────▼─────┐   ┌────────▼──────────┐   ┌──▼────────────────────┐
                │   Policy Knowledge Graph  │   │  Claim Verifier   │   │  Multimodal Vision    │
                │  - NetworkX Policy Graph  │   │ - Factual Truth DB│   │ - OpenCV / PIL Math   │
                │  - Semantic Tone Vectors  │   │ - Superlative Scan│   │ - Delta-E Palette     │
                │  - Prohibited Terminology │   │ - Expired Pricing │   │ - WCAG 2.1 Contrast   │
                └───────────────────────────┘   └───────────────────┘   └───────────────────────┘
```

---

## 📂 Repository Layout

```
BrandGuard-AI/
├── backend/                  # FastAPI Python backend
│   ├── app/
│   │   ├── api/              # REST API endpoints (scan, vault, reviews, analytics)
│   │   ├── core/             # Configuration, security, PII scrubber
│   │   ├── models/           # Pydantic data schemas
│   │   ├── services/         # Core AI & verification engines
│   │   │   ├── vault.py          # Guideline & asset ingestion
│   │   │   ├── graphrag.py       # Policy Knowledge Graph & rule matcher
│   │   │   ├── claim_verifier.py # Factual verification & superlative scanner
│   │   │   ├── visual_inspector.py # Palette Delta-E & WCAG contrast math
│   │   │   └── rewriter.py       # Intent-preserving diff & fix generator
│   │   └── main.py           # Application entrypoint
│   ├── tests/                # Automated test suites
│   └── requirements.txt      # Python dependencies
├── frontend/                 # Next.js 14 App Router frontend
│   ├── src/
│   │   ├── app/              # Routes & layouts
│   │   ├── components/       # Studio, DiffViewer, Canvas, Analytics, Vault
│   │   ├── lib/              # API clients, local rule engine, mock presets
│   │   └── types/            # TypeScript interfaces
│   ├── package.json
│   └── tailwind.config.js
├── docs/                     # Specifications & evaluation criteria
├── examples/                 # Seed brand guidelines, test collateral, and presets
├── BrandGuard_AI_Round_1_Proposal_ZeroToOne.pdf  # Round 1 Submission
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ (Tested on v24.14.0)
- Python 3.10+ (Tested on 3.13.1)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` to access the BrandGuard Studio.

---

## 🎯 Round 2 Evaluation Checklist
- [x] **Core workflow runs end-to-end:** Content input $\to$ Policy scan $\to$ Rule citation $\to$ Intent-preserving fix $\to$ Human sign-off.
- [x] **Technical depth:** Hybrid GraphRAG, OpenCV/PIL WCAG luminance math, deterministic claim verification, and LLM reasoning.
- [x] **Zero friction for judges:** Pre-loaded one-click test cases for social copy, tech announcements, and ad banners.
- [x] **Progress against Round 1 plan:** Faithfully implemented all architecture specifications formulated in Round 1.
- [x] **Three Named Round 3 Improvements:** Detailed and scoped in documentation.

---

## 📜 License
This project is licensed under the Apache 2.0 License - see the LICENSE file for details.

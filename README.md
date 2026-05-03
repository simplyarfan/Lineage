<div align="center">
  <img src="docs/banner.svg" width="100%" alt="Lineage" />
</div>

<div align="center">

[![IBM DEV DAY](https://img.shields.io/badge/IBM_DEV_DAY-2026-1a1a2e?style=flat-square&labelColor=1a1a2e&color=1a1a2e)](https://developer.ibm.com)&nbsp;[![HACKATHON](https://img.shields.io/badge/HACKATHON-4f46e5?style=flat-square)](https://developer.ibm.com)&nbsp;[![STATUS](https://img.shields.io/badge/STATUS-SUBMITTED-22c55e?style=flat-square&labelColor=1a1a2e)](https://developer.ibm.com)&nbsp;[![LICENSE](https://img.shields.io/badge/LICENSE-MIT-64748b?style=flat-square&labelColor=1a1a2e)](./LICENSE)

[![IBM Bob](https://img.shields.io/badge/IBM_Bob-Primary_IDE-0f62fe?style=flat-square)](https://www.ibm.com/products/watson)&nbsp;[![watsonx.ai](https://img.shields.io/badge/watsonx.ai-Granite_3_8B-0f62fe?style=flat-square)](https://www.ibm.com/products/watsonx-ai)&nbsp;[![Python](https://img.shields.io/badge/Python-3.10+-3776ab?style=flat-square)](https://python.org)&nbsp;[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square)](https://nextjs.org)&nbsp;[![D3.js](https://img.shields.io/badge/D3.js-7-f9a03c?style=flat-square)](https://d3js.org)&nbsp;[![SQLite](https://img.shields.io/badge/SQLite-local--first-003b57?style=flat-square)](https://sqlite.org)

</div>

---

## Overview

**Lineage** is a developer-side attribution engine for AI-generated code. As AI coding tools become standard in software development, questions around authorship, provenance, and accountability are no longer hypothetical. They are the standard that regulators and enterprises globally are beginning to require.

Lineage answers: *"Who wrote this line: human or AI? Which session? Which model? Was it reviewed?"*

It ingests IBM Bob session exports and git history to produce a complete attribution graph: every line of code tagged with its origin, the prompt that generated it, the model used, and whether a human re-touched it afterward.

> "The next generation of software compliance is not about what you ship. It is about who wrote it."

---

## Demo

**[View Demo](https://lineage-demo.vercel.app)** — Public showcase with real attribution data from Lineage's own development history.

For the full local experience with live SQLite data:

```bash
pip install -e .
lineage init && lineage scan && lineage view
```

---

## How It Works

From Bob session export to complete audit trail in four commands.

```
  IBM Bob Sessions              Git History
  (.md + .meta.json)            (git log)
          |                          |
          +-----------+--------------+
                      |
            lineage scan
         (adapters/bob.py)
                      |
            lineage attribute
         (attribution/engine.py)
         time · file overlap · author
                      |
            lineage classify
         (watsonx.ai Granite 3 8B)
         domain · risk tier · rationale
                      |
            lineage view
         treemap · file viewer · Risk Lens
         provenance panel · audit export
```

---

## How It Was Built

Lineage is a self-referential proof of concept. **IBM Bob** was the primary development tool for all phases. Phases 1 through 6 of the codebase were written entirely in Bob. The web UI (Phase 7) was built in Claude Code to stay within Bobcoin budget for the submission.

IBM Granite (via watsonx.ai) is used exclusively for **inference**: classifying Bob sessions by domain and risk tier. It does not write any code.

| Phase | What Was Built | Tool |
|-------|---------------|------|
| 01 | Architecture design + full build plan | IBM Bob |
| 02 | CLI scaffold, SQLite schema, Pydantic models | IBM Bob |
| 03 | Bob session parser, adapter pattern, unit tests | IBM Bob |
| 04 | Sidecar metadata format, surgical patch | IBM Bob |
| 05 | Attribution engine: git walker + heuristic scorer | IBM Bob |
| 06 | watsonx.ai classifier: domain + risk tier | IBM Bob |
| 07 | Next.js web UI, Flask local server | Claude Code |

---

## Key Features

**Attribution Treemap** — Every file in the repo, sized by lines of code, colored by AI authorship percentage. Green is human. Red is AI. Gray is unknown. Click any cell to drill into line-level attribution.

**Provenance Panel** — Click any AI-attributed line to see the exact prompt, model identifier, token cost, timestamp, and classification that generated it. Full traceability to the source session.

**Risk Lens** — One toggle highlights high-risk AI code (auth, payments, data domains) that has never been re-reviewed by a human. Designed for compliance review workflows.

**Session Classification** — IBM Granite 3 8B (via watsonx.ai) classifies each Bob session by domain (`auth`, `data`, `infra`, `ui`, `other`) and risk tier (`high`, `medium`, `low`) with a natural-language rationale.

**Audit Export** — Generates EU AI Act Article 12-compliant audit reports in JSON and PDF formats, covering every AI session, its outputs, and human oversight records.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Primary IDE | IBM Bob (ibm/granite-3-8b-instruct) |
| Inference | IBM watsonx.ai: Granite 3 8B Instruct |
| CLI | Python + Click |
| Storage | SQLite (local-first, zero dependencies) |
| Attribution | GitPython + heuristic scoring |
| Web UI | Next.js 16, React 18, D3.js v7, Tailwind CSS |
| Local Server | Flask (for `lineage view`) |
| Deployment | Vercel (public demo) |

---

## Project Structure

```
Lineage/
├── lineage/
│   ├── cli/              # Click CLI: init, scan, attribute, classify, view, export
│   ├── core/             # Pydantic models, config, exceptions
│   ├── adapters/         # Session parsers: BobSessionAdapter (+ future: Cursor, Copilot)
│   ├── attribution/      # GitWalker, AttributionScorer, AttributionEngine
│   ├── classification/   # watsonx.ai classifier + cache
│   ├── storage/          # SQLite schema, DatabaseManager
│   ├── web/              # Flask app + static index.html (local UI)
│   └── export/           # EU AI Act audit report generator
├── frontend/             # Next.js public showcase (deployed on Vercel)
├── bob_sessions/         # Exported Bob session .md + .meta.json files
├── tests/                # Pytest unit tests
├── docs/                 # Architecture docs + phase summaries
└── scripts/              # seed_demo.py: populates DB with real attribution data
```

---

## Getting Started

**Prerequisites:** Python 3.10+, Git, IBM Bob account

```bash
# Clone
git clone https://github.com/simplyarfan/Lineage.git
cd Lineage

# Install
pip install -e .

# Initialize database in your repo
lineage init

# Ingest Bob session exports
lineage scan --sessions ./bob_sessions/

# Match sessions to git commits
lineage attribute

# Classify sessions via watsonx.ai (requires .env with WATSONX_API_KEY etc.)
lineage classify

# Launch local web UI
lineage view
```

**Environment variables** (`.env` at repo root):

```
WATSONX_API_KEY=your-api-key
WATSONX_PROJECT_ID=your-project-id
WATSONX_ENDPOINT=https://eu-de.ml.cloud.ibm.com
```

---

## CLI Reference

| Command | Description |
|---------|-------------|
| `lineage init` | Initialize `.lineage/lineage.db` in current repo |
| `lineage scan` | Ingest Bob session exports into database |
| `lineage attribute` | Match sessions to git commits via heuristic scoring |
| `lineage classify` | Classify sessions via watsonx.ai Granite |
| `lineage view` | Launch local web UI at localhost:5000 |
| `lineage export` | Generate EU AI Act Article 12 audit report |

---

## Hackathon Submission

**IBM Dev Day: Bob Edition 2026**

- **Category:** Developer Productivity Tools
- **Core Technology:** IBM Bob + IBM watsonx.ai (Granite 3 8B Instruct)
- **Demo:** [View Demo](https://lineage-demo.vercel.app)

---

## Author

**Syed Arfan**

[![GitHub](https://img.shields.io/badge/GitHub-simplyarfan-181717?style=flat-square&logo=github)](https://github.com/simplyarfan)&nbsp;[![LinkedIn](https://img.shields.io/badge/LinkedIn-syedarfan-0a66c2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/syedarfan)

---

<div align="center">
  <sub>Built with IBM Bob for IBM Dev Day: Bob Edition 2026</sub>
</div>

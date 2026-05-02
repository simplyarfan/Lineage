# Lineage

**Git blame for AI-generated code** — Track, attribute, and audit AI-assisted development for EU AI Act compliance.

## What is Lineage?

Lineage is a developer-side attribution engine that answers the critical question: *"Who wrote this code—human or AI? Which prompt? Which model? Was it reviewed?"*

Built for the **EU AI Act Article 12** logging requirements (effective **August 2026**), Lineage transforms opaque AI-assisted development into auditable, retainable, attributable records. It ingests AI coding session exports (currently IBM Bob) and git history to produce a complete provenance graph for every line of code.

## Why It Matters

The EU AI Act mandates that organizations using AI systems maintain detailed logs of:
- Input data (prompts and context)
- Model identifiers (name, version, provider)
- Output artifacts (code generated)
- Human oversight (review and approval)

**Deadline: August 2026.** Organizations without compliant audit trails face significant penalties.

Lineage makes compliance automatic by:
- ✅ Parsing AI session exports into structured records
- ✅ Matching AI sessions to git commits with confidence scoring
- ✅ Classifying code by domain and risk tier (via watsonx.ai)
- ✅ Generating Article 12-compliant audit reports (JSON + PDF)
- ✅ Providing visual exploration tools (treemap, file viewer, timeline)

## Features (MVP - Phase 2)

- **CLI Interface**: Six commands for complete workflow (`init`, `scan`, `attribute`, `classify`, `view`, `export`)
- **SQLite Storage**: Local-first database in `.lineage/lineage.db` with full schema
- **Pydantic Models**: Type-safe data structures for sessions, commits, attributions, file lines, and reviews
- **Configuration**: YAML-based config with sensible defaults
- **Extensible Architecture**: Adapter pattern ready for Cursor, Copilot, Claude Code when they ship exports

## Installation

```bash
# Clone the repository
git clone https://github.com/simplyarfan/Lineage.git
cd Lineage

# Install in development mode
pip install -e .
```

## Quick Start

```bash
# Initialize Lineage in your repository
lineage init

# View available commands
lineage --help

# Commands (Phase 3-7 implementations coming):
# lineage scan --sessions ./bob_sessions/     # Ingest AI session exports
# lineage attribute --threshold 0.4           # Match sessions to commits
# lineage classify                            # Classify sessions by domain/risk
# lineage view --port 5000                    # Launch web UI
# lineage export --format eu-ai-act           # Generate audit report
```

## Project Status

**Current Phase: 2 - Scaffold Complete** ✅

- [x] Project structure and packaging
- [x] CLI skeleton with all commands
- [x] SQLite schema (5 tables, 7 indexes)
- [x] Database manager with context support
- [x] Pydantic models for all entities
- [x] Configuration loader with YAML support

**Next Phases:**
- Phase 3: Bob session parser (adapter pattern)
- Phase 4: Attribution engine (heuristic matching)
- Phase 5: Session classifier (watsonx.ai integration)
- Phase 6: Web UI (React + Flask + D3.js)
- Phase 7: Audit exporter (EU AI Act compliance)

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for complete design documentation including:
- Component breakdown
- Data flow diagrams
- Tech stack rationale
- Risk analysis
- Build plan (8 phases)

## Development

This project was built during the **IBM Bob Dev Day Hackathon** to demonstrate AI-assisted development with full provenance tracking. Lineage will audit its own development history as a self-referential proof of concept.

### Project Structure

```
lineage/
├── cli/              # Click-based command interface
├── core/             # Config, models, exceptions
├── adapters/         # AI tool parsers (Bob, future: Cursor, Copilot)
├── attribution/      # Heuristic matching engine
├── classification/   # watsonx.ai classifier
├── storage/          # SQLite schema and database manager
├── web/              # Flask API + React SPA
└── export/           # EU AI Act audit report generator

tests/                # Pytest test suite
docs/                 # Architecture and API documentation
bob_sessions/         # Session exports from building Lineage
examples/             # Demo data and sample outputs
```

## Requirements

- Python 3.10+
- Git repository
- IBM Bob (for session exports)
- watsonx.ai API key (for classification, Phase 5)

## License

MIT License - See LICENSE file for details

## Contributing

This is a hackathon project currently in active development. Contributions welcome after Phase 7 (MVP completion).

## Acknowledgments

Built with IBM Bob during the Bob Dev Day Hackathon. Special thanks to the IBM watsonx.ai team for Granite model access.

---

**Status**: Phase 2 Complete | **Version**: 0.1.0 | **Last Updated**: 2026-05-02

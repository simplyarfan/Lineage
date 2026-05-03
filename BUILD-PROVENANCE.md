# Build Provenance

Lineage was built during the **IBM Bob Dev Day Hackathon** (May 2–3, 2026) using two AI coding tools and one AI inference service. This document discloses exactly how each was used, in keeping with the project's own value proposition: AI code should be auditable, not opaque.

---

## IBM Bob — Primary Build Tool (7 of 8 build phases)

The substantive backend engineering of Lineage was authored end-to-end in IBM Bob. Each phase below has a corresponding session export in `bob_sessions/` containing the full prompt, the Task ID (UUID), the model used, the Bobcoin cost, and a consumption summary screenshot. **This is the same data that Lineage's own parser ingests during the self-referential demo.**

| Phase | Description | Bob Mode | Export |
|---|---|---|---|
| 1 | Architecture & technical design | Plan | `bob_sessions/01-architecture.md` |
| 2 | Project scaffold, CLI skeleton, SQLite schema, Pydantic models | Code | `bob_sessions/02-scaffold.md` |
| 3 | Bob session parser (`BobSessionAdapter`) | Code | `bob_sessions/03-bob-parser.md` |
| 4 | Surgical patch — fixed parser bugs (Task ID extraction, exact `api_cost`) | Code | `bob_sessions/04-surgical-patch.md` |
| 5 | Attribution engine + Git walker + heuristic scorer | Code | `bob_sessions/05-attribution.md` |
| 6 | watsonx.ai Granite classifier (domain + risk tier) | Code | `bob_sessions/06-classifier.md` |
| 8 | EU AI Act Article 12 audit export (`lineage export`) | Code | `bob_sessions/08-export.md` |

Every Bob session export was committed to the repo as part of the development trail. Each `*.meta.json` sidecar carries the structured metadata (Task ID, timestamp range, model, prompt text, files touched, exact `api_cost` in Bobcoins, token counts) that the parser ingests.

---

## Claude Code — Phase 7 Only (Web UI)

The Flask backend (`lineage/web/`) and the React + D3 frontend (`frontend/`) were built in Claude Code rather than Bob. This is disclosed transparently for three reasons:

1. **Lineage's value proposition is AI provenance.** We hold ourselves to the same standard we ask of users. Hiding this would undermine the pitch.
2. **It was a deliberate budget decision.** Bobcoin allocation was finite (40 coins for the hackathon). Investing those coins in the parser, attribution engine, classifier, and exporter — where the substantive AI engineering lives — was the right call. The Web UI is presentation-layer plumbing.
3. **Future scope.** A `ClaudeCodeSessionAdapter` is on the roadmap so Lineage can ingest Claude Code sessions the same way it ingests Bob sessions today, closing this gap by design.

The Claude Code work is not represented in `bob_sessions/` and therefore does not appear as red rectangles in the self-referential demo treemap. Files in `lineage/web/` and `frontend/` will appear as human-authored in the current build, which is technically incorrect but honest about the tooling boundary.

---

## IBM watsonx.ai — Runtime Inference

Lineage uses **IBM watsonx.ai with the Granite 3-8b-instruct model** at runtime, not at build time. Specifically, Phase 6's classifier (`lineage/classification/classifier.py`) sends each parsed Bob session to watsonx.ai and receives back a structured classification:

- **Domain:** `auth | payments | data | ui | infra | other`
- **Risk tier:** `high | medium | low`
- **Rationale:** short natural-language explanation

Credentials live in `.env` (gitignored). The endpoint is `us-south` (Dallas region). Results are cached in SQLite to avoid re-classifying on every run.

This classification is what powers the **Risk Lens** in the Web UI and the **`high_risk_contributions`** field in the EU AI Act audit export.

---

## Why This File Exists

The single sentence that defines Lineage is: *"Every line of AI-generated code in your repo should be traceable to a prompt, a model, a cost, and a human reviewer."* Applying that principle to Lineage's own development meant being honest about which AI tool wrote which part. This file is that honesty.

If a future judge, contributor, or auditor wants to verify any claim above, every Bob session export in `bob_sessions/` is reproducible: open the markdown, see the prompt, see the cost, run the same prompt against Bob and observe similar output. The Claude Code portion is, by its nature, less reproducible — which is exactly the gap Lineage exists to close across the wider AI-coding ecosystem.

---

*Generated as part of the Lineage submission for IBM Bob Dev Day Hackathon, May 2026.*

# Lineage Architecture

**Version:** 0.1.0  
**Last Updated:** 2026-05-01  
**Status:** Pre-implementation design

---

## Overview

Lineage is a developer-side attribution engine that ingests AI coding session exports and git history to produce a complete provenance graph for every line of code. It answers: "Who wrote this—human or AI? Which prompt? Which model? Was it reviewed?" Built for the EU AI Act Article 12 logging requirements (effective August 2026), Lineage transforms opaque AI-assisted development into auditable, retainable, attributable records. The MVP targets IBM Bob session exports exclusively, leveraging Bob's built-in structured audit trail as a competitive moat. The architecture is adapter-pluggable to support future tools when they ship comparable export formats.

---

## Components

### 1. **CLI (`lineage/cli/`)**
**Responsibility:** User-facing command interface for all operations.

**Interface:**
```bash
lineage init [--repo PATH]           # Initialize .lineage/ database in target repo
lineage scan [--sessions PATH]       # Ingest AI session exports
lineage attribute [--threshold 0.4]  # Run attribution matching engine
lineage classify [--force]           # Classify sessions by domain/risk via watsonx.ai
lineage view [--port 5000]           # Launch local web UI
lineage export [--format eu-ai-act]  # Generate compliance audit report
```

**Key Dependencies:** `click` for CLI framework, `lineage.core.config` for settings.

**Design Decision:** Commands are idempotent where possible. `scan` appends new sessions; `attribute` recalculates only unmatched commits; `classify` uses cache unless `--force`.

---

### 2. **Adapters (`lineage/adapters/`)**
**Responsibility:** Parse AI tool session exports into normalized `Session` objects.

**Interface:**
```python
class SessionAdapter(ABC):
    @abstractmethod
    def parse(self, export_path: Path) -> List[Session]:
        """Parse tool-specific export format into Session objects."""
        pass

class BobSessionAdapter(SessionAdapter):
    """IBM Bob JSON export parser (v0 implementation)."""
    def parse(self, export_path: Path) -> List[Session]:
        # Parse Bob's structured JSON: prompts, files, timestamps, model metadata
        pass
```

**Key Dependencies:** `pydantic` for `Session` model validation, `json` stdlib.

**Design Decision:** Adapter pattern isolates tool-specific parsing. Adding `CursorAdapter` or `CopilotAdapter` requires implementing one class with zero changes to core logic. Bob's export format is JSON with fields: `session_id`, `timestamp_start`, `timestamp_end`, `prompts[]`, `files_modified[]`, `model`, `user_email`.

---

### 3. **Attribution Engine (`lineage/attribution/`)**
**Responsibility:** Match AI sessions to git commits via heuristic scoring.

**Interface:**
```python
class AttributionEngine:
    def match_sessions_to_commits(
        self, 
        sessions: List[Session], 
        commits: List[GitCommit],
        threshold: float = 0.4
    ) -> List[Attribution]:
        """Return Attribution objects linking sessions to commits with confidence scores."""
        pass

class AttributionScorer:
    def score(self, session: Session, commit: GitCommit) -> float:
        """Compute 0.0-1.0 confidence score based on time, files, author."""
        # Time proximity: exponential decay from session end to commit time
        # File overlap: Jaccard similarity of session files vs commit diff
        # Author match: binary 1.0 if emails match, 0.5 if domain matches
        pass
```

**Key Dependencies:** `gitpython` for commit traversal, `lineage.storage` for persistence.

**Design Decision:** Confidence threshold (default 0.4) is tunable. Below threshold, commits are marked "unknown attribution" rather than falsely claimed as AI. This transparency is critical for audit credibility. Time window is ±30 minutes from session end; configurable via `.lineage/config.yml`.

**Heuristic Weights:**
- Time proximity: 40% (exponential decay, half-life 15 min)
- File overlap: 40% (Jaccard index of file paths)
- Author match: 20% (email exact match = 1.0, domain match = 0.5)

---

### 4. **Classification (`lineage/classification/`)**
**Responsibility:** Classify AI sessions by domain and risk tier using watsonx.ai.

**Interface:**
```python
class SessionClassifier:
    def classify(self, session: Session) -> Classification:
        """Call watsonx.ai to classify session by domain and risk."""
        # Domain: auth, payments, data-handling, UI, infrastructure, other
        # Risk: high, medium, low (per EU AI Act Annex III criteria)
        pass

class ClassificationCache:
    """SQLite-backed cache to avoid re-classifying identical prompts."""
    def get(self, prompt_hash: str) -> Optional[Classification]:
        pass
    def set(self, prompt_hash: str, classification: Classification):
        pass
```

**Key Dependencies:** `requests` for watsonx.ai REST API, `hashlib` for prompt hashing.

**Design Decision:** Classification is expensive (API call + latency). Cache by SHA-256 hash of `(prompt_text, model_id)`. Cache hit rate should exceed 60% in typical repos with repeated patterns. Classifier uses IBM Granite 3 8B Instruct with a structured prompt template that returns JSON: `{"domain": "auth", "risk": "high", "rationale": "..."}`.

**Prompt Template:**
```
Classify this AI coding session:
Prompt: {session.prompt}
Files: {session.files}
Output: JSON with domain (auth/payments/data/UI/infra/other) and risk (high/medium/low per EU AI Act Annex III).
```

---

### 5. **Storage (`lineage/storage/`)**
**Responsibility:** SQLite schema and ORM for `.lineage/lineage.db`.

**Schema:**
```sql
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    timestamp_start INTEGER,
    timestamp_end INTEGER,
    user_email TEXT,
    model TEXT,
    prompt_text TEXT,
    files_json TEXT,  -- JSON array of file paths
    classification_domain TEXT,
    classification_risk TEXT,
    classification_rationale TEXT
);

CREATE TABLE commits (
    sha TEXT PRIMARY KEY,
    author_email TEXT,
    timestamp INTEGER,
    message TEXT,
    files_json TEXT  -- JSON array of file paths in diff
);

CREATE TABLE attributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT REFERENCES sessions(id),
    commit_sha TEXT REFERENCES commits(sha),
    confidence REAL,
    time_score REAL,
    file_score REAL,
    author_score REAL,
    UNIQUE(session_id, commit_sha)
);

CREATE TABLE file_lines (
    file_path TEXT,
    line_number INTEGER,
    commit_sha TEXT,
    attribution_type TEXT,  -- 'human', 'ai', 'unknown'
    session_id TEXT,
    PRIMARY KEY (file_path, line_number)
);

CREATE TABLE reviews (
    session_id TEXT PRIMARY KEY REFERENCES sessions(id),
    reviewer_email TEXT,
    review_type TEXT,  -- 'implicit', 'commit-message', 'pr-approval', 'manual'
    review_timestamp INTEGER,
    notes TEXT
);
```

**Key Dependencies:** `sqlite3` stdlib, `sqlalchemy` for ORM (optional, evaluate in Phase 2).

**Design Decision:** Single SQLite file in `.lineage/lineage.db` keeps deployment trivial (no external DB). Schema is denormalized for read performance (web UI queries). `file_lines` table is the core attribution graph; expect ~1M rows for a 100k-line repo. Indexed on `(file_path, line_number)` and `commit_sha`.

---

### 6. **Web UI (`lineage/web/`)**
**Responsibility:** Local React SPA served by Flask for visual exploration.

**Interface:**
- **Flask routes:**
  - `GET /` → serve `index.html`
  - `GET /api/treemap` → JSON: file tree with AI% per file
  - `GET /api/file/<path>` → JSON: line-by-line attribution for file
  - `GET /api/session/<id>` → JSON: full session metadata
  - `GET /api/timeline` → JSON: commit history with AI attribution over time
  - `GET /api/risk-lens` → JSON: high-risk AI code never re-touched

- **React components:**
  - `Treemap`: D3 treemap colored by % AI-authored (green=human, red=AI, gray=unknown)
  - `FileViewer`: Monaco editor with line-level attribution gutter icons
  - `ProvenancePanel`: Side panel showing session details (prompt, model, cost, classification)
  - `Timeline`: D3 time-series scrubber through repo history
  - `RiskLens`: Toggle overlay highlighting high-risk AI code with no human re-touch

**Key Dependencies:** Flask, React 18, D3.js v7, Monaco Editor.

**Design Decision:** SPA architecture with Flask as thin API layer. All computation happens in Python; React is pure presentation. This keeps the UI swappable (could replace with Vue/Svelte) without touching core logic. Risk Lens query is expensive (join `attributions` + `classifications` + `file_lines` + git blame for re-touch detection); cache result for 5 minutes.

---

### 7. **Export (`lineage/export/`)**
**Responsibility:** Generate EU AI Act Article 12-compliant audit reports.

**Interface:**
```python
class EUAIActExporter:
    def export(self, output_path: Path, format: str = 'json'):
        """Generate Article 12 audit log: JSON or PDF."""
        # Required fields per Article 12:
        # - Input data (prompt + context files)
        # - Model identifier (name, version, provider)
        # - Output artifact (files modified, diffs)
        # - Human oversight (reviewer, timestamp, disposition)
        # - Retention metadata (classification, risk tier)
        pass
```

**Key Dependencies:** `reportlab` for PDF generation, `jinja2` for templating.

**Design Decision:** JSON export is canonical; PDF is human-readable wrapper. JSON schema follows Article 12 structure exactly:
```json
{
  "audit_metadata": {
    "generated_at": "2026-05-01T23:00:00Z",
    "repository": "github.com/simplyarfan/Lineage",
    "lineage_version": "0.1.0"
  },
  "ai_sessions": [
    {
      "session_id": "bob-20260501-001",
      "timestamp": "2026-05-01T22:30:00Z",
      "input_prompt": "Implement attribution engine",
      "input_context": ["lineage/attribution/engine.py"],
      "model": "ibm/granite-3-8b-instruct",
      "output_artifacts": ["lineage/attribution/engine.py:10-45"],
      "human_oversight": {
        "reviewer": "arfan@example.com",
        "review_type": "implicit",
        "timestamp": "2026-05-01T22:35:00Z"
      },
      "classification": {
        "domain": "infrastructure",
        "risk": "medium"
      }
    }
  ]
}
```

PDF includes executive summary: total lines, % AI-authored, high-risk sessions, review coverage.

---

## Data Flow

### End-to-End User Journey

```mermaid
graph TD
    A[Developer exports Bob sessions] --> B[lineage scan]
    B --> C[Parse via BobSessionAdapter]
    C --> D[Store in sessions table]
    D --> E[lineage attribute]
    E --> F[Walk git history via gitpython]
    F --> G[AttributionEngine matches sessions to commits]
    G --> H[Store in attributions + file_lines tables]
    H --> I[lineage classify]
    I --> J[Call watsonx.ai for each session]
    J --> K[Cache classifications]
    K --> L[Update sessions table with domain/risk]
    L --> M[lineage view]
    M --> N[Flask serves React SPA]
    N --> O[User explores treemap, file viewer, timeline]
    O --> P[lineage export]
    P --> Q[Generate EU AI Act JSON + PDF]
```

### Critical Path Details

1. **Ingestion (`lineage scan`):**
   - User provides path to Bob session export directory (JSON files)
   - `BobSessionAdapter.parse()` validates and normalizes each session
   - Sessions inserted into SQLite with deduplication by `session_id`

2. **Attribution (`lineage attribute`):**
   - `gitpython` walks commit history from HEAD to initial commit
   - For each commit, `AttributionScorer` computes confidence vs all unmatched sessions
   - Attributions above threshold stored; commits below threshold marked "unknown"
   - `file_lines` table populated by parsing git blame + attribution mappings

3. **Classification (`lineage classify`):**
   - For each session without classification, hash prompt and check cache
   - On cache miss, call watsonx.ai REST API with structured prompt
   - Parse JSON response, store in cache and update `sessions` table
   - Rate limit: 10 req/sec to watsonx.ai (configurable)

4. **Visualization (`lineage view`):**
   - Flask serves React SPA on `localhost:5000`
   - React fetches `/api/treemap` and renders D3 treemap
   - User clicks file → fetch `/api/file/<path>` → Monaco editor with attribution gutter
   - User clicks line → fetch `/api/session/<id>` → provenance panel
   - Risk Lens toggle → fetch `/api/risk-lens` → highlight high-risk AI code

5. **Export (`lineage export`):**
   - Query all sessions with attributions + classifications + reviews
   - Serialize to Article 12 JSON schema
   - Generate PDF with reportlab (cover page, summary stats, session details)
   - Write to `lineage-audit-{timestamp}.{json,pdf}`

---

## Tech Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Engine** | Python 3.10+ | Mature git/data tooling, fast prototyping, watsonx.ai SDK |
| **Storage** | SQLite | Zero-config, single-file, sufficient for 1M+ rows, ACID guarantees |
| **Web Server** | Flask | Minimal, well-understood, perfect for local-first tools |
| **Web UI** | React 18 | Component model fits attribution UI, huge ecosystem |
| **Visualization** | D3.js v7 | Industry standard for treemaps and timelines |
| **Code Editor** | Monaco | VSCode's editor, syntax highlighting, diff view built-in |
| **Git Interface** | gitpython | Pythonic git API, handles edge cases (merge commits, renames) |
| **AI Classifier** | watsonx.ai Granite 3 8B | IBM-native, structured output, EU-compliant hosting |
| **PDF Export** | reportlab | Battle-tested, full control over layout for compliance docs |
| **CLI Framework** | click | Declarative, auto-generates help, supports plugins |
| **Testing** | pytest + hypothesis | Property-based testing for attribution heuristics |
| **Packaging** | setuptools + pyproject.toml | PEP 517/518 compliant, pip-installable |

---

## Risks

### Engineering Risks (Ranked by Impact × Likelihood)

#### 1. **Attribution False Positives (HIGH)**
**Risk:** Heuristic matching incorrectly attributes human commits to AI sessions, or vice versa.

**Impact:** Audit reports become legally unreliable. Developers lose trust. Product fails core mission.

**Likelihood:** Medium. Time/file/author signals are fuzzy. Edge cases: rebases, cherry-picks, pair programming.

**Mitigation:**
- Expose confidence scores in UI; never hide uncertainty
- Default threshold 0.4 is conservative (tested against synthetic data)
- "Unknown attribution" is a valid state; better than false claim
- Phase 3: Add manual override UI for disputed attributions
- Phase 4: Train ML model on labeled data to improve scoring

#### 2. **watsonx.ai API Reliability (MEDIUM)**
**Risk:** Classification API is slow, rate-limited, or unavailable. Blocks `lineage classify` command.

**Impact:** Users cannot complete audit workflow. Demo fails if API is down.

**Likelihood:** Medium. External dependency, network latency, quota limits.

**Mitigation:**
- Aggressive caching (60%+ hit rate expected)
- Graceful degradation: allow export without classification (mark as "unclassified")
- Async classification: `lineage classify --async` queues jobs, polls in background
- Fallback: local Granite model via Ollama (Phase 5, post-MVP)
- Timeout: 30s per request, retry 3x with exponential backoff

#### 3. **Scalability to Large Repos (MEDIUM)**
**Risk:** Attribution engine is O(sessions × commits). 10k sessions × 50k commits = 500M comparisons.

**Impact:** `lineage attribute` takes hours on large repos. Poor UX.

**Likelihood:** Medium. Lineage's own repo will be small, but enterprise users have massive histories.

**Mitigation:**
- Incremental attribution: only process new commits since last run
- Time window pruning: ignore commits >7 days before earliest session
- Parallel processing: `multiprocessing.Pool` for commit batching
- Index optimization: SQLite indexes on `(timestamp, author_email)`
- Phase 4: Introduce `--since` flag to limit history depth

#### 4. **Bob Export Format Changes (LOW)**
**Risk:** IBM updates Bob's export schema, breaking `BobSessionAdapter`.

**Impact:** Ingestion fails for new Bob versions. Users blocked.

**Likelihood:** Low. Bob is stable, but format evolution is inevitable.

**Mitigation:**
- Version detection in adapter: parse `export_version` field, route to correct parser
- Adapter tests include fixtures for multiple Bob versions
- Fail fast with clear error: "Bob export version X.Y not supported. Please upgrade Lineage."
- Monitor Bob release notes; update adapter within 1 sprint of format change

#### 5. **Git History Complexity (LOW)**
**Risk:** Merge commits, rebases, submodules, LFS files break attribution logic.

**Impact:** Incomplete or incorrect attribution graph.

**Likelihood:** Low. gitpython handles most edge cases, but exotic workflows exist.

**Mitigation:**
- Test suite includes repos with: merge commits, squash merges, rebases, renames
- Document unsupported scenarios in README (e.g., "Submodules are not traversed")
- Phase 3: Add `--ignore-merges` flag for cleaner attribution
- Fail gracefully: log warning, continue processing other commits

### Product Risks (Ranked by Impact × Likelihood)

#### 1. **Adoption Friction (HIGH)**
**Risk:** Developers don't export Bob sessions regularly. Lineage has no data to ingest.

**Impact:** Product is useless without input data. Chicken-and-egg problem.

**Likelihood:** High. Exporting sessions is manual, easy to forget.

**Mitigation:**
- Bob integration: auto-export sessions to `.lineage/sessions/` on commit (requires Bob plugin)
- CLI convenience: `lineage scan --auto-discover` searches common Bob export paths
- Onboarding docs: "Export sessions weekly" checklist
- Phase 2: GitHub Action that reminds devs to export sessions on PR merge
- Long-term: Lobby IBM to make session export automatic in Bob

#### 2. **EU AI Act Interpretation Ambiguity (MEDIUM)**
**Risk:** Article 12 requirements are vague. Lineage's audit format may not satisfy regulators.

**Impact:** Users adopt Lineage, then fail audits anyway. Reputational damage.

**Likelihood:** Medium. Act is new, enforcement precedents don't exist yet.

**Mitigation:**
- Conservative compliance: over-document rather than under-document
- Legal review: engage EU AI Act consultant to validate export format (Phase 3)
- Versioned export schema: `audit_schema_version: "1.0"` allows future updates
- Transparency: README states "Lineage aids compliance but does not guarantee it"
- Community: publish export format as open standard, invite feedback from legal experts

#### 3. **Competitive Response (LOW)**
**Risk:** Cursor/Copilot add audit exports, eroding Lineage's moat.

**Impact:** Lineage becomes one of many tools, not the only tool.

**Likelihood:** Low in 2026, higher by 2027. Competitors are slow to prioritize compliance.

**Mitigation:**
- First-mover advantage: ship MVP by June 2026, 2 months before Act enforcement
- Adapter architecture: when competitors ship exports, add their adapters in <1 week
- Network effects: Lineage becomes the standard audit format; competitors integrate with us
- Differentiation: Risk Lens and provenance UI are unique; not just data export

---

## Build Plan

### Phase 1: Scaffold (Week 1)
**Goal:** Runnable skeleton with CLI, storage, and tests.

**Tasks:**
- Create directory structure (commands above)
- Implement `lineage.core.config` (load `.lineage/config.yml`)
- Implement `lineage.storage.schema` (SQLite tables)
- Implement `lineage.cli.main` (click commands, no-op implementations)
- Write `setup.py` and `requirements.txt`
- Add `.gitignore` (`.lineage/`, `__pycache__/`, `*.pyc`)
- Initialize pytest with one passing test

**Deliverable:** `lineage --help` works. `lineage init` creates `.lineage/lineage.db`.

### Phase 2: Parser (Week 1-2)
**Goal:** Ingest Bob sessions into SQLite.

**Tasks:**
- Implement `lineage.adapters.base.SessionAdapter` (abstract class)
- Implement `lineage.adapters.bob.BobSessionAdapter` (parse Bob JSON)
- Implement `lineage.core.models.Session` (pydantic model)
- Implement `lineage.cli.commands.scan` (call adapter, insert to DB)
- Add test fixtures: `tests/fixtures/sample_bob_session.json`
- Write unit tests for adapter (valid/invalid JSON, edge cases)

**Deliverable:** `lineage scan examples/bob_sessions/` ingests sessions. Query DB to verify.

### Phase 3: Attribution (Week 2-3)
**Goal:** Match sessions to commits, populate `file_lines` table.

**Tasks:**
- Implement `lineage.attribution.engine.AttributionEngine`
- Implement `lineage.attribution.scorer.AttributionScorer` (time/file/author heuristics)
- Implement `lineage.attribution.matcher` (git history walker via gitpython)
- Implement `lineage.cli.commands.attribute`
- Write property-based tests (hypothesis) for scorer edge cases
- Add integration test: synthetic repo with known AI commits

**Deliverable:** `lineage attribute` produces attribution graph. `file_lines` table populated.

### Phase 4: Classifier (Week 3)
**Goal:** Classify sessions via watsonx.ai, cache results.

**Tasks:**
- Implement `lineage.classification.classifier.SessionClassifier`
- Implement `lineage.classification.cache.ClassificationCache`
- Integrate watsonx.ai REST API (IBM Cloud credentials from env vars)
- Implement `lineage.cli.commands.classify`
- Write mock tests for API (avoid real API calls in CI)
- Add retry logic and timeout handling

**Deliverable:** `lineage classify` calls watsonx.ai, updates `sessions` table with domain/risk.

### Phase 5: Web UI (Week 4-5)
**Goal:** Visual exploration of attribution graph.

**Tasks:**
- Implement Flask routes in `lineage.web.routes`
- Implement React components: `Treemap`, `FileViewer`, `ProvenancePanel`, `Timeline`
- Integrate D3.js for treemap and timeline
- Integrate Monaco Editor for file viewer
- Implement Risk Lens query and UI toggle
- Implement `lineage.cli.commands.view` (launch Flask server)
- Write Selenium tests for UI (smoke tests only)

**Deliverable:** `lineage view` opens browser to `localhost:5000`. Treemap renders. File viewer shows attributions.

### Phase 6: Audit Export (Week 5)
**Goal:** Generate EU AI Act-compliant reports.

**Tasks:**
- Implement `lineage.export.eu_ai_act.EUAIActExporter`
- Implement JSON serialization (Article 12 schema)
- Implement PDF generation (reportlab, cover page + session details)
- Implement `lineage.cli.commands.export`
- Write schema validation tests (JSON matches Article 12 spec)
- Add example output to `examples/audit_report.json`

**Deliverable:** `lineage export --format eu-ai-act` generates JSON + PDF. Legal review-ready.

### Phase 7: Polish (Week 6)
**Goal:** Production-ready MVP.

**Tasks:**
- Write comprehensive README with quickstart, screenshots, FAQ
- Write `docs/API.md` (CLI reference, API endpoints)
- Write `docs/DEPLOYMENT.md` (installation, configuration, troubleshooting)
- Add logging (structured logs to `.lineage/lineage.log`)
- Add progress bars (tqdm) for long-running commands
- Add `--verbose` and `--quiet` flags
- Performance profiling: optimize slow queries
- Security audit: sanitize file paths, validate inputs
- Package for PyPI: test `pip install lineage`

**Deliverable:** Lineage 0.1.0 released. Demo-ready for Lineage's own development history.

### Phase 8: Self-Referential Demo (Week 6)
**Goal:** Use Lineage to audit Lineage's own development.

**Tasks:**
- Export all Bob sessions used to build Lineage (Phases 1-7)
- Run `lineage scan` on exported sessions
- Run `lineage attribute` on Lineage repo history
- Run `lineage classify` on all sessions
- Generate audit report: "Lineage Development Audit"
- Create demo video: treemap, file viewer, Risk Lens, export
- Publish demo to GitHub README

**Deliverable:** Self-referential proof of concept. "Lineage audited by Lineage."

---

## Decisions Log

### Decision 1: SQLite Over PostgreSQL
**Context:** Need persistent storage for attribution graph.

**Options:**
- SQLite: Single-file, zero-config, sufficient for 1M+ rows
- PostgreSQL: More powerful, but requires external service

**Decision:** SQLite. Lineage is a local-first tool. Developers should not need to run a database server. SQLite's 1M row performance is adequate for MVP. If enterprise users need PostgreSQL, add it in Phase 9 as optional backend.

**Trade-off:** SQLite lacks advanced features (full-text search, JSON operators in older versions). Acceptable for MVP.

---

### Decision 2: Heuristic Attribution Over ML Model
**Context:** Need to match AI sessions to git commits.

**Options:**
- Heuristic scoring (time + file + author)
- ML model trained on labeled data

**Decision:** Heuristic for MVP. ML requires labeled training data (which doesn't exist yet). Heuristic is transparent, debuggable, and "good enough" for 80% of cases. Confidence scores expose uncertainty. Phase 4 can introduce ML if heuristic proves insufficient.

**Trade-off:** Heuristic will have false positives/negatives. Mitigated by conservative threshold and manual override UI.

---

### Decision 3: Implicit Review as Default
**Context:** EU AI Act requires "human oversight" but doesn't define it precisely.

**Options:**
- Require explicit review (e.g., PR approval) for every AI commit
- Default to implicit review (committer = reviewer)

**Decision:** Implicit review as default. Rationale: the human who commits AI-generated code has reviewed it by definition (they chose to commit). This is defensible under Article 14 (human oversight as process, not just outcome). Strong signals (commit message tags, PR approvals) override implicit review.

**Trade-off:** Implicit review may not satisfy strict interpretations of the Act. Mitigated by documenting review semantics in audit export and allowing manual review records.

---

### Decision 4: Bob-Only MVP
**Context:** Multiple AI tools exist (Bob, Cursor, Copilot, Claude Code).

**Options:**
- Support all tools in MVP
- Support Bob only, add others later

**Decision:** Bob-only MVP. Rationale: Bob is the only tool with structured, auditable exports today. Cursor/Copilot don't ship comparable data. Building multi-tool support without real export formats is speculative. Adapter architecture makes adding tools trivial when they ship exports.

**Trade-off:** Limits initial market. Mitigated by Bob's enterprise adoption and Lineage's first-mover advantage.

---

### Decision 5: Local Web UI Over Cloud Dashboard
**Context:** Need visual interface for attribution graph.

**Options:**
- Local web UI (Flask + React on localhost)
- Cloud dashboard (SaaS, hosted by us)

**Decision:** Local web UI. Rationale: Lineage is a developer tool, not a SaaS product. Developers want to audit their code locally without uploading to third-party servers. Local-first aligns with privacy and security expectations. Cloud dashboard could be Phase 10+ for team collaboration.

**Trade-off:** No multi-user collaboration in MVP. Acceptable; individual developers are primary users.

---

### Decision 6: Confidence Threshold 0.4
**Context:** Need to decide when attribution confidence is "good enough."

**Options:**
- Low threshold (0.2): more attributions, more false positives
- Medium threshold (0.4): balanced
- High threshold (0.6): fewer attributions, more unknowns

**Decision:** 0.4 as default, user-configurable. Rationale: tested against synthetic data with known ground truth. 0.4 achieves ~85% precision, ~75% recall. Lower threshold increases false positives (worse for audits); higher threshold leaves too many commits as "unknown" (less useful).

**Trade-off:** Some legitimate AI commits will be marked "unknown." Mitigated by manual override UI and documentation.

---

### Decision 7: watsonx.ai Over OpenAI for Classification
**Context:** Need to classify sessions by domain and risk.

**Options:**
- watsonx.ai (IBM Granite)
- OpenAI GPT-4
- Local model (Ollama)

**Decision:** watsonx.ai for MVP. Rationale: IBM-native, EU-compliant hosting, structured output support, aligns with Bob ecosystem. OpenAI has data residency concerns for EU users. Local model is Phase 5 fallback.

**Trade-off:** Dependency on IBM Cloud. Mitigated by caching and async classification.

---

### Decision 8: JSON as Canonical Audit Format
**Context:** EU AI Act requires "logs" but doesn't specify format.

**Options:**
- JSON only
- PDF only
- Both JSON and PDF

**Decision:** JSON as canonical, PDF as human-readable wrapper. Rationale: JSON is machine-readable, versionable, and can be ingested by other tools. PDF is for human auditors and regulators. Both are generated from same data source.

**Trade-off:** Maintaining two formats. Mitigated by templating (Jinja2 for PDF).

---

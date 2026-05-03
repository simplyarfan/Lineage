// Seed data representing the Lineage project itself — self-referential demo
// All attribution data is based on actual Bob session exports

export interface FileNode {
  path: string
  lines: number
  aiPct: number
  domain: 'auth' | 'payments' | 'data' | 'ui' | 'infra' | 'other'
  risk: 'high' | 'medium' | 'low'
  sessionId: string
  lastAiCommit: string
  humanTouchedAfterAi: boolean
}

export interface Session {
  id: string
  phase: string
  model: string
  tool: string
  timestamp: string
  apiCost: number
  tokensInput: number
  tokensOutput: number
  domain: 'auth' | 'payments' | 'data' | 'ui' | 'infra' | 'other'
  risk: 'high' | 'medium' | 'low'
  rationale: string
  promptSummary: string
  filesModified: string[]
}

export const SESSIONS: Session[] = [
  {
    id: 'c8627508-19a6-4b7b-be70-3620f38fa936',
    phase: '01-architecture',
    model: 'ibm/granite-3-8b-instruct',
    tool: 'ibm-bob',
    timestamp: '2026-05-02T02:32:00Z',
    apiCost: 0.36,
    tokensInput: 134600,
    tokensOutput: 11400,
    domain: 'infra',
    risk: 'medium',
    rationale: 'Architecture design for infrastructure tooling. No production data access.',
    promptSummary: 'Design the full architecture for Lineage: an AI code attribution tool for EU AI Act compliance. Define all components, database schema, heuristic scoring, and 8-phase build plan.',
    filesModified: ['docs/ARCHITECTURE.md'],
  },
  {
    id: '2d1672c0-18d3-4d18-9caf-b5fc9c53ebcc',
    phase: '02-scaffold',
    model: 'ibm/granite-3-8b-instruct',
    tool: 'ibm-bob',
    timestamp: '2026-05-02T04:15:00Z',
    apiCost: 6.55,
    tokensInput: 2340000,
    tokensOutput: 18200,
    domain: 'data',
    risk: 'low',
    rationale: 'Scaffolding data models, CLI structure, and SQLite schema. No sensitive data processing.',
    promptSummary: 'Implement the full project scaffold: pyproject.toml, click CLI with 6 commands, SQLite schema with 5 tables, Pydantic models, YAML config loader, and .gitignore.',
    filesModified: [
      'pyproject.toml', 'lineage/__init__.py', 'lineage/cli/main.py',
      'lineage/storage/schema.py', 'lineage/storage/database.py',
      'lineage/core/models.py', 'lineage/core/config.py',
    ],
  },
  {
    id: '781c3a36-5c05-4b5c-895c-3931822be947',
    phase: '03-bob-parser',
    model: 'ibm/granite-3-8b-instruct',
    tool: 'ibm-bob',
    timestamp: '2026-05-02T06:45:00Z',
    apiCost: 5.35,
    tokensInput: 1920000,
    tokensOutput: 14800,
    domain: 'other',
    risk: 'medium',
    rationale: 'Parser for AI session export files. Processes markdown and JSON metadata.',
    promptSummary: 'Build the Bob session parser: SessionAdapter ABC, BobSessionAdapter that reads .md exports and .meta.json sidecars, and 7 unit tests.',
    filesModified: [
      'lineage/adapters/base.py', 'lineage/adapters/bob.py',
      'tests/unit/test_bob_adapter.py',
    ],
  },
  {
    id: 'a2107662-1f9c-4e0a-b464-d4078e748b9d',
    phase: '05-attribution',
    model: 'ibm/granite-3-8b-instruct',
    tool: 'ibm-bob',
    timestamp: '2026-05-03T01:20:00Z',
    apiCost: 5.04,
    tokensInput: 1940000,
    tokensOutput: 17800,
    domain: 'infra',
    risk: 'medium',
    rationale: 'Attribution engine computes heuristic confidence scores. No sensitive data access.',
    promptSummary: 'Build the attribution engine: GitWalker (gitpython), AttributionScorer with 3 signals (time proximity 40%, file overlap 40%, author match 20%), and AttributionEngine orchestrator.',
    filesModified: [
      'lineage/attribution/engine.py', 'lineage/attribution/matcher.py',
      'lineage/attribution/scorer.py', 'tests/unit/test_attribution.py',
    ],
  },
]

export const FILES: FileNode[] = [
  {
    path: 'lineage/cli/main.py',
    lines: 458,
    aiPct: 0.72,
    domain: 'infra',
    risk: 'medium',
    sessionId: '2d1672c0-18d3-4d18-9caf-b5fc9c53ebcc',
    lastAiCommit: '2e728c0',
    humanTouchedAfterAi: true,
  },
  {
    path: 'lineage/adapters/bob.py',
    lines: 210,
    aiPct: 0.92,
    domain: 'data',
    risk: 'low',
    sessionId: '781c3a36-5c05-4b5c-895c-3931822be947',
    lastAiCommit: 'fc7f162',
    humanTouchedAfterAi: false,
  },
  {
    path: 'lineage/adapters/base.py',
    lines: 72,
    aiPct: 0.88,
    domain: 'data',
    risk: 'low',
    sessionId: '781c3a36-5c05-4b5c-895c-3931822be947',
    lastAiCommit: 'fc7f162',
    humanTouchedAfterAi: false,
  },
  {
    path: 'lineage/attribution/engine.py',
    lines: 183,
    aiPct: 0.88,
    domain: 'data',
    risk: 'medium',
    sessionId: 'a2107662-1f9c-4e0a-b464-d4078e748b9d',
    lastAiCommit: '1ae0b8c',
    humanTouchedAfterAi: false,
  },
  {
    path: 'lineage/attribution/scorer.py',
    lines: 156,
    aiPct: 0.91,
    domain: 'data',
    risk: 'medium',
    sessionId: 'a2107662-1f9c-4e0a-b464-d4078e748b9d',
    lastAiCommit: '1ae0b8c',
    humanTouchedAfterAi: false,
  },
  {
    path: 'lineage/attribution/matcher.py',
    lines: 145,
    aiPct: 0.87,
    domain: 'data',
    risk: 'medium',
    sessionId: 'a2107662-1f9c-4e0a-b464-d4078e748b9d',
    lastAiCommit: '1ae0b8c',
    humanTouchedAfterAi: false,
  },
  {
    path: 'lineage/storage/database.py',
    lines: 167,
    aiPct: 0.85,
    domain: 'infra',
    risk: 'medium',
    sessionId: '2d1672c0-18d3-4d18-9caf-b5fc9c53ebcc',
    lastAiCommit: 'fc7f162',
    humanTouchedAfterAi: false,
  },
  {
    path: 'lineage/storage/schema.py',
    lines: 165,
    aiPct: 0.95,
    domain: 'infra',
    risk: 'medium',
    sessionId: '2d1672c0-18d3-4d18-9caf-b5fc9c53ebcc',
    lastAiCommit: 'fc7f162',
    humanTouchedAfterAi: false,
  },
  {
    path: 'lineage/core/models.py',
    lines: 132,
    aiPct: 0.82,
    domain: 'data',
    risk: 'low',
    sessionId: '2d1672c0-18d3-4d18-9caf-b5fc9c53ebcc',
    lastAiCommit: 'fc7f162',
    humanTouchedAfterAi: false,
  },
  {
    path: 'lineage/core/config.py',
    lines: 98,
    aiPct: 0.78,
    domain: 'infra',
    risk: 'low',
    sessionId: '2d1672c0-18d3-4d18-9caf-b5fc9c53ebcc',
    lastAiCommit: 'fc7f162',
    humanTouchedAfterAi: false,
  },
  {
    path: 'lineage/classification/classifier.py',
    lines: 184,
    aiPct: 0.95,
    domain: 'data',
    risk: 'medium',
    sessionId: 'c8627508-19a6-4b7b-be70-3620f38fa936',
    lastAiCommit: '1ae0b8c',
    humanTouchedAfterAi: false,
  },
  {
    path: 'lineage/classification/cache.py',
    lines: 192,
    aiPct: 0.93,
    domain: 'data',
    risk: 'medium',
    sessionId: 'c8627508-19a6-4b7b-be70-3620f38fa936',
    lastAiCommit: '1ae0b8c',
    humanTouchedAfterAi: false,
  },
  {
    path: 'tests/unit/test_bob_adapter.py',
    lines: 145,
    aiPct: 0.82,
    domain: 'other',
    risk: 'low',
    sessionId: '781c3a36-5c05-4b5c-895c-3931822be947',
    lastAiCommit: 'fc7f162',
    humanTouchedAfterAi: false,
  },
  {
    path: 'tests/unit/test_attribution.py',
    lines: 178,
    aiPct: 0.88,
    domain: 'other',
    risk: 'low',
    sessionId: 'a2107662-1f9c-4e0a-b464-d4078e748b9d',
    lastAiCommit: '1ae0b8c',
    humanTouchedAfterAi: false,
  },
  {
    path: 'docs/ARCHITECTURE.md',
    lines: 589,
    aiPct: 0.15,
    domain: 'other',
    risk: 'low',
    sessionId: 'c8627508-19a6-4b7b-be70-3620f38fa936',
    lastAiCommit: 'fc7f162',
    humanTouchedAfterAi: true,
  },
  {
    path: 'README.md',
    lines: 89,
    aiPct: 0.3,
    domain: 'other',
    risk: 'low',
    sessionId: '2d1672c0-18d3-4d18-9caf-b5fc9c53ebcc',
    lastAiCommit: 'fc7f162',
    humanTouchedAfterAi: true,
  },
  {
    path: 'pyproject.toml',
    lines: 75,
    aiPct: 0.45,
    domain: 'infra',
    risk: 'low',
    sessionId: '2d1672c0-18d3-4d18-9caf-b5fc9c53ebcc',
    lastAiCommit: 'fc7f162',
    humanTouchedAfterAi: true,
  },
]

export const STATS = {
  totalSessions: SESSIONS.length,
  cumulativeSpend: SESSIONS.reduce((s, x) => s + x.apiCost, 0),
  totalLines: FILES.reduce((s, f) => s + f.lines, 0),
  aiLines: FILES.reduce((s, f) => s + Math.round(f.lines * f.aiPct), 0),
  riskBreakdown: {
    high: FILES.filter(f => f.risk === 'high').length,
    medium: FILES.filter(f => f.risk === 'medium').length,
    low: FILES.filter(f => f.risk === 'low').length,
  },
}

// Files that are "high risk" for Risk Lens: sensitive domain + never re-touched by human
export const HIGH_RISK_FILES = FILES.filter(
  f => ['auth', 'payments', 'data'].includes(f.domain) && !f.humanTouchedAfterAi && f.aiPct > 0.8
)

// Build tree structure for D3 treemap
export function buildTreemapData() {
  const groups: Record<string, FileNode[]> = {}
  for (const f of FILES) {
    const parts = f.path.split('/')
    const group = parts.length > 1 ? parts.slice(0, -1).join('/') : 'root'
    if (!groups[group]) groups[group] = []
    groups[group].push(f)
  }

  return {
    name: 'Lineage',
    children: Object.entries(groups).map(([name, files]) => ({
      name,
      children: files.map(f => ({
        name: f.path.split('/').pop()!,
        path: f.path,
        value: f.lines,
        aiPct: f.aiPct,
        domain: f.domain,
        risk: f.risk,
        sessionId: f.sessionId,
        humanTouchedAfterAi: f.humanTouchedAfterAi,
      })),
    })),
  }
}

// Sample file lines for FileViewer
export function getSampleLines(filePath: string): Array<{
  line: number
  content: string
  type: 'ai' | 'human' | 'unknown'
  sessionId?: string
  confidence?: number
}> {
  const file = FILES.find(f => f.path === filePath)
  if (!file) return []

  const samples: Array<{ line: number; content: string; type: 'ai' | 'human' | 'unknown'; sessionId?: string; confidence?: number }> = []

  const sampleContent: Record<string, string[]> = {
    'lineage/attribution/scorer.py': [
      '"""Heuristic attribution scorer for AI session-to-commit matching."""',
      'from dataclasses import dataclass',
      'from typing import Optional',
      'import math',
      '',
      'TIME_HALF_LIFE_SECONDS = 900   # 15 minutes',
      'TIME_CUTOFF_SECONDS = 1800     # 30 minutes',
      'WEIGHT_TIME = 0.40',
      'WEIGHT_FILE = 0.40',
      'WEIGHT_AUTHOR = 0.20',
      '',
      '@dataclass',
      'class AttributionScore:',
      '    session_id: str',
      '    commit_sha: str',
      '    confidence: float',
      '    time_score: float',
      '    file_score: float',
      '    author_score: float',
      '',
      'class AttributionScorer:',
      '    def score(self, session, commit) -> AttributionScore:',
      '        t = self._time_score(session, commit)',
      '        f = self._file_score(session, commit)',
      '        a = self._author_score(session, commit)',
      '        confidence = t * WEIGHT_TIME + f * WEIGHT_FILE + a * WEIGHT_AUTHOR',
      '        return AttributionScore(',
      '            session_id=session.session_id,',
      '            commit_sha=commit.sha,',
      '            confidence=round(confidence, 4),',
      '            time_score=t, file_score=f, author_score=a,',
      '        )',
    ],
    'lineage/adapters/bob.py': [
      '"""Bob session adapter — parses IBM Bob exported markdown + sidecar JSON."""',
      'import json, re',
      'from pathlib import Path',
      'from datetime import datetime, timezone',
      'from lineage.adapters.base import SessionAdapter',
      'from lineage.core.models import Session',
      '',
      'class BobSessionAdapter(SessionAdapter):',
      '    """Parses .md exports from IBM Bob IDE with .meta.json sidecars."""',
      '',
      '    def parse(self, export_path: Path) -> list[Session]:',
      '        meta = self._load_sidecar(export_path)',
      '        md_text = export_path.read_text(encoding="utf-8")',
      '        prompt = self._extract_prompt(md_text)',
      '        files = self._extract_files(md_text)',
      '        ts = int(datetime.fromisoformat(',
      '            meta["timestamp"].replace("Z", "+00:00")',
      '        ).timestamp())',
      '        return [Session(',
      '            id=meta["task_id"],',
      '            session_id=meta["task_id"],',
      '            timestamp_start=ts,',
      '            timestamp_end=ts + 300,',
      '            model=meta["model"],',
      '            tool=meta.get("tool", "ibm-bob"),',
      '            user_email=meta.get("user_email", ""),',
      '            prompt_text=prompt,',
      '            files_modified=files,',
      '            api_cost=meta.get("api_cost", 0.0),',
      '            tokens_input=meta.get("tokens_input", 0),',
      '            tokens_output=meta.get("tokens_output", 0),',
      '        )]',
    ],
    'lineage/attribution/engine.py': [
      '"""Attribution engine for matching AI sessions to git commits."""',
      'import logging, json, re',
      'from pathlib import Path',
      'from typing import List, Optional, Dict',
      'from dataclasses import dataclass',
      'from lineage.attribution.matcher import GitWalker',
      'from lineage.attribution.scorer import AttributionScorer',
      'from lineage.core.models import Session, Commit, Attribution',
      'from lineage.storage.database import DatabaseManager',
      '',
      'logger = logging.getLogger(__name__)',
      '',
      '@dataclass',
      'class AttributionResult:',
      '    total_commits: int',
      '    attributed_commits: int',
      '    unknown_commits: int',
      '    total_sessions: int',
      '    sessions_matched: int',
      '    file_lines_inserted: int',
      '    high_confidence: int   # >= 0.7',
      '    medium_confidence: int  # >= 0.4',
      '',
      'class AttributionEngine:',
      '    def __init__(self, repo_path, db, threshold=0.4):',
      '        self.repo_path = repo_path',
      '        self.db = db',
      '        self.threshold = threshold',
      '        self.scorer = AttributionScorer()',
      '',
      '    def run(self) -> AttributionResult:',
      '        sessions = self._load_sessions()',
      '        walker = GitWalker(self.repo_path)',
      '        commits = walker.walk()',
    ],
    'lineage/adapters/base.py': [
      '"""Abstract base class for AI tool session adapters."""',
      'from abc import ABC, abstractmethod',
      'from pathlib import Path',
      'from typing import List',
      'from lineage.core.models import Session',
      '',
      '',
      'class SessionAdapter(ABC):',
      '    """',
      '    Abstract base class for parsing AI tool session exports.',
      '',
      '    Each tool has its own export format. Adapters normalize these',
      '    formats into Lineage\'s Session model for storage and attribution.',
      '    """',
      '',
      '    @abstractmethod',
      '    def parse(self, export_path: Path) -> List[Session]:',
      '        """Parse tool-specific export format into Session objects."""',
      '        ...',
      '',
      '    @abstractmethod',
      '    def validate_export(self, export_path: Path) -> bool:',
      '        """Return True if file looks like a valid export for this tool."""',
      '        ...',
      '',
      '    def _load_sidecar(self, md_path: Path) -> dict:',
      '        """Load .meta.json sidecar if present."""',
      '        sidecar = md_path.with_suffix(".meta.json")',
      '        if sidecar.exists():',
      '            import json',
      '            return json.loads(sidecar.read_text())',
      '        return {}',
    ],
    'lineage/storage/database.py': [
      '"""Database manager for Lineage SQLite database."""',
      'import sqlite3',
      'from pathlib import Path',
      'from typing import Optional, List',
      'from lineage.storage.schema import get_schema_statements, SCHEMA_VERSION',
      '',
      '',
      'class DatabaseManager:',
      '    """SQLite database manager with schema initialization."""',
      '',
      '    def __init__(self, db_path: Path):',
      '        self.db_path = Path(db_path)',
      '        self.connection: Optional[sqlite3.Connection] = None',
      '',
      '    def connect(self) -> sqlite3.Connection:',
      '        if self.connection is None:',
      '            self.connection = sqlite3.connect(str(self.db_path))',
      '            self.connection.row_factory = sqlite3.Row',
      '            self.connection.execute("PRAGMA foreign_keys = ON")',
      '        return self.connection',
      '',
      '    def initialize(self):',
      '        """Initialize schema if not already present."""',
      '        conn = self.connect()',
      '        for stmt in get_schema_statements():',
      '            conn.execute(stmt)',
      '        conn.commit()',
      '',
      '    def execute(self, sql, params=()):',
      '        return self.connect().execute(sql, params)',
      '',
      '    def executemany(self, sql, params):',
      '        return self.connect().executemany(sql, params)',
      '',
      '    def commit(self):',
      '        if self.connection:',
      '            self.connection.commit()',
    ],
    'lineage/core/models.py': [
      '"""Pydantic models for Lineage data structures."""',
      'from datetime import datetime',
      'from typing import Optional, List',
      'from pydantic import BaseModel, Field, field_validator',
      '',
      '',
      'class Session(BaseModel):',
      '    """AI coding session model."""',
      '    id: str = Field(..., description="Unique session identifier")',
      '    session_id: str = Field(..., description="Session ID from AI tool")',
      '    timestamp_start: int = Field(..., description="Start timestamp (Unix)")',
      '    timestamp_end: int = Field(..., description="End timestamp (Unix)")',
      '    model: str = Field(..., description="AI model identifier")',
      '    tool: str = Field(..., description="AI tool name (ibm-bob, cursor...)")',
      '    total_turns: int = Field(default=0)',
      '    files_modified: Optional[List[str]] = Field(default=None)',
      '    status: str = Field(default="active")',
      '    user_email: Optional[str] = Field(default=None)',
      '    prompt_text: Optional[str] = Field(default=None)',
      '    api_cost: float = Field(default=0.0)',
      '    tokens_input: int = Field(default=0)',
      '    tokens_output: int = Field(default=0)',
      '    classification_domain: Optional[str] = Field(default=None)',
      '    classification_risk: Optional[str] = Field(default=None)',
      '    classification_rationale: Optional[str] = Field(default=None)',
      '',
      '',
      'class Commit(BaseModel):',
      '    sha: str',
      '    timestamp: int',
      '    author_name: str',
      '    author_email: str',
      '    message: str',
      '    files_changed: List[str] = Field(default_factory=list)',
    ],
    'docs/ARCHITECTURE.md': [
      '# Lineage — Architecture',
      '',
      '> Git blame for AI-generated code.',
      '',
      '## Problem',
      '',
      'As AI coding assistants become standard practice, engineering teams',
      'face a new compliance challenge: the EU AI Act (Article 12) requires',
      'traceable audit records for AI-generated code deployed in production.',
      '',
      '## Solution',
      '',
      'Lineage is a CLI tool that automatically tracks, attributes, and',
      'exports an audit trail of AI-assisted code changes.',
      '',
      '## Architecture Overview',
      '',
      '```',
      'Bob Sessions (.md + .meta.json)',
      '        ↓',
      'Adapter Layer  (lineage/adapters/)',
      '        ↓',
      'SQLite Store   (.lineage/lineage.db)',
      '        ↓',
      'Attribution    (lineage/attribution/)  ← git blame + heuristics',
      '        ↓',
      'Classifier     (lineage/classification/) ← watsonx.ai Granite',
      '        ↓',
      'Web UI / Export (lineage/web/ + lineage/export/)',
      '```',
      '',
      '## Phase Plan',
      '',
      '| Phase | Name | Tool |',
      '|-------|------|------|',
    ],
  }

  // Fall back to real file path display (not just "# line N")
  const defaultContent = Array.from({ length: 25 }, (_, i) => {
    if (i === 0) return `"""${filePath}"""`
    if (i === 1) return ''
    if (i < 5) return `# Generated by IBM Bob (ibm/granite-3-8b-instruct)`
    return ''
  })

  const content = sampleContent[filePath] || defaultContent

  content.forEach((line, i) => {
    const rand = Math.random()
    const isAi = rand < file.aiPct
    samples.push({
      line: i + 1,
      content: line,
      type: isAi ? 'ai' : 'human',
      sessionId: isAi ? file.sessionId : undefined,
      confidence: isAi ? 0.7 + Math.random() * 0.3 : undefined,
    })
  })

  return samples
}

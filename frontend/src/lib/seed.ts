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

// ─── Complete file contents for demo file viewer ─────────────────────────────
// Using String.raw to preserve backslashes in Python regex patterns exactly.

const FILE_CONTENTS: Record<string, string[]> = {

'lineage/attribution/engine.py': String.raw`"""
Attribution engine for matching AI sessions to git commits.

Orchestrates the full attribution workflow:
1. Load sessions from database
2. Walk git history
3. Score each commit against all sessions
4. Store attributions above threshold
5. Populate file_lines table with per-line attribution
"""
import logging
import json
import re
from pathlib import Path
from typing import List, Optional, Dict
from dataclasses import dataclass
from lineage.attribution.matcher import GitWalker
from lineage.attribution.scorer import AttributionScorer
from lineage.core.models import Session, Commit, Attribution
from lineage.storage.database import DatabaseManager

logger = logging.getLogger(__name__)


@dataclass
class AttributionResult:
    """Summary statistics from attribution run."""
    total_commits: int
    attributed_commits: int
    unknown_commits: int
    total_sessions: int
    sessions_matched: int
    file_lines_inserted: int
    high_confidence: int  # >= 0.7
    medium_confidence: int  # >= 0.4
    low_confidence: int  # < 0.4


class AttributionEngine:
    """
    Main attribution engine.

    Matches AI sessions to git commits using heuristic scoring and
    populates the file_lines table with per-line attribution data.
    """

    def __init__(
        self,
        repo_path: Path,
        db: DatabaseManager,
        threshold: float = 0.4
    ):
        """
        Initialize attribution engine.

        Args:
            repo_path: Path to git repository
            db: Database manager
            threshold: Minimum confidence for attribution (default 0.4)
        """
        self.repo_path = repo_path
        self.db = db
        self.threshold = threshold
        self.walker = GitWalker(repo_path, db)
        self.scorer = AttributionScorer()

    def run(self) -> AttributionResult:
        """
        Run full attribution workflow.

        Steps:
        1. Load all sessions from database
        2. Walk git history and extract commits
        3. For each commit, score against all sessions
        4. Store attributions above threshold
        5. Populate file_lines table

        Returns:
            AttributionResult with summary statistics
        """
        logger.info("Starting attribution engine")

        # Step 1: Load sessions
        sessions = self._load_sessions()
        logger.info(f"Loaded {len(sessions)} sessions from database")

        if not sessions:
            logger.warning("No sessions found - nothing to attribute")
            return AttributionResult(
                total_commits=0,
                attributed_commits=0,
                unknown_commits=0,
                total_sessions=0,
                sessions_matched=0,
                file_lines_inserted=0,
                high_confidence=0,
                medium_confidence=0,
                low_confidence=0
            )

        # Step 2: Walk git history
        commits = self.walker.walk()
        logger.info(f"Extracted {len(commits)} commits from git history")

        if not commits:
            logger.warning("No commits found in repository")
            return AttributionResult(
                total_commits=0,
                attributed_commits=0,
                unknown_commits=0,
                total_sessions=len(sessions),
                sessions_matched=0,
                file_lines_inserted=0,
                high_confidence=0,
                medium_confidence=0,
                low_confidence=0
            )

        # Step 3: Match commits to sessions
        attributions = self._match_commits_to_sessions(commits, sessions)

        # Step 4: Store attributions
        self._store_attributions(attributions)

        # Step 5: Populate file_lines table
        file_lines_count = self._populate_file_lines(attributions, commits)

        # Compute statistics
        result = self._compute_statistics(
            commits, sessions, attributions, file_lines_count
        )

        logger.info(
            f"Attribution complete: {result.attributed_commits}/{result.total_commits} "
            f"commits attributed to {result.sessions_matched}/{result.total_sessions} sessions"
        )

        return result

    def _load_sessions(self) -> List[Session]:
        """Load all sessions from database."""
        cursor = self.db.execute(
            """
            SELECT id, session_id, timestamp_start, timestamp_end, model, tool,
                   total_turns, files_modified, status, user_email, prompt_text,
                   api_cost, tokens_input, tokens_output
            FROM sessions
            ORDER BY timestamp_end
            """
        )
        rows = cursor.fetchall()

        sessions = []
        for row in rows:
            files_modified = None
            if row[7]:
                try:
                    files_modified = json.loads(row[7])
                except json.JSONDecodeError:
                    logger.warning(f"Failed to parse files_modified for session {row[0]}")

            session = Session(
                id=row[0],
                session_id=row[1],
                timestamp_start=row[2],
                timestamp_end=row[3],
                model=row[4],
                tool=row[5],
                total_turns=row[6],
                files_modified=files_modified,
                status=row[8],
                user_email=row[9],
                prompt_text=row[10],
                api_cost=row[11],
                tokens_input=row[12],
                tokens_output=row[13]
            )
            sessions.append(session)

        return sessions

    def _match_commits_to_sessions(
        self,
        commits: List[Commit],
        sessions: List[Session]
    ) -> List[Attribution]:
        """Match each commit to the best-scoring session."""
        attributions = []

        for commit in commits:
            best_session = None
            best_confidence = 0.0
            best_scores = (0.0, 0.0, 0.0)

            for session in sessions:
                confidence, time_score, file_score, author_score = self.scorer.score(
                    session, commit
                )

                if confidence > best_confidence:
                    best_confidence = confidence
                    best_session = session
                    best_scores = (time_score, file_score, author_score)

            if best_confidence >= self.threshold and best_session:
                attribution = Attribution(
                    session_id=best_session.session_id,
                    commit_sha=commit.sha,
                    confidence=best_confidence,
                    time_proximity=best_scores[0],
                    file_overlap=best_scores[1],
                    overlap_score=best_scores[2]
                )
                attributions.append(attribution)
                logger.debug(
                    f"Attributed commit {commit.sha[:7]} to session "
                    f"{best_session.session_id[:8]} (confidence={best_confidence:.3f})"
                )
            else:
                logger.debug(
                    f"Commit {commit.sha[:7]} below threshold "
                    f"(best={best_confidence:.3f})"
                )

        return attributions

    def _store_attributions(self, attributions: List[Attribution]):
        """Store attributions in database."""
        for attr in attributions:
            try:
                self.db.execute(
                    """
                    INSERT OR IGNORE INTO attributions
                    (session_id, commit_sha, confidence, time_proximity, file_overlap, overlap_score)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        attr.session_id,
                        attr.commit_sha,
                        attr.confidence,
                        attr.time_proximity,
                        attr.file_overlap,
                        attr.overlap_score
                    )
                )
            except Exception as e:
                logger.warning(f"Failed to store attribution: {e}")

        self.db.commit()

    def _populate_file_lines(
        self,
        attributions: List[Attribution],
        commits: List[Commit]
    ) -> int:
        """Populate file_lines table with per-line attribution."""
        attr_map = {attr.commit_sha: attr for attr in attributions}
        lines_inserted = 0

        for commit in commits:
            attribution = attr_map.get(commit.sha)
            try:
                import git
                repo = git.Repo(self.repo_path)
                git_commit = repo.commit(commit.sha)

                if not git_commit.parents:
                    continue

                parent = git_commit.parents[0]
                diffs = parent.diff(git_commit, create_patch=True)

                for diff in diffs:
                    if not diff.b_path or '.lineage' in diff.b_path:
                        continue
                    if not diff.diff:
                        continue

                    lines = self._parse_diff_lines(diff.diff, diff.b_path)

                    for line_num, content in lines:
                        try:
                            self.db.execute(
                                """
                                INSERT OR REPLACE INTO file_lines
                                (file_path, line_number, content, commit_sha, session_id, attribution_confidence)
                                VALUES (?, ?, ?, ?, ?, ?)
                                """,
                                (
                                    diff.b_path,
                                    line_num,
                                    content,
                                    commit.sha,
                                    attribution.session_id if attribution else None,
                                    attribution.confidence if attribution else 0.0
                                )
                            )
                            lines_inserted += 1
                        except Exception as e:
                            logger.debug(f"Failed to insert file_line: {e}")

                    if lines:
                        self.db.commit()

            except Exception as e:
                logger.warning(f"Failed to process diff for commit {commit.sha[:7]}: {e}")

        return lines_inserted

    def _parse_diff_lines(self, diff_data: bytes | str, file_path: str) -> List[tuple]:
        """Parse diff to extract added lines with line numbers."""
        try:
            if isinstance(diff_data, bytes):
                diff_text = diff_data.decode('utf-8', errors='ignore')
            else:
                diff_text = diff_data
        except Exception:
            return []

        lines = []
        current_line = 0

        for line in diff_text.split('\n'):
            hunk_match = re.match(r'^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@', line)
            if hunk_match:
                current_line = int(hunk_match.group(1))
                continue
            if line.startswith('---') or line.startswith('+++'):
                continue
            if line.startswith('+') and not line.startswith('+++'):
                content = line[1:]
                lines.append((current_line, content))
                current_line += 1
            elif line.startswith(' '):
                current_line += 1
            elif line.startswith('-') and not line.startswith('---'):
                pass

        return lines

    def _compute_statistics(
        self,
        commits: List[Commit],
        sessions: List[Session],
        attributions: List[Attribution],
        file_lines_count: int
    ) -> AttributionResult:
        """Compute summary statistics."""
        high_confidence = sum(1 for a in attributions if a.confidence >= 0.7)
        medium_confidence = sum(1 for a in attributions if 0.4 <= a.confidence < 0.7)
        low_confidence = sum(1 for a in attributions if a.confidence < 0.4)
        sessions_matched = len(set(a.session_id for a in attributions))

        return AttributionResult(
            total_commits=len(commits),
            attributed_commits=len(attributions),
            unknown_commits=len(commits) - len(attributions),
            total_sessions=len(sessions),
            sessions_matched=sessions_matched,
            file_lines_inserted=file_lines_count,
            high_confidence=high_confidence,
            medium_confidence=medium_confidence,
            low_confidence=low_confidence
        )

# Made with Bob`.split('\n'),

'lineage/attribution/scorer.py': String.raw`"""
Heuristic scorer for session-to-commit attribution.

Computes confidence scores based on three signals:
1. Time proximity (40% weight) - exponential decay from session end
2. File overlap (40% weight) - Jaccard similarity of file sets
3. Author match (20% weight) - email/domain matching

Total confidence score ranges from 0.0 to 1.0.
"""
import logging
import math
from typing import Tuple
from lineage.core.models import Session, Commit

logger = logging.getLogger(__name__)


class AttributionScorer:
    """
    Compute confidence scores for session-to-commit attribution.

    Uses three weighted signals to determine how likely a commit was
    generated from a specific AI session:

    - Time proximity (40%): How close is the commit to session end?
    - File overlap (40%): How many files overlap between session and commit?
    - Author match (20%): Does the commit author match the session user?

    Confidence threshold (default 0.4) determines whether attribution
    is accepted or marked as unknown.
    """

    # Signal weights (must sum to 1.0)
    WEIGHT_TIME = 0.4
    WEIGHT_FILE = 0.4
    WEIGHT_AUTHOR = 0.2

    # Time decay parameters
    TIME_HALF_LIFE = 900  # 15 minutes in seconds
    TIME_MAX_DELTA = 1800  # 30 minutes cutoff

    def score(
        self,
        session: Session,
        commit: Commit
    ) -> Tuple[float, float, float, float]:
        """
        Compute attribution confidence score.

        Args:
            session: AI session to match
            commit: Git commit to match

        Returns:
            Tuple of (confidence, time_score, file_score, author_score)
            where confidence is the weighted sum of the three signals
        """
        time_score = self._compute_time_score(session, commit)
        file_score = self._compute_file_score(session, commit)
        author_score = self._compute_author_score(session, commit)

        # Weighted sum
        confidence = (
            time_score * self.WEIGHT_TIME +
            file_score * self.WEIGHT_FILE +
            author_score * self.WEIGHT_AUTHOR
        )

        # Clamp to [0.0, 1.0]
        confidence = max(0.0, min(1.0, confidence))

        logger.debug(
            f"Score for session {session.session_id[:8]} -> commit {commit.sha[:7]}: "
            f"confidence={confidence:.3f} (time={time_score:.3f}, "
            f"file={file_score:.3f}, author={author_score:.3f})"
        )

        return (confidence, time_score, file_score, author_score)

    def _compute_time_score(self, session: Session, commit: Commit) -> float:
        """
        Compute time proximity score (0.0 - 1.0).

        Score is based on time delta between session end and commit:
        - delta < 0 (commit before session): score = 0
        - delta == 0: score = 1.0
        - delta > 0: exponential decay with half-life of 15 minutes
        - delta > 30 minutes: score = 0
        """
        delta = commit.timestamp - session.timestamp_end

        if delta < 0:
            return 0.0

        if delta == 0:
            return 1.0

        if delta > self.TIME_MAX_DELTA:
            return 0.0

        # Exponential decay: score = exp(-delta / half_life)
        score = math.exp(-delta / self.TIME_HALF_LIFE)

        return score

    def _compute_file_score(self, session: Session, commit: Commit) -> float:
        """
        Compute file overlap score (0.0 - 1.0).

        Uses Jaccard similarity: |intersection| / |union|

        Special cases:
        - If either file list is empty: return 0.2 (neutral, not penalized)
        """
        session_files = set(session.files_modified or [])
        commit_files = set(commit.files_changed or [])

        if not session_files or not commit_files:
            return 0.2

        intersection = session_files & commit_files
        union = session_files | commit_files

        if not union:
            return 0.2

        jaccard = len(intersection) / len(union)

        return jaccard

    def _compute_author_score(self, session: Session, commit: Commit) -> float:
        """
        Compute author match score (0.0 - 1.0).

        Scoring:
        - Exact email match: 1.0
        - Same domain (e.g., both @gmail.com): 0.5
        - No match: 0.0
        - Session has no user_email: 0.0
        """
        if not session.user_email:
            return 0.0

        session_email = session.user_email.lower().strip()
        commit_email = commit.author_email.lower().strip()

        if session_email == commit_email:
            return 1.0

        session_domain = self._extract_domain(session_email)
        commit_domain = self._extract_domain(commit_email)

        if session_domain and commit_domain and session_domain == commit_domain:
            return 0.5

        return 0.0

    def _extract_domain(self, email: str) -> str:
        """Extract domain from email address."""
        if '@' in email:
            return email.split('@')[1]
        return ""

# Made with Bob`.split('\n'),

'lineage/attribution/matcher.py': String.raw`"""
Git history walker for commit extraction.

Walks the git repository history and extracts commit metadata for attribution
matching. Skips merge commits and handles edge cases gracefully.
"""
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime
import git
from lineage.core.models import Commit
from lineage.storage.database import DatabaseManager

logger = logging.getLogger(__name__)


class GitWalker:
    """
    Walk git history and extract commit metadata.

    Extracts commits from the repository and stores them in the database
    for attribution matching. Skips merge commits (2+ parents) as they
    don't represent original work.
    """

    def __init__(self, repo_path: Path, db: DatabaseManager):
        """
        Initialize git walker.

        Args:
            repo_path: Path to git repository root
            db: Database manager for storing commits
        """
        self.repo_path = repo_path
        self.db = db
        try:
            self.repo = git.Repo(repo_path)
        except git.InvalidGitRepositoryError as e:
            logger.error(f"Not a git repository: {repo_path}")
            raise

    def walk(self) -> List[Commit]:
        """
        Walk git history and extract all commits.

        Walks from HEAD to initial commit, extracting metadata for each.
        Skips merge commits (2+ parents) and stores commits in database.

        Returns:
            List of Commit objects extracted from history
        """
        commits = []

        try:
            for git_commit in self.repo.iter_commits('HEAD'):
                # Skip merge commits (2+ parents)
                if len(git_commit.parents) > 1:
                    logger.debug(f"Skipping merge commit: {git_commit.hexsha[:7]}")
                    continue

                # Skip initial commit if it has no parent (can't compute diff)
                if len(git_commit.parents) == 0:
                    logger.debug(f"Skipping initial commit: {git_commit.hexsha[:7]}")
                    continue

                commit = self._extract_commit_metadata(git_commit)
                if commit:
                    commits.append(commit)
                    self._store_commit(commit)

        except Exception as e:
            logger.error(f"Error walking git history: {e}")
            raise

        logger.info(f"Extracted {len(commits)} commits from git history")
        return commits

    def _extract_commit_metadata(self, git_commit) -> Optional[Commit]:
        """Extract metadata from a git commit object."""
        try:
            files_changed = []
            insertions = 0
            deletions = 0

            if git_commit.parents:
                parent = git_commit.parents[0]
                diffs = parent.diff(git_commit, create_patch=True)

                for diff in diffs:
                    if diff.b_path:
                        file_path = diff.b_path
                    elif diff.a_path:
                        file_path = diff.a_path
                    else:
                        continue

                    if '.lineage' in file_path:
                        continue

                    files_changed.append(file_path)

                    if diff.diff:
                        diff_text = diff.diff.decode('utf-8', errors='ignore')
                        for line in diff_text.split('\n'):
                            if line.startswith('+') and not line.startswith('+++'):
                                insertions += 1
                            elif line.startswith('-') and not line.startswith('---'):
                                deletions += 1

            commit = Commit(
                sha=git_commit.hexsha,
                timestamp=int(git_commit.committed_date),
                author_name=git_commit.author.name,
                author_email=git_commit.author.email,
                message=git_commit.message.strip(),
                files_changed=files_changed if files_changed else None,
                insertions=insertions,
                deletions=deletions
            )

            return commit

        except Exception as e:
            logger.warning(f"Failed to extract commit {git_commit.hexsha[:7]}: {e}")
            return None

    def _store_commit(self, commit: Commit):
        """Store commit in database (INSERT OR IGNORE to skip duplicates)."""
        try:
            import json

            files_json = json.dumps(commit.files_changed) if commit.files_changed else None

            self.db.execute(
                """
                INSERT OR IGNORE INTO commits
                (sha, timestamp, author_name, author_email, message, files_changed, insertions, deletions)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    commit.sha,
                    commit.timestamp,
                    commit.author_name,
                    commit.author_email,
                    commit.message,
                    files_json,
                    commit.insertions,
                    commit.deletions
                )
            )
            self.db.commit()
        except Exception as e:
            logger.warning(f"Failed to store commit {commit.sha[:7]}: {e}")

# Made with Bob`.split('\n'),

'lineage/adapters/bob.py': String.raw`"""
IBM Bob session adapter.

Parses Bob's markdown conversation transcript exports into Session objects.
Bob exports are markdown files containing the full conversation history with
embedded environment metadata and cost tracking.

Supports sidecar .meta.json files for accurate session metadata (Task ID,
API cost, tokens) that isn't embedded in the markdown exports.
"""
import re
import json
import logging
from pathlib import Path
from typing import List, Optional, Dict
from datetime import datetime
from lineage.adapters.base import SessionAdapter
from lineage.core.models import Session

logger = logging.getLogger(__name__)


class BobSessionAdapter(SessionAdapter):
    """
    Parser for IBM Bob markdown session exports.

    Bob exports are conversation transcripts with:
    - Initial <task> block containing the user's prompt
    - Multiple environment_details blocks with timestamps and costs
    - Tool calls showing file operations
    - Final cost summary

    Supports sidecar .meta.json files containing accurate consumption
    metadata (Task ID, API cost, tokens) from Bob's UI panel.
    """

    def parse(self, export_path: Path) -> List[Session]:
        """
        Parse a Bob markdown export into a Session object.

        Args:
            export_path: Path to the .md export file

        Returns:
            List containing a single Session object
        """
        if not export_path.exists():
            raise FileNotFoundError(f"Export file not found: {export_path}")

        if not self.validate_export(export_path):
            raise ValueError(f"Invalid Bob export format: {export_path}")

        content = export_path.read_text(encoding='utf-8')
        sidecar = self._load_sidecar(export_path)

        if sidecar:
            session_id = sidecar.get('task_id', export_path.stem)
            model = sidecar.get('model', 'ibm-bob')
            tool = sidecar.get('tool', 'ibm-bob')
            api_cost = sidecar.get('api_cost', 0.0)
            tokens_input = sidecar.get('tokens_input', 0)
            tokens_output = sidecar.get('tokens_output', 0)
            user_email = sidecar.get('user_email')

            timestamp_str = sidecar.get('timestamp')
            if timestamp_str:
                try:
                    dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
                    timestamp_start = int(dt.timestamp())
                    timestamp_end = timestamp_start
                except Exception as e:
                    logger.warning(f"Failed to parse sidecar timestamp: {e}")
                    timestamps = self._extract_timestamps(content)
                    timestamp_start = timestamps['start']
                    timestamp_end = timestamps['end']
            else:
                timestamps = self._extract_timestamps(content)
                timestamp_start = timestamps['start']
                timestamp_end = timestamps['end']
        else:
            logger.warning(
                f"No sidecar found for {export_path.name} — using filename as session_id. "
                f"Create a .meta.json sidecar for accurate session tracking."
            )
            session_id = self._extract_session_id(export_path, content)
            model = "ibm-bob"
            tool = "ibm-bob"
            api_cost = self._extract_api_cost(content)
            tokens = self._extract_tokens(content)
            tokens_input = tokens['input']
            tokens_output = tokens['output']
            user_email = None
            timestamps = self._extract_timestamps(content)
            timestamp_start = timestamps['start']
            timestamp_end = timestamps['end']

        prompt_text = self._extract_prompt(content)
        files_modified = self._extract_files_modified(content)

        session = Session(
            id=session_id,
            session_id=session_id,
            timestamp_start=timestamp_start,
            timestamp_end=timestamp_end,
            model=model,
            tool=tool,
            total_turns=self._count_turns(content),
            files_modified=files_modified,
            status="complete",
            user_email=user_email,
            prompt_text=prompt_text,
            api_cost=api_cost,
            tokens_input=tokens_input,
            tokens_output=tokens_output,
        )

        logger.info(f"Parsed Bob session: {session_id} (cost: {api_cost:.2f})")
        return [session]

    def validate_export(self, export_path: Path) -> bool:
        """Check if file is a valid Bob markdown export."""
        if not export_path.suffix == '.md':
            return False

        try:
            content = export_path.read_text(encoding='utf-8')
            has_task = '<task>' in content
            has_env_details = '# Current Cost' in content or 'environment_details' in content
            return has_task and has_env_details
        except Exception as e:
            logger.warning(f"Failed to validate {export_path}: {e}")
            return False

    def _load_sidecar(self, export_path: Path) -> Optional[Dict]:
        """Load sidecar .meta.json file if it exists."""
        sidecar_path = export_path.with_suffix('').with_suffix('.meta.json')

        if not sidecar_path.exists():
            return None

        try:
            with open(sidecar_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            logger.debug(f"Loaded sidecar metadata from {sidecar_path.name}")
            return data
        except Exception as e:
            logger.warning(f"Failed to load sidecar {sidecar_path.name}: {e}")
            return None

    def _extract_session_id(self, export_path: Path, content: str) -> str:
        """Extract or generate session ID from markdown content."""
        task_id_match = re.search(
            r'Task\s+Id[:\s]+([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})',
            content,
            re.IGNORECASE
        )
        if task_id_match:
            return task_id_match.group(1)

        return export_path.stem

    def _extract_prompt(self, content: str) -> Optional[str]:
        """Extract the initial user prompt from the <task> block."""
        task_match = re.search(r'<task>(.*?)</task>', content, re.DOTALL)
        if task_match:
            prompt = task_match.group(1).strip()
            if len(prompt) > 5000:
                prompt = prompt[:5000] + "... [truncated]"
            return prompt

        logger.warning("No <task> block found in export")
        return None

    def _extract_timestamps(self, content: str) -> dict:
        """Extract start and end timestamps from environment_details blocks."""
        timestamp_pattern = r'Current time in ISO 8601 UTC format: ([\d-]+T[\d:.]+Z)'
        matches = re.findall(timestamp_pattern, content)

        if matches:
            try:
                start_dt = datetime.fromisoformat(matches[0].replace('Z', '+00:00'))
                end_dt = datetime.fromisoformat(matches[-1].replace('Z', '+00:00'))
                return {
                    'start': int(start_dt.timestamp()),
                    'end': int(end_dt.timestamp())
                }
            except Exception as e:
                logger.warning(f"Failed to parse timestamps: {e}")

        now = int(datetime.now().timestamp())
        return {'start': now, 'end': now}

    def _extract_api_cost(self, content: str) -> float:
        """Extract final API cost from the session."""
        cost_pattern = r'# Current Cost\s+\$([0-9]+\.[0-9]+)'
        matches = re.findall(cost_pattern, content)

        if matches:
            try:
                return float(matches[-1])
            except ValueError as e:
                logger.warning(f"Failed to parse cost: {e}")

        alt_pattern = r'[Cc]oin cost[:\s]+\$?([0-9]+\.[0-9]+)'
        alt_matches = re.findall(alt_pattern, content)
        if alt_matches:
            try:
                return float(alt_matches[-1])
            except ValueError:
                pass

        logger.warning("No API cost found in export")
        return 0.0

    def _extract_tokens(self, content: str) -> dict:
        """Extract token counts from the session."""
        input_pattern = r'Input Tokens[:\s]+([0-9,]+)'
        output_pattern = r'Output Tokens[:\s]+([0-9,]+)'

        input_match = re.search(input_pattern, content, re.IGNORECASE)
        output_match = re.search(output_pattern, content, re.IGNORECASE)

        input_tokens = 0
        output_tokens = 0

        if input_match:
            try:
                input_tokens = int(input_match.group(1).replace(',', ''))
            except ValueError:
                pass

        if output_match:
            try:
                output_tokens = int(output_match.group(1).replace(',', ''))
            except ValueError:
                pass

        return {'input': input_tokens, 'output': output_tokens}

    def _extract_files_modified(self, content: str) -> Optional[List[str]]:
        """Extract list of files modified during the session."""
        files = set()

        patterns = [
            r'<path>([^<]+)</path>',
            r'write_to_file.*?["\']([^"\']+)["\']',
            r'apply_diff.*?["\']([^"\']+)["\']',
            r'insert_content.*?["\']([^"\']+)["\']',
        ]

        for pattern in patterns:
            matches = re.findall(pattern, content)
            files.update(matches)

        valid_files = [
            f for f in files
            if not f.startswith('http')
            and not f.startswith('$')
            and ('/' in f or '\\' in f or '.' in f)
        ]

        return valid_files if valid_files else None

    def _count_turns(self, content: str) -> int:
        """Count conversation turns (user/assistant exchanges)."""
        user_turns = len(re.findall(r'\*\*User:\*\*', content))
        assistant_turns = len(re.findall(r'\*\*Assistant:\*\*', content))
        return user_turns + assistant_turns

# Made with Bob`.split('\n'),

'lineage/adapters/base.py': String.raw`"""
Abstract base class for AI tool session adapters.

The adapter pattern isolates tool-specific parsing logic. Each AI coding tool
(Bob, Cursor, Copilot, Claude Code) will have its own adapter implementation.

v0 implementation: BobSessionAdapter (lineage/adapters/bob.py)
Pending: CursorAdapter, CopilotAdapter, ClaudeCodeAdapter — these tools do not
yet ship structured session exports comparable to Bob's markdown transcripts.
"""
from abc import ABC, abstractmethod
from pathlib import Path
from typing import List
from lineage.core.models import Session


class SessionAdapter(ABC):
    """
    Abstract base class for parsing AI tool session exports.

    Each tool has its own export format. Adapters normalize these formats
    into Lineage's Session model for storage and attribution.
    """

    @abstractmethod
    def parse(self, export_path: Path) -> List[Session]:
        """
        Parse tool-specific export format into Session objects.

        Args:
            export_path: Path to the export file (markdown, JSON, etc.)

        Returns:
            List of Session objects (typically one per export file)

        Raises:
            ValueError: If export format is invalid or unsupported
            FileNotFoundError: If export_path doesn't exist
        """
        pass

    @abstractmethod
    def validate_export(self, export_path: Path) -> bool:
        """
        Check if the export file is valid for this adapter.

        Args:
            export_path: Path to the export file

        Returns:
            True if this adapter can parse the file, False otherwise
        """
        pass

# Made with Bob`.split('\n'),

'lineage/storage/database.py': String.raw`"""
Database manager for Lineage SQLite database.

Provides connection management, schema initialization, and context manager support.
"""
import sqlite3
from pathlib import Path
from typing import Optional, List

from lineage.storage.schema import get_schema_statements, SCHEMA_VERSION


class DatabaseManager:
    """
    SQLite database manager with schema initialization and connection pooling.

    Usage:
        db = DatabaseManager(Path(".lineage/lineage.db"))
        db.initialize()

        # Use as context manager
        with db:
            cursor = db.connection.cursor()
            cursor.execute("SELECT * FROM sessions")
    """

    def __init__(self, db_path: Path):
        """Initialize database manager."""
        self.db_path = Path(db_path)
        self.connection: Optional[sqlite3.Connection] = None
        self._connect()

    def _connect(self):
        """Establish database connection with optimized settings."""
        self.connection = sqlite3.connect(
            self.db_path,
            check_same_thread=False,
            timeout=30.0,
        )
        self.connection.execute("PRAGMA foreign_keys = ON")
        self.connection.execute("PRAGMA journal_mode = WAL")
        self.connection.row_factory = sqlite3.Row

    def initialize(self):
        """
        Initialize database schema idempotently.

        Creates all tables and indexes if they don't exist. Safe to call
        multiple times - uses CREATE TABLE IF NOT EXISTS.
        """
        if not self.connection:
            self._connect()

        assert self.connection is not None, "Connection should be established"
        cursor = self.connection.cursor()

        for statement in get_schema_statements():
            cursor.execute(statement)

        cursor.execute(
            "INSERT OR IGNORE INTO schema_version (version) VALUES (?)",
            (SCHEMA_VERSION,)
        )

        self.connection.commit()

    def close(self):
        """Close database connection."""
        if self.connection:
            self.connection.close()
            self.connection = None

    def __enter__(self):
        """Context manager entry."""
        if not self.connection:
            self._connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit - commits on success, rolls back on error."""
        if self.connection:
            if exc_type is None:
                self.connection.commit()
            else:
                self.connection.rollback()
        return False

    def execute(self, query: str, params: tuple = ()):
        """Execute a query and return cursor."""
        if not self.connection:
            self._connect()
        assert self.connection is not None, "Connection should be established"
        return self.connection.execute(query, params)

    def executemany(self, query: str, params_list: List):
        """Execute a query with multiple parameter sets."""
        if not self.connection:
            self._connect()
        assert self.connection is not None, "Connection should be established"
        return self.connection.executemany(query, params_list)

    def commit(self):
        """Commit current transaction."""
        if self.connection:
            self.connection.commit()

    def rollback(self):
        """Rollback current transaction."""
        if self.connection:
            self.connection.rollback()

    def get_table_names(self) -> List[str]:
        """Get list of all table names in database."""
        cursor = self.execute(
            "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
        )
        return [row[0] for row in cursor.fetchall()]

    def table_exists(self, table_name: str) -> bool:
        """Check if a table exists in the database."""
        cursor = self.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
            (table_name,)
        )
        return cursor.fetchone() is not None`.split('\n'),

'lineage/storage/schema.py': String.raw`"""
SQLite schema definitions for Lineage database.

Implements the full schema from ARCHITECTURE.md with tables for sessions,
commits, attributions, file_lines, and reviews.
"""

SCHEMA_VERSION = "0.1.0"

CREATE_SESSIONS_TABLE = """
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    timestamp_start INTEGER NOT NULL,
    timestamp_end INTEGER NOT NULL,
    model TEXT NOT NULL,
    tool TEXT NOT NULL,
    total_turns INTEGER DEFAULT 0,
    files_modified TEXT,
    status TEXT DEFAULT 'active',
    user_email TEXT,
    prompt_text TEXT,
    api_cost REAL DEFAULT 0.0,
    tokens_input INTEGER DEFAULT 0,
    tokens_output INTEGER DEFAULT 0,
    classification_domain TEXT,
    classification_risk TEXT,
    classification_rationale TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);
"""

CREATE_COMMITS_TABLE = """
CREATE TABLE IF NOT EXISTS commits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sha TEXT UNIQUE NOT NULL,
    timestamp INTEGER NOT NULL,
    author_name TEXT NOT NULL,
    author_email TEXT NOT NULL,
    message TEXT,
    files_changed TEXT,
    insertions INTEGER DEFAULT 0,
    deletions INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);
"""

CREATE_ATTRIBUTIONS_TABLE = """
CREATE TABLE IF NOT EXISTS attributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    commit_sha TEXT NOT NULL,
    confidence REAL NOT NULL,
    overlap_score REAL DEFAULT 0.0,
    time_proximity REAL DEFAULT 0.0,
    file_overlap REAL DEFAULT 0.0,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (session_id) REFERENCES sessions(session_id),
    FOREIGN KEY (commit_sha) REFERENCES commits(sha),
    UNIQUE(session_id, commit_sha)
);
"""

CREATE_FILE_LINES_TABLE = """
CREATE TABLE IF NOT EXISTS file_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path TEXT NOT NULL,
    line_number INTEGER NOT NULL,
    content TEXT,
    commit_sha TEXT NOT NULL,
    session_id TEXT,
    attribution_confidence REAL DEFAULT 0.0,
    last_modified INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (commit_sha) REFERENCES commits(sha),
    FOREIGN KEY (session_id) REFERENCES sessions(session_id),
    UNIQUE(file_path, line_number)
);
"""

CREATE_REVIEWS_TABLE = """
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attribution_id INTEGER NOT NULL,
    reviewer TEXT NOT NULL,
    decision TEXT NOT NULL,
    notes TEXT,
    reviewed_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (attribution_id) REFERENCES attributions(id)
);
"""

CREATE_SESSIONS_TIMESTAMP_INDEX = """
CREATE INDEX IF NOT EXISTS idx_sessions_timestamp_end
ON sessions(timestamp_end);
"""

CREATE_COMMITS_TIMESTAMP_INDEX = """
CREATE INDEX IF NOT EXISTS idx_commits_timestamp
ON commits(timestamp);
"""

CREATE_COMMITS_AUTHOR_INDEX = """
CREATE INDEX IF NOT EXISTS idx_commits_author_email
ON commits(author_email);
"""

CREATE_ATTRIBUTIONS_SESSION_INDEX = """
CREATE INDEX IF NOT EXISTS idx_attributions_session_id
ON attributions(session_id);
"""

CREATE_ATTRIBUTIONS_COMMIT_INDEX = """
CREATE INDEX IF NOT EXISTS idx_attributions_commit_sha
ON attributions(commit_sha);
"""

CREATE_FILE_LINES_PATH_INDEX = """
CREATE INDEX IF NOT EXISTS idx_file_lines_path_line
ON file_lines(file_path, line_number);
"""

CREATE_FILE_LINES_COMMIT_INDEX = """
CREATE INDEX IF NOT EXISTS idx_file_lines_commit_sha
ON file_lines(commit_sha);
"""

CREATE_SCHEMA_VERSION_TABLE = """
CREATE TABLE IF NOT EXISTS schema_version (
    version TEXT PRIMARY KEY,
    applied_at INTEGER DEFAULT (strftime('%s', 'now'))
);
"""

ALL_SCHEMA_STATEMENTS = [
    CREATE_SCHEMA_VERSION_TABLE,
    CREATE_SESSIONS_TABLE,
    CREATE_COMMITS_TABLE,
    CREATE_ATTRIBUTIONS_TABLE,
    CREATE_FILE_LINES_TABLE,
    CREATE_REVIEWS_TABLE,
    CREATE_SESSIONS_TIMESTAMP_INDEX,
    CREATE_COMMITS_TIMESTAMP_INDEX,
    CREATE_COMMITS_AUTHOR_INDEX,
    CREATE_ATTRIBUTIONS_SESSION_INDEX,
    CREATE_ATTRIBUTIONS_COMMIT_INDEX,
    CREATE_FILE_LINES_PATH_INDEX,
    CREATE_FILE_LINES_COMMIT_INDEX,
]


def get_schema_statements():
    """Return all schema creation statements in order."""
    return ALL_SCHEMA_STATEMENTS

# Made with Bob`.split('\n'),

'lineage/core/models.py': String.raw`"""
Pydantic models for Lineage data structures.

Models match the SQLite schema exactly and provide validation for all data types.
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator


class Session(BaseModel):
    """AI coding session model."""
    id: str = Field(..., description="Unique session identifier")
    session_id: str = Field(..., description="Session ID from AI tool export")
    timestamp_start: int = Field(..., description="Session start timestamp (Unix epoch)")
    timestamp_end: int = Field(..., description="Session end timestamp (Unix epoch)")
    model: str = Field(..., description="AI model identifier (e.g., granite-3-8b)")
    tool: str = Field(..., description="AI tool name (e.g., ibm-bob, cursor, copilot)")
    total_turns: int = Field(default=0, description="Number of conversation turns")
    files_modified: Optional[List[str]] = Field(default=None, description="List of modified file paths")
    status: str = Field(default="active", description="Session status")
    user_email: Optional[str] = Field(default=None, description="User email address")
    prompt_text: Optional[str] = Field(default=None, description="Primary prompt text")
    api_cost: float = Field(default=0.0, description="API cost in USD")
    tokens_input: int = Field(default=0, description="Input tokens consumed")
    tokens_output: int = Field(default=0, description="Output tokens generated")
    classification_domain: Optional[str] = Field(default=None, description="Domain classification")
    classification_risk: Optional[str] = Field(default=None, description="Risk tier (high/medium/low)")
    classification_rationale: Optional[str] = Field(default=None, description="Classification reasoning")
    created_at: Optional[int] = Field(default=None, description="Record creation timestamp")

    @field_validator('timestamp_start', 'timestamp_end')
    @classmethod
    def validate_timestamp(cls, v):
        """Ensure timestamps are positive integers."""
        if v < 0:
            raise ValueError("Timestamp must be positive")
        return v


class Commit(BaseModel):
    """Git commit model."""
    id: Optional[int] = Field(default=None, description="Database primary key")
    sha: str = Field(..., description="Git commit SHA-1 hash")
    timestamp: int = Field(..., description="Commit timestamp (Unix epoch)")
    author_name: str = Field(..., description="Commit author name")
    author_email: str = Field(..., description="Commit author email")
    message: Optional[str] = Field(default=None, description="Commit message")
    files_changed: Optional[List[str]] = Field(default=None, description="List of changed file paths")
    insertions: int = Field(default=0, description="Number of lines inserted")
    deletions: int = Field(default=0, description="Number of lines deleted")
    created_at: Optional[int] = Field(default=None, description="Record creation timestamp")

    @field_validator('sha')
    @classmethod
    def validate_sha(cls, v):
        """Ensure SHA is valid format (40 hex characters)."""
        if len(v) not in [7, 40]:
            raise ValueError("SHA must be 7 or 40 characters")
        return v


class Attribution(BaseModel):
    """Session-to-commit attribution model."""
    id: Optional[int] = Field(default=None, description="Database primary key")
    session_id: str = Field(..., description="Reference to session")
    commit_sha: str = Field(..., description="Reference to commit")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Overall confidence score")
    overlap_score: float = Field(default=0.0, ge=0.0, le=1.0, description="File overlap score")
    time_proximity: float = Field(default=0.0, ge=0.0, le=1.0, description="Time proximity score")
    file_overlap: float = Field(default=0.0, ge=0.0, le=1.0, description="File overlap score")
    created_at: Optional[int] = Field(default=None, description="Record creation timestamp")

    @field_validator('confidence', 'overlap_score', 'time_proximity', 'file_overlap')
    @classmethod
    def validate_score(cls, v):
        """Ensure scores are between 0.0 and 1.0."""
        if not 0.0 <= v <= 1.0:
            raise ValueError("Score must be between 0.0 and 1.0")
        return v


class FileLine(BaseModel):
    """File line attribution model."""
    id: Optional[int] = Field(default=None, description="Database primary key")
    file_path: str = Field(..., description="Relative file path")
    line_number: int = Field(..., ge=1, description="Line number (1-indexed)")
    content: Optional[str] = Field(default=None, description="Line content")
    commit_sha: str = Field(..., description="Commit that last modified this line")
    session_id: Optional[str] = Field(default=None, description="Attributed AI session")
    attribution_confidence: float = Field(default=0.0, ge=0.0, le=1.0, description="Attribution confidence")
    last_modified: Optional[int] = Field(default=None, description="Last modification timestamp")

    @field_validator('line_number')
    @classmethod
    def validate_line_number(cls, v):
        if v < 1:
            raise ValueError("Line number must be >= 1")
        return v


class Review(BaseModel):
    """Human review record model."""
    id: Optional[int] = Field(default=None, description="Database primary key")
    attribution_id: int = Field(..., description="Reference to attribution")
    reviewer: str = Field(..., description="Reviewer identifier (email)")
    decision: str = Field(..., description="Review decision (approved/rejected/needs-revision)")
    notes: Optional[str] = Field(default=None, description="Review notes")
    reviewed_at: Optional[int] = Field(default=None, description="Review timestamp")

    @field_validator('decision')
    @classmethod
    def validate_decision(cls, v):
        valid_decisions = ['approved', 'rejected', 'needs-revision']
        if v not in valid_decisions:
            raise ValueError(f"Decision must be one of: {', '.join(valid_decisions)}")
        return v

# Made with Bob`.split('\n'),

'lineage/core/config.py': String.raw`"""
Configuration management for Lineage.

Loads configuration from .lineage/config.yml with sensible defaults.
"""
import yaml
from pathlib import Path
from typing import Dict, Any, Optional


DEFAULT_CONFIG = {
    "attribution_threshold": 0.4,
    "time_window_minutes": 30,
    "min_confidence": 0.3,

    "weight_time_proximity": 0.4,
    "weight_file_overlap": 0.4,
    "weight_author_match": 0.2,

    "time_decay_half_life_minutes": 15,

    "watsonx_endpoint": "https://us-south.ml.cloud.ibm.com/ml/v1/text/generation",
    "watsonx_model": "ibm/granite-3-8b-instruct",
    "classification_cache_enabled": True,
    "classification_rate_limit": 10,

    "web_port": 5000,
    "web_host": "localhost",
    "risk_lens_cache_minutes": 5,

    "export_format": "eu-ai-act",
    "export_include_metadata": True,

    "db_path": ".lineage/lineage.db",
    "db_timeout": 30.0,

    "log_level": "INFO",
    "log_file": ".lineage/lineage.log",
}


def load_config(repo_path: Optional[Path] = None) -> Dict[str, Any]:
    """
    Load configuration from .lineage/config.yml with defaults.

    Args:
        repo_path: Path to repository root (default: current directory)

    Returns:
        dict: Merged configuration (defaults + user overrides)
    """
    config = DEFAULT_CONFIG.copy()

    if repo_path is None:
        repo_path = Path.cwd()
    else:
        repo_path = Path(repo_path)

    config_file = repo_path / ".lineage" / "config.yml"

    if config_file.exists():
        try:
            with open(config_file, 'r') as f:
                user_config = yaml.safe_load(f)
                if user_config:
                    config.update(user_config)
        except yaml.YAMLError as e:
            print(f"Warning: Failed to parse config.yml: {e}")
        except Exception as e:
            print(f"Warning: Failed to load config.yml: {e}")

    return config


def save_config(config: Dict[str, Any], repo_path: Optional[Path] = None):
    """Save configuration to .lineage/config.yml."""
    if repo_path is None:
        repo_path = Path.cwd()
    else:
        repo_path = Path(repo_path)

    lineage_dir = repo_path / ".lineage"
    lineage_dir.mkdir(exist_ok=True)

    config_file = lineage_dir / "config.yml"

    with open(config_file, 'w') as f:
        yaml.dump(config, f, default_flow_style=False, sort_keys=False)


def get_config_value(key: str, repo_path: Optional[Path] = None, default: Any = None) -> Any:
    """Get a single configuration value."""
    config = load_config(repo_path)
    return config.get(key, default)


def validate_config(config: Dict[str, Any]) -> bool:
    """Validate configuration values."""
    if not 0.0 <= config.get("attribution_threshold", 0.4) <= 1.0:
        raise ValueError("attribution_threshold must be between 0.0 and 1.0")

    weight_sum = (
        config.get("weight_time_proximity", 0.4) +
        config.get("weight_file_overlap", 0.4) +
        config.get("weight_author_match", 0.2)
    )
    if not 0.99 <= weight_sum <= 1.01:
        raise ValueError(f"Heuristic weights must sum to 1.0 (got {weight_sum})")

    if config.get("time_window_minutes", 30) <= 0:
        raise ValueError("time_window_minutes must be positive")

    if config.get("classification_rate_limit", 10) <= 0:
        raise ValueError("classification_rate_limit must be positive")

    return True


def create_default_config(repo_path: Optional[Path] = None):
    """Create default config.yml file in .lineage directory."""
    save_config(DEFAULT_CONFIG, repo_path)

# Made with Bob`.split('\n'),

'lineage/classification/classifier.py': String.raw`"""
watsonx.ai session classifier for domain and risk tier classification.

Uses IBM Granite-3-8b-instruct model to classify AI coding sessions
for EU AI Act compliance and risk assessment.
"""
import json
import re
import time
import requests
from typing import Dict, Optional
from datetime import datetime, timedelta


class SessionClassifier:
    """
    Classifies AI sessions using watsonx.ai Granite model.

    Converts raw session metadata into domain labels and risk tiers
    for the Risk Lens feature in Lineage UI.
    """

    def __init__(self, api_key: str, project_id: str, endpoint: str):
        """
        Initialize with watsonx.ai credentials.

        Args:
            api_key: IBM Cloud API key
            project_id: watsonx.ai project ID
            endpoint: watsonx.ai endpoint URL
        """
        self.api_key = api_key
        self.project_id = project_id
        self.endpoint = endpoint.rstrip('/')

        self._iam_token = None
        self._token_expires_at = None

        self._last_request_time = 0
        self._rate_limit_delay = 0.5  # 500ms between requests

    def _get_iam_token(self) -> str:
        """
        Get IBM Cloud IAM token for API authentication.

        Caches token and refreshes when expired (3600s lifetime).
        """
        if (self._iam_token and self._token_expires_at and
            datetime.now() < self._token_expires_at):
            return self._iam_token

        token_url = "https://iam.cloud.ibm.com/identity/token"
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json"
        }
        data = {
            "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
            "apikey": self.api_key
        }

        response = requests.post(token_url, headers=headers, data=data, timeout=30)
        response.raise_for_status()

        token_data = response.json()
        self._iam_token = token_data["access_token"]

        expires_in = token_data.get("expires_in", 3600)
        self._token_expires_at = datetime.now() + timedelta(seconds=expires_in - 300)

        return self._iam_token

    def _rate_limit(self):
        """Apply rate limiting between requests."""
        current_time = time.time()
        time_since_last = current_time - self._last_request_time

        if time_since_last < self._rate_limit_delay:
            sleep_time = self._rate_limit_delay - time_since_last
            time.sleep(sleep_time)

        self._last_request_time = time.time()

    def _build_prompt(self, session) -> str:
        """Build classification prompt for the session."""
        prompt_text = session.prompt_text or "No prompt available"
        if len(prompt_text) > 500:
            prompt_text = prompt_text[:500] + "..."

        files_modified = session.files_modified or []
        files_str = ", ".join(files_modified) if files_modified else "No files specified"

        prompt = f"""Classify this AI coding session for audit purposes.

Session prompt: {prompt_text}
Files modified: {files_str}

Return ONLY a JSON object with these exact fields:
{{"domain": "<one of: auth, payments, data, ui, infra, other>",
 "risk_tier": "<one of: high, medium, low>",
 "rationale": "<one sentence>"}}"""

        return prompt

    def _parse_response(self, response_text: str) -> Dict[str, str]:
        """Parse watsonx.ai response to extract classification JSON."""
        default = {
            "domain": "other",
            "risk_tier": "medium",
            "rationale": "Classification failed - using default"
        }

        try:
            json_match = re.search(r'\{[^}]*\}', response_text)
            if not json_match:
                return default

            json_str = json_match.group(0)
            classification = json.loads(json_str)

            required_fields = ["domain", "risk_tier", "rationale"]
            if not all(field in classification for field in required_fields):
                return default

            valid_domains = ["auth", "payments", "data", "ui", "infra", "other"]
            if classification["domain"] not in valid_domains:
                classification["domain"] = "other"

            valid_risks = ["high", "medium", "low"]
            if classification["risk_tier"] not in valid_risks:
                classification["risk_tier"] = "medium"

            return classification

        except (json.JSONDecodeError, KeyError, AttributeError):
            return default

    def classify(self, session) -> Dict[str, str]:
        """
        Classify a session using watsonx.ai Granite model.

        Args:
            session: Session object to classify

        Returns:
            dict: Classification with domain, risk_tier, rationale
        """
        self._rate_limit()

        prompt = self._build_prompt(session)
        url = f"{self.endpoint}/ml/v1/text/generation?version=2023-05-29"

        headers = {
            "Authorization": f"Bearer {self._get_iam_token()}",
            "Content-Type": "application/json"
        }

        payload = {
            "model_id": "ibm/granite-3-8b-instruct",
            "project_id": self.project_id,
            "input": prompt,
            "parameters": {
                "decoding_method": "greedy",
                "max_new_tokens": 200,
                "stop_sequences": ["}"]
            }
        }

        max_retries = 3
        retry_delays = [1, 2, 4]

        for attempt in range(max_retries):
            try:
                response = requests.post(url, headers=headers, json=payload, timeout=30)
                response.raise_for_status()

                response_data = response.json()
                generated_text = response_data["results"][0]["generated_text"]

                return self._parse_response(generated_text)

            except (requests.RequestException, KeyError, IndexError) as e:
                if attempt < max_retries - 1:
                    time.sleep(retry_delays[attempt])
                    continue

        return {
            "domain": "other",
            "risk_tier": "medium",
            "rationale": f"Classification failed after {max_retries} attempts - using default"
        }

# Made with Bob`.split('\n'),

'lineage/classification/cache.py': String.raw`"""
Classification cache for storing and retrieving session classifications.

Manages the classification_domain, classification_risk, and
classification_rationale columns in the sessions table.
"""
from typing import Optional, Dict, List
from lineage.storage.database import DatabaseManager
from lineage.core.models import Session


class ClassificationCache:
    """
    Cache for session classifications in SQLite database.

    Provides methods to check, store, and retrieve classification data
    for AI sessions to avoid redundant watsonx.ai API calls.
    """

    def __init__(self, db: DatabaseManager):
        self.db = db

    def get(self, session_id: str) -> Optional[Dict[str, str]]:
        """Get cached classification for a session."""
        cursor = self.db.execute(
            """
            SELECT classification_domain, classification_risk, classification_rationale
            FROM sessions
            WHERE session_id = ?
            """,
            (session_id,)
        )

        row = cursor.fetchone()
        if not row:
            return None

        if (row['classification_domain'] is None or
            row['classification_risk'] is None or
            row['classification_rationale'] is None):
            return None

        return {
            "domain": row['classification_domain'],
            "risk_tier": row['classification_risk'],
            "rationale": row['classification_rationale']
        }

    def set(self, session_id: str, classification: Dict[str, str]):
        """Store classification for a session."""
        self.db.execute(
            """
            UPDATE sessions
            SET classification_domain = ?,
                classification_risk = ?,
                classification_rationale = ?
            WHERE session_id = ?
            """,
            (
                classification["domain"],
                classification["risk_tier"],
                classification["rationale"],
                session_id
            )
        )
        self.db.commit()

    def needs_classification(self) -> List[Session]:
        """Get all sessions that need classification (classification_domain IS NULL)."""
        import json

        cursor = self.db.execute(
            """
            SELECT id, session_id, timestamp_start, timestamp_end, model, tool,
                   total_turns, files_modified, status, user_email, prompt_text,
                   api_cost, tokens_input, tokens_output,
                   classification_domain, classification_risk, classification_rationale,
                   created_at
            FROM sessions
            WHERE classification_domain IS NULL
            """
        )

        sessions = []
        for row in cursor.fetchall():
            files_modified = None
            if row['files_modified']:
                try:
                    files_modified = json.loads(row['files_modified'])
                except json.JSONDecodeError:
                    files_modified = []

            session = Session(
                id=row['id'],
                session_id=row['session_id'],
                timestamp_start=row['timestamp_start'],
                timestamp_end=row['timestamp_end'],
                model=row['model'],
                tool=row['tool'],
                total_turns=row['total_turns'],
                files_modified=files_modified,
                status=row['status'],
                user_email=row['user_email'],
                prompt_text=row['prompt_text'],
                api_cost=row['api_cost'],
                tokens_input=row['tokens_input'],
                tokens_output=row['tokens_output'],
                classification_domain=row['classification_domain'],
                classification_risk=row['classification_risk'],
                classification_rationale=row['classification_rationale'],
                created_at=row['created_at']
            )
            sessions.append(session)

        return sessions

    def get_all_sessions(self) -> List[Session]:
        """Get all sessions regardless of classification status."""
        import json

        cursor = self.db.execute(
            """
            SELECT id, session_id, timestamp_start, timestamp_end, model, tool,
                   total_turns, files_modified, status, user_email, prompt_text,
                   api_cost, tokens_input, tokens_output,
                   classification_domain, classification_risk, classification_rationale,
                   created_at
            FROM sessions
            """
        )

        sessions = []
        for row in cursor.fetchall():
            files_modified = None
            if row['files_modified']:
                try:
                    files_modified = json.loads(row['files_modified'])
                except json.JSONDecodeError:
                    files_modified = []

            session = Session(
                id=row['id'],
                session_id=row['session_id'],
                timestamp_start=row['timestamp_start'],
                timestamp_end=row['timestamp_end'],
                model=row['model'],
                tool=row['tool'],
                total_turns=row['total_turns'],
                files_modified=files_modified,
                status=row['status'],
                user_email=row['user_email'],
                prompt_text=row['prompt_text'],
                api_cost=row['api_cost'],
                tokens_input=row['tokens_input'],
                tokens_output=row['tokens_output'],
                classification_domain=row['classification_domain'],
                classification_risk=row['classification_risk'],
                classification_rationale=row['classification_rationale'],
                created_at=row['created_at']
            )
            sessions.append(session)

        return sessions

# Made with Bob`.split('\n'),

'lineage/cli/main.py': String.raw`"""
Lineage CLI - Main command interface for AI code attribution.
"""
import click
from pathlib import Path
import os


@click.group()
@click.version_option(version="0.1.0")
def cli():
    """
    Lineage - Git blame for AI-generated code.

    Track, attribute, and audit AI-assisted development for EU AI Act compliance.
    """
    pass


@cli.command()
@click.option(
    "--repo",
    type=click.Path(exists=True, file_okay=False, dir_okay=True),
    default=".",
    help="Path to git repository (default: current directory)",
)
def init(repo):
    """
    Initialize Lineage database in target repository.

    Creates .lineage/lineage.db with schema for sessions, commits, and attributions.
    """
    from lineage.storage.database import DatabaseManager

    repo_path = Path(repo).resolve()
    lineage_dir = repo_path / ".lineage"
    db_path = lineage_dir / "lineage.db"

    lineage_dir.mkdir(exist_ok=True)

    db = DatabaseManager(db_path)
    db.initialize()
    db.close()

    click.echo(f"Initialized Lineage database at {db_path}")
    click.echo(f"Ready to track AI-generated code")


@cli.command()
@click.option(
    "--sessions",
    type=click.Path(exists=True, file_okay=False, dir_okay=True),
    default="./bob_sessions",
    help="Path to AI session exports directory (default: ./bob_sessions)",
)
@click.option(
    "--repo",
    type=click.Path(exists=True, file_okay=False, dir_okay=True),
    default=".",
    help="Path to git repository (default: current directory)",
)
def scan(sessions, repo):
    """
    Ingest AI session exports into Lineage database.

    Discovers and parses Bob session markdown exports, storing them for attribution.
    Skips duplicates based on session_id.
    """
    import json
    from lineage.storage.database import DatabaseManager
    from lineage.adapters.bob import BobSessionAdapter

    repo_path = Path(repo).resolve()
    sessions_path = Path(sessions).resolve()
    db_path = repo_path / ".lineage" / "lineage.db"

    if not db_path.exists():
        click.echo("Lineage database not found. Run 'lineage init' first.")
        return

    md_files = list(sessions_path.rglob("*.md"))

    if not md_files:
        click.echo(f"No .md files found in {sessions_path}")
        return

    click.echo(f"Found {len(md_files)} markdown file(s) in {sessions_path}")

    adapter = BobSessionAdapter()
    parsed_sessions = []
    skipped_files = []

    for md_file in md_files:
        try:
            if adapter.validate_export(md_file):
                sessions_list = adapter.parse(md_file)
                parsed_sessions.extend(sessions_list)
                click.echo(f"  Parsed {md_file.name}")
            else:
                skipped_files.append(md_file.name)
                click.echo(f"  Skipped {md_file.name} (not a Bob export)")
        except Exception as e:
            skipped_files.append(md_file.name)
            click.echo(f"  Failed to parse {md_file.name}: {e}")

    if not parsed_sessions:
        click.echo("No valid sessions parsed")
        return

    db = DatabaseManager(db_path)
    inserted = 0
    duplicates = 0

    try:
        for session in parsed_sessions:
            try:
                files_json = json.dumps(session.files_modified) if session.files_modified else None

                cursor = db.execute(
                    """
                    INSERT OR IGNORE INTO sessions (
                        id, session_id, timestamp_start, timestamp_end, model, tool,
                        total_turns, files_modified, status, user_email, prompt_text,
                        api_cost, tokens_input, tokens_output
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        session.id,
                        session.session_id,
                        session.timestamp_start,
                        session.timestamp_end,
                        session.model,
                        session.tool,
                        session.total_turns,
                        files_json,
                        session.status,
                        session.user_email,
                        session.prompt_text,
                        session.api_cost,
                        session.tokens_input,
                        session.tokens_output,
                    ),
                )

                if cursor.rowcount > 0:
                    inserted += 1
                else:
                    duplicates += 1

            except Exception as e:
                click.echo(f"  Failed to insert session {session.session_id}: {e}")

        db.commit()

    finally:
        db.close()

    click.echo(f"\nScanned {len(md_files)} files, parsed {len(parsed_sessions)} sessions")
    click.echo(f"  Inserted: {inserted}")
    click.echo(f"  Duplicates skipped: {duplicates}")
    if skipped_files:
        click.echo(f"  Files skipped: {len(skipped_files)}")


@cli.command()
@click.option(
    "--repo",
    type=click.Path(exists=True, file_okay=False, dir_okay=True),
    default=".",
    help="Path to git repository (default: current directory)",
)
@click.option(
    "--threshold",
    type=float,
    default=0.4,
    help="Minimum confidence score for attribution (0.0-1.0)",
)
@click.option(
    "--force",
    is_flag=True,
    help="Re-run attribution even if attributions already exist",
)
def attribute(repo, threshold, force):
    """
    Match AI sessions to git commits using heuristic scoring.

    Analyzes git history and attributes commits to AI sessions based on
    time proximity, file overlap, and author matching. Populates the
    file_lines table with per-line attribution data.
    """
    from lineage.storage.database import DatabaseManager
    from lineage.attribution.engine import AttributionEngine

    repo_path = Path(repo).resolve()
    db_path = repo_path / ".lineage" / "lineage.db"

    if not db_path.exists():
        click.echo("Lineage database not found. Run 'lineage init' first.")
        return

    db = DatabaseManager(db_path)
    try:
        cursor = db.execute("SELECT COUNT(*) as count FROM sessions")
        row = cursor.fetchone()
        session_count = row['count'] if row else 0

        if session_count == 0:
            click.echo("No sessions found. Run 'lineage scan' first.")
            return

        if not force:
            cursor = db.execute("SELECT COUNT(*) as count FROM attributions")
            row = cursor.fetchone()
            attr_count = row['count'] if row else 0

            if attr_count > 0:
                click.echo(f"{attr_count} attributions already exist. Use --force to re-run.")
                return

        if force:
            click.echo("Clearing existing attributions...")
            db.execute("DELETE FROM attributions")
            db.execute("DELETE FROM file_lines")
            db.commit()

        click.echo("Running attribution engine...")

        engine = AttributionEngine(repo_path, db, threshold)
        result = engine.run()

        click.echo(f"Walked {result.total_commits} commits")
        click.echo(f"Attributed: {result.attributed_commits} commits to AI sessions")
        click.echo(f"Unknown:    {result.unknown_commits} commits (human-authored)")
        click.echo()

        if result.attributed_commits > 0:
            click.echo(f"High confidence (>=0.7):   {result.high_confidence} attributions")
            click.echo(f"Medium confidence (>=0.4): {result.medium_confidence} attributions")
            click.echo()

        click.echo(f"File lines inserted: {result.file_lines_inserted}")
        click.echo(f"Sessions matched: {result.sessions_matched} / {result.total_sessions}")
        click.echo("Attribution complete")

    except Exception as e:
        click.echo(f"Attribution failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


@cli.command()
@click.option(
    "--force",
    is_flag=True,
    help="Force re-classification of already classified sessions",
)
@click.option(
    "--repo",
    type=click.Path(exists=True, file_okay=False, dir_okay=True),
    default=".",
    help="Path to git repository (default: current directory)",
)
def classify(force, repo):
    """
    Classify AI sessions by domain and risk tier using watsonx.ai.

    Uses IBM Granite-3-8b-instruct to classify sessions for EU AI Act compliance.
    """
    from lineage.storage.database import DatabaseManager
    from lineage.classification.classifier import SessionClassifier
    from lineage.classification.cache import ClassificationCache

    repo_path = Path(repo).resolve()
    db_path = repo_path / ".lineage" / "lineage.db"

    if not db_path.exists():
        click.echo("Lineage database not found. Run 'lineage init' first.")
        return

    env_path = repo_path / ".env"
    credentials = {}

    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    credentials[key.strip()] = value.strip()

    api_key = credentials.get('WATSONX_API_KEY') or os.environ.get('WATSONX_API_KEY')
    project_id = credentials.get('WATSONX_PROJECT_ID') or os.environ.get('WATSONX_PROJECT_ID')
    endpoint = credentials.get('WATSONX_ENDPOINT') or os.environ.get('WATSONX_ENDPOINT')

    if not all([api_key, project_id, endpoint]):
        click.echo("Missing watsonx.ai credentials")
        click.echo("Set WATSONX_API_KEY, WATSONX_PROJECT_ID, WATSONX_ENDPOINT in .env file")
        return

    db = DatabaseManager(db_path)
    cache = ClassificationCache(db)
    classifier = SessionClassifier(str(api_key), str(project_id), str(endpoint))

    try:
        if force:
            sessions = cache.get_all_sessions()
            click.echo(f"Re-classifying all {len(sessions)} sessions...")
        else:
            sessions = cache.needs_classification()
            if not sessions:
                click.echo("All sessions already classified")
                return
            click.echo(f"Found {len(sessions)} sessions needing classification")

        click.echo(f"Classifying via watsonx.ai (Granite 3 8B)...")
        click.echo()

        for session in sessions:
            classification = classifier.classify(session)
            cache.set(session.session_id, classification)
            click.echo(f"  {session.session_id}: {classification['domain']} ({classification['risk_tier']} risk)")

        click.echo()
        click.echo("Classification complete")

    except Exception as e:
        click.echo(f"Classification failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


@cli.command()
@click.option(
    "--port",
    type=int,
    default=5000,
    help="Port for local web server (default: 5000)",
)
@click.option(
    "--repo",
    type=click.Path(exists=True, file_okay=False, dir_okay=True),
    default=".",
    help="Path to git repository (default: current directory)",
)
def view(port, repo):
    """
    Launch local web UI for visual exploration of the attribution graph.

    Starts a Flask server and opens the treemap, file viewer, Risk Lens,
    and provenance panel in your browser.
    """
    import threading
    import webbrowser
    from lineage.web.app import create_app

    repo_path = Path(repo).resolve()
    db_path = repo_path / ".lineage" / "lineage.db"

    if not db_path.exists():
        click.echo("Lineage database not found. Run 'lineage init' first.")
        return

    url = f"http://localhost:{port}"
    app = create_app(db_path, repo_path)

    click.echo(f"Starting Lineage UI at {url}")
    click.echo("  Press Ctrl+C to stop\n")

    threading.Timer(1.0, lambda: webbrowser.open(url)).start()

    app.run(host="127.0.0.1", port=port, debug=False, use_reloader=False)


@cli.command()
@click.option(
    "--format",
    type=click.Choice(["eu-ai-act", "json", "pdf"], case_sensitive=False),
    default="eu-ai-act",
    help="Export format (eu-ai-act generates both JSON and PDF)",
)
@click.option(
    "--output",
    type=click.Path(file_okay=True, dir_okay=False),
    help="Output file path (default: lineage-audit-{timestamp}.{format})",
)
def export(format, output):
    """
    Generate EU AI Act Article 12-compliant audit report.

    Exports complete provenance graph with session metadata,
    classifications, and human oversight records.
    """
    click.echo("Phase 8 will implement this")
    click.echo(f"This command will generate {format} audit report.")
    if output:
        click.echo(f"Output will be written to: {output}")


if __name__ == "__main__":
    cli()

# Made with Bob`.split('\n'),

'tests/unit/test_attribution.py': String.raw`"""
Unit tests for attribution engine components.

Tests the scorer, matcher, and engine with synthetic data.
"""
import pytest
from datetime import datetime, timedelta
from pathlib import Path
from lineage.attribution.scorer import AttributionScorer
from lineage.core.models import Session, Commit


class TestAttributionScorer:
    """Test suite for AttributionScorer."""

    def test_scorer_time_signal(self):
        """
        Test time proximity scoring.

        Creates a session ending at time T and a commit at T+300 (5 min later).
        Time score should be > 0.3 due to exponential decay.
        """
        scorer = AttributionScorer()

        session = Session(
            id="test-session",
            session_id="test-session",
            timestamp_start=999000,
            timestamp_end=1000000,
            model="test-model",
            tool="test-tool",
            total_turns=1,
            files_modified=["test.py"],
            status="complete"
        )

        commit = Commit(
            sha="a" * 40,
            timestamp=1000300,  # 5 minutes after session end
            author_name="Test Author",
            author_email="test@example.com",
            message="Test commit",
            files_changed=["test.py"]
        )

        confidence, time_score, file_score, author_score = scorer.score(session, commit)

        # At 5 minutes (300s), with half-life of 900s:
        # score = exp(-300/900) = exp(-1/3) ~= 0.717
        assert time_score > 0.3, f"Expected time_score > 0.3, got {time_score}"
        assert time_score < 1.0, f"Expected time_score < 1.0, got {time_score}"
        assert confidence > 0.0

    def test_scorer_file_overlap(self):
        """
        Test file overlap scoring.

        Session with files [adapters/bob.py, core/models.py]
        and commit touching [adapters/bob.py, storage/schema.py].
        Jaccard = 1/3 ~= 0.333.
        """
        scorer = AttributionScorer()

        session = Session(
            id="test-session",
            session_id="test-session",
            timestamp_start=1000000,
            timestamp_end=1000000,
            model="test-model",
            tool="test-tool",
            total_turns=1,
            files_modified=[
                "lineage/adapters/bob.py",
                "lineage/core/models.py"
            ],
            status="complete"
        )

        commit = Commit(
            sha="b" * 40,
            timestamp=1000000,
            author_name="Test Author",
            author_email="test@example.com",
            message="Test commit",
            files_changed=[
                "lineage/adapters/bob.py",
                "lineage/storage/schema.py"
            ]
        )

        confidence, time_score, file_score, author_score = scorer.score(session, commit)

        assert file_score > 0.0, f"Expected file_score > 0, got {file_score}"
        assert file_score < 1.0, f"Expected file_score < 1.0, got {file_score}"
        assert confidence > 0.0

    def test_scorer_author_match(self):
        """Exact email match should give author_score = 1.0."""
        scorer = AttributionScorer()

        session = Session(
            id="test-session",
            session_id="test-session",
            timestamp_start=1000000,
            timestamp_end=1000000,
            model="test-model",
            tool="test-tool",
            total_turns=1,
            files_modified=["test.py"],
            status="complete",
            user_email="dev@example.com"
        )

        commit = Commit(
            sha="c" * 40,
            timestamp=1000000,
            author_name="Developer",
            author_email="dev@example.com",
            message="Test commit",
            files_changed=["test.py"]
        )

        confidence, time_score, file_score, author_score = scorer.score(session, commit)

        assert author_score == 1.0, f"Expected author_score = 1.0, got {author_score}"
        assert confidence > 0.5

    def test_scorer_domain_match(self):
        """Same email domain should give author_score = 0.5."""
        scorer = AttributionScorer()

        session = Session(
            id="test-session",
            session_id="test-session",
            timestamp_start=1000000,
            timestamp_end=1000000,
            model="test-model",
            tool="test-tool",
            total_turns=1,
            files_modified=["test.py"],
            status="complete",
            user_email="alice@example.com"
        )

        commit = Commit(
            sha="d" * 40,
            timestamp=1000000,
            author_name="Bob",
            author_email="bob@example.com",
            message="Test commit",
            files_changed=["test.py"]
        )

        confidence, time_score, file_score, author_score = scorer.score(session, commit)

        assert author_score == 0.5, f"Expected author_score = 0.5, got {author_score}"

    def test_scorer_unknown_below_threshold(self):
        """Commit before session, different files, different author - confidence < 0.4."""
        scorer = AttributionScorer()

        session = Session(
            id="test-session",
            session_id="test-session",
            timestamp_start=2000000,
            timestamp_end=2000100,
            model="test-model",
            tool="test-tool",
            total_turns=1,
            files_modified=["session_file.py"],
            status="complete",
            user_email="session@example.com"
        )

        commit = Commit(
            sha="e" * 40,
            timestamp=1000000,  # Way before session
            author_name="Different Author",
            author_email="different@other.com",
            message="Test commit",
            files_changed=["commit_file.py"]
        )

        confidence, time_score, file_score, author_score = scorer.score(session, commit)

        assert time_score == 0.0, f"Expected time_score = 0, got {time_score}"
        assert author_score == 0.0, f"Expected author_score = 0, got {author_score}"
        assert confidence < 0.4, f"Expected confidence < 0.4, got {confidence}"

    def test_scorer_empty_file_lists(self):
        """Empty file lists get neutral score (0.2), not penalized."""
        scorer = AttributionScorer()

        session = Session(
            id="test-session",
            session_id="test-session",
            timestamp_start=1000000,
            timestamp_end=1000000,
            model="test-model",
            tool="test-tool",
            total_turns=1,
            files_modified=None,
            status="complete"
        )

        commit = Commit(
            sha="f" * 40,
            timestamp=1000000,
            author_name="Test",
            author_email="test@example.com",
            message="Test",
            files_changed=["test.py"]
        )

        confidence, time_score, file_score, author_score = scorer.score(session, commit)

        assert file_score == 0.2, f"Expected file_score = 0.2, got {file_score}"

    def test_scorer_time_cutoff(self):
        """Commits > 30 minutes after session get time_score = 0."""
        scorer = AttributionScorer()

        session = Session(
            id="test-session",
            session_id="test-session",
            timestamp_start=1000000,
            timestamp_end=1000000,
            model="test-model",
            tool="test-tool",
            total_turns=1,
            files_modified=["test.py"],
            status="complete"
        )

        commit = Commit(
            sha="g" * 40,
            timestamp=1001860,  # 31 minutes after
            author_name="Test",
            author_email="test@example.com",
            message="Test",
            files_changed=["test.py"]
        )

        confidence, time_score, file_score, author_score = scorer.score(session, commit)

        assert time_score == 0.0, f"Expected time_score = 0, got {time_score}"


# Made with Bob`.split('\n'),

}

// Deterministic pseudo-random for consistent attribution coloring per line
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

// Sample file lines for FileViewer — returns complete real file content
export function getSampleLines(filePath: string): Array<{
  line: number
  content: string
  type: 'ai' | 'human' | 'unknown'
  sessionId?: string
  confidence?: number
}> {
  const file = FILES.find(f => f.path === filePath)
  if (!file) return []

  const content = FILE_CONTENTS[filePath] ?? [
    `"""${filePath}"""`,
    ``,
    `# Generated by IBM Bob (ibm/granite-3-8b-instruct)`,
    `# Phase 02 scaffold session`,
  ]

  return content.map((line, i) => {
    const rand = pseudoRandom(i * 137 + filePath.length * 31)
    const isAi = rand < file.aiPct
    return {
      line: i + 1,
      content: line,
      type: isAi ? 'ai' as const : 'human' as const,
      sessionId: isAi ? file.sessionId : undefined,
      confidence: isAi ? 0.7 + pseudoRandom(i * 93 + 7) * 0.3 : undefined,
    }
  })
}

"""
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
        """
        Load all sessions from database.
        
        Returns:
            List of Session objects
        """
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
            # Parse files_modified JSON
            files_modified = None
            if row[7]:  # files_modified column
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
        """
        Match each commit to the best-scoring session.
        
        For each commit, computes confidence score against all sessions
        and selects the highest-scoring session. If score is above threshold,
        creates an Attribution. Otherwise, commit is marked as unknown.
        
        Args:
            commits: List of commits to match
            sessions: List of sessions to match against
            
        Returns:
            List of Attribution objects (only for matches above threshold)
        """
        attributions = []
        
        for commit in commits:
            best_session = None
            best_confidence = 0.0
            best_scores = (0.0, 0.0, 0.0)  # time, file, author
            
            # Score commit against all sessions
            for session in sessions:
                confidence, time_score, file_score, author_score = self.scorer.score(
                    session, commit
                )
                
                if confidence > best_confidence:
                    best_confidence = confidence
                    best_session = session
                    best_scores = (time_score, file_score, author_score)
            
            # Create attribution if above threshold
            if best_confidence >= self.threshold and best_session:
                attribution = Attribution(
                    session_id=best_session.session_id,
                    commit_sha=commit.sha,
                    confidence=best_confidence,
                    time_proximity=best_scores[0],
                    file_overlap=best_scores[1],
                    overlap_score=best_scores[2]  # author score
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
        """
        Store attributions in database.
        
        Args:
            attributions: List of Attribution objects to store
        """
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
        """
        Populate file_lines table with per-line attribution.
        
        For each attributed commit, parses the diff to find added lines
        and inserts them into file_lines with attribution metadata.
        
        For commits without attribution (unknown), marks lines as human-authored.
        
        Args:
            attributions: List of attributions
            commits: List of all commits
            
        Returns:
            Number of file_lines inserted
        """
        # Build attribution lookup
        attr_map = {attr.commit_sha: attr for attr in attributions}
        
        lines_inserted = 0
        
        for commit in commits:
            attribution = attr_map.get(commit.sha)
            
            # Get diff for this commit
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
                    
                    # Parse diff to extract added lines
                    lines = self._parse_diff_lines(diff.diff, diff.b_path)
                    
                    # Insert file_lines
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
                    
                    # Commit after each file to avoid losing data
                    if lines:
                        self.db.commit()
            
            except Exception as e:
                logger.warning(f"Failed to process diff for commit {commit.sha[:7]}: {e}")
        
        return lines_inserted
    
    def _parse_diff_lines(self, diff_data: bytes | str, file_path: str) -> List[tuple]:
        """
        Parse diff to extract added lines with line numbers.
        
        Parses unified diff format to find lines starting with '+' (added)
        and computes their absolute line numbers from hunk headers.
        
        Args:
            diff_data: Raw diff bytes or string
            file_path: File path for logging
            
        Returns:
            List of (line_number, content) tuples for added lines
        """
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
            # Parse hunk header: @@ -a,b +c,d @@
            hunk_match = re.match(r'^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@', line)
            if hunk_match:
                current_line = int(hunk_match.group(1))
                continue
            
            # Skip diff metadata lines
            if line.startswith('---') or line.startswith('+++'):
                continue
            
            # Added line (starts with +)
            if line.startswith('+') and not line.startswith('+++'):
                content = line[1:]  # Remove leading +
                lines.append((current_line, content))
                current_line += 1
            # Context or removed line
            elif line.startswith(' '):
                current_line += 1
            # Removed line (starts with -) - don't increment line number
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
        """
        Compute summary statistics.
        
        Args:
            commits: All commits
            sessions: All sessions
            attributions: All attributions
            file_lines_count: Number of file_lines inserted
            
        Returns:
            AttributionResult with statistics
        """
        # Count confidence tiers
        high_confidence = sum(1 for a in attributions if a.confidence >= 0.7)
        medium_confidence = sum(1 for a in attributions if 0.4 <= a.confidence < 0.7)
        low_confidence = sum(1 for a in attributions if a.confidence < 0.4)
        
        # Count unique sessions matched
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

# Made with Bob
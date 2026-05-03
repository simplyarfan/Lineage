"""
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
        
        The raw score is then scaled by WEIGHT_TIME to get the contribution.
        
        Args:
            session: AI session
            commit: Git commit
            
        Returns:
            Time proximity score (0.0 - 1.0)
        """
        # Compute time delta (commit time - session end time)
        delta = commit.timestamp - session.timestamp_end
        
        # Commit before session ended: impossible attribution
        if delta < 0:
            return 0.0
        
        # Commit exactly at session end: perfect match
        if delta == 0:
            return 1.0
        
        # Commit after session: exponential decay
        # score = exp(-delta / half_life)
        if delta > self.TIME_MAX_DELTA:
            # Beyond 30 minutes: no attribution
            return 0.0
        
        # Exponential decay formula
        score = math.exp(-delta / self.TIME_HALF_LIFE)
        
        return score
    
    def _compute_file_score(self, session: Session, commit: Commit) -> float:
        """
        Compute file overlap score (0.0 - 1.0).
        
        Uses Jaccard similarity: |intersection| / |union|
        
        Special cases:
        - If either file list is empty: return 0.2 (neutral, not penalized)
        - If both lists are empty: return 0.2
        
        Args:
            session: AI session
            commit: Git commit
            
        Returns:
            File overlap score (0.0 - 1.0)
        """
        session_files = set(session.files_modified or [])
        commit_files = set(commit.files_changed or [])
        
        # Handle empty file lists (common in exports)
        if not session_files or not commit_files:
            # Neutral score: don't penalize empty lists
            return 0.2
        
        # Jaccard similarity: intersection / union
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
        - Session has no user_email: 0.0 (can't determine)
        
        Args:
            session: AI session
            commit: Git commit
            
        Returns:
            Author match score (0.0 - 1.0)
        """
        if not session.user_email:
            # No user email in session: can't determine authorship
            return 0.0
        
        session_email = session.user_email.lower().strip()
        commit_email = commit.author_email.lower().strip()
        
        # Exact match
        if session_email == commit_email:
            return 1.0
        
        # Domain match (e.g., both @example.com)
        session_domain = self._extract_domain(session_email)
        commit_domain = self._extract_domain(commit_email)
        
        if session_domain and commit_domain and session_domain == commit_domain:
            return 0.5
        
        # No match
        return 0.0
    
    def _extract_domain(self, email: str) -> str:
        """
        Extract domain from email address.
        
        Args:
            email: Email address
            
        Returns:
            Domain part (e.g., "example.com" from "user@example.com")
        """
        if '@' in email:
            return email.split('@')[1]
        return ""

# Made with Bob
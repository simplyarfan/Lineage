"""
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
        
        # Create session ending at timestamp 1000000
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
        
        # Create commit 5 minutes (300 seconds) after session end
        commit = Commit(
            sha="a" * 40,
            timestamp=1000300,  # 5 minutes after session end
            author_name="Test Author",
            author_email="test@example.com",
            message="Test commit",
            files_changed=["test.py"]
        )
        
        confidence, time_score, file_score, author_score = scorer.score(session, commit)
        
        # Time score should be positive (exponential decay)
        # At 5 minutes (300s), with half-life of 900s:
        # score = exp(-300/900) = exp(-1/3) ≈ 0.717
        assert time_score > 0.3, f"Expected time_score > 0.3, got {time_score}"
        assert time_score < 1.0, f"Expected time_score < 1.0, got {time_score}"
        
        # Overall confidence should include time component
        assert confidence > 0.0
    
    def test_scorer_file_overlap(self):
        """
        Test file overlap scoring.
        
        Session with files [lineage/adapters/bob.py, lineage/core/models.py]
        and commit touching [lineage/adapters/bob.py, lineage/storage/schema.py].
        File score should be > 0 due to overlap.
        """
        scorer = AttributionScorer()
        
        # Create session with 2 files
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
        
        # Create commit touching 2 files (1 overlaps)
        commit = Commit(
            sha="b" * 40,
            timestamp=1000000,  # Same time as session
            author_name="Test Author",
            author_email="test@example.com",
            message="Test commit",
            files_changed=[
                "lineage/adapters/bob.py",  # Overlaps
                "lineage/storage/schema.py"  # Doesn't overlap
            ]
        )
        
        confidence, time_score, file_score, author_score = scorer.score(session, commit)
        
        # File score should be positive (Jaccard similarity)
        # Intersection: 1 file (bob.py)
        # Union: 3 files (bob.py, models.py, schema.py)
        # Jaccard = 1/3 ≈ 0.333
        assert file_score > 0.0, f"Expected file_score > 0, got {file_score}"
        assert file_score < 1.0, f"Expected file_score < 1.0, got {file_score}"
        
        # Overall confidence should include file component
        assert confidence > 0.0
    
    def test_scorer_author_match(self):
        """
        Test author matching.
        
        Session with user_email and commit with matching email should
        have author_score = 1.0.
        """
        scorer = AttributionScorer()
        
        # Create session with user email
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
        
        # Create commit with matching email
        commit = Commit(
            sha="c" * 40,
            timestamp=1000000,
            author_name="Developer",
            author_email="dev@example.com",  # Exact match
            message="Test commit",
            files_changed=["test.py"]
        )
        
        confidence, time_score, file_score, author_score = scorer.score(session, commit)
        
        # Author score should be 1.0 for exact match
        assert author_score == 1.0, f"Expected author_score = 1.0, got {author_score}"
        
        # Overall confidence should be high
        assert confidence > 0.5
    
    def test_scorer_domain_match(self):
        """
        Test domain matching (same domain, different user).
        
        Should give author_score = 0.5.
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
            files_modified=["test.py"],
            status="complete",
            user_email="alice@example.com"
        )
        
        commit = Commit(
            sha="d" * 40,
            timestamp=1000000,
            author_name="Bob",
            author_email="bob@example.com",  # Same domain
            message="Test commit",
            files_changed=["test.py"]
        )
        
        confidence, time_score, file_score, author_score = scorer.score(session, commit)
        
        # Author score should be 0.5 for domain match
        assert author_score == 0.5, f"Expected author_score = 0.5, got {author_score}"
    
    def test_scorer_unknown_below_threshold(self):
        """
        Test that session and commit with no overlap score below threshold.
        
        No time overlap (commit before session), no file overlap, no author match.
        Combined confidence should be < 0.4.
        """
        scorer = AttributionScorer()
        
        # Create session
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
        
        # Create commit BEFORE session (time_score = 0)
        commit = Commit(
            sha="e" * 40,
            timestamp=1000000,  # Way before session
            author_name="Different Author",
            author_email="different@other.com",  # Different domain
            message="Test commit",
            files_changed=["commit_file.py"]  # Different file
        )
        
        confidence, time_score, file_score, author_score = scorer.score(session, commit)
        
        # Time score should be 0 (commit before session)
        assert time_score == 0.0, f"Expected time_score = 0, got {time_score}"
        
        # Author score should be 0 (no match)
        assert author_score == 0.0, f"Expected author_score = 0, got {author_score}"
        
        # Overall confidence should be below threshold
        assert confidence < 0.4, f"Expected confidence < 0.4, got {confidence}"
    
    def test_scorer_empty_file_lists(self):
        """
        Test that empty file lists get neutral score (0.2), not penalized.
        """
        scorer = AttributionScorer()
        
        # Session with no files_modified
        session = Session(
            id="test-session",
            session_id="test-session",
            timestamp_start=1000000,
            timestamp_end=1000000,
            model="test-model",
            tool="test-tool",
            total_turns=1,
            files_modified=None,  # Empty
            status="complete"
        )
        
        # Commit with files
        commit = Commit(
            sha="f" * 40,
            timestamp=1000000,
            author_name="Test",
            author_email="test@example.com",
            message="Test",
            files_changed=["test.py"]
        )
        
        confidence, time_score, file_score, author_score = scorer.score(session, commit)
        
        # File score should be neutral (0.2)
        assert file_score == 0.2, f"Expected file_score = 0.2, got {file_score}"
    
    def test_scorer_time_cutoff(self):
        """
        Test that commits > 30 minutes after session get time_score = 0.
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
            files_modified=["test.py"],
            status="complete"
        )
        
        # Commit 31 minutes (1860 seconds) after session
        commit = Commit(
            sha="g" * 40,
            timestamp=1001860,  # 31 minutes after
            author_name="Test",
            author_email="test@example.com",
            message="Test",
            files_changed=["test.py"]
        )
        
        confidence, time_score, file_score, author_score = scorer.score(session, commit)
        
        # Time score should be 0 (beyond 30 minute cutoff)
        assert time_score == 0.0, f"Expected time_score = 0, got {time_score}"


# Made with Bob
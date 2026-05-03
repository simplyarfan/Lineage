"""
Unit tests for EU AI Act export functionality.

Tests the EUAIActExporter class and audit report generation.
"""
import json
import pytest
from pathlib import Path
from datetime import datetime
import tempfile
import sqlite3

from lineage.export.eu_ai_act import EUAIActExporter
from lineage.storage.database import DatabaseManager


@pytest.fixture
def temp_db():
    """Create a temporary database with test data."""
    with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as f:
        db_path = Path(f.name)
    
    # Initialize database
    db = DatabaseManager(db_path)
    db.initialize()
    
    # Insert test sessions
    db.execute("""
        INSERT INTO sessions (
            id, session_id, timestamp_start, timestamp_end, model, tool,
            total_turns, files_modified, status, user_email, prompt_text,
            api_cost, tokens_input, tokens_output,
            classification_domain, classification_risk, classification_rationale
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        'session-1',
        'session-1',
        1714600000,  # 2024-05-02 00:00:00 UTC
        1714603600,  # 2024-05-02 01:00:00 UTC
        'ibm/granite-3-8b-instruct',
        'ibm-bob',
        5,
        '["src/auth.py", "tests/test_auth.py"]',
        'active',
        'dev@example.com',
        'Implement user authentication',
        1.25,
        1000,
        500,
        'auth',
        'high',
        'Authentication is security-critical'
    ))
    
    db.execute("""
        INSERT INTO sessions (
            id, session_id, timestamp_start, timestamp_end, model, tool,
            total_turns, files_modified, status, user_email, prompt_text,
            api_cost, tokens_input, tokens_output,
            classification_domain, classification_risk, classification_rationale
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        'session-2',
        'session-2',
        1714610000,  # 2024-05-02 02:46:40 UTC
        1714613600,  # 2024-05-02 03:46:40 UTC
        'ibm/granite-3-8b-instruct',
        'ibm-bob',
        3,
        '["src/ui.py"]',
        'active',
        'dev@example.com',
        'Update UI components',
        0.75,
        800,
        400,
        'ui',
        'low',
        'UI changes are low risk'
    ))
    
    # Insert test commits
    db.execute("""
        INSERT INTO commits (
            sha, timestamp, author_name, author_email, message,
            files_changed, insertions, deletions
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        'abc123def456',
        1714604000,  # 2024-05-02 01:06:40 UTC (shortly after session-1)
        'Jane Developer',
        'dev@example.com',
        'feat: add authentication module',
        '["src/auth.py", "tests/test_auth.py"]',
        150,
        10
    ))
    
    db.execute("""
        INSERT INTO commits (
            sha, timestamp, author_name, author_email, message,
            files_changed, insertions, deletions
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        'def789ghi012',
        1714614000,  # 2024-05-02 03:53:20 UTC (shortly after session-2)
        'Jane Developer',
        'dev@example.com',
        'style: update UI styling',
        '["src/ui.py"]',
        50,
        5
    ))
    
    db.execute("""
        INSERT INTO commits (
            sha, timestamp, author_name, author_email, message,
            files_changed, insertions, deletions
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        'ghi345jkl678',
        1714620000,  # 2024-05-02 05:33:20 UTC (no matching session)
        'John Human',
        'john@example.com',
        'fix: manual bug fix',
        '["src/utils.py"]',
        20,
        15
    ))
    
    # Insert attributions
    db.execute("""
        INSERT INTO attributions (
            session_id, commit_sha, confidence, overlap_score,
            time_proximity, file_overlap
        ) VALUES (?, ?, ?, ?, ?, ?)
    """, (
        'session-1',
        'abc123def456',
        0.85,
        0.9,
        0.8,
        1.0
    ))
    
    db.execute("""
        INSERT INTO attributions (
            session_id, commit_sha, confidence, overlap_score,
            time_proximity, file_overlap
        ) VALUES (?, ?, ?, ?, ?, ?)
    """, (
        'session-2',
        'def789ghi012',
        0.75,
        0.8,
        0.7,
        1.0
    ))
    
    db.commit()
    db.close()
    
    yield db_path
    
    # Cleanup
    db_path.unlink()


def test_export_produces_valid_json(temp_db):
    """Test that export produces valid, parseable JSON."""
    with tempfile.NamedTemporaryFile(suffix='.json', delete=False) as f:
        output_path = Path(f.name)
    
    try:
        exporter = EUAIActExporter(temp_db)
        report = exporter.export(output_path=output_path)
        exporter.close()
        
        # Verify file was created
        assert output_path.exists()
        
        # Verify it's valid JSON
        with open(output_path, 'r') as f:
            data = json.load(f)
        
        # Verify required top-level keys
        assert 'schema_version' in data
        assert 'standard' in data
        assert 'generated_at' in data
        assert 'tool' in data
        assert 'tool_version' in data
        assert 'repo' in data
        assert 'filters' in data
        assert 'summary' in data
        assert 'records' in data
        
        # Verify schema version
        assert data['schema_version'] == '1.0'
        assert data['tool'] == 'lineage'
        
    finally:
        if output_path.exists():
            output_path.unlink()


def test_export_filters_by_date_range(temp_db):
    """Test that date filters correctly limit results."""
    with tempfile.NamedTemporaryFile(suffix='.json', delete=False) as f:
        output_path = Path(f.name)
    
    try:
        exporter = EUAIActExporter(temp_db)
        
        # Export only commits from 2024-05-02
        report = exporter.export(
            since='2024-05-02',
            until='2024-05-02',
            output_path=output_path
        )
        exporter.close()
        
        # All test commits are from 2024-05-02, so should get all attributions
        assert len(report['records']) == 2
        
        # Verify dates are in range
        for record in report['records']:
            commit_ts = datetime.fromisoformat(record['commit']['timestamp'].replace('Z', '+00:00'))
            assert commit_ts.date() == datetime(2024, 5, 2).date()
        
    finally:
        if output_path.exists():
            output_path.unlink()


def test_export_filters_by_min_confidence(temp_db):
    """Test that min_confidence filter works correctly."""
    with tempfile.NamedTemporaryFile(suffix='.json', delete=False) as f:
        output_path = Path(f.name)
    
    try:
        exporter = EUAIActExporter(temp_db)
        
        # Export with high confidence threshold (should only get session-1)
        report = exporter.export(
            min_confidence=0.8,
            output_path=output_path
        )
        exporter.close()
        
        # Only session-1 has confidence >= 0.8
        assert len(report['records']) == 1
        assert report['records'][0]['ai_session']['id'] == 'session-1'
        assert report['records'][0]['attribution']['confidence'] >= 0.8
        
    finally:
        if output_path.exists():
            output_path.unlink()


def test_export_summary_counts_match_records(temp_db):
    """Test that summary counts match the actual records."""
    with tempfile.NamedTemporaryFile(suffix='.json', delete=False) as f:
        output_path = Path(f.name)
    
    try:
        exporter = EUAIActExporter(temp_db)
        report = exporter.export(output_path=output_path)
        exporter.close()
        
        summary = report['summary']
        records = report['records']
        
        # AI-attributed commits should match records count
        assert summary['ai_attributed_commits'] == len(records)
        
        # Total commits should be >= AI-attributed commits
        assert summary['total_commits'] >= summary['ai_attributed_commits']
        
        # Human-only commits should be the difference
        expected_human = summary['total_commits'] - summary['ai_attributed_commits']
        assert summary['human_only_commits'] == expected_human
        
        # Total sessions should be >= 2 (we inserted 2)
        assert summary['total_sessions'] >= 2
        
    finally:
        if output_path.exists():
            output_path.unlink()


def test_export_includes_classification_when_present(temp_db):
    """Test that classification data is included in records."""
    with tempfile.NamedTemporaryFile(suffix='.json', delete=False) as f:
        output_path = Path(f.name)
    
    try:
        exporter = EUAIActExporter(temp_db)
        report = exporter.export(output_path=output_path)
        exporter.close()
        
        # Find the high-risk record (session-1)
        high_risk_record = None
        for record in report['records']:
            if record['ai_session']['id'] == 'session-1':
                high_risk_record = record
                break
        
        assert high_risk_record is not None
        assert high_risk_record['classification'] is not None
        assert high_risk_record['classification']['domain'] == 'auth'
        assert high_risk_record['classification']['risk_tier'] == 'high'
        assert 'rationale' in high_risk_record['classification']
        
        # Verify summary counts high-risk contributions
        assert report['summary']['high_risk_contributions'] >= 1
        
    finally:
        if output_path.exists():
            output_path.unlink()


def test_export_handles_no_attributions_gracefully(temp_db):
    """Test that export handles case with no attributions above threshold."""
    with tempfile.NamedTemporaryFile(suffix='.json', delete=False) as f:
        output_path = Path(f.name)
    
    try:
        exporter = EUAIActExporter(temp_db)
        
        # Use impossibly high confidence threshold
        report = exporter.export(
            min_confidence=0.99,
            output_path=output_path
        )
        exporter.close()
        
        # Should have empty records but valid summary
        assert len(report['records']) == 0
        assert report['summary']['ai_attributed_commits'] == 0
        assert report['summary']['total_commits'] >= 3  # We inserted 3 commits
        assert report['summary']['human_only_commits'] == report['summary']['total_commits']
        
        # Verify file is still valid JSON
        with open(output_path, 'r') as f:
            data = json.load(f)
        assert data == report
        
    finally:
        if output_path.exists():
            output_path.unlink()


def test_export_json_format(temp_db):
    """Test that JSON format produces simplified output."""
    with tempfile.NamedTemporaryFile(suffix='.json', delete=False) as f:
        output_path = Path(f.name)
    
    try:
        exporter = EUAIActExporter(temp_db)
        report = exporter.export(
            output_path=output_path,
            format_type='json'
        )
        exporter.close()
        
        # Read the file
        with open(output_path, 'r') as f:
            data = json.load(f)
        
        # JSON format should only have records key
        assert 'records' in data
        # Should not have the full wrapper
        assert 'schema_version' not in data
        assert 'standard' not in data
        
    finally:
        if output_path.exists():
            output_path.unlink()


def test_export_record_structure(temp_db):
    """Test that each record has the correct structure."""
    with tempfile.NamedTemporaryFile(suffix='.json', delete=False) as f:
        output_path = Path(f.name)
    
    try:
        exporter = EUAIActExporter(temp_db)
        report = exporter.export(output_path=output_path)
        exporter.close()
        
        assert len(report['records']) > 0
        
        # Check first record structure
        record = report['records'][0]
        
        # Required top-level keys
        assert 'record_id' in record
        assert 'commit' in record
        assert 'ai_session' in record
        assert 'classification' in record
        assert 'attribution' in record
        assert 'disposition' in record
        assert 'human_reviewer' in record
        
        # Commit structure
        commit = record['commit']
        assert 'sha' in commit
        assert 'author_email' in commit
        assert 'author_name' in commit
        assert 'timestamp' in commit
        assert 'message' in commit
        assert 'files_touched' in commit
        
        # AI session structure
        session = record['ai_session']
        assert 'id' in session
        assert 'tool' in session
        assert 'model' in session
        assert 'user_email' in session
        assert 'timestamp_start' in session
        assert 'timestamp_end' in session
        assert 'prompt_text' in session
        assert 'files_referenced' in session
        assert 'api_cost' in session
        assert 'tokens_input' in session
        assert 'tokens_output' in session
        
        # Attribution structure
        attribution = record['attribution']
        assert 'confidence' in attribution
        assert 'time_score' in attribution
        assert 'file_score' in attribution
        assert 'author_score' in attribution
        assert 'method' in attribution
        assert attribution['method'] == 'heuristic-v1'
        
        # Human reviewer structure
        reviewer = record['human_reviewer']
        assert 'email' in reviewer
        assert 'review_type' in reviewer
        assert reviewer['review_type'] == 'implicit-commit'
        
    finally:
        if output_path.exists():
            output_path.unlink()


def test_export_api_cost_calculation(temp_db):
    """Test that API costs are correctly summed in summary."""
    with tempfile.NamedTemporaryFile(suffix='.json', delete=False) as f:
        output_path = Path(f.name)
    
    try:
        exporter = EUAIActExporter(temp_db)
        report = exporter.export(output_path=output_path)
        exporter.close()
        
        # Calculate expected cost from records
        expected_cost = sum(r['ai_session']['api_cost'] for r in report['records'])
        
        # Should match summary (with rounding tolerance)
        assert abs(report['summary']['total_api_cost'] - expected_cost) < 0.01
        
        # Should be 2.0 (1.25 + 0.75) for our test data
        assert abs(report['summary']['total_api_cost'] - 2.0) < 0.01
        
    finally:
        if output_path.exists():
            output_path.unlink()


# Made with Bob
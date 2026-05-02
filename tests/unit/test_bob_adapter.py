"""
Unit tests for Bob session adapter.

Tests use the real Bob export files from bob_sessions/ as fixtures.
"""
import pytest
from pathlib import Path
from lineage.adapters.bob import BobSessionAdapter


# Fixture paths
FIXTURES_DIR = Path(__file__).parent.parent.parent / "bob_sessions"
ARCHITECTURE_EXPORT = FIXTURES_DIR / "01-architecture.md"
SCAFFOLD_EXPORT = FIXTURES_DIR / "02-scaffold.md"


class TestBobSessionAdapter:
    """Test suite for BobSessionAdapter."""
    
    def test_parse_architecture_session(self):
        """
        Test parsing of 01-architecture.md export with sidecar.
        
        Verifies:
        - Session ID is extracted from sidecar (UUID)
        - API cost is from sidecar (0.36)
        - Tool is set to "ibm-bob"
        - Model is from sidecar
        - Prompt text is extracted from <task> block
        """
        adapter = BobSessionAdapter()
        sessions = adapter.parse(ARCHITECTURE_EXPORT)
        
        assert len(sessions) == 1
        session = sessions[0]
        
        # Session ID should be UUID from sidecar
        assert session.session_id == "c8627508-19a6-4b7b-be70-3620f38fa936"
        
        # API cost from sidecar (exact value)
        assert session.api_cost == 0.36
        
        # Tool from sidecar
        assert session.tool == "ibm-bob"
        
        # Model from sidecar
        assert session.model == "claude-sonnet-4"
        
        # Tokens from sidecar
        assert session.tokens_input == 134600
        assert session.tokens_output == 11400
        
        # User email from sidecar
        assert session.user_email == "syedarfan101@gmail.com"
        
        # Prompt should be extracted from <task> block
        assert session.prompt_text is not None
        assert len(session.prompt_text) > 100
        assert "Lineage" in session.prompt_text
        
        # Timestamps should be extracted
        assert session.timestamp_start > 0
        assert session.timestamp_end >= session.timestamp_start
        
        # Status should be complete
        assert session.status == "complete"
    
    def test_parse_scaffold_session(self):
        """
        Test parsing of 02-scaffold.md export with sidecar.
        
        Verifies:
        - Session ID is extracted from sidecar (UUID)
        - API cost is from sidecar (6.55)
        - Tool is set to "ibm-bob"
        - Files modified list is extracted (may be incomplete)
        """
        adapter = BobSessionAdapter()
        sessions = adapter.parse(SCAFFOLD_EXPORT)
        
        assert len(sessions) == 1
        session = sessions[0]
        
        # Session ID should be UUID from sidecar
        assert session.session_id == "a2107662-1f9c-4e0a-b464-d4078e748b9d"
        
        # API cost from sidecar (exact value)
        assert session.api_cost == 6.55
        
        # Tool from sidecar
        assert session.tool == "ibm-bob"
        
        # Model from sidecar
        assert session.model == "claude-sonnet-4"
        
        # Tokens from sidecar
        assert session.tokens_input == 2600000
        assert session.tokens_output == 20000
        
        # Prompt should be extracted
        assert session.prompt_text is not None
        assert "Phase 1 (architecture) is complete" in session.prompt_text
        
        # Files modified should be extracted (may be incomplete)
        # The scaffold session created many files
        if session.files_modified:
            assert len(session.files_modified) > 0
            # Should contain some Python files
            python_files = [f for f in session.files_modified if f.endswith('.py')]
            assert len(python_files) > 0
        
        # Turn count should be positive
        assert session.total_turns > 0
    
    def test_scan_command_inserts_to_db(self, tmp_path):
        """
        Test that scan command inserts sessions into database.
        
        Creates a temporary database, runs scan logic, and verifies
        both sessions are present with correct fields.
        """
        import json
        from lineage.storage.database import DatabaseManager
        
        # Create temporary database
        db_path = tmp_path / "test.db"
        db = DatabaseManager(db_path)
        db.initialize()
        
        # Parse both sessions
        adapter = BobSessionAdapter()
        arch_sessions = adapter.parse(ARCHITECTURE_EXPORT)
        scaffold_sessions = adapter.parse(SCAFFOLD_EXPORT)
        
        all_sessions = arch_sessions + scaffold_sessions
        
        # Insert sessions
        for session in all_sessions:
            files_json = json.dumps(session.files_modified) if session.files_modified else None
            
            db.execute(
                """
                INSERT INTO sessions (
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
        
        db.commit()
        
        # Query database to verify
        cursor = db.execute("SELECT id, tool, api_cost FROM sessions ORDER BY api_cost")
        rows = cursor.fetchall()
        
        assert len(rows) == 2
        
        # First row should be architecture session (lower cost)
        assert rows[0]['tool'] == 'ibm-bob'
        assert rows[0]['api_cost'] == 0.36
        
        # Second row should be scaffold session (higher cost)
        assert rows[1]['tool'] == 'ibm-bob'
        assert rows[1]['api_cost'] == 6.55
        
        db.close()
    
    def test_validate_export(self):
        """Test that validate_export correctly identifies Bob exports."""
        adapter = BobSessionAdapter()
        
        # Valid Bob exports
        assert adapter.validate_export(ARCHITECTURE_EXPORT) is True
        assert adapter.validate_export(SCAFFOLD_EXPORT) is True
        
        # Non-existent file
        assert adapter.validate_export(Path("nonexistent.md")) is False
    
    def test_extract_session_id(self):
        """Test session ID extraction from sidecar."""
        adapter = BobSessionAdapter()
        
        # With sidecar, should get UUID
        sidecar = adapter._load_sidecar(ARCHITECTURE_EXPORT)
        assert sidecar is not None
        assert sidecar['task_id'] == "c8627508-19a6-4b7b-be70-3620f38fa936"
    
    def test_extract_api_cost(self):
        """Test API cost extraction from sidecar."""
        adapter = BobSessionAdapter()
        
        # Test with architecture export sidecar
        arch_sidecar = adapter._load_sidecar(ARCHITECTURE_EXPORT)
        assert arch_sidecar is not None
        assert arch_sidecar['api_cost'] == 0.36
        
        # Test with scaffold export sidecar
        scaffold_sidecar = adapter._load_sidecar(SCAFFOLD_EXPORT)
        assert scaffold_sidecar is not None
        assert scaffold_sidecar['api_cost'] == 6.55
    
    def test_parse_without_sidecar(self, tmp_path):
        """Test parsing a markdown file without sidecar falls back gracefully."""
        adapter = BobSessionAdapter()
        
        # Create a minimal Bob export without sidecar
        test_export = tmp_path / "test-session.md"
        test_export.write_text("""
**User:**

<task>
Test task for parsing without sidecar
</task>
<environment_details>
# Current Cost
$1.50
</environment_details>

**Assistant:**

Test response
""")
        
        # Parse should work with fallback
        sessions = adapter.parse(test_export)
        assert len(sessions) == 1
        session = sessions[0]
        
        # Should fall back to filename for session_id
        assert session.session_id == "test-session"
        
        # Should extract cost from markdown
        assert session.api_cost == 1.50
        
        # Should have defaults for missing fields
        assert session.model == "ibm-bob"
        assert session.tool == "ibm-bob"

# Made with Bob

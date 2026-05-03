"""
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
        """
        Initialize cache with database connection.
        
        Args:
            db: DatabaseManager instance
        """
        self.db = db
    
    def get(self, session_id: str) -> Optional[Dict[str, str]]:
        """
        Get cached classification for a session.
        
        Args:
            session_id: Session identifier
            
        Returns:
            dict with domain, risk_tier, rationale if found, None otherwise
        """
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
        
        # Check if classification exists (all three fields must be non-null)
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
        """
        Store classification for a session.
        
        Args:
            session_id: Session identifier
            classification: dict with domain, risk_tier, rationale
        """
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
        """
        Get all sessions that need classification.
        
        Returns sessions where classification_domain is NULL.
        
        Returns:
            list: Session objects needing classification
        """
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
            # Parse files_modified JSON
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
        """
        Get all sessions regardless of classification status.
        
        Returns:
            list: All Session objects
        """
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
            # Parse files_modified JSON
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

# Made with Bob

"""
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
        """
        Initialize database manager.
        
        Args:
            db_path: Path to SQLite database file
        """
        self.db_path = Path(db_path)
        self.connection: Optional[sqlite3.Connection] = None
        self._connect()
    
    def _connect(self):
        """Establish database connection with optimized settings."""
        self.connection = sqlite3.connect(
            self.db_path,
            check_same_thread=False,  # Allow multi-threaded access
            timeout=30.0,  # 30 second timeout for locks
        )
        # Enable foreign key constraints
        self.connection.execute("PRAGMA foreign_keys = ON")
        # Use WAL mode for better concurrency
        self.connection.execute("PRAGMA journal_mode = WAL")
        # Row factory for dict-like access
        self.connection.row_factory = sqlite3.Row
    
    def initialize(self):
        """
        Initialize database schema idempotently.
        
        Creates all tables and indexes if they don't exist. Safe to call
        multiple times - uses CREATE TABLE IF NOT EXISTS.
        """
        if not self.connection:
            self._connect()
        
        cursor = self.connection.cursor()
        
        # Execute all schema statements
        for statement in get_schema_statements():
            cursor.execute(statement)
        
        # Record schema version
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
        """Context manager entry - returns self for connection access."""
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
        return False  # Don't suppress exceptions
    
    def execute(self, query: str, params: tuple = ()):
        """
        Execute a query and return cursor.
        
        Args:
            query: SQL query string
            params: Query parameters (tuple)
            
        Returns:
            sqlite3.Cursor: Cursor with query results
        """
        if not self.connection:
            self._connect()
        return self.connection.execute(query, params)
    
    def executemany(self, query: str, params_list: list):
        """
        Execute a query with multiple parameter sets.
        
        Args:
            query: SQL query string
            params_list: List of parameter tuples
            
        Returns:
            sqlite3.Cursor: Cursor after execution
        """
        if not self.connection:
            self._connect()
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
        """
        Get list of all table names in database.
        
        Returns:
            list: Table names
        """
        cursor = self.execute(
            "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
        )
        return [row[0] for row in cursor.fetchall()]
    
    def table_exists(self, table_name: str) -> bool:
        """
        Check if a table exists in the database.
        
        Args:
            table_name: Name of table to check
            
        Returns:
            bool: True if table exists
        """
        cursor = self.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
            (table_name,)
        )
        return cursor.fetchone() is not None

# Made with Bob

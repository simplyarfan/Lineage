"""
SQLite schema definitions for Lineage database.

Implements the full schema from ARCHITECTURE.md with tables for sessions,
commits, attributions, file_lines, and reviews.
"""

# Schema version for future migrations
SCHEMA_VERSION = "0.1.0"

# SQL statements for creating tables
CREATE_SESSIONS_TABLE = """
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    timestamp_start INTEGER NOT NULL,
    timestamp_end INTEGER NOT NULL,
    model TEXT NOT NULL,
    total_turns INTEGER DEFAULT 0,
    files_modified TEXT,  -- JSON array of file paths
    status TEXT DEFAULT 'active',
    user_email TEXT,
    prompt_text TEXT,
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
    files_changed TEXT,  -- JSON array of file paths
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
    decision TEXT NOT NULL,  -- 'approved', 'rejected', 'needs-revision'
    notes TEXT,
    reviewed_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (attribution_id) REFERENCES attributions(id)
);
"""

# Index definitions for query optimization
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

# Schema metadata table
CREATE_SCHEMA_VERSION_TABLE = """
CREATE TABLE IF NOT EXISTS schema_version (
    version TEXT PRIMARY KEY,
    applied_at INTEGER DEFAULT (strftime('%s', 'now'))
);
"""

# All schema statements in order
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
    """
    Return all schema creation statements in order.
    
    Returns:
        list: SQL statements for creating tables and indexes
    """
    return ALL_SCHEMA_STATEMENTS

# Made with Bob

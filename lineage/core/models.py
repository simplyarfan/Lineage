"""
Pydantic models for Lineage data structures.

Models match the SQLite schema exactly and provide validation for all data types.
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator


class Session(BaseModel):
    """
    AI coding session model.
    
    Represents a single AI-assisted coding session with metadata about
    prompts, files modified, model used, and classification.
    """
    id: str = Field(..., description="Unique session identifier")
    session_id: str = Field(..., description="Session ID from AI tool export")
    timestamp_start: int = Field(..., description="Session start timestamp (Unix epoch)")
    timestamp_end: int = Field(..., description="Session end timestamp (Unix epoch)")
    model: str = Field(..., description="AI model identifier (e.g., granite-3-8b)")
    total_turns: int = Field(default=0, description="Number of conversation turns")
    files_modified: Optional[List[str]] = Field(default=None, description="List of modified file paths")
    status: str = Field(default="active", description="Session status")
    user_email: Optional[str] = Field(default=None, description="User email address")
    prompt_text: Optional[str] = Field(default=None, description="Primary prompt text")
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
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "bob-20260501-001",
                "session_id": "bob-20260501-001",
                "timestamp_start": 1714600000,
                "timestamp_end": 1714603600,
                "model": "ibm/granite-3-8b-instruct",
                "total_turns": 5,
                "files_modified": ["src/main.py", "tests/test_main.py"],
                "status": "active",
                "user_email": "dev@example.com",
                "prompt_text": "Implement user authentication",
            }
        }


class Commit(BaseModel):
    """
    Git commit model.
    
    Represents a single git commit with metadata for attribution matching.
    """
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
        if len(v) not in [7, 40]:  # Allow short or full SHA
            raise ValueError("SHA must be 7 or 40 characters")
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "sha": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
                "timestamp": 1714603700,
                "author_name": "Jane Developer",
                "author_email": "jane@example.com",
                "message": "feat: add authentication module",
                "files_changed": ["src/auth.py", "tests/test_auth.py"],
                "insertions": 150,
                "deletions": 10,
            }
        }


class Attribution(BaseModel):
    """
    Session-to-commit attribution model.
    
    Links an AI session to a git commit with confidence scoring.
    """
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
    
    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "bob-20260501-001",
                "commit_sha": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
                "confidence": 0.85,
                "overlap_score": 0.9,
                "time_proximity": 0.8,
                "file_overlap": 0.9,
            }
        }


class FileLine(BaseModel):
    """
    File line attribution model.
    
    Tracks attribution for individual lines of code.
    """
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
        """Ensure line number is positive."""
        if v < 1:
            raise ValueError("Line number must be >= 1")
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "file_path": "src/auth.py",
                "line_number": 42,
                "content": "def authenticate(user, password):",
                "commit_sha": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
                "session_id": "bob-20260501-001",
                "attribution_confidence": 0.85,
            }
        }


class Review(BaseModel):
    """
    Human review record model.
    
    Tracks human oversight of AI-generated code for compliance.
    """
    id: Optional[int] = Field(default=None, description="Database primary key")
    attribution_id: int = Field(..., description="Reference to attribution")
    reviewer: str = Field(..., description="Reviewer identifier (email)")
    decision: str = Field(..., description="Review decision (approved/rejected/needs-revision)")
    notes: Optional[str] = Field(default=None, description="Review notes")
    reviewed_at: Optional[int] = Field(default=None, description="Review timestamp")
    
    @field_validator('decision')
    @classmethod
    def validate_decision(cls, v):
        """Ensure decision is valid."""
        valid_decisions = ['approved', 'rejected', 'needs-revision']
        if v not in valid_decisions:
            raise ValueError(f"Decision must be one of: {', '.join(valid_decisions)}")
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "attribution_id": 1,
                "reviewer": "senior-dev@example.com",
                "decision": "approved",
                "notes": "Code quality looks good, tests pass",
            }
        }

# Made with Bob

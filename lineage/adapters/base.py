"""
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

# Made with Bob

"""
IBM Bob session adapter.

Parses Bob's markdown conversation transcript exports into Session objects.
Bob exports are markdown files containing the full conversation history with
embedded environment metadata and cost tracking.

Supports sidecar .meta.json files for accurate session metadata (Task ID,
API cost, tokens) that isn't embedded in the markdown exports.
"""
import re
import json
import logging
from pathlib import Path
from typing import List, Optional, Dict
from datetime import datetime
from lineage.adapters.base import SessionAdapter
from lineage.core.models import Session

logger = logging.getLogger(__name__)


class BobSessionAdapter(SessionAdapter):
    """
    Parser for IBM Bob markdown session exports.
    
    Bob exports are conversation transcripts with:
    - Initial <task> block containing the user's prompt
    - Multiple environment_details blocks with timestamps and costs
    - Tool calls showing file operations
    - Final cost summary
    
    Supports sidecar .meta.json files containing accurate consumption
    metadata (Task ID, API cost, tokens) from Bob's UI panel.
    """
    
    def parse(self, export_path: Path) -> List[Session]:
        """
        Parse a Bob markdown export into a Session object.
        
        Args:
            export_path: Path to the .md export file
            
        Returns:
            List containing a single Session object
            
        Raises:
            ValueError: If export format is invalid
            FileNotFoundError: If export_path doesn't exist
        """
        if not export_path.exists():
            raise FileNotFoundError(f"Export file not found: {export_path}")
        
        if not self.validate_export(export_path):
            raise ValueError(f"Invalid Bob export format: {export_path}")
        
        content = export_path.read_text(encoding='utf-8')
        
        # Try to load sidecar metadata
        sidecar = self._load_sidecar(export_path)
        
        # Extract session metadata (prefer sidecar, fallback to markdown)
        if sidecar:
            session_id = sidecar.get('task_id', export_path.stem)
            model = sidecar.get('model', 'ibm-bob')
            tool = sidecar.get('tool', 'ibm-bob')
            api_cost = sidecar.get('api_cost', 0.0)
            tokens_input = sidecar.get('tokens_input', 0)
            tokens_output = sidecar.get('tokens_output', 0)
            user_email = sidecar.get('user_email')
            
            # Parse timestamp from sidecar
            timestamp_str = sidecar.get('timestamp')
            if timestamp_str:
                try:
                    dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
                    timestamp_start = int(dt.timestamp())
                    timestamp_end = timestamp_start  # Sidecar has single timestamp
                except Exception as e:
                    logger.warning(f"Failed to parse sidecar timestamp: {e}")
                    timestamps = self._extract_timestamps(content)
                    timestamp_start = timestamps['start']
                    timestamp_end = timestamps['end']
            else:
                timestamps = self._extract_timestamps(content)
                timestamp_start = timestamps['start']
                timestamp_end = timestamps['end']
        else:
            # Fallback to markdown parsing
            logger.warning(
                f"No sidecar found for {export_path.name} — using filename as session_id. "
                f"Create a .meta.json sidecar for accurate session tracking."
            )
            session_id = self._extract_session_id(export_path, content)
            model = "ibm-bob"
            tool = "ibm-bob"
            api_cost = self._extract_api_cost(content)
            tokens = self._extract_tokens(content)
            tokens_input = tokens['input']
            tokens_output = tokens['output']
            user_email = None
            timestamps = self._extract_timestamps(content)
            timestamp_start = timestamps['start']
            timestamp_end = timestamps['end']
        
        # Always extract from markdown (not in sidecar)
        prompt_text = self._extract_prompt(content)
        files_modified = self._extract_files_modified(content)
        
        # Create Session object
        session = Session(
            id=session_id,
            session_id=session_id,
            timestamp_start=timestamp_start,
            timestamp_end=timestamp_end,
            model=model,
            tool=tool,
            total_turns=self._count_turns(content),
            files_modified=files_modified,
            status="complete",
            user_email=user_email,
            prompt_text=prompt_text,
            api_cost=api_cost,
            tokens_input=tokens_input,
            tokens_output=tokens_output,
        )
        
        logger.info(f"Parsed Bob session: {session_id} (cost: ${api_cost:.2f})")
        return [session]
    
    def validate_export(self, export_path: Path) -> bool:
        """
        Check if file is a valid Bob markdown export.
        
        Args:
            export_path: Path to the export file
            
        Returns:
            True if file appears to be a Bob export
        """
        if not export_path.suffix == '.md':
            return False
        
        try:
            content = export_path.read_text(encoding='utf-8')
            # Bob exports have characteristic markers
            has_task = '<task>' in content
            has_env_details = '# Current Cost' in content or 'environment_details' in content
            return has_task and has_env_details
        except Exception as e:
            logger.warning(f"Failed to validate {export_path}: {e}")
            return False
    
    def _load_sidecar(self, export_path: Path) -> Optional[Dict]:
        """
        Load sidecar .meta.json file if it exists.
        
        For export at path/to/01-architecture.md, looks for
        path/to/01-architecture.meta.json
        
        Args:
            export_path: Path to the .md export file
            
        Returns:
            Dict with sidecar metadata, or None if not found
        """
        # Construct sidecar path: replace .md with .meta.json
        sidecar_path = export_path.with_suffix('').with_suffix('.meta.json')
        
        if not sidecar_path.exists():
            return None
        
        try:
            with open(sidecar_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            logger.debug(f"Loaded sidecar metadata from {sidecar_path.name}")
            return data
        except Exception as e:
            logger.warning(f"Failed to load sidecar {sidecar_path.name}: {e}")
            return None
    
    def _extract_session_id(self, export_path: Path, content: str) -> str:
        """
        Extract or generate session ID from markdown content.
        
        Bob exports may contain Task IDs in the consumption summary metadata.
        The Task ID is a UUID in format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
        
        Fallback to filename stem if Task ID can't be extracted.
        """
        # Try to find Task Id UUID in content
        # Pattern matches standard UUID format (8-4-4-4-12 hex digits)
        task_id_match = re.search(
            r'Task\s+Id[:\s]+([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})',
            content,
            re.IGNORECASE
        )
        if task_id_match:
            return task_id_match.group(1)
        
        # Fallback: use filename stem as session ID
        return export_path.stem
    
    def _extract_prompt(self, content: str) -> Optional[str]:
        """
        Extract the initial user prompt from the <task> block.
        
        Returns the first <task>...</task> content, which is the primary
        instruction that defines the session's intent.
        """
        task_match = re.search(r'<task>(.*?)</task>', content, re.DOTALL)
        if task_match:
            prompt = task_match.group(1).strip()
            # Truncate if extremely long (keep first 5000 chars)
            if len(prompt) > 5000:
                prompt = prompt[:5000] + "... [truncated]"
            return prompt
        
        logger.warning("No <task> block found in export")
        return None
    
    def _extract_timestamps(self, content: str) -> dict:
        """
        Extract start and end timestamps from environment_details blocks.
        
        Returns dict with 'start' and 'end' Unix timestamps.
        Falls back to file mtime if timestamps can't be parsed.
        """
        # Find all timestamp entries
        timestamp_pattern = r'Current time in ISO 8601 UTC format: ([\d-]+T[\d:.]+Z)'
        matches = re.findall(timestamp_pattern, content)
        
        if matches:
            try:
                # First timestamp is start, last is end
                start_dt = datetime.fromisoformat(matches[0].replace('Z', '+00:00'))
                end_dt = datetime.fromisoformat(matches[-1].replace('Z', '+00:00'))
                return {
                    'start': int(start_dt.timestamp()),
                    'end': int(end_dt.timestamp())
                }
            except Exception as e:
                logger.warning(f"Failed to parse timestamps: {e}")
        
        # Fallback: use current time
        now = int(datetime.now().timestamp())
        return {'start': now, 'end': now}
    
    def _extract_api_cost(self, content: str) -> float:
        """
        Extract final API cost from the session.
        
        Looks for the last "# Current Cost" entry or final cost summary.
        Returns 0.0 if cost can't be determined.
        """
        # Find all cost entries
        cost_pattern = r'# Current Cost\s+\$([0-9]+\.[0-9]+)'
        matches = re.findall(cost_pattern, content)
        
        if matches:
            try:
                # Last cost entry is the final cost
                return float(matches[-1])
            except ValueError as e:
                logger.warning(f"Failed to parse cost: {e}")
        
        # Try alternative pattern: "Coin cost: $X.XX"
        alt_pattern = r'[Cc]oin cost[:\s]+\$?([0-9]+\.[0-9]+)'
        alt_matches = re.findall(alt_pattern, content)
        if alt_matches:
            try:
                return float(alt_matches[-1])
            except ValueError:
                pass
        
        logger.warning("No API cost found in export")
        return 0.0
    
    def _extract_tokens(self, content: str) -> dict:
        """
        Extract token counts from the session.
        
        Bob exports don't consistently expose token counts.
        Returns dict with 'input' and 'output' (both may be 0).
        """
        # Look for token patterns (if they exist)
        input_pattern = r'Input Tokens[:\s]+([0-9,]+)'
        output_pattern = r'Output Tokens[:\s]+([0-9,]+)'
        
        input_match = re.search(input_pattern, content, re.IGNORECASE)
        output_match = re.search(output_pattern, content, re.IGNORECASE)
        
        input_tokens = 0
        output_tokens = 0
        
        if input_match:
            try:
                input_tokens = int(input_match.group(1).replace(',', ''))
            except ValueError:
                pass
        
        if output_match:
            try:
                output_tokens = int(output_match.group(1).replace(',', ''))
            except ValueError:
                pass
        
        return {'input': input_tokens, 'output': output_tokens}
    
    def _extract_files_modified(self, content: str) -> Optional[List[str]]:
        """
        Extract list of files modified during the session.
        
        Parses tool calls for file operations: write_to_file, apply_diff,
        insert_content, etc. Returns unique list of file paths.
        
        Note: This list may be incomplete. Phase 4 attribution will
        compensate via git diff matching.
        """
        files = set()
        
        # Pattern for tool calls with file paths
        patterns = [
            r'<path>([^<]+)</path>',  # XML-style tool calls
            r'write_to_file.*?["\']([^"\']+)["\']',  # Function-style
            r'apply_diff.*?["\']([^"\']+)["\']',
            r'insert_content.*?["\']([^"\']+)["\']',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, content)
            files.update(matches)
        
        # Filter out non-file paths (e.g., URLs, commands)
        valid_files = [
            f for f in files 
            if not f.startswith('http') 
            and not f.startswith('$')
            and '/' in f or '\\' in f or '.' in f
        ]
        
        return valid_files if valid_files else None
    
    def _count_turns(self, content: str) -> int:
        """
        Count conversation turns (user/assistant exchanges).
        
        Counts occurrences of "**User:**" and "**Assistant:**" markers.
        """
        user_turns = len(re.findall(r'\*\*User:\*\*', content))
        assistant_turns = len(re.findall(r'\*\*Assistant:\*\*', content))
        
        # Total turns is the sum (each exchange is 2 turns)
        return user_turns + assistant_turns

# Made with Bob

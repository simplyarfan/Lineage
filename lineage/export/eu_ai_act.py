"""
EU AI Act Article 12 compliant audit export.

Generates comprehensive audit trails of AI-attributed contributions
for regulatory compliance with EU AI Act record-keeping requirements.
"""
import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any, List
import subprocess

from lineage.storage.database import DatabaseManager


class EUAIActExporter:
    """
    Exports AI attribution data in EU AI Act Article 12 compliant format.
    
    Article 12 requires providers of high-risk AI systems to maintain
    detailed logs of system operations, including:
    - Period of use
    - Reference database against which input data has been checked
    - Input data for which the search has led to a match
    - Identification of natural persons involved in verification
    """
    
    def __init__(self, db_path: Path):
        """
        Initialize exporter with database connection.
        
        Args:
            db_path: Path to Lineage SQLite database
        """
        self.db_path = Path(db_path)
        self.db = DatabaseManager(self.db_path)
    
    def export(
        self,
        since: Optional[str] = None,
        until: Optional[str] = None,
        min_confidence: float = 0.4,
        output_path: Path = Path("./audit-report.json"),
        format_type: str = "eu-ai-act"
    ) -> Dict[str, Any]:
        """
        Generate audit report with optional filters.
        
        Args:
            since: Start date filter (YYYY-MM-DD), optional
            until: End date filter (YYYY-MM-DD), optional
            min_confidence: Minimum attribution confidence (0.0-1.0)
            output_path: Output file path
            format_type: Export format ('eu-ai-act' or 'json')
            
        Returns:
            dict: Complete audit report data structure
        """
        # Convert date strings to Unix timestamps if provided
        since_ts = self._parse_date(since) if since else None
        until_ts = self._parse_date_end(until) if until else None
        
        # Get repository metadata
        repo_path = self.db_path.parent.parent
        repo_metadata = self._get_repo_metadata(repo_path)
        
        # Build the report
        report = {
            "schema_version": "1.0",
            "standard": "EU AI Act Article 12 — Record-keeping",
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "tool": "lineage",
            "tool_version": "0.1.0",
            "repo": repo_metadata,
            "filters": {
                "since": since,
                "until": until,
                "min_confidence": min_confidence
            },
            "summary": {},
            "records": []
        }
        
        # Fetch all attributions with their related data
        records = self._fetch_attribution_records(since_ts, until_ts, min_confidence)
        report["records"] = records
        
        # Calculate summary statistics
        report["summary"] = self._calculate_summary(records, since_ts, until_ts)
        
        # Write to file based on format
        if format_type == "json":
            # Simplified JSON format - just records
            output_data = {"records": records}
        else:
            # Full EU AI Act format
            output_data = report
        
        # Write with pretty printing
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        return report
    
    def _parse_date(self, date_str: str) -> int:
        """
        Parse YYYY-MM-DD date string to Unix timestamp at start of day (00:00:00 UTC).
        
        Args:
            date_str: Date in YYYY-MM-DD format
            
        Returns:
            int: Unix timestamp
        """
        dt = datetime.strptime(date_str, "%Y-%m-%d")
        return int(dt.timestamp())
    
    def _parse_date_end(self, date_str: str) -> int:
        """
        Parse YYYY-MM-DD date string to Unix timestamp at end of day (23:59:59 UTC).
        
        Args:
            date_str: Date in YYYY-MM-DD format
            
        Returns:
            int: Unix timestamp at end of day
        """
        dt = datetime.strptime(date_str, "%Y-%m-%d")
        # Add 86399 seconds (23:59:59) to get end of day
        return int(dt.timestamp()) + 86399
    
    def _get_repo_metadata(self, repo_path: Path) -> Dict[str, Any]:
        """
        Extract git repository metadata.
        
        Args:
            repo_path: Path to git repository
            
        Returns:
            dict: Repository metadata
        """
        metadata = {
            "path": str(repo_path.resolve()),
            "head_sha": None,
            "remote_url": None
        }
        
        try:
            # Get current HEAD SHA
            result = subprocess.run(
                ["git", "rev-parse", "HEAD"],
                cwd=repo_path,
                capture_output=True,
                text=True,
                check=True
            )
            metadata["head_sha"] = result.stdout.strip()
            
            # Get remote URL
            result = subprocess.run(
                ["git", "config", "--get", "remote.origin.url"],
                cwd=repo_path,
                capture_output=True,
                text=True,
                check=False
            )
            if result.returncode == 0:
                metadata["remote_url"] = result.stdout.strip()
        except Exception:
            # If git commands fail, leave as None
            pass
        
        return metadata
    
    def _fetch_attribution_records(
        self,
        since_ts: Optional[int],
        until_ts: Optional[int],
        min_confidence: float
    ) -> List[Dict[str, Any]]:
        """
        Fetch all attribution records matching filters.
        
        Args:
            since_ts: Start timestamp filter (Unix epoch)
            until_ts: End timestamp filter (Unix epoch)
            min_confidence: Minimum confidence threshold
            
        Returns:
            list: Attribution records in EU AI Act format
        """
        # Build query with filters
        query = """
            SELECT
                a.session_id,
                a.commit_sha,
                a.confidence,
                a.time_proximity,
                a.file_overlap,
                a.overlap_score,
                s.id as session_db_id,
                s.tool,
                s.model,
                s.user_email,
                s.timestamp_start,
                s.timestamp_end,
                s.prompt_text,
                s.files_modified,
                s.api_cost,
                s.tokens_input,
                s.tokens_output,
                s.classification_domain,
                s.classification_risk,
                s.classification_rationale,
                c.timestamp as commit_timestamp,
                c.author_name,
                c.author_email,
                c.message,
                c.files_changed
            FROM attributions a
            JOIN sessions s ON a.session_id = s.session_id
            JOIN commits c ON a.commit_sha = c.sha
            WHERE a.confidence >= ?
        """
        
        params = [min_confidence]
        
        if since_ts is not None:
            query += " AND c.timestamp >= ?"
            params.append(since_ts)
        
        if until_ts is not None:
            query += " AND c.timestamp <= ?"
            params.append(until_ts)
        
        query += " ORDER BY c.timestamp DESC"
        
        cursor = self.db.execute(query, tuple(params))
        rows = cursor.fetchall()
        
        records = []
        for row in rows:
            # Parse JSON fields
            files_modified = json.loads(row['files_modified']) if row['files_modified'] else []
            files_changed = json.loads(row['files_changed']) if row['files_changed'] else []
            
            # Build record in EU AI Act format
            record = {
                "record_id": str(uuid.uuid4()),
                "commit": {
                    "sha": row['commit_sha'],
                    "author_email": row['author_email'],
                    "author_name": row['author_name'],
                    "timestamp": datetime.fromtimestamp(row['commit_timestamp']).isoformat() + "Z",
                    "message": row['message'] or "",
                    "files_touched": files_changed
                },
                "ai_session": {
                    "id": row['session_id'],
                    "tool": row['tool'],
                    "model": row['model'],
                    "user_email": row['user_email'] or "",
                    "timestamp_start": datetime.fromtimestamp(row['timestamp_start']).isoformat() + "Z",
                    "timestamp_end": datetime.fromtimestamp(row['timestamp_end']).isoformat() + "Z",
                    "prompt_text": row['prompt_text'] or "",
                    "files_referenced": files_modified,
                    "api_cost": float(row['api_cost']) if row['api_cost'] else 0.0,
                    "tokens_input": row['tokens_input'] or 0,
                    "tokens_output": row['tokens_output'] or 0
                },
                "classification": None,
                "attribution": {
                    "confidence": float(row['confidence']),
                    "time_score": float(row['time_proximity']) if row['time_proximity'] else 0.0,
                    "file_score": float(row['file_overlap']) if row['file_overlap'] else 0.0,
                    "author_score": float(row['overlap_score']) if row['overlap_score'] else 0.0,
                    "method": "heuristic-v1"
                },
                "disposition": "committed",
                "human_reviewer": {
                    "email": row['author_email'],
                    "review_type": "implicit-commit"
                }
            }
            
            # Add classification if present
            if row['classification_domain'] and row['classification_risk']:
                record["classification"] = {
                    "domain": row['classification_domain'],
                    "risk_tier": row['classification_risk'],
                    "rationale": row['classification_rationale'] or ""
                }
            
            records.append(record)
        
        return records
    
    def _calculate_summary(
        self,
        records: List[Dict[str, Any]],
        since_ts: Optional[int],
        until_ts: Optional[int]
    ) -> Dict[str, Any]:
        """
        Calculate summary statistics for the report.
        
        Args:
            records: List of attribution records
            since_ts: Start timestamp filter
            until_ts: End timestamp filter
            
        Returns:
            dict: Summary statistics
        """
        # Count AI-attributed commits
        ai_attributed_commits = len(records)
        
        # Get total commits in range
        query = "SELECT COUNT(*) as count FROM commits WHERE 1=1"
        params = []
        
        if since_ts is not None:
            query += " AND timestamp >= ?"
            params.append(since_ts)
        
        if until_ts is not None:
            query += " AND timestamp <= ?"
            params.append(until_ts)
        
        cursor = self.db.execute(query, tuple(params))
        total_commits = cursor.fetchone()['count']
        
        # Calculate human-only commits
        human_only_commits = total_commits - ai_attributed_commits
        
        # Get total sessions
        cursor = self.db.execute("SELECT COUNT(*) as count FROM sessions")
        total_sessions = cursor.fetchone()['count']
        
        # Calculate total API cost
        total_api_cost = sum(r['ai_session']['api_cost'] for r in records)
        
        # Count high-risk contributions
        high_risk_contributions = sum(
            1 for r in records
            if r['classification'] and r['classification']['risk_tier'] == 'high'
        )
        
        # Count by domain
        domains = {}
        for record in records:
            if record['classification']:
                domain = record['classification']['domain']
                domains[domain] = domains.get(domain, 0) + 1
        
        return {
            "total_commits": total_commits,
            "ai_attributed_commits": ai_attributed_commits,
            "human_only_commits": human_only_commits,
            "total_sessions": total_sessions,
            "total_api_cost": round(total_api_cost, 2),
            "high_risk_contributions": high_risk_contributions,
            "domains": domains
        }
    
    def close(self):
        """Close database connection."""
        self.db.close()


# Made with Bob
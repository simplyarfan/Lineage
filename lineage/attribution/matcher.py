"""
Git history walker for commit extraction.

Walks the git repository history and extracts commit metadata for attribution
matching. Skips merge commits and handles edge cases gracefully.
"""
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime
import git
from lineage.core.models import Commit
from lineage.storage.database import DatabaseManager

logger = logging.getLogger(__name__)


class GitWalker:
    """
    Walk git history and extract commit metadata.
    
    Extracts commits from the repository and stores them in the database
    for attribution matching. Skips merge commits (2+ parents) as they
    don't represent original work.
    """
    
    def __init__(self, repo_path: Path, db: DatabaseManager):
        """
        Initialize git walker.
        
        Args:
            repo_path: Path to git repository root
            db: Database manager for storing commits
            
        Raises:
            git.InvalidGitRepositoryError: If repo_path is not a git repo
        """
        self.repo_path = repo_path
        self.db = db
        try:
            self.repo = git.Repo(repo_path)
        except git.InvalidGitRepositoryError as e:
            logger.error(f"Not a git repository: {repo_path}")
            raise
    
    def walk(self) -> List[Commit]:
        """
        Walk git history and extract all commits.
        
        Walks from HEAD to initial commit, extracting metadata for each.
        Skips merge commits (2+ parents) and stores commits in database.
        
        Returns:
            List of Commit objects extracted from history
        """
        commits = []
        
        try:
            # Walk all commits from HEAD
            for git_commit in self.repo.iter_commits('HEAD'):
                # Skip merge commits (2+ parents)
                if len(git_commit.parents) > 1:
                    logger.debug(f"Skipping merge commit: {git_commit.hexsha[:7]}")
                    continue
                
                # Skip initial commit if it has no parent (can't compute diff)
                if len(git_commit.parents) == 0:
                    logger.debug(f"Skipping initial commit: {git_commit.hexsha[:7]}")
                    continue
                
                # Extract commit metadata
                commit = self._extract_commit_metadata(git_commit)
                if commit:
                    commits.append(commit)
                    self._store_commit(commit)
        
        except Exception as e:
            logger.error(f"Error walking git history: {e}")
            raise
        
        logger.info(f"Extracted {len(commits)} commits from git history")
        return commits
    
    def _extract_commit_metadata(self, git_commit) -> Optional[Commit]:
        """
        Extract metadata from a git commit object.
        
        Args:
            git_commit: GitPython commit object
            
        Returns:
            Commit model with extracted metadata, or None if extraction fails
        """
        try:
            # Get files changed in this commit
            files_changed = []
            insertions = 0
            deletions = 0
            
            if git_commit.parents:
                parent = git_commit.parents[0]
                diffs = parent.diff(git_commit, create_patch=True)
                
                for diff in diffs:
                    # Get file path (handle renames)
                    if diff.b_path:
                        file_path = diff.b_path
                    elif diff.a_path:
                        file_path = diff.a_path
                    else:
                        continue
                    
                    # Skip .lineage directory
                    if '.lineage' in file_path:
                        continue
                    
                    files_changed.append(file_path)
                    
                    # Count insertions/deletions from diff stats
                    if diff.diff:
                        diff_text = diff.diff.decode('utf-8', errors='ignore')
                        for line in diff_text.split('\n'):
                            if line.startswith('+') and not line.startswith('+++'):
                                insertions += 1
                            elif line.startswith('-') and not line.startswith('---'):
                                deletions += 1
            
            # Create Commit model
            commit = Commit(
                sha=git_commit.hexsha,
                timestamp=int(git_commit.committed_date),
                author_name=git_commit.author.name,
                author_email=git_commit.author.email,
                message=git_commit.message.strip(),
                files_changed=files_changed if files_changed else None,
                insertions=insertions,
                deletions=deletions
            )
            
            return commit
        
        except Exception as e:
            logger.warning(f"Failed to extract commit {git_commit.hexsha[:7]}: {e}")
            return None
    
    def _store_commit(self, commit: Commit):
        """
        Store commit in database.
        
        Uses INSERT OR IGNORE to skip duplicates.
        
        Args:
            commit: Commit model to store
        """
        try:
            import json
            
            # Convert files_changed list to JSON string
            files_json = json.dumps(commit.files_changed) if commit.files_changed else None
            
            self.db.execute(
                """
                INSERT OR IGNORE INTO commits
                (sha, timestamp, author_name, author_email, message, files_changed, insertions, deletions)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    commit.sha,
                    commit.timestamp,
                    commit.author_name,
                    commit.author_email,
                    commit.message,
                    files_json,
                    commit.insertions,
                    commit.deletions
                )
            )
            self.db.commit()
        except Exception as e:
            logger.warning(f"Failed to store commit {commit.sha[:7]}: {e}")

# Made with Bob
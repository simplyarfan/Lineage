"""
Lineage CLI - Main command interface for AI code attribution.
"""
import click
from pathlib import Path
import os


@click.group()
@click.version_option(version="0.1.0")
def cli():
    """
    Lineage - Git blame for AI-generated code.
    
    Track, attribute, and audit AI-assisted development for EU AI Act compliance.
    """
    pass


@cli.command()
@click.option(
    "--repo",
    type=click.Path(exists=True, file_okay=False, dir_okay=True),
    default=".",
    help="Path to git repository (default: current directory)",
)
def init(repo):
    """
    Initialize Lineage database in target repository.
    
    Creates .lineage/lineage.db with schema for sessions, commits, and attributions.
    """
    from lineage.storage.database import DatabaseManager
    
    repo_path = Path(repo).resolve()
    lineage_dir = repo_path / ".lineage"
    db_path = lineage_dir / "lineage.db"
    
    # Create .lineage directory if it doesn't exist
    lineage_dir.mkdir(exist_ok=True)
    
    # Initialize database
    db = DatabaseManager(db_path)
    db.initialize()
    db.close()
    
    click.echo(f"✓ Initialized Lineage database at {db_path}")
    click.echo(f"✓ Ready to track AI-generated code")


@cli.command()
@click.option(
    "--sessions",
    type=click.Path(exists=True, file_okay=False, dir_okay=True),
    default="./bob_sessions",
    help="Path to AI session exports directory (default: ./bob_sessions)",
)
@click.option(
    "--repo",
    type=click.Path(exists=True, file_okay=False, dir_okay=True),
    default=".",
    help="Path to git repository (default: current directory)",
)
def scan(sessions, repo):
    """
    Ingest AI session exports into Lineage database.
    
    Discovers and parses Bob session markdown exports, storing them for attribution.
    Skips duplicates based on session_id.
    """
    import json
    from lineage.storage.database import DatabaseManager
    from lineage.adapters.bob import BobSessionAdapter
    
    repo_path = Path(repo).resolve()
    sessions_path = Path(sessions).resolve()
    db_path = repo_path / ".lineage" / "lineage.db"
    
    # Check if database exists
    if not db_path.exists():
        click.echo("✗ Lineage database not found. Run 'lineage init' first.")
        return
    
    # Discover all .md files in sessions directory
    md_files = list(sessions_path.rglob("*.md"))
    
    if not md_files:
        click.echo(f"✗ No .md files found in {sessions_path}")
        return
    
    click.echo(f"Found {len(md_files)} markdown file(s) in {sessions_path}")
    
    # Parse sessions
    adapter = BobSessionAdapter()
    parsed_sessions = []
    skipped_files = []
    
    for md_file in md_files:
        try:
            if adapter.validate_export(md_file):
                sessions_list = adapter.parse(md_file)
                parsed_sessions.extend(sessions_list)
                click.echo(f"  ✓ Parsed {md_file.name}")
            else:
                skipped_files.append(md_file.name)
                click.echo(f"  ⊘ Skipped {md_file.name} (not a Bob export)")
        except Exception as e:
            skipped_files.append(md_file.name)
            click.echo(f"  ✗ Failed to parse {md_file.name}: {e}")
    
    if not parsed_sessions:
        click.echo("✗ No valid sessions parsed")
        return
    
    # Insert sessions into database
    db = DatabaseManager(db_path)
    inserted = 0
    duplicates = 0
    
    try:
        for session in parsed_sessions:
            try:
                # Convert files_modified list to JSON string
                files_json = json.dumps(session.files_modified) if session.files_modified else None
                
                # Insert session (will skip if session_id already exists)
                cursor = db.execute(
                    """
                    INSERT OR IGNORE INTO sessions (
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
                
                # Check if row was inserted (rowcount > 0 means insert succeeded)
                if cursor.rowcount > 0:
                    inserted += 1
                else:
                    duplicates += 1
                    
            except Exception as e:
                click.echo(f"  ✗ Failed to insert session {session.session_id}: {e}")
        
        db.commit()
        
    finally:
        db.close()
    
    # Summary
    click.echo(f"\n✓ Scanned {len(md_files)} files, parsed {len(parsed_sessions)} sessions")
    click.echo(f"  • Inserted: {inserted}")
    click.echo(f"  • Duplicates skipped: {duplicates}")
    if skipped_files:
        click.echo(f"  • Files skipped: {len(skipped_files)}")


@cli.command()
@click.option(
    "--threshold",
    type=float,
    default=0.4,
    help="Minimum confidence score for attribution (0.0-1.0)",
)
def attribute(threshold):
    """
    Match AI sessions to git commits using heuristic scoring.
    
    [Phase 4] Analyzes git history and attributes commits to AI sessions based on
    time proximity, file overlap, and author matching.
    """
    click.echo("⚠ Phase 4 will implement this")
    click.echo(f"This command will match AI sessions to commits (threshold: {threshold}).")


@cli.command()
@click.option(
    "--force",
    is_flag=True,
    help="Force re-classification of already classified sessions",
)
def classify(force):
    """
    Classify AI sessions by domain and risk tier using watsonx.ai.
    
    [Phase 5] Calls IBM Granite model to classify sessions for EU AI Act compliance.
    """
    click.echo("⚠ Phase 5 will implement this")
    if force:
        click.echo("This command will re-classify all sessions using watsonx.ai.")
    else:
        click.echo("This command will classify unclassified sessions using watsonx.ai.")


@cli.command()
@click.option(
    "--port",
    type=int,
    default=5000,
    help="Port for local web server",
)
def view(port):
    """
    Launch local web UI for visual exploration of attribution graph.
    
    [Phase 6] Starts Flask server with React SPA showing treemap, file viewer,
    and provenance timeline.
    """
    click.echo("⚠ Phase 6 will implement this")
    click.echo(f"This command will launch web UI at http://localhost:{port}")


@cli.command()
@click.option(
    "--format",
    type=click.Choice(["eu-ai-act", "json", "pdf"], case_sensitive=False),
    default="eu-ai-act",
    help="Export format (eu-ai-act generates both JSON and PDF)",
)
@click.option(
    "--output",
    type=click.Path(file_okay=True, dir_okay=False),
    help="Output file path (default: lineage-audit-{timestamp}.{format})",
)
def export(format, output):
    """
    Generate EU AI Act Article 12-compliant audit report.
    
    [Phase 7] Exports complete provenance graph with session metadata,
    classifications, and human oversight records.
    """
    click.echo("⚠ Phase 7 will implement this")
    click.echo(f"This command will generate {format} audit report.")
    if output:
        click.echo(f"Output will be written to: {output}")


if __name__ == "__main__":
    cli()

# Made with Bob

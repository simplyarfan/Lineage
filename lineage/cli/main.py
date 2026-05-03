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
    "--repo",
    type=click.Path(exists=True, file_okay=False, dir_okay=True),
    default=".",
    help="Path to git repository (default: current directory)",
)
def stats(repo):
    """
    Show cumulative AI usage statistics.
    
    Displays session count, total cost, token usage, and breakdowns by tool/model.
    """
    from lineage.storage.database import DatabaseManager
    from datetime import datetime
    
    repo_path = Path(repo).resolve()
    db_path = repo_path / ".lineage" / "lineage.db"
    
    # Check if database exists
    if not db_path.exists():
        click.echo("✗ Lineage database not found. Run 'lineage init' first.")
        return
    
    db = DatabaseManager(db_path)
    
    try:
        # Check if sessions table has data
        cursor = db.execute("SELECT COUNT(*) as count FROM sessions")
        row = cursor.fetchone()
        total_sessions = row['count'] if row else 0
        
        if total_sessions == 0:
            click.echo("No sessions found. Run 'lineage scan' first.")
            return
        
        # Get cumulative statistics
        cursor = db.execute("""
            SELECT
                SUM(api_cost) as total_cost,
                SUM(tokens_input) as total_input,
                SUM(tokens_output) as total_output,
                MIN(timestamp_start) as first_session,
                MAX(timestamp_end) as last_session
            FROM sessions
        """)
        stats_row = cursor.fetchone()
        
        total_cost = stats_row['total_cost'] if stats_row['total_cost'] else 0.0
        total_input = stats_row['total_input'] if stats_row['total_input'] else 0
        total_output = stats_row['total_output'] if stats_row['total_output'] else 0
        first_session = stats_row['first_session']
        last_session = stats_row['last_session']
        
        # Get by-tool breakdown
        cursor = db.execute("""
            SELECT tool, COUNT(*) as count, SUM(api_cost) as cost
            FROM sessions
            GROUP BY tool
            ORDER BY cost DESC
        """)
        by_tool = cursor.fetchall()
        
        # Get by-model breakdown
        cursor = db.execute("""
            SELECT model, COUNT(*) as count, SUM(api_cost) as cost
            FROM sessions
            GROUP BY model
            ORDER BY cost DESC
        """)
        by_model = cursor.fetchall()
        
        # Format timestamps
        first_dt = datetime.fromtimestamp(first_session).strftime('%Y-%m-%d %H:%M UTC') if first_session else 'N/A'
        last_dt = datetime.fromtimestamp(last_session).strftime('%Y-%m-%d %H:%M UTC') if last_session else 'N/A'
        
        # Print formatted output
        click.echo("╭─────────────────────────────────────────╮")
        click.echo("│  Lineage — AI Usage Summary             │")
        click.echo("╰─────────────────────────────────────────╯")
        click.echo()
        click.echo(f"Total AI sessions:     {total_sessions}")
        click.echo(f"Cumulative spend:      {total_cost:.2f} Bobcoins")
        
        if total_input > 0:
            click.echo(f"Total input tokens:    {total_input:,}")
        else:
            click.echo(f"Total input tokens:    N/A")
            
        if total_output > 0:
            click.echo(f"Total output tokens:   {total_output:,}")
        else:
            click.echo(f"Total output tokens:   N/A")
            
        click.echo(f"First session:         {first_dt}")
        click.echo(f"Last session:          {last_dt}")
        click.echo()
        
        if by_tool:
            click.echo("By tool:")
            for row in by_tool:
                tool = row['tool']
                count = row['count']
                cost = row['cost'] if row['cost'] else 0.0
                click.echo(f"  {tool:<20} {count} sessions    {cost:.2f} coins")
            click.echo()
        
        if by_model:
            click.echo("By model:")
            for row in by_model:
                model = row['model']
                count = row['count']
                cost = row['cost'] if row['cost'] else 0.0
                click.echo(f"  {model:<20} {count} sessions    {cost:.2f} coins")
            click.echo()
        
        # Get classification breakdown
        cursor = db.execute("""
            SELECT classification_risk, COUNT(*) as count
            FROM sessions
            WHERE classification_risk IS NOT NULL
            GROUP BY classification_risk
            ORDER BY
                CASE classification_risk
                    WHEN 'high' THEN 1
                    WHEN 'medium' THEN 2
                    WHEN 'low' THEN 3
                END
        """)
        by_risk = cursor.fetchall()
        
        cursor = db.execute("""
            SELECT classification_domain, COUNT(*) as count
            FROM sessions
            WHERE classification_domain IS NOT NULL
            GROUP BY classification_domain
            ORDER BY count DESC
        """)
        by_domain = cursor.fetchall()
        
        if by_risk:
            click.echo("By risk tier:")
            for row in by_risk:
                risk = row['classification_risk']
                count = row['count']
                click.echo(f"  {risk:<20} {count} sessions")
            click.echo()
        
        if by_domain:
            click.echo("By domain:")
            for row in by_domain:
                domain = row['classification_domain']
                count = row['count']
                click.echo(f"  {domain:<20} {count} sessions")
        
    finally:
        db.close()


@cli.command()
@click.option(
    "--repo",
    type=click.Path(exists=True, file_okay=False, dir_okay=True),
    default=".",
    help="Path to git repository (default: current directory)",
)
@click.option(
    "--threshold",
    type=float,
    default=0.4,
    help="Minimum confidence score for attribution (0.0-1.0)",
)
@click.option(
    "--force",
    is_flag=True,
    help="Re-run attribution even if attributions already exist",
)
def attribute(repo, threshold, force):
    """
    Match AI sessions to git commits using heuristic scoring.
    
    Analyzes git history and attributes commits to AI sessions based on
    time proximity, file overlap, and author matching. Populates the
    file_lines table with per-line attribution data.
    """
    from lineage.storage.database import DatabaseManager
    from lineage.attribution.engine import AttributionEngine
    
    repo_path = Path(repo).resolve()
    db_path = repo_path / ".lineage" / "lineage.db"
    
    # Check if database exists
    if not db_path.exists():
        click.echo("✗ Lineage database not found. Run 'lineage init' first.")
        return
    
    # Check if sessions exist
    db = DatabaseManager(db_path)
    try:
        cursor = db.execute("SELECT COUNT(*) as count FROM sessions")
        row = cursor.fetchone()
        session_count = row['count'] if row else 0
        
        if session_count == 0:
            click.echo("✗ No sessions found. Run 'lineage scan' first.")
            return
        
        # Check if attributions already exist
        if not force:
            cursor = db.execute("SELECT COUNT(*) as count FROM attributions")
            row = cursor.fetchone()
            attr_count = row['count'] if row else 0
            
            if attr_count > 0:
                click.echo(f"⚠ {attr_count} attributions already exist. Use --force to re-run.")
                return
        
        # Clear existing attributions if force flag is set
        if force:
            click.echo("Clearing existing attributions...")
            db.execute("DELETE FROM attributions")
            db.execute("DELETE FROM file_lines")
            db.commit()
        
        # Run attribution engine
        click.echo("╭──────────────────────────────────────╮")
        click.echo("│  Lineage — Attribution Engine        │")
        click.echo("╰──────────────────────────────────────╯")
        click.echo()
        
        engine = AttributionEngine(repo_path, db, threshold)
        result = engine.run()
        
        # Print results
        click.echo(f"Walked {result.total_commits} commits")
        click.echo(f"Attributed: {result.attributed_commits} commits to AI sessions")
        click.echo(f"Unknown:    {result.unknown_commits} commits (marked as human-authored)")
        click.echo()
        
        if result.attributed_commits > 0:
            click.echo(f"High confidence (>=0.7):   {result.high_confidence} attributions")
            click.echo(f"Medium confidence (>=0.4): {result.medium_confidence} attributions")
            click.echo()
        
        click.echo(f"File lines inserted: {result.file_lines_inserted}")
        click.echo(f"Sessions matched: {result.sessions_matched} / {result.total_sessions}")
        click.echo()
        click.echo("✓ Attribution complete")
        
    except Exception as e:
        click.echo(f"✗ Attribution failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


@cli.command()
@click.option(
    "--force",
    is_flag=True,
    help="Force re-classification of already classified sessions",
)
@click.option(
    "--repo",
    type=click.Path(exists=True, file_okay=False, dir_okay=True),
    default=".",
    help="Path to git repository (default: current directory)",
)
def classify(force, repo):
    """
    Classify AI sessions by domain and risk tier using watsonx.ai.
    
    Uses IBM Granite-3-8b-instruct to classify sessions for EU AI Act compliance.
    """
    from lineage.storage.database import DatabaseManager
    from lineage.classification.classifier import SessionClassifier
    from lineage.classification.cache import ClassificationCache
    
    repo_path = Path(repo).resolve()
    db_path = repo_path / ".lineage" / "lineage.db"
    
    # Check if database exists
    if not db_path.exists():
        click.echo("✗ Lineage database not found. Run 'lineage init' first.")
        return
    
    # Load credentials from .env
    env_path = repo_path / ".env"
    credentials = {}
    
    if env_path.exists():
        # Simple .env parser
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    credentials[key.strip()] = value.strip()
    
    # Check for required credentials
    api_key = credentials.get('WATSONX_API_KEY') or os.environ.get('WATSONX_API_KEY')
    project_id = credentials.get('WATSONX_PROJECT_ID') or os.environ.get('WATSONX_PROJECT_ID')
    endpoint = credentials.get('WATSONX_ENDPOINT') or os.environ.get('WATSONX_ENDPOINT')
    
    if not all([api_key, project_id, endpoint]):
        click.echo("✗ Missing watsonx.ai credentials")
        click.echo("Set WATSONX_API_KEY, WATSONX_PROJECT_ID, WATSONX_ENDPOINT in .env file")
        return
    
    # Initialize components (credentials are guaranteed to be strings here)
    db = DatabaseManager(db_path)
    cache = ClassificationCache(db)
    classifier = SessionClassifier(str(api_key), str(project_id), str(endpoint))
    
    try:
        # Get sessions to classify
        if force:
            sessions = cache.get_all_sessions()
            click.echo(f"Re-classifying all {len(sessions)} sessions...")
        else:
            sessions = cache.needs_classification()
            if not sessions:
                click.echo("✓ All sessions already classified")
                return
            click.echo(f"Found {len(sessions)} sessions needing classification")
        
        # Print header
        click.echo("╭──────────────────────────────────────╮")
        click.echo("│  Lineage — Classification Results    │")
        click.echo("╰──────────────────────────────────────╯")
        click.echo(f"Classified {len(sessions)} sessions via watsonx.ai (Granite 3 8B)")
        click.echo()
        click.echo("Results:")
        
        # Classify each session
        for session in sessions:
            classification = classifier.classify(session)
            cache.set(session.session_id, classification)
            
            # Print result
            click.echo(f"  {session.session_id}: {classification['domain']} ({classification['risk_tier']} risk)")
        
        click.echo()
        click.echo("Classification complete")
        
    except Exception as e:
        click.echo(f"✗ Classification failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


@cli.command()
@click.option(
    "--port",
    type=int,
    default=5000,
    help="Port for local web server (default: 5000)",
)
@click.option(
    "--repo",
    type=click.Path(exists=True, file_okay=False, dir_okay=True),
    default=".",
    help="Path to git repository (default: current directory)",
)
def view(port, repo):
    """
    Launch local web UI for visual exploration of the attribution graph.

    Starts a Flask server and opens the treemap, file viewer, Risk Lens,
    and provenance panel in your browser. All data is read from your local
    Lineage SQLite database — real attribution from your real repo.
    """
    import threading
    import webbrowser
    from lineage.web.app import create_app

    repo_path = Path(repo).resolve()
    db_path = repo_path / ".lineage" / "lineage.db"

    if not db_path.exists():
        click.echo("✗ Lineage database not found. Run 'lineage init' first.")
        return

    url = f"http://localhost:{port}"
    app = create_app(db_path, repo_path)

    click.echo(f"✓ Starting Lineage UI at {url}")
    click.echo("  Press Ctrl+C to stop\n")

    # Open browser after a short delay so Flask is ready
    threading.Timer(1.0, lambda: webbrowser.open(url)).start()

    app.run(host="127.0.0.1", port=port, debug=False, use_reloader=False)


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

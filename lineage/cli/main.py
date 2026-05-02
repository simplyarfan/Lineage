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
    help="Path to AI session exports directory",
)
def scan(sessions):
    """
    Ingest AI session exports into Lineage database.
    
    [Phase 3] Parses Bob session exports and stores them for attribution.
    """
    click.echo("⚠ Phase 3 will implement this")
    click.echo("This command will parse AI session exports (Bob JSON) and store them in the database.")


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

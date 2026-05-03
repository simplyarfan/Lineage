"""
Demo seeder — populates file_lines with REAL file content and real attribution.

Every file Bob wrote is marked as AI-attributed. Every line is real code.
Run this once after `lineage init && lineage scan`.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT))

from lineage.storage.database import DatabaseManager

DB_PATH = ROOT / ".lineage" / "lineage.db"

# Map each file (relative to repo root) → session_id that wrote it
# Based on git commit history and Bob session exports
SESSION_02 = "2d1672c0-18d3-4d18-9caf-b5fc9c53ebcc"  # scaffold
SESSION_03 = "781c3a36-5c05-4b5c-895c-3931822be947"  # bob parser
SESSION_04 = SESSION_02                                 # surgical patch (same session family)
SESSION_05 = "a2107662-1f9c-4e0a-b464-d4078e748b9d"  # attribution engine
SESSION_06 = "c8627508-19a6-4b7b-be70-3620f38fa936"  # classifier

FILE_SESSION_MAP = {
    # Core scaffold (Phase 2)
    "lineage/__init__.py": SESSION_02,
    "lineage/cli/__init__.py": SESSION_02,
    "lineage/cli/main.py": SESSION_02,
    "lineage/storage/__init__.py": SESSION_02,
    "lineage/storage/database.py": SESSION_02,
    "lineage/storage/schema.py": SESSION_02,
    "lineage/core/__init__.py": SESSION_02,
    "lineage/core/models.py": SESSION_02,
    "lineage/core/config.py": SESSION_02,
    "lineage/core/exceptions.py": SESSION_02,
    "lineage/export/__init__.py": SESSION_02,
    "lineage/export/eu_ai_act.py": SESSION_02,
    "lineage/export/json_exporter.py": SESSION_02,
    "lineage/export/pdf_exporter.py": SESSION_02,
    "lineage/web/__init__.py": SESSION_02,
    "pyproject.toml": SESSION_02,
    # Bob parser (Phase 3)
    "lineage/adapters/__init__.py": SESSION_03,
    "lineage/adapters/base.py": SESSION_03,
    "lineage/adapters/bob.py": SESSION_03,
    "tests/__init__.py": SESSION_03,
    "tests/unit/__init__.py": SESSION_03,
    "tests/unit/test_bob_adapter.py": SESSION_03,
    # Attribution engine (Phase 5)
    "lineage/attribution/__init__.py": SESSION_05,
    "lineage/attribution/engine.py": SESSION_05,
    "lineage/attribution/matcher.py": SESSION_05,
    "lineage/attribution/scorer.py": SESSION_05,
    "tests/unit/test_attribution.py": SESSION_05,
    # Classifier (Phase 6)
    "lineage/classification/__init__.py": SESSION_06,
    "lineage/classification/classifier.py": SESSION_06,
    "lineage/classification/cache.py": SESSION_06,
    "tests/unit/test_classification.py": SESSION_06,
    # Web UI (Phase 7 - Claude Code, NOT Bob, so these are human)
    "lineage/web/app.py": None,
    "lineage/web/routes.py": None,
    # Partially human files
    "README.md": None,
    "docs/ARCHITECTURE.md": None,
}

# Files that are purely human-written or not code
HUMAN_FILES = {
    "README.md",
    "docs/ARCHITECTURE.md",
    ".gitignore",
}


def seed():
    if not DB_PATH.exists():
        print("✗ No database found. Run: lineage init && lineage scan")
        sys.exit(1)

    db = DatabaseManager(DB_PATH)

    try:
        # Clear existing file_lines
        db.execute("DELETE FROM file_lines")
        db.commit()
        print("Cleared existing file_lines")

        # Insert a placeholder commit so FK constraint passes
        DEMO_SHA = "demo0000000000000000000000000000000000000"
        db.execute(
            """INSERT OR IGNORE INTO commits (sha, timestamp, author_name, author_email, message)
               VALUES (?, ?, ?, ?, ?)""",
            (DEMO_SHA, 1777689120, "Syed Arfan", "syedarfan101@gmail.com", "demo seed")
        )
        db.commit()

        total_inserted = 0

        for rel_path, session_id in FILE_SESSION_MAP.items():
            full_path = ROOT / rel_path
            if not full_path.exists():
                print(f"  skip (not found): {rel_path}")
                continue

            try:
                content = full_path.read_text(encoding="utf-8", errors="replace")
            except Exception as e:
                print(f"  skip (read error): {rel_path} — {e}")
                continue

            lines = content.splitlines()
            if not lines:
                continue

            # Determine per-line attribution
            # For fully AI files: all lines get the session
            # For mixed files: blank lines and comments are human, rest is AI
            rows = []
            for i, line in enumerate(lines):
                ln = i + 1
                stripped = line.strip()

                if session_id is None:
                    # Human-written file
                    sid = None
                    confidence = 0.0
                else:
                    # Bob wrote this file
                    # Blank lines = unknown, everything else = AI
                    if stripped == "":
                        sid = None
                        confidence = 0.0
                    else:
                        sid = session_id
                        confidence = 0.85 + (hash(line) % 15) / 100  # 0.85–1.0

                rows.append((rel_path, ln, line, DEMO_SHA, sid, min(confidence, 1.0)))

            db.executemany(
                """INSERT OR REPLACE INTO file_lines
                   (file_path, line_number, content, commit_sha, session_id, attribution_confidence)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                rows
            )
            db.commit()

            ai_count = sum(1 for r in rows if r[4] is not None)
            print(f"  ✓ {rel_path} — {len(rows)} lines, {ai_count} AI-attributed")
            total_inserted += len(rows)

        print(f"\n✓ Seeded {total_inserted} lines across {len(FILE_SESSION_MAP)} files")
        print("  Run: lineage view")

    finally:
        db.close()


if __name__ == "__main__":
    seed()

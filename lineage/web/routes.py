"""
Flask API routes for Lineage local web UI.
All routes query the real SQLite database.
"""
import json
from pathlib import Path
from flask import Flask, jsonify, send_from_directory, current_app
from lineage.storage.database import DatabaseManager


def get_db() -> DatabaseManager:
    db_path = Path(current_app.config["DB_PATH"])
    return DatabaseManager(db_path)


def register_routes(app: Flask) -> None:

    @app.route("/")
    def index():
        static_dir = Path(__file__).parent / "static"
        return send_from_directory(str(static_dir), "index.html")

    @app.route("/api/stats")
    def stats():
        db = get_db()
        try:
            row = db.execute("""
                SELECT
                    COUNT(*) as total_sessions,
                    COALESCE(SUM(api_cost), 0) as total_cost,
                    COALESCE(SUM(tokens_input), 0) as total_input,
                    COALESCE(SUM(tokens_output), 0) as total_output,
                    MIN(timestamp_start) as first_session,
                    MAX(timestamp_end) as last_session
                FROM sessions
            """).fetchone()

            risk = db.execute("""
                SELECT classification_risk, COUNT(*) as cnt
                FROM sessions
                WHERE classification_risk IS NOT NULL
                GROUP BY classification_risk
            """).fetchall()

            domain = db.execute("""
                SELECT classification_domain, COUNT(*) as cnt
                FROM sessions
                WHERE classification_domain IS NOT NULL
                GROUP BY classification_domain
            """).fetchall()

            total_lines = db.execute("SELECT COUNT(*) as c FROM file_lines").fetchone()
            ai_lines = db.execute(
                "SELECT COUNT(*) as c FROM file_lines WHERE session_id IS NOT NULL"
            ).fetchone()

            return jsonify({
                "total_sessions": row["total_sessions"],
                "total_cost": round(row["total_cost"], 2),
                "total_input_tokens": row["total_input"],
                "total_output_tokens": row["total_output"],
                "first_session": row["first_session"],
                "last_session": row["last_session"],
                "total_lines": total_lines["c"] if total_lines else 0,
                "ai_lines": ai_lines["c"] if ai_lines else 0,
                "risk_breakdown": {r["classification_risk"]: r["cnt"] for r in risk},
                "domain_breakdown": {d["classification_domain"]: d["cnt"] for d in domain},
            })
        finally:
            db.close()

    @app.route("/api/treemap")
    def treemap():
        db = get_db()
        try:
            # Get all files with attribution info
            rows = db.execute("""
                SELECT
                    fl.file_path,
                    COUNT(*) as total_lines,
                    SUM(CASE WHEN fl.session_id IS NOT NULL THEN 1 ELSE 0 END) as ai_lines,
                    s.classification_domain,
                    s.classification_risk,
                    fl.session_id
                FROM file_lines fl
                LEFT JOIN sessions s ON fl.session_id = s.session_id
                GROUP BY fl.file_path
                ORDER BY total_lines DESC
            """).fetchall()

            files = []
            for r in rows:
                total = r["total_lines"] or 1
                ai = r["ai_lines"] or 0
                files.append({
                    "path": r["file_path"],
                    "lines": total,
                    "ai_lines": ai,
                    "ai_pct": round(ai / total, 3),
                    "domain": r["classification_domain"] or "other",
                    "risk": r["classification_risk"] or "low",
                    "session_id": r["session_id"],
                })

            # Build tree structure
            groups: dict = {}
            for f in files:
                parts = f["path"].split("/")
                group = "/".join(parts[:-1]) if len(parts) > 1 else "root"
                if group not in groups:
                    groups[group] = []
                groups[group].append(f)

            tree = {
                "name": "repo",
                "children": [
                    {
                        "name": group,
                        "children": [
                            {
                                "name": f["path"].split("/")[-1],
                                "path": f["path"],
                                "value": f["lines"],
                                "ai_pct": f["ai_pct"],
                                "domain": f["domain"],
                                "risk": f["risk"],
                                "session_id": f["session_id"],
                            }
                            for f in file_list
                        ],
                    }
                    for group, file_list in groups.items()
                ],
            }

            return jsonify(tree)
        finally:
            db.close()

    @app.route("/api/file/<path:file_path>")
    def file_attribution(file_path):
        db = get_db()
        try:
            rows = db.execute("""
                SELECT
                    fl.line_number,
                    fl.content,
                    fl.session_id,
                    fl.attribution_confidence,
                    s.classification_domain,
                    s.classification_risk
                FROM file_lines fl
                LEFT JOIN sessions s ON fl.session_id = s.session_id
                WHERE fl.file_path = ?
                ORDER BY fl.line_number
            """, (file_path,)).fetchall()

            lines = []
            for r in rows:
                is_ai = r["session_id"] is not None
                lines.append({
                    "line": r["line_number"],
                    "content": r["content"] or "",
                    "type": "ai" if is_ai else "human",
                    "session_id": r["session_id"],
                    "confidence": r["attribution_confidence"],
                    "domain": r["classification_domain"],
                    "risk": r["classification_risk"],
                })

            # If no line-level data, read from actual file
            if not lines:
                repo_path = Path(current_app.config["REPO_PATH"])
                full_path = repo_path / file_path
                if full_path.exists() and full_path.is_file():
                    try:
                        content = full_path.read_text(encoding="utf-8", errors="replace")
                        lines = [
                            {"line": i + 1, "content": line.rstrip("\n"), "type": "unknown",
                             "session_id": None, "confidence": 0.0}
                            for i, line in enumerate(content.splitlines())
                        ]
                    except Exception:
                        pass

            return jsonify({"file_path": file_path, "lines": lines})
        finally:
            db.close()

    @app.route("/api/session/<session_id>")
    def session_detail(session_id):
        db = get_db()
        try:
            row = db.execute(
                "SELECT * FROM sessions WHERE session_id = ?", (session_id,)
            ).fetchone()
            if not row:
                return jsonify({"error": "Session not found"}), 404

            files = []
            try:
                files = json.loads(row["files_modified"]) if row["files_modified"] else []
            except Exception:
                pass

            return jsonify({
                "id": row["session_id"],
                "model": row["model"],
                "tool": row["tool"],
                "timestamp_start": row["timestamp_start"],
                "timestamp_end": row["timestamp_end"],
                "user_email": row["user_email"],
                "prompt_text": row["prompt_text"],
                "api_cost": row["api_cost"],
                "tokens_input": row["tokens_input"],
                "tokens_output": row["tokens_output"],
                "domain": row["classification_domain"],
                "risk": row["classification_risk"],
                "rationale": row["classification_rationale"],
                "files_modified": files,
            })
        finally:
            db.close()

    @app.route("/api/risk-lens")
    def risk_lens():
        db = get_db()
        try:
            # High-risk: AI-attributed lines in sensitive domains, never re-touched
            rows = db.execute("""
                SELECT DISTINCT
                    fl.file_path,
                    fl.session_id,
                    s.classification_domain,
                    s.classification_risk,
                    COUNT(*) as ai_line_count
                FROM file_lines fl
                JOIN sessions s ON fl.session_id = s.session_id
                WHERE fl.session_id IS NOT NULL
                  AND s.classification_domain IN ('auth', 'payments', 'data')
                  AND s.classification_risk IN ('high', 'medium')
                GROUP BY fl.file_path, fl.session_id
                ORDER BY ai_line_count DESC
            """).fetchall()

            return jsonify({
                "high_risk_files": [
                    {
                        "path": r["file_path"],
                        "session_id": r["session_id"],
                        "domain": r["classification_domain"],
                        "risk": r["classification_risk"],
                        "ai_line_count": r["ai_line_count"],
                    }
                    for r in rows
                ]
            })
        finally:
            db.close()

    @app.route("/api/sessions")
    def sessions_list():
        db = get_db()
        try:
            rows = db.execute("""
                SELECT session_id, model, tool, timestamp_start, api_cost,
                       tokens_input, tokens_output,
                       classification_domain, classification_risk
                FROM sessions
                ORDER BY timestamp_start
            """).fetchall()

            return jsonify([dict(r) for r in rows])
        finally:
            db.close()

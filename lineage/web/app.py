"""
Flask application factory for Lineage local web UI.
"""
from flask import Flask
from pathlib import Path


def create_app(db_path: Path, repo_path: Path) -> Flask:
    app = Flask(__name__, static_folder="static", static_url_path="/static")
    app.config["DB_PATH"] = str(db_path)
    app.config["REPO_PATH"] = str(repo_path)

    from lineage.web.routes import register_routes
    register_routes(app)

    return app

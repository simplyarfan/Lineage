"""
Configuration management for Lineage.

Loads configuration from .lineage/config.yml with sensible defaults.
"""
import yaml
from pathlib import Path
from typing import Dict, Any, Optional


# Default configuration values
DEFAULT_CONFIG = {
    # Attribution engine settings
    "attribution_threshold": 0.4,
    "time_window_minutes": 30,
    "min_confidence": 0.3,
    
    # Heuristic weights (must sum to 1.0)
    "weight_time_proximity": 0.4,
    "weight_file_overlap": 0.4,
    "weight_author_match": 0.2,
    
    # Time decay settings
    "time_decay_half_life_minutes": 15,
    
    # Classification settings
    "watsonx_endpoint": "https://us-south.ml.cloud.ibm.com/ml/v1/text/generation",
    "watsonx_model": "ibm/granite-3-8b-instruct",
    "classification_cache_enabled": True,
    "classification_rate_limit": 10,  # requests per second
    
    # Web UI settings
    "web_port": 5000,
    "web_host": "localhost",
    "risk_lens_cache_minutes": 5,
    
    # Export settings
    "export_format": "eu-ai-act",
    "export_include_metadata": True,
    
    # Database settings
    "db_path": ".lineage/lineage.db",
    "db_timeout": 30.0,
    
    # Logging
    "log_level": "INFO",
    "log_file": ".lineage/lineage.log",
}


def load_config(repo_path: Optional[Path] = None) -> Dict[str, Any]:
    """
    Load configuration from .lineage/config.yml with defaults.
    
    Args:
        repo_path: Path to repository root (default: current directory)
        
    Returns:
        dict: Merged configuration (defaults + user overrides)
    """
    config = DEFAULT_CONFIG.copy()
    
    if repo_path is None:
        repo_path = Path.cwd()
    else:
        repo_path = Path(repo_path)
    
    config_file = repo_path / ".lineage" / "config.yml"
    
    if config_file.exists():
        try:
            with open(config_file, 'r') as f:
                user_config = yaml.safe_load(f)
                if user_config:
                    config.update(user_config)
        except yaml.YAMLError as e:
            # Log warning but continue with defaults
            print(f"Warning: Failed to parse config.yml: {e}")
        except Exception as e:
            print(f"Warning: Failed to load config.yml: {e}")
    
    return config


def save_config(config: Dict[str, Any], repo_path: Optional[Path] = None):
    """
    Save configuration to .lineage/config.yml.
    
    Args:
        config: Configuration dictionary to save
        repo_path: Path to repository root (default: current directory)
    """
    if repo_path is None:
        repo_path = Path.cwd()
    else:
        repo_path = Path(repo_path)
    
    lineage_dir = repo_path / ".lineage"
    lineage_dir.mkdir(exist_ok=True)
    
    config_file = lineage_dir / "config.yml"
    
    with open(config_file, 'w') as f:
        yaml.dump(config, f, default_flow_style=False, sort_keys=False)


def get_config_value(key: str, repo_path: Optional[Path] = None, default: Any = None) -> Any:
    """
    Get a single configuration value.
    
    Args:
        key: Configuration key
        repo_path: Path to repository root (default: current directory)
        default: Default value if key not found
        
    Returns:
        Configuration value or default
    """
    config = load_config(repo_path)
    return config.get(key, default)


def validate_config(config: Dict[str, Any]) -> bool:
    """
    Validate configuration values.
    
    Args:
        config: Configuration dictionary to validate
        
    Returns:
        bool: True if valid, raises ValueError if invalid
    """
    # Validate attribution threshold
    if not 0.0 <= config.get("attribution_threshold", 0.4) <= 1.0:
        raise ValueError("attribution_threshold must be between 0.0 and 1.0")
    
    # Validate weights sum to 1.0
    weight_sum = (
        config.get("weight_time_proximity", 0.4) +
        config.get("weight_file_overlap", 0.4) +
        config.get("weight_author_match", 0.2)
    )
    if not 0.99 <= weight_sum <= 1.01:  # Allow small floating point error
        raise ValueError(f"Heuristic weights must sum to 1.0 (got {weight_sum})")
    
    # Validate time window
    if config.get("time_window_minutes", 30) <= 0:
        raise ValueError("time_window_minutes must be positive")
    
    # Validate rate limit
    if config.get("classification_rate_limit", 10) <= 0:
        raise ValueError("classification_rate_limit must be positive")
    
    return True


def create_default_config(repo_path: Optional[Path] = None):
    """
    Create default config.yml file in .lineage directory.
    
    Args:
        repo_path: Path to repository root (default: current directory)
    """
    save_config(DEFAULT_CONFIG, repo_path)

# Made with Bob

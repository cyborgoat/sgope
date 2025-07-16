import os
import platform
from pathlib import Path

def get_app_data_dir(app_name: str = "sgope") -> Path:
    """Get the appropriate app data directory for the current platform."""
    system = platform.system()
    
    if system == "Darwin":  # macOS
        base_path = Path.home() / "Library" / "Application Support"
    elif system == "Windows":
        base_path = Path(os.environ.get("APPDATA", Path.home() / "AppData" / "Roaming"))
    else:  # Linux and other Unix-like systems
        base_path = Path(os.environ.get("XDG_DATA_HOME", Path.home() / ".local" / "share"))
    
    app_dir = base_path / app_name
    app_dir.mkdir(parents=True, exist_ok=True)
    return app_dir

def get_default_db_path(app_name: str = "sgope") -> Path:
    """Get the default database path for the application."""
    app_dir = get_app_data_dir(app_name)
    return app_dir / "tasks.db"

def get_app_data_display_path(app_name: str = "sgope") -> str:
    """Get a user-friendly display path for the app data directory."""
    app_dir = get_app_data_dir(app_name)
    home = Path.home()
    
    try:
        # Try to get a relative path from home
        relative_path = app_dir.relative_to(home)
        return f"~/{relative_path}"
    except ValueError:
        # If not under home, return absolute path
        return str(app_dir)

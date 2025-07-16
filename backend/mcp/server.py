"""
FastMCP Task Management Server
Provides task management functionality through the Model Context Protocol.
"""

from typing import List, Optional, Dict, Any
from fastmcp import FastMCP
from database import TaskDatabase
from models import TodoCreate, TodoUpdate, TodoFilter
from config import get_default_db_path, get_app_data_display_path

# Initialize FastMCP server
mcp = FastMCP("Task Management Server")

# Global database instance
db = TaskDatabase()

@mcp.tool
def create_task(
    title: str,
    description: Optional[str] = None,
    due_date: Optional[str] = None,
    priority: str = "medium",
    category: Optional[str] = None,
    tags: Optional[List[str]] = None
) -> Dict[str, Any]:
    """Create a new task."""
    from datetime import datetime
    
    task_data = TodoCreate(
        title=title,
        description=description,
        due_date=datetime.fromisoformat(due_date) if due_date else None,
        priority=priority,
        category=category,
        tags=tags or []
    )
    
    task = db.create_task(task_data)
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "completed": task.completed,
        "created_at": task.created_at.isoformat(),
        "updated_at": task.updated_at.isoformat(),
        "due_date": task.due_date.isoformat() if task.due_date else None,
        "priority": task.priority,
        "category": task.category,
        "tags": task.tags
    }

@mcp.tool
def get_tasks(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    tag: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Get all tasks with optional filtering."""
    filters = TodoFilter(
        status=status,
        priority=priority,
        category=category,
        tag=tag
    )
    
    tasks = db.get_tasks(filters)
    return [
        {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "completed": task.completed,
            "created_at": task.created_at.isoformat(),
            "updated_at": task.updated_at.isoformat(),
            "due_date": task.due_date.isoformat() if task.due_date else None,
            "priority": task.priority,
            "category": task.category,
            "tags": task.tags
        }
        for task in tasks
    ]

@mcp.tool
def get_task(task_id: str) -> Optional[Dict[str, Any]]:
    """Get a specific task by ID."""
    task = db.get_task(task_id)
    if not task:
        return None
    
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "completed": task.completed,
        "created_at": task.created_at.isoformat(),
        "updated_at": task.updated_at.isoformat(),
        "due_date": task.due_date.isoformat() if task.due_date else None,
        "priority": task.priority,
        "category": task.category,
        "tags": task.tags
    }

@mcp.tool
def update_task(
    task_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    completed: Optional[bool] = None,
    due_date: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    tags: Optional[List[str]] = None
) -> Optional[Dict[str, Any]]:
    """Update an existing task."""
    from datetime import datetime
    
    updates = TodoUpdate(
        title=title,
        description=description,
        completed=completed,
        due_date=datetime.fromisoformat(due_date) if due_date else None,
        priority=priority,
        category=category,
        tags=tags
    )
    
    task = db.update_task(task_id, updates)
    if not task:
        return None
    
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "completed": task.completed,
        "created_at": task.created_at.isoformat(),
        "updated_at": task.updated_at.isoformat(),
        "due_date": task.due_date.isoformat() if task.due_date else None,
        "priority": task.priority,
        "category": task.category,
        "tags": task.tags
    }

@mcp.tool
def delete_task(task_id: str) -> bool:
    """Delete a task."""
    return db.delete_task(task_id)

@mcp.tool
def get_task_stats() -> Dict[str, Any]:
    """Get task statistics."""
    stats = db.get_stats()
    return {
        "total": stats.total,
        "active": stats.active,
        "completed": stats.completed,
        "overdue": stats.overdue,
        "completion_rate": stats.completion_rate
    }

@mcp.tool
def toggle_task_completion(task_id: str) -> Optional[Dict[str, Any]]:
    """Toggle the completion status of a task."""
    task = db.get_task(task_id)
    if not task:
        return None
    
    updates = TodoUpdate(completed=not task.completed)
    updated_task = db.update_task(task_id, updates)
    
    if not updated_task:
        return None
    
    return {
        "id": updated_task.id,
        "title": updated_task.title,
        "description": updated_task.description,
        "completed": updated_task.completed,
        "created_at": updated_task.created_at.isoformat(),
        "updated_at": updated_task.updated_at.isoformat(),
        "due_date": updated_task.due_date.isoformat() if updated_task.due_date else None,
        "priority": updated_task.priority,
        "category": updated_task.category,
        "tags": updated_task.tags
    }

@mcp.tool
def get_database_info() -> Dict[str, str]:
    """Get information about the database configuration."""
    return {
        "current_path": db.db_path,
        "default_path": str(get_default_db_path()),
        "display_path": get_app_data_display_path()
    }

@mcp.tool
def set_database_path(new_path: str) -> Dict[str, str]:
    """Set a new database path."""
    # Create a new database instance with the new path
    new_db = TaskDatabase(new_path)
    # Update the global database instance
    db.__dict__.update(new_db.__dict__)
    return {
        "message": "Database path updated successfully",
        "new_path": new_path
    }

@mcp.resource("tasks://all")
def get_tasks_resource() -> str:
    """Get all tasks as a resource."""
    tasks = db.get_tasks()
    tasks_data = [
        {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "completed": task.completed,
            "created_at": task.created_at.isoformat(),
            "updated_at": task.updated_at.isoformat(),
            "due_date": task.due_date.isoformat() if task.due_date else None,
            "priority": task.priority,
            "category": task.category,
            "tags": task.tags
        }
        for task in tasks
    ]
    
    import json
    return json.dumps(tasks_data, indent=2)

@mcp.resource("tasks://stats")
def get_task_stats_resource() -> str:
    """Get task statistics as a resource."""
    stats = db.get_stats()
    import json
    return json.dumps({
        "total": stats.total,
        "active": stats.active,
        "completed": stats.completed,
        "overdue": stats.overdue,
        "completion_rate": stats.completion_rate
    }, indent=2)

if __name__ == "__main__":
    mcp.run()

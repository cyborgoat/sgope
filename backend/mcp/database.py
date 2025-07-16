import sqlite3
import json
from datetime import datetime
from typing import List, Optional
from pathlib import Path
from models import TodoItem, TodoCreate, TodoUpdate, TodoFilter, TodoStats
from config import get_default_db_path

class TaskDatabase:
    def __init__(self, db_path: Optional[str] = None):
        self.db_path = db_path or str(get_default_db_path())
        self.init_db()
    
    def init_db(self):
        """Initialize the database with the tasks table."""
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS tasks (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    description TEXT,
                    completed BOOLEAN NOT NULL DEFAULT 0,
                    created_at TIMESTAMP NOT NULL,
                    updated_at TIMESTAMP NOT NULL,
                    due_date TIMESTAMP,
                    priority TEXT NOT NULL DEFAULT 'medium',
                    category TEXT,
                    tags TEXT  -- JSON array
                )
            ''')
            conn.commit()
    
    def create_task(self, task_data: TodoCreate) -> TodoItem:
        """Create a new task."""
        task_id = str(int(datetime.now().timestamp() * 1000000))
        now = datetime.now()
        
        task = TodoItem(
            id=task_id,
            title=task_data.title,
            description=task_data.description,
            completed=False,
            created_at=now,
            updated_at=now,
            due_date=task_data.due_date,
            priority=task_data.priority,
            category=task_data.category,
            tags=task_data.tags
        )
        
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT INTO tasks (id, title, description, completed, created_at, updated_at, due_date, priority, category, tags)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                task.id,
                task.title,
                task.description,
                task.completed,
                task.created_at.isoformat(),
                task.updated_at.isoformat(),
                task.due_date.isoformat() if task.due_date else None,
                task.priority,
                task.category,
                json.dumps(task.tags)
            ))
            conn.commit()
        
        return task
    
    def get_tasks(self, filters: Optional[TodoFilter] = None) -> List[TodoItem]:
        """Get all tasks with optional filtering."""
        query = "SELECT * FROM tasks"
        params = []
        conditions = []
        
        if filters:
            if filters.status == "active":
                conditions.append("completed = 0")
            elif filters.status == "completed":
                conditions.append("completed = 1")
            
            if filters.priority and filters.priority != "all":
                conditions.append("priority = ?")
                params.append(filters.priority)
            
            if filters.category:
                conditions.append("category = ?")
                params.append(filters.category)
            
            if filters.tag:
                conditions.append("tags LIKE ?")
                params.append(f'%"{filters.tag}"%')
        
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        query += " ORDER BY created_at DESC"
        
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute(query, params)
            rows = cursor.fetchall()
        
        tasks = []
        for row in rows:
            task = TodoItem(
                id=row["id"],
                title=row["title"],
                description=row["description"],
                completed=bool(row["completed"]),
                created_at=datetime.fromisoformat(row["created_at"]),
                updated_at=datetime.fromisoformat(row["updated_at"]),
                due_date=datetime.fromisoformat(row["due_date"]) if row["due_date"] else None,
                priority=row["priority"],
                category=row["category"],
                tags=json.loads(row["tags"]) if row["tags"] else []
            )
            tasks.append(task)
        
        return tasks
    
    def get_task(self, task_id: str) -> Optional[TodoItem]:
        """Get a specific task by ID."""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
            row = cursor.fetchone()
        
        if not row:
            return None
        
        return TodoItem(
            id=row["id"],
            title=row["title"],
            description=row["description"],
            completed=bool(row["completed"]),
            created_at=datetime.fromisoformat(row["created_at"]),
            updated_at=datetime.fromisoformat(row["updated_at"]),
            due_date=datetime.fromisoformat(row["due_date"]) if row["due_date"] else None,
            priority=row["priority"],
            category=row["category"],
            tags=json.loads(row["tags"]) if row["tags"] else []
        )
    
    def update_task(self, task_id: str, updates: TodoUpdate) -> Optional[TodoItem]:
        """Update an existing task."""
        existing_task = self.get_task(task_id)
        if not existing_task:
            return None
        
        # Apply updates
        update_data = updates.dict(exclude_unset=True)
        if update_data:
            update_data["updated_at"] = datetime.now()
            
            # Build update query
            set_clauses = []
            params = []
            
            for field, value in update_data.items():
                if field == "tags":
                    set_clauses.append("tags = ?")
                    params.append(json.dumps(value))
                elif field == "due_date":
                    set_clauses.append("due_date = ?")
                    params.append(value.isoformat() if value else None)
                elif field == "updated_at":
                    set_clauses.append("updated_at = ?")
                    params.append(value.isoformat())
                else:
                    set_clauses.append(f"{field} = ?")
                    params.append(value)
            
            params.append(task_id)
            
            with sqlite3.connect(self.db_path) as conn:
                conn.execute(
                    f"UPDATE tasks SET {', '.join(set_clauses)} WHERE id = ?",
                    params
                )
                conn.commit()
        
        return self.get_task(task_id)
    
    def delete_task(self, task_id: str) -> bool:
        """Delete a task."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
            conn.commit()
            return cursor.rowcount > 0
    
    def get_stats(self) -> TodoStats:
        """Get task statistics."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END) as active,
                    SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed,
                    SUM(CASE WHEN completed = 0 AND due_date < datetime('now') THEN 1 ELSE 0 END) as overdue
                FROM tasks
            ''')
            row = cursor.fetchone()
        
        total = row[0] or 0
        active = row[1] or 0
        completed = row[2] or 0
        overdue = row[3] or 0
        
        completion_rate = (completed / total * 100) if total > 0 else 0
        
        return TodoStats(
            total=total,
            active=active,
            completed=completed,
            overdue=overdue,
            completion_rate=completion_rate
        )

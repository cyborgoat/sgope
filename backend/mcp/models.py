from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class TodoItem(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    completed: bool = False
    created_at: datetime
    updated_at: datetime
    due_date: Optional[datetime] = None
    priority: str = "medium"  # low, medium, high
    category: Optional[str] = None
    tags: List[str] = []

class TodoCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: str = "medium"
    category: Optional[str] = None
    tags: List[str] = []

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None

class TodoFilter(BaseModel):
    status: Optional[str] = None  # all, active, completed
    priority: Optional[str] = None  # all, low, medium, high
    category: Optional[str] = None
    tag: Optional[str] = None

class TodoStats(BaseModel):
    total: int
    active: int
    completed: int
    overdue: int
    completion_rate: float

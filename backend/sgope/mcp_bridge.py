"""
FastAPI integration for MCP Task Management Server
Bridges FastAPI routes with MCP tools.
"""

import asyncio
import json
import os
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from fastmcp import Client
from fastmcp.client.transports import PythonStdioTransport

# Task models for API
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[str] = None
    priority: str = "medium"
    category: Optional[str] = None
    tags: List[str] = []

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    due_date: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None

class TaskFilter(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    tag: Optional[str] = None

# Router for task management
router = APIRouter()

class MCPTaskClient:
    """Client for communicating with MCP task management server."""
    
    def __init__(self, server_path: Optional[str] = None):
        if server_path is None:
            # Get the absolute path to the MCP server (it's in the backend/mcp directory)
            current_dir = os.path.dirname(os.path.abspath(__file__))
            backend_dir = os.path.dirname(current_dir)  # Go up one level to backend/
            server_path = os.path.join(backend_dir, "mcp", "server.py")
        
        # Use PythonStdioTransport to run the MCP server
        transport = PythonStdioTransport(server_path)
        self.client = Client(transport)
    
    async def call_tool(self, tool_name: str, params: Dict[str, Any]) -> Any:
        """Call a tool on the MCP server."""
        try:
            async with self.client:
                result = await self.client.call_tool(tool_name, params)
                
                # Handle different response formats
                if hasattr(result, 'content') and result.content:
                    # If it has content, parse the JSON
                    import json
                    try:
                        # Check if the content is text content
                        content_item = result.content[0]
                        if hasattr(content_item, 'text'):
                            text_content = getattr(content_item, 'text', None)
                            if text_content:
                                return json.loads(text_content)
                        return None
                    except (json.JSONDecodeError, IndexError, AttributeError):
                        return None
                elif hasattr(result, 'data'):
                    # If it has data attribute, use it
                    return result.data
                elif isinstance(result, (dict, list)):
                    # If it's already a dict or list, return it
                    return result
                else:
                    # If it's a Root object or similar, try to convert it
                    if hasattr(result, '__dict__'):
                        return result.__dict__
                    return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"MCP tool call failed: {str(e)}")

# Global MCP client instance
mcp_client = MCPTaskClient()

@router.post("/tasks", response_model=dict)
async def create_task(task: TaskCreate):
    """Create a new task."""
    params = {
        "title": task.title,
        "description": task.description,
        "due_date": task.due_date,
        "priority": task.priority,
        "category": task.category,
        "tags": task.tags
    }
    result = await mcp_client.call_tool("create_task", params)
    
    if result is None:
        raise HTTPException(status_code=500, detail="Failed to create task")
    
    return result

@router.get("/tasks", response_model=List[dict])
async def get_tasks(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    tag: Optional[str] = None
):
    """Get all tasks with optional filtering."""
    params = {
        "status": status,
        "priority": priority,
        "category": category,
        "tag": tag
    }
    result = await mcp_client.call_tool("get_tasks", params)
    
    if result is None:
        return []
    
    # Ensure we return a list
    if isinstance(result, list):
        return result
    elif isinstance(result, dict):
        return [result]
    else:
        return []

@router.get("/tasks/stats", response_model=dict)
async def get_task_stats():
    """Get task statistics."""
    result = await mcp_client.call_tool("get_task_stats", {})
    return result if result is not None else {}

@router.get("/tasks/{task_id}", response_model=dict)
async def get_task(task_id: str):
    """Get a specific task by ID."""
    result = await mcp_client.call_tool("get_task", {"task_id": task_id})
    
    if result is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return result

@router.put("/tasks/{task_id}", response_model=dict)
async def update_task(task_id: str, updates: TaskUpdate):
    """Update an existing task."""
    params = {
        "task_id": task_id,
        **{k: v for k, v in updates.dict().items() if v is not None}
    }
    result = await mcp_client.call_tool("update_task", params)
    
    if result is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return result

@router.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    """Delete a task."""
    success = await mcp_client.call_tool("delete_task", {"task_id": task_id})
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}

@router.post("/tasks/{task_id}/toggle")
async def toggle_task_completion(task_id: str):
    """Toggle the completion status of a task."""
    result = await mcp_client.call_tool("toggle_task_completion", {"task_id": task_id})
    if result is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return result

@router.get("/tasks/database/info")
async def get_database_info():
    """Get database configuration information."""
    return await mcp_client.call_tool("get_database_info", {})

@router.post("/tasks/database/path")
async def set_database_path(path: str):
    """Set a new database path."""
    return await mcp_client.call_tool("set_database_path", {"new_path": path})

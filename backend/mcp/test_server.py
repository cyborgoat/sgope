#!/usr/bin/env python3
"""
Test script for the FastMCP task management server.
"""

import asyncio
import sys
import os

# Add the mcp directory to the path so we can import our modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastmcp import Client

async def test_mcp_server():
    """Test the MCP server functionality."""
    # Create a client pointing to our server
    client = Client("server.py")
    
    try:
        async with client:
            # Test creating a task
            print("Testing task creation...")
            result = await client.call_tool("create_task", {
                "title": "Test Task",
                "description": "This is a test task",
                "priority": "high"
            })
            print(f"Created task: {result}")
            
            # Test getting tasks
            print("\nTesting task retrieval...")
            tasks_result = await client.call_tool("get_tasks", {})
            tasks = tasks_result.data if hasattr(tasks_result, 'data') else tasks_result
            print(f"Retrieved {len(tasks)} tasks")
            
            # Test getting stats
            print("\nTesting task stats...")
            stats_result = await client.call_tool("get_task_stats", {})
            stats = stats_result.data if hasattr(stats_result, 'data') else stats_result
            print(f"Stats: {stats}")
            
            # Test getting database info
            print("\nTesting database info...")
            db_info_result = await client.call_tool("get_database_info", {})
            db_info = db_info_result.data if hasattr(db_info_result, 'data') else db_info_result
            print(f"Database info: {db_info}")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_mcp_server())

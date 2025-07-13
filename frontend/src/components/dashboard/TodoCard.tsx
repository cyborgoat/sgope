"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  CheckSquare, 
  Plus, 
  ChevronRight,
  Circle,
  CheckCircle
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  priority: "low" | "medium" | "high";
}

const TODO_STORAGE_KEY = "sgope-todos";

export function TodoCard() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState("");

  // Load todos from localStorage
  useEffect(() => {
    const storedTodos = localStorage.getItem(TODO_STORAGE_KEY);
    if (storedTodos) {
      try {
        const parsed = JSON.parse(storedTodos);
        const todosWithDates = parsed.map((todo: Record<string, unknown>) => ({
          ...todo,
          createdAt: typeof todo.createdAt === 'string' || typeof todo.createdAt === 'number' ? new Date(todo.createdAt) : new Date()
        }));
        setTodos(todosWithDates);
      } catch (error) {
        console.error("Error parsing todos from localStorage:", error);
      }
    }
  }, []);

  // Save todos to localStorage
  const saveTodos = (newTodos: TodoItem[]) => {
    localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(newTodos));
    setTodos(newTodos);
  };

  const addTodo = () => {
    if (!newTodoTitle.trim()) return;

    const newTodo: TodoItem = {
      id: Date.now().toString(),
      title: newTodoTitle.trim(),
      completed: false,
      createdAt: new Date(),
      priority: "medium"
    };

    const updatedTodos = [newTodo, ...todos];
    saveTodos(updatedTodos);
    setNewTodoTitle("");
  };

  const toggleTodo = (id: string) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos(updatedTodos);
  };

  const incompleteTodos = todos.filter(todo => !todo.completed);
  const completedCount = todos.filter(todo => todo.completed).length;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-500";
      case "medium": return "text-yellow-500";
      case "low": return "text-green-500";
      default: return "text-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Todo List
            </CardTitle>
            <CardDescription>
              Track your tasks and stay organized
            </CardDescription>
          </div>
          <Badge variant={completedCount > 0 ? "default" : "secondary"}>
            {completedCount}/{todos.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Quick Add */}
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Add a new task..."
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={addTodo} disabled={!newTodoTitle.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{incompleteTodos.length}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
        </div>

        {/* Recent Todos */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Recent Tasks</h4>
          {todos.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No tasks yet. Add one above!
            </div>
          ) : (
            <ScrollArea className="h-32">
              {todos.slice(0, 5).map((todo) => (
                <div 
                  key={todo.id} 
                  className={`flex items-center gap-3 p-2 hover:bg-muted/50 rounded-sm ${
                    todo.completed ? 'opacity-60' : ''
                  }`}
                >
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() => toggleTodo(todo.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <span 
                      className={`text-sm ${
                        todo.completed ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {todo.title}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <Circle className={`h-2 w-2 fill-current ${getPriorityColor(todo.priority)}`} />
                      <span className="text-xs text-muted-foreground">
                        {todo.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {todo.completed && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
              ))}
            </ScrollArea>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-4 pt-4 border-t">
          <Link href="/tasks">
            <Button variant="outline" className="w-full" size="sm">
              <ChevronRight className="h-4 w-4 mr-2" />
              Manage All Tasks
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

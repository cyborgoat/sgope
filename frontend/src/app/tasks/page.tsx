"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
// import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  Edit, 
  Calendar,
  Circle,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface TodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  priority: "low" | "medium" | "high";
  category?: string;
  tags: string[];
}

const TODO_STORAGE_KEY = "sgope-todos";

export default function TasksPage() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "low" | "medium" | "high">("all");
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    category: "",
    dueDate: "",
    tags: ""
  });

  // Load todos from localStorage
  useEffect(() => {
    const storedTodos = localStorage.getItem(TODO_STORAGE_KEY);
    if (storedTodos) {
      try {
        const parsed = JSON.parse(storedTodos);
        const todosWithDates = parsed.map((todo: Record<string, unknown>) => ({
          ...todo,
          createdAt: typeof todo.createdAt === 'string' || typeof todo.createdAt === 'number' ? new Date(todo.createdAt) : new Date(),
          updatedAt: typeof todo.updatedAt === 'string' || typeof todo.updatedAt === 'number' ? new Date(todo.updatedAt) : new Date(),
          dueDate: todo.dueDate && (typeof todo.dueDate === 'string' || typeof todo.dueDate === 'number') ? new Date(todo.dueDate) : undefined
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

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      category: "",
      dueDate: "",
      tags: ""
    });
  };

  const addTodo = () => {
    if (!formData.title.trim()) return;

    const newTodo: TodoItem = {
      id: Date.now().toString(),
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      priority: formData.priority,
      category: formData.category.trim() || undefined,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    const updatedTodos = [newTodo, ...todos];
    saveTodos(updatedTodos);
    resetForm();
    setIsAddDialogOpen(false);
  };

  const updateTodo = () => {
    if (!editingTodo || !formData.title.trim()) return;

    const updatedTodos = todos.map(todo =>
      todo.id === editingTodo.id 
        ? {
            ...todo,
            title: formData.title.trim(),
            description: formData.description.trim() || undefined,
            priority: formData.priority,
            category: formData.category.trim() || undefined,
            dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
            updatedAt: new Date()
          }
        : todo
    );
    
    saveTodos(updatedTodos);
    resetForm();
    setIsEditDialogOpen(false);
    setEditingTodo(null);
  };

  const toggleTodo = (id: string) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id 
        ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
        : todo
    );
    saveTodos(updatedTodos);
  };

  const deleteTodo = (id: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    saveTodos(updatedTodos);
  };

  const editTodo = (todo: TodoItem) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description || "",
      priority: todo.priority,
      category: todo.category || "",
      dueDate: todo.dueDate ? todo.dueDate.toISOString().split('T')[0] : "",
      tags: todo.tags.join(', ')
    });
    setIsEditDialogOpen(true);
  };

  // Filter todos
  const filteredTodos = todos.filter(todo => {
    if (filter === "active" && todo.completed) return false;
    if (filter === "completed" && !todo.completed) return false;
    if (priorityFilter !== "all" && todo.priority !== priorityFilter) return false;
    return true;
  });

  const completedCount = todos.filter(todo => todo.completed).length;
  const activeTodosCount = todos.length - completedCount;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-500 bg-red-50 border-red-200";
      case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-500 bg-gray-50 border-gray-200";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <AlertCircle className="h-3 w-3" />;
      case "medium": return <Circle className="h-3 w-3" />;
      case "low": return <CheckCircle className="h-3 w-3" />;
      default: return <Circle className="h-3 w-3" />;
    }
  };

  const isOverdue = (dueDate?: Date) => {
    return dueDate && dueDate < new Date() && dueDate.toDateString() !== new Date().toDateString();
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground">
            Manage your tasks and stay organized
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter task title..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add more details..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value: "low" | "medium" | "high") => 
                        setFormData({ ...formData, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Work, Personal, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="urgent, project, meeting"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addTodo} disabled={!formData.title.trim()}>
                  Add Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todos.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Circle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeTodosCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filter} onValueChange={(value: "all" | "active" | "completed") => setFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priorityFilter} onValueChange={(value: "all" | "low" | "medium" | "high") => setPriorityFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tasks ({filteredTodos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTodos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {filter === "all" ? "No tasks yet. Create your first task above!" : `No ${filter} tasks found.`}
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {filteredTodos.map((todo) => (
                  <div 
                    key={todo.id} 
                    className={`p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                      todo.completed ? 'opacity-60' : ''
                    } ${isOverdue(todo.dueDate) && !todo.completed ? 'border-red-300 bg-red-50' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => toggleTodo(todo.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={`font-medium ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {todo.title}
                          </h3>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPriorityColor(todo.priority)}`}
                          >
                            <span className="flex items-center gap-1">
                              {getPriorityIcon(todo.priority)}
                              {todo.priority}
                            </span>
                          </Badge>
                          {isOverdue(todo.dueDate) && !todo.completed && (
                            <Badge variant="destructive" className="text-xs">
                              Overdue
                            </Badge>
                          )}
                        </div>
                        
                        {todo.description && (
                          <p className={`text-sm mb-2 ${todo.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                            {todo.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Created: {todo.createdAt.toLocaleDateString()}</span>
                          {todo.dueDate && (
                            <span className={isOverdue(todo.dueDate) && !todo.completed ? 'text-red-600 font-medium' : ''}>
                              Due: {todo.dueDate.toLocaleDateString()}
                            </span>
                          )}
                          {todo.category && (
                            <Badge variant="secondary" className="text-xs">
                              {todo.category}
                            </Badge>
                          )}
                        </div>
                        
                        {todo.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {todo.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => editTodo(todo)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTodo(todo.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add more details..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value: "low" | "medium" | "high") => 
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dueDate">Due Date</Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Input
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Work, Personal, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tags">Tags (comma separated)</Label>
              <Input
                id="edit-tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="urgent, project, meeting"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateTodo} disabled={!formData.title.trim()}>
              Update Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import { getTaskColumns } from "@/components/task-columns";
import { 
  CheckSquare, 
  Plus, 
  Calendar,
  Circle,
  CheckCircle,
  AlertCircle,
  Database,
  Settings,
  TrendingUp
} from "lucide-react";
import { 
  Task, 
  TaskCreate, 
  TaskUpdate,
  TaskStats, 
  apiCreateTask, 
  apiGetTasks, 
  apiGetTaskStats,
  apiGetDatabaseInfo,
  apiUpdateTask,
  apiDeleteTask,
  DatabaseInfo
} from "@/lib/api/tasks";

export default function TasksPage() {
  // All state and handlers must be inside the component
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    active: 0,
    completed: 0,
    overdue: 0,
    completion_rate: 0
  });
  const [dbInfo, setDbInfo] = useState<DatabaseInfo>({
    current_path: "",
    default_path: "",
    display_path: ""
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "low" | "medium" | "high">("all");
  // Form state
  const [formData, setFormData] = useState<TaskCreate>({
    title: "",
    description: "",
    priority: "medium",
    category: "",
    due_date: "",
    tags: []
  });
  // Edit/Delete dialog state
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState<TaskUpdate | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);


  // Edit handler
  const handleEdit = (task: Task) => {
    setEditTask(task);
    setEditForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      category: task.category || "",
      due_date: task.due_date || "",
      tags: task.tags || [],
      completed: task.completed, // Always include completed
    });
    setIsEditDialogOpen(true);
  };

  // Detail handler
  const handleDetail = (task: Task) => {
    // TODO: Implement detail dialog logic
    alert(`Task details: ${task.title}`);
  };

  // Delete handler
  const handleDelete = (task: Task) => {
    setDeleteTask(task);
    setIsDeleteDialogOpen(true);
  };

  // Save edit
  const saveEdit = async () => {
    if (!editTask || !editForm) return;
    try {
      // Always include completed in the update request
      await apiUpdateTask(editTask.id, { ...editForm, completed: editForm.completed });
      setIsEditDialogOpen(false);
      setEditTask(null);
      setEditForm(null);
      loadData();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!deleteTask) return;
    try {
      await apiDeleteTask(deleteTask.id);
      setIsDeleteDialogOpen(false);
      setDeleteTask(null);
      loadData();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Load data
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, priorityFilter]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [tasksData, statsData, dbData] = await Promise.all([
        apiGetTasks({
          status: filter === "all" ? undefined : filter,
          priority: priorityFilter === "all" ? undefined : priorityFilter
        }),
        apiGetTaskStats(),
        apiGetDatabaseInfo()
      ]);
      setTasks(tasksData);
      setStats(statsData);
      setDbInfo(dbData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      category: "",
      due_date: "",
      tags: []
    });
  };

  const addTask = async () => {
    if (!formData.title.trim()) return;

    try {
      const taskData: TaskCreate = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        category: formData.category?.trim() || undefined,
        tags: Array.isArray(formData.tags) 
          ? formData.tags
          : (formData.tags as string).split(',').map((tag: string) => tag.trim()).filter(Boolean)
      };

      await apiCreateTask(taskData);
      resetForm();
      setIsAddDialogOpen(false);
      loadData(); // Refresh data
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleTagsChange = (value: string) => {
    setFormData({
      ...formData,
      tags: value.split(',').map(tag => tag.trim()).filter(Boolean)
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight truncate">Tasks</h1>
            <p className="text-muted-foreground text-sm truncate">
              Manage your tasks efficiently with our modern interface
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
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Add more details..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
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
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
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
                      value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags}
                      onChange={(e) => handleTagsChange(e.target.value)}
                      placeholder="urgent, project, meeting"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addTask} disabled={!formData.title.trim()}>
                    Add Task
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="space-y-4 p-8 pt-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  All tasks in your system
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                <Circle className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
                <p className="text-xs text-muted-foreground">
                  Tasks still in progress
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <p className="text-xs text-muted-foreground">
                  Successfully finished tasks
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.completion_rate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.overdue > 0 && `${stats.overdue} overdue`}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Quick Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex gap-2 items-center flex-wrap">
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
                <div className="flex items-center space-x-2 ml-auto">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground truncate">
                    Database: {dbInfo.display_path}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasks Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tasks ({tasks.length})</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  Loading tasks...
                </div>
              ) : (
                <DataTable
                  columns={getTaskColumns({ onEdit: handleEdit, onDelete: handleDelete, onDetail: handleDetail })}
                  data={tasks}
                  searchKey="title"
                  searchPlaceholder="Search tasks..."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editForm && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Enter task title..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Add more details..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select value={editForm.priority} onValueChange={(value) => setEditForm({ ...editForm, priority: value })}>
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
                    value={editForm.due_date}
                    onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  placeholder="Work, Personal, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tags">Tags (comma separated)</Label>
                <Input
                  id="edit-tags"
                  value={Array.isArray(editForm.tags) ? editForm.tags.join(', ') : editForm.tags}
                  onChange={(e) => setEditForm({ ...editForm, tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean) })}
                  placeholder="urgent, project, meeting"
                />
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={!editForm?.title.trim()}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Task Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete this task?
            <div className="mt-2 text-muted-foreground text-sm">
              {deleteTask?.title}
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

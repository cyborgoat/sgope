import { BACKEND_URL, apiRequest } from './common';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  due_date?: string;
  priority: string;
  category?: string;
  tags: string[];
}

export interface TaskCreate {
  title: string;
  description?: string;
  due_date?: string;
  priority: string;
  category?: string;
  tags: string[];
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
  due_date?: string;
  priority?: string;
  category?: string;
  tags?: string[];
}

export interface TaskStats {
  total: number;
  active: number;
  completed: number;
  overdue: number;
  completion_rate: number;
}

export interface DatabaseInfo {
  current_path: string;
  default_path: string;
  display_path: string;
}

export const apiCreateTask = async (task: TaskCreate): Promise<Task> => {
  return apiRequest<Task>(`${BACKEND_URL}/api/mcp/tasks`, {
    method: 'POST',
    body: JSON.stringify(task),
  });
};

export const apiGetTasks = async (filters?: {
  status?: string;
  priority?: string;
  category?: string;
  tag?: string;
}): Promise<Task[]> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.tag) params.append('tag', filters.tag);
  
  const url = `${BACKEND_URL}/api/mcp/tasks${params.toString() ? `?${params.toString()}` : ''}`;
  return apiRequest<Task[]>(url);
};

export const apiGetTask = async (taskId: string): Promise<Task> => {
  return apiRequest<Task>(`${BACKEND_URL}/api/mcp/tasks/${taskId}`);
};

export const apiUpdateTask = async (taskId: string, updates: TaskUpdate): Promise<Task> => {
  return apiRequest<Task>(`${BACKEND_URL}/api/mcp/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};

export const apiDeleteTask = async (taskId: string): Promise<void> => {
  return apiRequest<void>(`${BACKEND_URL}/api/mcp/tasks/${taskId}`, {
    method: 'DELETE',
  });
};

export const apiToggleTaskCompletion = async (taskId: string): Promise<Task> => {
  return apiRequest<Task>(`${BACKEND_URL}/api/mcp/tasks/${taskId}/toggle`, {
    method: 'POST',
  });
};

export const apiGetTaskStats = async (): Promise<TaskStats> => {
  return apiRequest<TaskStats>(`${BACKEND_URL}/api/mcp/tasks/stats`);
};

export const apiGetDatabaseInfo = async (): Promise<DatabaseInfo> => {
  return apiRequest<DatabaseInfo>(`${BACKEND_URL}/api/mcp/tasks/database/info`);
};

export const apiSetDatabasePath = async (path: string): Promise<{ message: string; new_path: string }> => {
  return apiRequest<{ message: string; new_path: string }>(`${BACKEND_URL}/api/mcp/tasks/database/path`, {
    method: 'POST',
    body: JSON.stringify({ path }),
  });
};

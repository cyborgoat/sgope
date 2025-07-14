/**
 * Dashboard and Activity Types
 * Used in Dashboard and RecentActivityCard components
 */

export interface DashboardStats {
  knowledge_files: number;
  total_actions: number;
  active_models: number;
  recent_chats: number;
}

export interface RecentActivity {
  id: string;
  type: "chat" | "file_upload" | "action" | "model_change";
  description: string;
  timestamp: Date;
}

export interface RecentActivityCardProps {
  activities: RecentActivity[];
}

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  priority: "low" | "medium" | "high";
}

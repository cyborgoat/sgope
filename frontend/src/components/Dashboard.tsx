"use client";

import { useState, useEffect } from "react";
import { fetchStats } from '@/lib/api/stats';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Brain, 
  FileText, 
  MessageSquare, 
  RefreshCw
} from "lucide-react";
import { KnowledgeBaseCard } from "./dashboard/KnowledgeBaseCard";
import { LLMServiceCard } from "./dashboard/LLMServiceCard";
import { TodoCard } from "./dashboard/TodoCard";
import { RecentActivityCard } from "./dashboard/RecentActivityCard";
import { DashboardStats, RecentActivity } from "@/types";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    knowledge_files: 0,
    total_actions: 0,
    active_models: 0,
    recent_chats: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchStats();
      setStats({
        knowledge_files: data.short_term_memory?.files || 0,
        total_actions: data.long_term_memory?.total_actions || 0,
        active_models: data.llm_services?.all_models?.length || 0,
        recent_chats: 5 // Placeholder - you can implement this endpoint
      });
      // Generate some mock recent activity
      const mockActivity: RecentActivity[] = [
        {
          id: "1",
          type: "chat",
          description: "Started chat with llama3.2:latest",
          timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
        },
        {
          id: "2", 
          type: "file_upload",
          description: "Uploaded project_notes.md",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
        },
        {
          id: "3",
          type: "action",
          description: "Executed file search action",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4) // 4 hours ago
        }
      ];
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 animate-pulse mb-1" />
                <div className="h-3 bg-muted rounded w-24 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={fetchDashboardData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Knowledge Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.knowledge_files}</div>
            <p className="text-xs text-muted-foreground">
              Files in knowledge base
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Models</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_models}</div>
            <p className="text-xs text-muted-foreground">
              Available LLM models
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_actions}</div>
            <p className="text-xs text-muted-foreground">
              Actions executed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Chats</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recent_chats}</div>
            <p className="text-xs text-muted-foreground">
              In the last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 space-y-4">
          {/* Knowledge Base Card */}
          <KnowledgeBaseCard />
          
          {/* LLM Services Card */}
          <LLMServiceCard />
        </div>
        
        <div className="col-span-3 space-y-4">
          {/* Todo Card */}
          <TodoCard />
          
          {/* Recent Activity Card */}
          <RecentActivityCard activities={recentActivity} />
        </div>
      </div>
    </div>
  );
}

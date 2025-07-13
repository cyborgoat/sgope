"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Activity, 
  MessageSquare, 
  FileText, 
  Brain, 
  RefreshCw,
  Search,
  Calendar,
  Clock
} from "lucide-react";

interface ActivityLog {
  id: string;
  type: "chat" | "file_upload" | "action" | "model_change" | "system";
  description: string;
  details?: string;
  timestamp: Date;
  user?: string;
  metadata?: Record<string, unknown>;
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("all");

  const generateMockActivities = (): ActivityLog[] => {
    const types: ("chat" | "file_upload" | "action" | "model_change" | "system")[] = [
      "chat", "file_upload", "action", "model_change", "system"
    ];
    
    const descriptions = {
      chat: [
        "Started new chat session",
        "Sent message about project requirements",
        "Asked for code review suggestions",
        "Requested explanation about API design",
        "Discussed implementation strategy"
      ],
      file_upload: [
        "Uploaded project_notes.md",
        "Added config.json to knowledge base",
        "Uploaded requirements.txt",
        "Added README.md documentation",
        "Uploaded test_data.csv"
      ],
      action: [
        "Executed file search action",
        "Ran code analysis",
        "Generated project summary",
        "Performed knowledge search",
        "Executed documentation generation"
      ],
      model_change: [
        "Switched to GPT-4 model",
        "Changed to Claude-3 Sonnet",
        "Set llama3.2:latest as default",
        "Updated model configuration",
        "Added new Ollama service"
      ],
      system: [
        "System started successfully",
        "Model services refreshed",
        "Knowledge base updated",
        "Configuration saved",
        "Cache cleared"
      ]
    };

    const activities: ActivityLog[] = [];
    
    for (let i = 0; i < 50; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const description = descriptions[type][Math.floor(Math.random() * descriptions[type].length)];
      const hoursAgo = Math.floor(Math.random() * 24 * 7); // Last 7 days
      
      activities.push({
        id: `activity_${i}`,
        type,
        description,
        timestamp: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
        user: "user",
        metadata: {
          session_id: `session_${Math.floor(Math.random() * 100)}`,
          source: type === "system" ? "system" : "user"
        }
      });
    }
    
    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockActivities = generateMockActivities();
      setActivities(mockActivities);
      setFilteredActivities(mockActivities);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = activities;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.details?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(activity => activity.type === typeFilter);
    }

    // Apply time filter
    if (timeFilter !== "all") {
      const now = new Date();
      let cutoffDate: Date;
      
      switch (timeFilter) {
        case "1h":
          cutoffDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case "1d":
          cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "1w":
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(0);
      }
      
      filtered = filtered.filter(activity => activity.timestamp >= cutoffDate);
    }

    setFilteredActivities(filtered);
  }, [activities, searchTerm, typeFilter, timeFilter]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "chat":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "file_upload":
        return <FileText className="h-4 w-4 text-green-500" />;
      case "action":
        return <Activity className="h-4 w-4 text-purple-500" />;
      case "model_change":
        return <Brain className="h-4 w-4 text-orange-500" />;
      case "system":
        return <RefreshCw className="h-4 w-4 text-gray-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityBadge = (type: string) => {
    const colors = {
      chat: "bg-blue-100 text-blue-800 border-blue-200",
      file_upload: "bg-green-100 text-green-800 border-green-200",
      action: "bg-purple-100 text-purple-800 border-purple-200",
      model_change: "bg-orange-100 text-orange-800 border-orange-200",
      system: "bg-gray-100 text-gray-800 border-gray-200"
    };

    return (
      <Badge variant="outline" className={`text-xs ${colors[type as keyof typeof colors] || colors.system}`}>
        {type.replace('_', ' ')}
      </Badge>
    );
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  };

  const getActivityStats = () => {
    const last24h = activities.filter(a => 
      a.timestamp >= new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length;
    
    const last7d = activities.filter(a => 
      a.timestamp >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    const typeStats = activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { last24h, last7d, typeStats };
  };

  const stats = getActivityStats();

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Activity Log</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
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
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Activity Log</h2>
          <p className="text-muted-foreground">
            Track all system activities and user interactions
          </p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities.length}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 24h</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.last24h}</div>
            <p className="text-xs text-muted-foreground">
              Recent activity
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 7 days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.last7d}</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Active</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {Object.entries(stats.typeStats).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Activity type
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="chat">Chat</SelectItem>
                  <SelectItem value="file_upload">File Upload</SelectItem>
                  <SelectItem value="action">Actions</SelectItem>
                  <SelectItem value="model_change">Model Changes</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Range</label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="1d">Last 24 Hours</SelectItem>
                  <SelectItem value="1w">Last Week</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Results</label>
              <div className="flex items-center h-10 px-3 py-2 border rounded-md bg-muted">
                <span className="text-sm text-muted-foreground">
                  {filteredActivities.length} activities
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activity Timeline</CardTitle>
          <CardDescription>
            Chronological list of all system activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activities match your current filters
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {filteredActivities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getActivityBadge(activity.type)}
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {activity.timestamp.toLocaleString()}
                        </span>
                      </div>
                      <h3 className="font-medium text-sm mb-1">
                        {activity.description}
                      </h3>
                      {activity.details && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {activity.details}
                        </p>
                      )}
                      {activity.metadata && (
                        <div className="flex gap-2">
                          {Object.entries(activity.metadata).map(([key, value]) => (
                            <Badge key={key} variant="secondary" className="text-xs">
                              {key}: {String(value)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

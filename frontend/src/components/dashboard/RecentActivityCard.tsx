"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  MessageSquare, 
  FileText, 
  Brain, 
  Clock,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecentActivityCardProps } from "@/types";

export function RecentActivityCard({ activities }: RecentActivityCardProps) {
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
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case "chat":
        return <Badge variant="secondary" className="text-xs">Chat</Badge>;
      case "file_upload":
        return <Badge variant="secondary" className="text-xs">Upload</Badge>;
      case "action":
        return <Badge variant="secondary" className="text-xs">Action</Badge>;
      case "model_change":
        return <Badge variant="secondary" className="text-xs">Model</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Other</Badge>;
    }
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Your latest actions and interactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No recent activity to show
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {activities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-sm transition-colors"
                >
                  <div className="mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getActivityBadge(activity.type)}
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Quick Actions */}
        <div className="mt-4 pt-4 border-t">
          <Link href="/activity">
            <Button variant="outline" className="w-full" size="sm">
              <ChevronRight className="h-4 w-4 mr-2" />
              View Full Activity Log
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

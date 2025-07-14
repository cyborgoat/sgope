"use client";

import { useState, useEffect } from "react";
import { fetchServices, fetchModels } from "@/lib/api/llm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  RefreshCw, 
  Settings, 
  Circle,
  ChevronRight,
  Brain
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ModelInfo, ServiceInfo, LLMStats } from "@/types";

export function LLMServiceCard() {
  const [services, setServices] = useState<Record<string, ServiceInfo>>({});
  // Removed unused models state to fix ESLint error. Use modelsList locally only.
  const [stats, setStats] = useState<LLMStats>({
    total_services: 0,
    active_services: 0,
    total_models: 0,
    available_models: 0,
    default_model: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchLLMData = async () => {
    try {
      setIsLoading(true);
      const servicesData = await fetchServices();
      setServices(servicesData);
      const modelsData = await fetchModels();
      const modelsList = modelsData.all_models || [];
      const servicesList = Object.values(servicesData || {}) as ServiceInfo[];
      const stats: LLMStats = {
        total_services: servicesList.length,
        active_services: servicesList.filter(s => s.available).length,
        total_models: modelsList.length,
        available_models: modelsList.filter((m: ModelInfo) => m.available).length,
        default_model: modelsList.find((m: ModelInfo) => m.is_default)?.name || 'None'
      };
      setStats(stats);
    } catch (error) {
      console.error("Error fetching LLM data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLLMData();
  }, []);

  const getStatusColor = (available: boolean, status: string) => {
    if (available && status === "online") return "text-green-500";
    if (status === "configured") return "text-blue-500";
    return "text-red-500";
  };

  const getStatusText = (available: boolean, status: string) => {
    if (available && status === "online") return "Online";
    if (status === "configured") return "Configured";
    if (status.startsWith("error:")) return "Error";
    return "Offline";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              LLM Services
            </CardTitle>
            <CardDescription>
              Manage your language model endpoints and configurations
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchLLMData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.active_services}/{stats.total_services}</div>
            <div className="text-xs text-muted-foreground">Active Services</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.available_models}/{stats.total_models}</div>
            <div className="text-xs text-muted-foreground">Available Models</div>
          </div>
        </div>

        {/* Default Model */}
        <div className="mb-4 p-3 bg-muted/50 rounded-md">
          <div className="text-sm font-medium mb-1">Default Model</div>
          <div className="text-lg font-semibold text-primary">{stats.default_model}</div>
        </div>

        {/* Services List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Services</h4>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2 p-2">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <ScrollArea className="h-32">
              {Object.values(services).map((service) => (
                <div key={service.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-sm">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Circle
                      className={`h-2 w-2 fill-current ${getStatusColor(service.available, service.status)}`}
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium truncate">{service.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{service.type}</Badge>
                        <span className={`text-xs ${getStatusColor(service.available, service.status)}`}>
                          {getStatusText(service.available, service.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {service.models.length} models
                  </Badge>
                </div>
              ))}
              {Object.keys(services).length === 0 && !isLoading && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No services configured yet
                </div>
              )}
            </ScrollArea>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-4 pt-4 border-t space-y-2">
          <Button variant="outline" className="w-full" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure Services
          </Button>
          <Button variant="outline" className="w-full" size="sm">
            <ChevronRight className="h-4 w-4 mr-2" />
            View All Models
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

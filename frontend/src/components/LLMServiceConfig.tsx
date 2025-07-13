"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchServices, fetchModels, setDefaultModel as apiSetDefaultModel, removeService as apiRemoveService } from '@/lib/api/llm';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
import { useLLMStore } from "@/lib/llmStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Circle, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  TestTube, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Star} from "lucide-react";

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  service: string;
  service_type: string;
  available: boolean;
  is_default: boolean;
}

interface ServiceInfo {
  id: string;
  type: string;
  name: string;
  enabled: boolean;
  available: boolean;
  models: string[];
  status: string;
  config: Record<string, string | boolean | string[]>;
}

interface ServiceConfig {
  name: string;
  host?: string;
  api_key?: string;
  base_url?: string;
  models?: string[];
}

export default function LLMServiceConfig() {
  const selectedModel = useLLMStore((state) => state.selectedModel);
  const setSelectedModel = useLLMStore((state) => state.setSelectedModel);
  const services = useLLMStore((state) => state.services);
  const setServices = useLLMStore((state) => state.setServices);
  
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  
  // Configuration state
  const [selectedServiceType, setSelectedServiceType] = useState<"ollama" | "openai">("ollama");
  const [serviceConfig, setServiceConfig] = useState<ServiceConfig>({
    name: "",
    host: "http://localhost:11434",
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message?: string;
    models?: string[];
    available?: boolean;
  }>({ success: false });
  const [testAbortController, setTestAbortController] = useState<AbortController | null>(null);
  
  // Model selection state
  const [discoveredModels, setDiscoveredModels] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [openaiModelsInput, setOpenaiModels] = useState<string>('');
  const [testStatusMessage, setTestStatusMessage] = useState<string>('');

  const fetchModelsFromApi = useCallback(async () => {
    try {
      const data = await import('@/lib/api/llm').then(mod => mod.fetchModels());
      setModels(data.all_models || []);
      if (
        selectedModel &&
        !data.all_models.find((m: ModelInfo) => m.id === selectedModel)
      ) {
        setSelectedModel("");
      }
    } catch (error) {
      console.error("Error fetching models:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedModel, setSelectedModel]);

  const fetchServicesCb = async () => {
    try {
      const data = await fetchServices();
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const testService = async () => {
    setTesting(true);
    setTestResult({ success: false });
    setDiscoveredModels([]);
    setTestStatusMessage('Checking connection...');
    
    const abortController = new AbortController();
    setTestAbortController(abortController);
    
    try {
      const config: Record<string, string | string[]> = { ...serviceConfig };
      
      if (selectedServiceType === "openai" && openaiModelsInput) {
        config.models = openaiModelsInput.split(',').map(m => m.trim()).filter(Boolean);
      }
      
      setTestStatusMessage('Sending test request...');
      const response = await fetch(`${BACKEND_URL}/api/services/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_type: selectedServiceType,
          config: config,
        }),
        signal: abortController.signal,
      });
      
      const result = await response.json();
      
      if (result.success && result.available) {
        setTestResult({
          success: true,
          available: true,
          message: `✅ Connected successfully! Found ${result.models?.length || 0} models.`,
          models: result.models || [],
        });
        setDiscoveredModels(result.models || []);
        setTestStatusMessage('Models discovered!');
        
        if (selectedServiceType === "openai" && serviceConfig.models?.length) {
          setDiscoveredModels(serviceConfig.models);
          setSelectedModels(new Set(serviceConfig.models));
          setTestStatusMessage('Using configured OpenAI models.');
        } else {
          setSelectedModels(new Set(result.models || []));
          setTestStatusMessage('All discovered models selected.');
        }
      } else if (result.success && !result.available) {
        setTestResult({
          success: false,
          message: "❌ Service is reachable but not available. Check your configuration.",
        });
        setTestStatusMessage('Service reachable but not available.');
      } else {
        let errorMessage = result.error || "Test failed";
        
        if (errorMessage.includes("401") || errorMessage.includes("Authentication")) {
          errorMessage = "❌ Authentication failed - Please check your API key";
        } else if (errorMessage.includes("403")) {
          errorMessage = "❌ Access forbidden - Check your API key permissions";
        } else if (errorMessage.includes("404")) {
          errorMessage = "❌ Endpoint not found - Check your Base URL";
        } else if (errorMessage.includes("Connection")) {
          errorMessage = "❌ Connection failed - Check your endpoint URL and network";
        } else if (errorMessage.includes("timeout")) {
          errorMessage = "❌ Connection timeout - Endpoint may be slow or unreachable";
        }
        
        setTestResult({
          success: false,
          message: errorMessage,
        });
        setTestStatusMessage('Test failed.');
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        setTestResult({
          success: false,
          message: "⏹️ Test cancelled by user",
        });
        setTestStatusMessage('Test cancelled.');
      } else {
        setTestResult({
          success: false,
          message: `❌ Connection error: ${error instanceof Error ? error.message : String(error)}`,
        });
        setTestStatusMessage('Connection error.');
      }
    } finally {
      setTesting(false);
      setTestAbortController(null);
      setTimeout(() => setTestStatusMessage(''), 3000);
    }
  };

  const cancelTest = () => {
    if (testAbortController) {
      testAbortController.abort();
    }
  };

  const addService = async () => {
    try {
      const serviceId = editingServiceId || `${selectedServiceType}_${Date.now()}`;
      // Always use selectedModels for models field
      const config: Record<string, string | string[]> = { 
        ...serviceConfig,
        models: Array.from(selectedModels)
      };
      if (editingServiceId) {
        await fetch(`${BACKEND_URL}/api/services/${editingServiceId}`, {
          method: "DELETE",
        });
      }
      const response = await fetch(`${BACKEND_URL}/api/services/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: serviceId,
          service_type: selectedServiceType,
          config: config,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setConfigDialogOpen(false);
        resetConfigForm();
        // Immediately refresh services and models for UI update
        const [servicesData, modelsData] = await Promise.all([
          import('@/lib/api/llm').then(mod => mod.fetchServices()),
          import('@/lib/api/llm').then(mod => mod.fetchModels())
        ]);
        setServices(servicesData);
        setModels(modelsData.all_models || []);
      } else {
        setTestResult({
          success: false,
          message: result.error || "Failed to save service",
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Error saving service: ${error}`,
      });
    }
  };

  const editService = (service: ServiceInfo) => {
    setEditingServiceId(service.id);
    setSelectedServiceType(service.type as "ollama" | "openai");
    
    const config = service.config;
    if (service.type === "ollama") {
      setServiceConfig({
        name: service.name,
        host: String(config.host || "http://localhost:11434"),
      });
    } else if (service.type === "openai") {
      const models = Array.isArray(config.models) ? config.models : [];
      setServiceConfig({
        name: service.name,
        api_key: String(config.api_key || ""),
        base_url: String(config.base_url || ""),
        models: models,
      });
      setDiscoveredModels(models);
      setOpenaiModels(models.join(','));
    }
    
    setSelectedModels(new Set(service.models));
    setTestResult({ success: false });
    setConfigDialogOpen(true);
  };

  const removeService = async (serviceId: string) => {
    try {
      await apiRemoveService(serviceId);
      // Immediately refresh services and models for UI update
      const [servicesData, modelsData] = await Promise.all([
        fetchServices(),
        fetchModels()
      ]);
      setServices(servicesData);
      setModels(modelsData.all_models || []);
    } catch (error) {
      console.error("Error removing service:", error);
    }
  };

  const setDefaultModel = async (modelId: string) => {
    try {
      await apiSetDefaultModel(modelId);
      setSelectedModel(modelId);
      // Immediately refresh models for UI update
      const modelsData = await fetchModels();
      setModels(modelsData.all_models || []);
    } catch (error) {
      console.error("Error setting default model:", error);
    }
  };

  const resetConfigForm = () => {
    setServiceConfig({
      name: "",
      host: "http://localhost:11434",
    });
    setSelectedServiceType("ollama");
    setTestResult({ success: false });
    setDiscoveredModels([]);
    setSelectedModels(new Set());
    setEditingServiceId(null);
    setOpenaiModels('');
  };

  const toggleModelSelection = (modelId: string) => {
    const newSelected = new Set(selectedModels);
    if (newSelected.has(modelId)) {
      newSelected.delete(modelId);
    } else {
      newSelected.add(modelId);
    }
    setSelectedModels(newSelected);
  };

  const getStatusColor = (service: ServiceInfo) => {
    if (service.status === "online") return "text-green-500";
    if (service.status === "configured") return "text-blue-500";
    return "text-red-500";
  };

  const getStatusText = (service: ServiceInfo) => {
    if (service.status === "online") return "Online";
    if (service.status === "configured") return "Configured";
    if (service.status.startsWith("error:")) return "Error";
    return "Offline";
  };

  useEffect(() => {
    fetchModelsFromApi();
    fetchServicesCb();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Circle className="h-5 w-5" />
            LLM Service Configuration
          </CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading services...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              LLM Service Configuration
            </CardTitle>
            <CardDescription>
              Manage your LLM service endpoints and select the default model
            </CardDescription>
          </div>
          <Dialog 
            open={configDialogOpen} 
            onOpenChange={(open) => {
              setConfigDialogOpen(open);
              if (!open) {
                resetConfigForm();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Configure LLM Services</DialogTitle>
                <DialogDescription>
                  Manage your LLM service endpoints and models. Ollama services will scan for available models, while OpenAI services require manual configuration.
                </DialogDescription>
              </DialogHeader>

              <Tabs 
                defaultValue="add"
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-1">
                  <TabsTrigger value="add">
                    {editingServiceId ? "Edit Service" : "Add New Service"}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="add" className="space-y-4">
                  <div className="space-y-4">
                    {/* Service Type Selection */}
                    <div className="space-y-2">
                      <Label>Service Type</Label>
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant={selectedServiceType === "ollama" ? "default" : "outline"}
                          onClick={() => {
                            setSelectedServiceType("ollama");
                            setServiceConfig({
                              name: "",
                              host: "http://localhost:11434",
                            });
                            setTestResult({ success: false });
                            setDiscoveredModels([]);
                            setSelectedModels(new Set());
                          }}
                          className="flex-1"
                        >
                          Ollama
                        </Button>
                        <Button
                          type="button"
                          variant={selectedServiceType === "openai" ? "default" : "outline"}
                          onClick={() => {
                            setSelectedServiceType("openai");
                            setServiceConfig({
                              name: "",
                              api_key: "",
                              base_url: "",
                              models: [],
                            });
                            setTestResult({ success: false });
                            setDiscoveredModels([]);
                            setSelectedModels(new Set());
                          }}
                          className="flex-1"
                        >
                          OpenAI Compatible
                        </Button>
                      </div>
                    </div>

                    {/* Service Configuration Form */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="service-name">Service Name</Label>
                        <Input
                          id="service-name"
                          placeholder="My Ollama Service"
                          value={serviceConfig.name}
                          onChange={(e) =>
                            setServiceConfig({ ...serviceConfig, name: e.target.value })
                          }
                        />
                      </div>

                      {selectedServiceType === "ollama" && (
                        <div className="space-y-2">
                          <Label htmlFor="ollama-host">Ollama Host</Label>
                          <Input
                            id="ollama-host"
                            placeholder="http://localhost:11434"
                            value={serviceConfig.host || ""}
                            onChange={(e) =>
                              setServiceConfig({ ...serviceConfig, host: e.target.value })
                            }
                          />
                          <p className="text-xs text-muted-foreground">
                            Tip: Local Ollama is usually at http://localhost:11434
                          </p>
                        </div>
                      )}

                      {selectedServiceType === "openai" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="openai-base-url">Base URL (Optional)</Label>
                            <Input
                              id="openai-base-url"
                              placeholder="https://api.openai.com/v1 (leave empty for official OpenAI)"
                              value={serviceConfig.base_url || ""}
                              onChange={(e) =>
                                setServiceConfig({ ...serviceConfig, base_url: e.target.value })
                              }
                            />
                            <p className="text-xs text-muted-foreground">
                              Examples: DeepSeek: https://api.deepseek.com | Qwen: https://dashscope-intl.aliyuncs.com/compatible-mode/v1
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="openai-api-key">API Key</Label>
                            <Input
                              id="openai-api-key"
                              type="password"
                              placeholder="sk-..."
                              value={serviceConfig.api_key || ""}
                              onChange={(e) =>
                                setServiceConfig({ ...serviceConfig, api_key: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="openai-models">Available Models (comma separated)</Label>
                            <Input
                              id="openai-models"
                              placeholder="deepseek-chat,deepseek-reasoner (DeepSeek) | qwen-plus,qwen-turbo (Qwen) | gpt-4,gpt-3.5-turbo (OpenAI)"
                              value={openaiModelsInput}
                              onChange={(e) => {
                                setOpenaiModels(e.target.value);
                              }}
                            />
                            <p className="text-xs text-muted-foreground">
                              List the models available on your OpenAI-compatible endpoint. For DeepSeek use: deepseek-chat,deepseek-reasoner
                            </p>
                          </div>
                        </>
                      )}

                      {/* Test Connection */}
                      <div className="space-y-2">
                        {!testing ? (
                          <Button
                            type="button"
                            onClick={testService}
                            disabled={!serviceConfig.name}
                            className="w-full"
                            variant="outline"
                          >
                            <TestTube className="mr-2 h-4 w-4" />
                            Test Connection
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            onClick={cancelTest}
                            className="w-full"
                            variant="destructive"
                          >
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {testStatusMessage || "Cancel Test"}
                          </Button>
                        )}

                        {testResult.message && (
                          <div className={`flex items-center space-x-2 text-sm p-3 rounded-md ${
                            testResult.success ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                          }`}>
                            {testResult.success ? (
                              <CheckCircle className="h-4 w-4 flex-shrink-0" />
                            ) : (
                              <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            )}
                            <span className="break-words">{testResult.message}</span>
                          </div>
                        )}
                      </div>

                      {/* Model Selection */}
                      {discoveredModels.length > 0 && (
                        <div className="space-y-2">
                          <Label>Select Models to Enable</Label>
                          <div className="max-h-32 overflow-y-auto border rounded p-2 space-y-2">
                            {discoveredModels.map((modelId) => (
                              <div key={modelId} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`model-${modelId}`}
                                  checked={selectedModels.has(modelId)}
                                  onCheckedChange={() => toggleModelSelection(modelId)}
                                />
                                <Label htmlFor={`model-${modelId}`} className="text-sm cursor-pointer">
                                  {modelId}
                                </Label>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Select which models you want to make available in the app
                          </p>
                        </div>
                      )}

                      {/* Add/Edit Service */}
                      <Button
                        onClick={addService}
                        disabled={!testResult.success || selectedModels.size === 0}
                        className="w-full"
                      >
                        {editingServiceId ? (
                          <>
                            <Edit className="mr-2 h-4 w-4" />
                            Update Service ({selectedModels.size} models)
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Service ({selectedModels.size} models)
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Services List */}
        {Object.keys(services).length === 0 ? (
          <div className="text-muted-foreground text-sm text-center py-4">
            No LLM services configured. Click &quot;Add Service&quot; to get started.
          </div>
        ) : (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Configured Services</Label>
            {Object.values(services).map((service) => (
              <div key={service.id} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Circle className={`h-2 w-2 ${getStatusColor(service)}`} />
                    <span className="font-medium">{service.name}</span>
                    <Badge variant="outline" className="text-xs">{service.type}</Badge>
                    <Badge variant="secondary" className="text-xs">
                      {service.models.length} models
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editService(service)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeService(service.id)}
                      className="h-6 w-6 p-0 text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Status: {getStatusText(service)} • Models: {service.models.join(', ') || 'None'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Default Model Selection */}
        <div className="mt-4">
          <Label className="text-sm font-medium mb-2 block">Default Model</Label>
          <div className="flex gap-2 flex-wrap">
            {models.length === 0 ? (
              <span className="text-muted-foreground text-xs">No models available</span>
            ) : (
              models.map((model) => (
                <Badge
                  key={`${model.id}-${model.provider}`}
                  variant={selectedModel === model.id ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setDefaultModel(model.id)}
                >
                  {model.name}
                  {selectedModel === model.id && <Star className="h-3 w-3 ml-1 inline" />}
                </Badge>
              ))
            )}
          </div>
          {selectedModel && (
            <p className="text-xs text-muted-foreground mt-1">
              Current default: {models.find(m => m.id === selectedModel)?.name || selectedModel}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * LLM Service and Model Types
 * Used across ModelSelector, LLMServiceConfig, LLMServiceCard, and KnowledgeSidebar
 */

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  service: string;
  service_type: string;
  available: boolean;
  is_default: boolean;
}

export interface ServiceInfo {
  id: string;
  type: string;
  name: string;
  enabled: boolean;
  available: boolean;
  models: string[];
  status: string;
  config: Record<string, string | boolean | string[]>;
}

export interface ServiceConfig {
  name: string;
  host?: string;
  api_key?: string;
  base_url?: string;
  models?: string[];
}

export interface LLMStats {
  total_services: number;
  active_services: number;
  total_models: number;
  available_models: number;
  default_model: string;
}

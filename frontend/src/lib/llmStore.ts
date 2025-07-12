import { create } from 'zustand';

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

interface LLMState {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  services: Record<string, ServiceInfo>;
  setServices: (services: Record<string, ServiceInfo>) => void;
}

export const useLLMStore = create<LLMState>((set) => ({
  selectedModel: '',
  setSelectedModel: (model: string) => set({ selectedModel: model }),
  services: {},
  setServices: (services: Record<string, ServiceInfo>) => set({ services }),
}));

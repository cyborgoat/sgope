
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


const SELECTED_MODEL_KEY = 'sgope.selectedModel';

function getInitialSelectedModel() {
  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem(SELECTED_MODEL_KEY);
      if (stored) return stored;
    } catch {}
  }
  return '';
}

export const useLLMStore = create<LLMState>((set) => ({
  selectedModel: getInitialSelectedModel(),
  setSelectedModel: (model: string) => {
    set({ selectedModel: model });
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(SELECTED_MODEL_KEY, model);
      } catch {}
    }
  },
  services: {},
  setServices: (services: Record<string, ServiceInfo>) => set({ services }),
}));

/**
 * Knowledge Base and File System Types
 * Used in KnowledgeSidebar and related components
 */

export interface FileItem {
  id: string;
  label: string;
  description: string;
  name?: string;
  path?: string;
  type?: 'file' | 'directory' | 'folder' | 'image';
  children?: FileItem[];
  metadata?: {
    type?: string;
    path?: string;
    size?: number;
  };
}

export interface SystemStats {
  short_term_memory: {
    total_items: number;
    files: number;
    folders: number;
    images: number;
  };
  long_term_memory: {
    total_actions: number;
  };
  llm_services: {
    default_model: string;
    all_models: unknown[];
    services: Record<string, {
      available: boolean;
      status: string;
      models: string[];
    }>;
  };
}

export interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: TreeNode[];
  size?: number;
}

/**
 * Input and Suggestion Types
 * Used in AutocompleteInput and EnhancedInput components
 */

export interface SuggestionItem {
  id: string;
  label: string;
  description?: string;
}

export interface AutocompleteInputProps {
  onSend: (message: string) => void;
}

export interface EnhancedInputProps {
  onSend: (
    message: string, 
    attachments?: Array<{type: 'file' | 'image', name: string, url?: string}>, 
    selectedAction?: string,
    options?: { knowledgeFilename?: string }
  ) => void;
  isLoading?: boolean;
  isActionActive?: boolean;
  onStop?: () => void;
}

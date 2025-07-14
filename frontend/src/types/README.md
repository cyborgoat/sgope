# Types Documentation

This document describes the centralized TypeScript type system for the frontend components.

## Overview

All TypeScript interfaces have been moved from individual component files to a centralized `types` folder under `/frontend/src/types/`. This follows TypeScript best practices and improves code maintainability by:

- Avoiding code duplication across components
- Providing a single source of truth for type definitions
- Making it easier to update and maintain interfaces
- Improving code reusability

## File Structure

```
/frontend/src/types/
├── index.ts         # Main export file for all types
├── llm.d.ts         # LLM service and model types
├── chat.d.ts        # Chat and messaging types
├── input.d.ts       # Input component types
├── dashboard.d.ts   # Dashboard and activity types
├── knowledge.d.ts   # Knowledge base and file system types
└── layout.d.ts      # Layout and component props types
```

## Type Categories

### LLM Types (`llm.d.ts`)
- `ModelInfo` - Individual model information
- `ServiceInfo` - LLM service configuration
- `ServiceConfig` - Service setup parameters
- `LLMStats` - Statistics for LLM services

**Used in:** ModelSelector, LLMServiceConfig, LLMServiceCard, KnowledgeSidebar

### Chat Types (`chat.d.ts`)
- `Message` - Chat message structure
- `AttachmentItem` - File/image attachments

**Used in:** ChatInterface, MarkdownMessage

### Input Types (`input.d.ts`)
- `SuggestionItem` - Autocomplete suggestions
- `AutocompleteInputProps` - Autocomplete input component props
- `EnhancedInputProps` - Enhanced input component props

**Used in:** AutocompleteInput, EnhancedInput

### Dashboard Types (`dashboard.d.ts`)
- `DashboardStats` - Dashboard statistics
- `RecentActivity` - Recent activity items
- `RecentActivityCardProps` - Recent activity card props
- `TodoItem` - Todo list items

**Used in:** Dashboard, RecentActivityCard, TodoCard

### Knowledge Types (`knowledge.d.ts`)
- `FileItem` - File system items
- `SystemStats` - System statistics
- `TreeNode` - File tree structure

**Used in:** KnowledgeSidebar, KnowledgeBaseCard

### Layout Types (`layout.d.ts`)
- `SidebarProps` - Sidebar component props
- `AppLayoutProps` - App layout props

**Used in:** AppLayout

## Usage

Import types using the centralized export:

```typescript
import { ModelInfo, ServiceInfo, DashboardStats } from "@/types";
```

## Benefits

1. **Reduced Duplication**: `ModelInfo` and `ServiceInfo` were duplicated across 4 different components
2. **Better Organization**: Related types are grouped together in logical files
3. **Easier Maintenance**: Updates to interfaces only need to be made in one place
4. **Type Safety**: All components continue to have full TypeScript support
5. **Scalability**: New types can be easily added to the appropriate category file

## Migration Summary

The following interfaces were successfully migrated:

- **ModelInfo** (was in: ModelSelector, LLMServiceConfig, LLMServiceCard)
- **ServiceInfo** (was in: ModelSelector, LLMServiceConfig, LLMServiceCard, KnowledgeSidebar)
- **ServiceConfig** (was in: ModelSelector, LLMServiceConfig)
- **SuggestionItem** (was in: AutocompleteInput, EnhancedInput)
- **RecentActivity** (was in: Dashboard, RecentActivityCard)
- And 15+ additional interfaces

All components now use the centralized types and the project builds successfully without any TypeScript errors.
